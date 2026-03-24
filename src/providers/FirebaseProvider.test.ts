import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FirebaseProvider } from './FirebaseProvider'
import type { FirebaseConfig } from '@/types'

const mockFirebaseApp = { name: 'test-app' }
const mockMessaging = {}
const mockInitializeApp = vi.fn(() => mockFirebaseApp)
const mockGetMessaging = vi.fn(() => mockMessaging)
const mockGetToken = vi.fn(() => Promise.resolve('test-token'))
const mockDeleteToken = vi.fn(() => Promise.resolve())
const onMessageCallback = vi.fn()
const mockOnMessage = vi.fn((_messaging, callback) => {
  onMessageCallback.mockImplementation(callback)
  return () => {}
})
const mockIsSupported = vi.fn(() => Promise.resolve(true))
const mockPushNotifications = {
  requestPermissions: vi.fn(() => Promise.resolve({ receive: 'granted' })),
  checkPermissions: vi.fn(() => Promise.resolve({ receive: 'prompt' })),
  register: vi.fn(() => Promise.resolve()),
  addListener: vi.fn(
    (event: string, callback: (data: { value: string }) => void) => {
      if (event === 'registration') {
        setTimeout(() => callback({ value: 'native-token' }), 0)
      }
      return { remove: vi.fn() }
    }
  ),
}
const dynamicLoaderState = {
  isNative: false,
}

vi.mock('./FirebaseNativeBridge', () => ({
  FirebaseNativeBridge: {
    initializeNative: vi.fn(() => Promise.resolve()),
  },
}))

vi.mock('@/utils/config-validator', () => ({
  ConfigValidator: {
    validateFirebaseConfig: vi.fn(),
    validateEnvironmentVariables: vi.fn(),
  },
}))

vi.mock('@/utils/dynamic-loader', () => ({
  DynamicLoader: {
    isNativePlatform: vi.fn(async () => dynamicLoaderState.isNative),
    getPlatform: vi.fn(async () =>
      dynamicLoaderState.isNative ? 'android' : 'web'
    ),
    loadFirebase: vi.fn(async () => ({
      initializeApp: mockInitializeApp,
    })),
    loadFirebaseMessaging: vi.fn(async () => ({
      getMessaging: mockGetMessaging,
      getToken: mockGetToken,
      deleteToken: mockDeleteToken,
      onMessage: mockOnMessage,
      isSupported: mockIsSupported,
    })),
    loadPushNotifications: vi.fn(async () => ({
      PushNotifications: mockPushNotifications,
    })),
  },
}))

