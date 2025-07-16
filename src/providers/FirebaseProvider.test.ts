import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { FirebaseProvider } from './FirebaseProvider'
import type { FirebaseConfig } from '@/types'

// Mock Capacitor first
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn(() => false),
    getPlatform: vi.fn(() => 'web'),
  },
}))

// Mock Firebase modules
const mockFirebaseApp = { name: 'test-app' }
const mockMessaging = {}

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => mockFirebaseApp),
  getApps: vi.fn(() => []),
}))

vi.mock('firebase/messaging', () => {
  const onMessageCallback = vi.fn()

  return {
    getMessaging: vi.fn(() => mockMessaging),
    getToken: vi.fn(() => Promise.resolve('test-token')),
    deleteToken: vi.fn(() => Promise.resolve()),
    onMessage: vi.fn((messaging, callback) => {
      onMessageCallback.mockImplementation(callback)
      return () => {}
    }),
    isSupported: vi.fn(() => Promise.resolve(true)),
    __onMessageCallback: onMessageCallback,
  }
})

vi.mock('@capacitor/push-notifications', () => ({
  PushNotifications: {
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
    getToken: vi.fn(() => Promise.resolve({ value: 'native-token' })),
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
    provider = new FirebaseProvider()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('init', () => {
    it('should initialize Firebase app', async () => {
      const { initializeApp } = await import('firebase/app')

      await provider.init(mockConfig)

      expect(initializeApp).toHaveBeenCalledWith(mockConfig)
    })

    it('should handle multiple initialization attempts', async () => {
      const { initializeApp } = await import('firebase/app')

      await provider.init(mockConfig)
      await provider.init(mockConfig)

      // Firebase provider doesn't check for existing app, so it will try to init twice
      expect(initializeApp).toHaveBeenCalledTimes(2)
    })

    it('should initialize messaging for web platform', async () => {
      const { getMessaging } = await import('firebase/messaging')

      await provider.init(mockConfig)

      expect(getMessaging).toHaveBeenCalled()
    })

    it('should initialize for native platform', async () => {
      const { Capacitor } = await import('@capacitor/core')
      ;(Capacitor.isNativePlatform as any).mockReturnValue(true)

      await provider.init(mockConfig)

      // Provider initializes successfully for native platforms
      expect(provider).toBeDefined()
    })
  })

  describe('requestPermission', () => {
    beforeEach(async () => {
      await provider.init(mockConfig)
    })

    it('should request permission on web', async () => {
      const { Capacitor } = await import('@capacitor/core')
      ;(Capacitor.isNativePlatform as any).mockReturnValue(false)

      // Mock Notification API
      const mockNotification = {
        permission: 'default',
        requestPermission: vi.fn(() => Promise.resolve('granted')),
      }
      Object.defineProperty(window, 'Notification', {
        value: mockNotification,
        writable: true,
        configurable: true,
      })

      const result = await provider.requestPermission()

      expect(result).toBe(true)
      expect(mockNotification.requestPermission).toHaveBeenCalled()
    })

    it('should request permission on native platform', async () => {
      const { Capacitor } = await import('@capacitor/core')
      ;(Capacitor.isNativePlatform as any).mockReturnValue(true)

      const { PushNotifications } = await import(
        '@capacitor/push-notifications'
      )
      ;(PushNotifications.requestPermissions as any).mockResolvedValue({
        receive: 'granted',
      })

      const result = await provider.requestPermission()

      expect(result).toBe(true)
      expect(PushNotifications.requestPermissions).toHaveBeenCalled()
    })

    it('should return false if permission denied', async () => {
      const { Capacitor } = await import('@capacitor/core')
      ;(Capacitor.isNativePlatform as any).mockReturnValue(true)

      const { PushNotifications } = await import(
        '@capacitor/push-notifications'
      )
      ;(PushNotifications.requestPermissions as any).mockResolvedValueOnce({
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
      const { Capacitor } = await import('@capacitor/core')
      ;(Capacitor.isNativePlatform as any).mockReturnValue(false)

      // Mock Notification API
      Object.defineProperty(window, 'Notification', {
        value: { permission: 'granted' },
        writable: true,
        configurable: true,
      })

      const result = await provider.checkPermission()

      expect(result).toBe('granted')
    })

    it('should check permission on native platform', async () => {
      const { Capacitor } = await import('@capacitor/core')
      ;(Capacitor.isNativePlatform as any).mockReturnValue(true)

      const { PushNotifications } = await import(
        '@capacitor/push-notifications'
      )
      ;(PushNotifications.checkPermissions as any).mockResolvedValueOnce({
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
      const { getToken } = await import('firebase/messaging')
      ;(getToken as any).mockResolvedValue('web-token')

      const token = await provider.getToken()

      expect(token).toBe('web-token')
    })

    it('should get token on native platform', async () => {
      const { Capacitor } = await import('@capacitor/core')
      ;(Capacitor.isNativePlatform as any).mockReturnValue(true)

      const token = await provider.getToken()

      // Native platforms return the cached token from Firebase
      expect(token).toBe('test-token')
    })

    it('should throw error if no messaging instance', async () => {
      // Destroy to clear messaging instance
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

      // Simulate message reception
      const messaging = await import('firebase/messaging')
      const onMessageCallback = (messaging as any).__onMessageCallback

      if (onMessageCallback) {
        onMessageCallback({
          notification: {
            title: 'Test',
            body: 'Test message',
          },
          data: { key: 'value' },
          from: 'test-sender',
          collapseKey: 'test-key',
        })
      }

      // Check the transformed payload structure matches FirebaseProvider implementation
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ key: 'value' }),
          notification: expect.objectContaining({
            title: 'Test',
            body: 'Test message',
            data: { key: 'value' },
          }),
          to: 'test-sender',
          collapse_key: 'test-key',
        })
      )
    })

    it('should register token refresh listener', async () => {
      const callback = vi.fn()
      const unsubscribe = provider.onTokenRefresh(callback)

      // Verify the callback is registered and can be unsubscribed
      expect(typeof unsubscribe).toBe('function')
      unsubscribe()
    })

    it('should register error listener', () => {
      const callback = vi.fn()
      const unsubscribe = provider.onError(callback)

      // Verify the callback is registered and can be unsubscribed
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
        webPush: true, // isNativePlatform is false in our mock, so it's web
      })
    })
  })

  describe('destroy', () => {
    it('should clean up resources', async () => {
      await provider.init(mockConfig)

      const { deleteToken } = await import('firebase/messaging')

      // Set a token first
      await provider.getToken()

      await provider.destroy()

      // Should have deleted the token
      expect(deleteToken).toHaveBeenCalled()

      // Provider can be reinitialized
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
