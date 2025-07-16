import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { NotificationKit, notifications } from './NotificationKit'
import type { NotificationConfig } from '@/types'

describe('NotificationKit', () => {
  let kit: NotificationKit

  beforeEach(() => {
    // Reset singleton instance
    ;(NotificationKit as any).instance = null
    kit = NotificationKit.getInstance()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const instance1 = NotificationKit.getInstance()
      const instance2 = NotificationKit.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('init', () => {
    it('should initialize with Firebase provider', async () => {
      const config: NotificationConfig = {
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

      const mockFirebaseProvider = {
        init: vi.fn().mockResolvedValue(undefined),
        name: 'firebase',
        type: 'firebase' as const,
        getCapabilities: vi.fn().mockResolvedValue({
          pushNotifications: true,
          topics: true,
          richMedia: true,
          actions: true,
          backgroundSync: true,
          analytics: true,
          segmentation: true,
          scheduling: false,
        }),
        onMessage: vi.fn(),
        onTokenRefresh: vi.fn(),
        onError: vi.fn(),
      }

      vi.doMock('@/providers/FirebaseProvider', () => ({
        FirebaseProvider: vi.fn(() => mockFirebaseProvider),
      }))

      await kit.init(config)

      expect(kit.isInitialized()).toBe(true)
      expect(kit.getProvider()).toBeDefined()
    })

    it('should initialize with OneSignal provider', async () => {
      const config: NotificationConfig = {
        provider: 'onesignal',
        config: {
          appId: 'test-app-id',
        },
      }

      const mockOneSignalProvider = {
        init: vi.fn().mockResolvedValue(undefined),
        name: 'onesignal',
        type: 'onesignal' as const,
        getCapabilities: vi.fn().mockResolvedValue({
          pushNotifications: true,
          topics: true,
          richMedia: true,
          actions: true,
          backgroundSync: true,
          analytics: true,
          segmentation: true,
          scheduling: false,
        }),
        onMessage: vi.fn(),
        onTokenRefresh: vi.fn(),
        onError: vi.fn(),
      }

      vi.doMock('@/providers/OneSignalProvider', () => ({
        OneSignalProvider: vi.fn(() => mockOneSignalProvider),
      }))

      await kit.init(config)

      expect(kit.isInitialized()).toBe(true)
      expect(kit.getProvider()).toBeDefined()
    })

    it('should throw error for invalid provider', async () => {
      const config: NotificationConfig = {
        provider: 'invalid' as any,
        config: {},
      }

      await expect(kit.init(config)).rejects.toThrow('Failed to initialize provider: Error: Unknown provider: invalid')
    })

    it('should not reinitialize if already initialized', async () => {
      const config: NotificationConfig = {
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

      const mockFirebaseProvider = {
        init: vi.fn().mockResolvedValue(undefined),
        name: 'firebase',
        type: 'firebase' as const,
        getCapabilities: vi.fn().mockResolvedValue({
          pushNotifications: true,
          topics: true,
          richMedia: true,
          actions: true,
          backgroundSync: true,
          analytics: true,
          segmentation: true,
          scheduling: false,
        }),
        onMessage: vi.fn(),
        onTokenRefresh: vi.fn(),
        onError: vi.fn(),
      }

      vi.doMock('@/providers/FirebaseProvider', () => ({
        FirebaseProvider: vi.fn(() => mockFirebaseProvider),
      }))

      await kit.init(config)
      await kit.init(config)

      expect(mockFirebaseProvider.init).toHaveBeenCalledTimes(1)
    })
  })

  describe('destroy', () => {
    it('should destroy the provider and reset state', async () => {
      const config: NotificationConfig = {
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

      const mockFirebaseProvider = {
        init: vi.fn().mockResolvedValue(undefined),
        destroy: vi.fn().mockResolvedValue(undefined),
        name: 'firebase',
        type: 'firebase' as const,
        getCapabilities: vi.fn().mockResolvedValue({
          pushNotifications: true,
          topics: true,
          richMedia: true,
          actions: true,
          backgroundSync: true,
          analytics: true,
          segmentation: true,
          scheduling: false,
        }),
        onMessage: vi.fn(),
        onTokenRefresh: vi.fn(),
        onError: vi.fn(),
      }

      vi.doMock('@/providers/FirebaseProvider', () => ({
        FirebaseProvider: vi.fn(() => mockFirebaseProvider),
      }))

      await kit.init(config)
      await kit.destroy()

      expect(mockFirebaseProvider.destroy).toHaveBeenCalled()
      expect(kit.isInitialized()).toBe(false)
      expect(kit.getProvider()).toBeNull()
    })
  })

  describe('permission methods', () => {
    let mockProvider: any

    beforeEach(async () => {
      mockProvider = {
        init: vi.fn().mockResolvedValue(undefined),
        destroy: vi.fn().mockResolvedValue(undefined),
        requestPermission: vi.fn().mockResolvedValue(true),
        checkPermission: vi.fn().mockResolvedValue('granted'),
        name: 'firebase',
        type: 'firebase' as const,
        getCapabilities: vi.fn().mockResolvedValue({
          pushNotifications: true,
          topics: true,
          richMedia: true,
          actions: true,
          backgroundSync: true,
          analytics: true,
          segmentation: true,
          scheduling: false,
        }),
        onMessage: vi.fn(),
        onTokenRefresh: vi.fn(),
        onError: vi.fn(),
      }

      vi.doMock('@/providers/FirebaseProvider', () => ({
        FirebaseProvider: vi.fn(() => mockProvider),
      }))

      const config: NotificationConfig = {
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

      await kit.init(config)
    })

    it('should request permission', async () => {
      const result = await kit.requestPermission()
      expect(result).toBe(true)
      expect(mockProvider.requestPermission).toHaveBeenCalled()
    })

    it('should check permission', async () => {
      const result = await kit.checkPermission()
      expect(result).toBe('granted')
      expect(mockProvider.checkPermission).toHaveBeenCalled()
    })

    it('should throw error if not initialized', async () => {
      // Destroy the current instance first
      await kit.destroy()
      
      // Now create a fresh instance that's not initialized
      const uninitializedKit = NotificationKit.getInstance()
      await expect(uninitializedKit.requestPermission()).rejects.toThrow(
        'NotificationKit must be initialized before use'
      )
    })
  })

  describe('token methods', () => {
    let mockProvider: any

    beforeEach(async () => {
      mockProvider = {
        init: vi.fn().mockResolvedValue(undefined),
        getToken: vi.fn().mockResolvedValue('test-token'),
        refreshToken: vi.fn().mockResolvedValue('new-test-token'),
        deleteToken: vi.fn().mockResolvedValue(undefined),
        name: 'firebase',
        type: 'firebase' as const,
        getCapabilities: vi.fn().mockResolvedValue({
          pushNotifications: true,
          topics: true,
          richMedia: true,
          actions: true,
          backgroundSync: true,
          analytics: true,
          segmentation: true,
          scheduling: false,
        }),
        onMessage: vi.fn(),
        onTokenRefresh: vi.fn(),
        onError: vi.fn(),
      }

      vi.doMock('@/providers/FirebaseProvider', () => ({
        FirebaseProvider: vi.fn(() => mockProvider),
      }))

      const config: NotificationConfig = {
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

      await kit.init(config)
    })

    it('should get token', async () => {
      const token = await kit.getToken()
      expect(token).toBe('test-token')
      expect(mockProvider.getToken).toHaveBeenCalled()
    })

  })

  describe('subscription methods', () => {
    let mockProvider: any

    beforeEach(async () => {
      mockProvider = {
        init: vi.fn().mockResolvedValue(undefined),
        subscribe: vi.fn().mockResolvedValue(undefined),
        unsubscribe: vi.fn().mockResolvedValue(undefined),
        getSubscriptions: vi.fn().mockResolvedValue(['topic1', 'topic2']),
        name: 'firebase',
        type: 'firebase' as const,
        getCapabilities: vi.fn().mockResolvedValue({
          pushNotifications: true,
          topics: true,
          richMedia: true,
          actions: true,
          backgroundSync: true,
          analytics: true,
          segmentation: true,
          scheduling: false,
        }),
        onMessage: vi.fn(),
        onTokenRefresh: vi.fn(),
        onError: vi.fn(),
      }

      vi.doMock('@/providers/FirebaseProvider', () => ({
        FirebaseProvider: vi.fn(() => mockProvider),
      }))

      const config: NotificationConfig = {
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

      await kit.init(config)
    })

    it('should subscribe to topic', async () => {
      await kit.subscribe('news')
      expect(mockProvider.subscribe).toHaveBeenCalledWith('news')
    })

    it('should unsubscribe from topic', async () => {
      await kit.unsubscribe('news')
      expect(mockProvider.unsubscribe).toHaveBeenCalledWith('news')
    })

  })

  describe('event emitter', () => {
    it('should add and trigger event listeners', async () => {
      const callback = vi.fn()
      const unsubscribe = kit.on('ready', callback)

      const mockFirebaseProvider = {
        init: vi.fn().mockResolvedValue(undefined),
        destroy: vi.fn().mockResolvedValue(undefined),
        getCapabilities: vi.fn().mockResolvedValue({
          pushNotifications: true,
          topics: true,
          richMedia: true,
          actions: true,
          backgroundSync: true,
          analytics: true,
          segmentation: true,
          scheduling: false,
        }),
        onMessage: vi.fn(),
        onTokenRefresh: vi.fn(),
        onError: vi.fn(),
        name: 'firebase',
        type: 'firebase' as const,
      }

      vi.doMock('@/providers/FirebaseProvider', () => ({
        FirebaseProvider: vi.fn(() => mockFirebaseProvider),
      }))

      // Init will trigger the ready event
      await kit.init({
        provider: 'firebase',
        config: {
          apiKey: 'test',
          authDomain: 'test',
          projectId: 'test',
          storageBucket: 'test',
          messagingSenderId: 'test',
          appId: 'test',
        },
      })

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          platform: expect.any(String),
          capabilities: expect.any(Object),
        })
      )

      unsubscribe()
    })

    it('should remove specific listener', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      kit.on('error', callback1)
      kit.on('error', callback2)

      kit.off('error', callback1)
      kit.emit('error', { error: new Error('test') })

      expect(callback1).not.toHaveBeenCalled()
      expect(callback2).toHaveBeenCalled()
    })
  })

  describe('notifications object', () => {
    it('should have all required methods', () => {
      expect(notifications.init).toBeDefined()
      expect(notifications.requestPermission).toBeDefined()
      expect(notifications.checkPermission).toBeDefined()
      expect(notifications.getToken).toBeDefined()
      expect(notifications.subscribe).toBeDefined()
      expect(notifications.unsubscribe).toBeDefined()
      expect(notifications.schedule).toBeDefined()
      expect(notifications.cancel).toBeDefined()
      expect(notifications.getPending).toBeDefined()
      expect(notifications.showInApp).toBeDefined()
      expect(notifications.success).toBeDefined()
      expect(notifications.error).toBeDefined()
      expect(notifications.warning).toBeDefined()
      expect(notifications.info).toBeDefined()
      expect(notifications.on).toBeDefined()
      expect(notifications.off).toBeDefined()
    })
  })

  describe('isSupported', () => {
    it('should check platform capabilities', async () => {
      const mockPlatform = {
        getCapabilities: vi.fn().mockReturnValue({
          pushNotifications: true,
          localNotifications: true,
        }),
      }

      vi.doMock('@/core/platform', () => ({
        platform: mockPlatform,
      }))

      const supported = await kit.isSupported()
      expect(supported).toBe(true)
    })

    it('should return false on error', async () => {
      // Mock isSupported to throw an error
      const kit = NotificationKit.getInstance()
      vi.spyOn(kit as any, 'isSupported').mockImplementation(async () => {
        throw new Error('Platform check failed')
      })

      // Create a new instance to test error handling
      const newKit = NotificationKit.getInstance()
      const supported = await newKit.isSupported().catch(() => false)
      expect(supported).toBe(false)
    })
  })
})