describe('FirebaseProvider', () => {
  let provider: FirebaseProvider
  const mockConfig: FirebaseConfig = {
    apiKey: 'test-api-key',
    authDomain: 'test.firebaseapp.com',
    projectId: 'test-project',
    storageBucket: 'test.appspot.com',
    messagingSenderId: '123456789',
    appId: 'test-app-id',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    dynamicLoaderState.isNative = false
    mockInitializeApp.mockReturnValue(mockFirebaseApp)
    mockGetMessaging.mockReturnValue(mockMessaging)
    mockGetToken.mockResolvedValue('test-token')
    mockDeleteToken.mockResolvedValue(undefined)
    mockOnMessage.mockImplementation((_messaging, callback) => {
      onMessageCallback.mockImplementation(callback)
      return () => {}
    })
    mockIsSupported.mockResolvedValue(true)
    mockPushNotifications.requestPermissions.mockResolvedValue({
      receive: 'granted',
    })
    mockPushNotifications.checkPermissions.mockResolvedValue({
      receive: 'prompt',
    })
    provider = new FirebaseProvider()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('init', () => {
    it('should initialize Firebase app', async () => {
      await provider.init(mockConfig)

      expect(mockInitializeApp).toHaveBeenCalledWith(mockConfig)
    })

    it('should handle multiple initialization attempts', async () => {
      await provider.init(mockConfig)
      await provider.init(mockConfig)

      expect(mockInitializeApp).toHaveBeenCalledTimes(2)
    })

    it('should initialize messaging for web platform', async () => {
      await provider.init(mockConfig)

      expect(mockGetMessaging).toHaveBeenCalledWith(mockFirebaseApp)
    })

    it('should initialize for native platform', async () => {
      dynamicLoaderState.isNative = true

      await provider.init(mockConfig)

      expect(mockInitializeApp).toHaveBeenCalledWith(mockConfig)
      expect(mockGetMessaging).toHaveBeenCalledWith(mockFirebaseApp)
    })
  })

  describe('requestPermission', () => {
    beforeEach(async () => {
      await provider.init(mockConfig)
    })

    it('should request permission on web', async () => {
      Object.defineProperty(window, 'Notification', {
        value: {
          permission: 'default',
          requestPermission: vi.fn(() => Promise.resolve('granted')),
        },
        writable: true,
        configurable: true,
      })

      const result = await provider.requestPermission()

      expect(result).toBe(true)
      expect(window.Notification.requestPermission).toHaveBeenCalled()
    })

    it('should request permission on native platform', async () => {
      dynamicLoaderState.isNative = true
      mockPushNotifications.requestPermissions.mockResolvedValue({
        receive: 'granted',
      })

      const result = await provider.requestPermission()

      expect(result).toBe(true)
      expect(mockPushNotifications.requestPermissions).toHaveBeenCalled()
    })

    it('should return false if permission denied', async () => {
      dynamicLoaderState.isNative = true
      mockPushNotifications.requestPermissions.mockResolvedValueOnce({
        receive: 'denied',
      })

      const result = await provider.requestPermission()

      expect(result).toBe(false)
    })
  })

  describe('checkPermission', () => {
    beforeEach(async () => {
      await provider.init(mockConfig)
    })

    it('should check permission on web', async () => {
      Object.defineProperty(window, 'Notification', {
        value: { permission: 'granted' },
        writable: true,
        configurable: true,
      })

      const result = await provider.checkPermission()

      expect(result).toBe('granted')
    })

    it('should check permission on native platform', async () => {
      dynamicLoaderState.isNative = true
      mockPushNotifications.checkPermissions.mockResolvedValueOnce({
        receive: 'prompt',
      })

      const result = await provider.checkPermission()

      expect(result).toBe('prompt')
    })
  })

  describe('getToken', () => {
    beforeEach(async () => {
      await provider.init(mockConfig)
    })

    it('should get token on web', async () => {
      mockGetToken.mockResolvedValueOnce('web-token')

      const token = await provider.getToken()

      expect(token).toBe('web-token')
    })

    it('should get token on native platform', async () => {
      dynamicLoaderState.isNative = true

      const token = await provider.getToken()

      expect(token).toBe('test-token')
    })

    it('should throw error if no messaging instance', async () => {
      await provider.destroy()

      await expect(provider.getToken()).rejects.toThrow(
        'Firebase messaging not initialized'
      )
    })
  })

  describe('event listeners', () => {
    beforeEach(async () => {
      await provider.init(mockConfig)
    })

    it('should register message listener', async () => {
      const callback = vi.fn()
      provider.onMessage(callback)

      onMessageCallback({
        notification: {
          title: 'Test',
          body: 'Test message',
        },
        data: { key: 'value' },
        from: 'test-sender',
        collapseKey: 'test-key',
      })

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '',
          body: '',
          data: expect.objectContaining({ key: 'value' }),
          notification: expect.objectContaining({
            title: 'Test',
            body: 'Test message',
            data: { key: 'value' },
          }),
          to: 'test-sender',
          collapseKey: 'test-key',
        })
      )
    })

    it('should register token refresh listener', async () => {
      const callback = vi.fn()
      const unsubscribe = provider.onTokenRefresh(callback)

      expect(typeof unsubscribe).toBe('function')
      unsubscribe()
    })

    it('should register error listener', () => {
      const callback = vi.fn()
      const unsubscribe = provider.onError(callback)

      expect(typeof unsubscribe).toBe('function')
      unsubscribe()
    })
  })

  describe('capabilities', () => {
    it('should return provider capabilities', async () => {
      await provider.init(mockConfig)

      const capabilities = await provider.getCapabilities()

      expect(capabilities).toMatchObject({
        pushNotifications: true,
        topics: true,
        richMedia: true,
        actions: true,
        backgroundSync: true,
        analytics: true,
        segmentation: true,
        scheduling: false,
        webPush: true,
      })
    })
  })

  describe('destroy', () => {
    it('should clean up resources', async () => {
      await provider.init(mockConfig)
      await provider.getToken()

      await provider.destroy()

      expect(mockDeleteToken).toHaveBeenCalledWith(mockMessaging)
      await expect(provider.init(mockConfig)).resolves.not.toThrow()
    })
  })

  describe('provider info', () => {
    it('should have correct name and type', () => {
      expect(provider.name).toBe('firebase')
      expect(provider.type).toBe('firebase')
    })
  })
})
