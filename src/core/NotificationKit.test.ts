import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NotificationKit } from './NotificationKit'
import type { NotificationConfig } from '@/types'
import { DynamicLoader } from '@/utils/dynamic-loader'

let mockFirebaseProvider: any
let mockOneSignalProvider: any

vi.mock('@/utils/dynamic-loader', () => ({
  DynamicLoader: {
    getPlatform: vi.fn(),
    isNativePlatform: vi.fn(),
  },
}))

vi.mock('@/providers/FirebaseProvider', () => ({
  FirebaseProvider: class MockFirebaseProvider {
    constructor() {
      return mockFirebaseProvider
    }
  } as any,
}))

vi.mock('@/providers/OneSignalProvider', () => ({
  OneSignalProvider: class MockOneSignalProvider {
    constructor() {
      return mockOneSignalProvider
    }
  } as any,
}))

function createMockProvider(name: 'firebase' | 'onesignal') {
  return {
    name,
    type: name,
    init: vi.fn().mockResolvedValue(undefined),
    destroy: vi.fn().mockResolvedValue(undefined),
    requestPermission: vi.fn().mockResolvedValue(true),
    checkPermission: vi.fn().mockResolvedValue('granted'),
    getToken: vi.fn().mockResolvedValue('test-token'),
    subscribe: vi.fn().mockResolvedValue(undefined),
    unsubscribe: vi.fn().mockResolvedValue(undefined),
    sendNotification: vi.fn().mockResolvedValue(undefined),
    scheduleNotification: vi.fn().mockResolvedValue(undefined),
    cancelNotification: vi.fn().mockResolvedValue(undefined),
    getPendingNotifications: vi.fn().mockResolvedValue([]),
    showInAppNotification: vi.fn().mockResolvedValue('notification-id'),
    createChannel: vi.fn().mockResolvedValue(undefined),
    deleteChannel: vi.fn().mockResolvedValue(undefined),
    listChannels: vi.fn().mockResolvedValue([]),
    isSupported: vi.fn().mockResolvedValue(true),
    getCapabilities: vi.fn().mockResolvedValue({
      topics: true,
      scheduling: true,
      analytics: true,
      segmentation: true,
      templates: false,
      webhooks: false,
      batch: false,
      priority: true,
      ttl: true,
      collapse: true,
      pushNotifications: true,
      richMedia: true,
      actions: true,
      backgroundSync: true,
      channels: false,
    }),
    onMessage: vi.fn(),
    onTokenRefresh: vi.fn(),
    onError: vi.fn(),
  }
}

describe('NotificationKit', () => {
  let kit: NotificationKit

  const firebaseConfig: NotificationConfig = {
    provider: 'firebase',
    config: {
      apiKey: 'test-api-key',
      authDomain: 'test.firebaseapp.com',
      projectId: 'test-project',
      storageBucket: 'test.appspot.com',
      messagingSenderId: '123456789',
      appId: 'test-app-id',
    },
  }

  const oneSignalConfig: NotificationConfig = {
    provider: 'onesignal',
    config: {
      appId: 'test-app-id',
    },
  }

  beforeEach(() => {
    ;(NotificationKit as any).instance = null
    vi.clearAllMocks()

    mockFirebaseProvider = createMockProvider('firebase')
    mockOneSignalProvider = createMockProvider('onesignal')
    vi.mocked(DynamicLoader.getPlatform).mockResolvedValue('web')
    vi.mocked(DynamicLoader.isNativePlatform).mockResolvedValue(false)

    kit = NotificationKit.getInstance()
  })

  describe('getInstance', () => {
    it('should return the same instance', () => {
      expect(NotificationKit.getInstance()).toBe(NotificationKit.getInstance())
    })
  })

  describe('init', () => {
    it('should initialize with Firebase provider', async () => {
      await kit.init(firebaseConfig)

      expect(mockFirebaseProvider.init).toHaveBeenCalledWith(firebaseConfig.config)
      expect(kit.isInitialized()).toBe(true)
      expect(kit.getProvider()).toBe(mockFirebaseProvider)
    })

    it('should initialize with OneSignal provider', async () => {
      await kit.init(oneSignalConfig)

      expect(mockOneSignalProvider.init).toHaveBeenCalledWith(
        oneSignalConfig.config
      )
      expect(kit.isInitialized()).toBe(true)
      expect(kit.getProvider()).toBe(mockOneSignalProvider)
    })

    it('should throw error for invalid provider', async () => {
      await expect(
        kit.init({ provider: 'invalid' as never, config: {} })
      ).rejects.toThrow(
        'Failed to initialize provider: Error: Unknown provider: invalid'
      )
    })

    it('should not reinitialize if already initialized', async () => {
      await kit.init(firebaseConfig)
      await kit.init(firebaseConfig)

      expect(mockFirebaseProvider.init).toHaveBeenCalledTimes(1)
    })
  })

  describe('destroy', () => {
    it('should destroy the provider and reset state', async () => {
      await kit.init(firebaseConfig)
      await kit.destroy()

      expect(mockFirebaseProvider.destroy).toHaveBeenCalled()
      expect(kit.isInitialized()).toBe(false)
      expect(kit.getProvider()).toBeNull()
    })
  })

  describe('permission methods', () => {
    beforeEach(async () => {
      await kit.init(firebaseConfig)
    })

    it('should request permission', async () => {
      const result = await kit.requestPermission()
      expect(result).toBe(true)
      expect(mockFirebaseProvider.requestPermission).toHaveBeenCalled()
    })

    it('should check permission', async () => {
      const result = await kit.checkPermission()
      expect(result).toBe('granted')
      expect(mockFirebaseProvider.checkPermission).toHaveBeenCalled()
    })

    it('should throw error if not initialized', async () => {
      await kit.destroy()
      await expect(kit.requestPermission()).rejects.toThrow(
        'NotificationKit must be initialized before use'
      )
    })
  })

  describe('token methods', () => {
    beforeEach(async () => {
      await kit.init(firebaseConfig)
    })

    it('should get token', async () => {
      const result = await kit.getToken()
      expect(result).toBe('test-token')
      expect(mockFirebaseProvider.getToken).toHaveBeenCalled()
    })
  })

  describe('subscription methods', () => {
    beforeEach(async () => {
      await kit.init(firebaseConfig)
    })

    it('should subscribe to topic', async () => {
      await kit.subscribe('news')
      expect(mockFirebaseProvider.subscribe).toHaveBeenCalledWith('news')
    })

    it('should unsubscribe from topic', async () => {
      await kit.unsubscribe('news')
      expect(mockFirebaseProvider.unsubscribe).toHaveBeenCalledWith('news')
    })
  })

  describe('event emitter', () => {
    it('should add and trigger event listeners', async () => {
      const readyListener = vi.fn()
      kit.on('ready', readyListener)

      await kit.init(firebaseConfig)

      expect(readyListener).toHaveBeenCalledTimes(1)
    })

    it('should remove specific listener', () => {
      const listener = vi.fn()
      kit.on('ready', listener)
      kit.off('ready', listener)

      ;(kit as any).emit('ready', { test: true })

      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('utility behavior', () => {
    it('should have all required methods', () => {
      expect(typeof kit.init).toBe('function')
      expect(typeof kit.destroy).toBe('function')
      expect(typeof kit.requestPermission).toBe('function')
      expect(typeof kit.checkPermission).toBe('function')
      expect(typeof kit.getToken).toBe('function')
      expect(typeof kit.subscribe).toBe('function')
      expect(typeof kit.unsubscribe).toBe('function')
      expect(typeof kit.on).toBe('function')
      expect(typeof kit.off).toBe('function')
    })

    it('should check platform capabilities', async () => {
      await kit.init(firebaseConfig)
      expect(kit.getCapabilities()).toBeTruthy()
    })

    it('should return false on provider support errors', async () => {
      mockFirebaseProvider.isSupported.mockRejectedValue(new Error('unsupported'))
      await kit.init(firebaseConfig)

      await expect(kit.isSupported()).resolves.toBe(false)
    })
  })
})
