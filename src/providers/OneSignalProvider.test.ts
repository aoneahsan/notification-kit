import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { OneSignalProvider } from './OneSignalProvider'
import type { OneSignalConfig, PushNotificationPayload } from '@/types'

// Create a mock OneSignal object to reuse across tests
const mockOneSignal = {
  setAppId: vi.fn(),
  setNotificationOpenedHandler: vi.fn(),
  setNotificationWillShowInForegroundHandler: vi.fn(),
  promptForPushNotificationsWithUserResponse: vi.fn(() =>
    Promise.resolve(true)
  ),
  getDeviceState: vi.fn(() =>
    Promise.resolve({
      isSubscribed: true,
      userId: 'test-user-id',
      pushToken: 'test-push-token',
      hasNotificationPermission: true,
      notificationPermissionStatus: 1,
    })
  ),
  addSubscriptionObserver: vi.fn(),
  removeSubscriptionObserver: vi.fn(),
  addPermissionObserver: vi.fn(),
  removePermissionObserver: vi.fn(),
  sendTag: vi.fn(() => Promise.resolve()),
  deleteTag: vi.fn(() => Promise.resolve()),
  getTags: vi.fn(() => Promise.resolve({})),
  setExternalUserId: vi.fn(() => Promise.resolve()),
  removeExternalUserId: vi.fn(() => Promise.resolve()),
  postNotification: vi.fn(() => Promise.resolve()),
  clearOneSignalNotifications: vi.fn(),
}

// Mock OneSignal
vi.mock('onesignal-cordova-plugin', () => ({
  default: mockOneSignal,
}))

vi.mock('@/core/platform', () => ({
  platform: {
    getPlatform: vi.fn(() => 'android'),
    isWeb: vi.fn(() => false),
    isNative: vi.fn(() => true),
  },
}))

describe('OneSignalProvider', () => {
  let provider: OneSignalProvider
  const mockConfig: OneSignalConfig = {
    appId: 'test-app-id',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    provider = new OneSignalProvider()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('init', () => {
    it('should initialize OneSignal with app ID', async () => {
      await provider.init(mockConfig)

      expect(mockOneSignal.setAppId).toHaveBeenCalledWith(mockConfig.appId)
      expect(provider.isInitialized()).toBe(true)
    })

    it('should not reinitialize if already initialized', async () => {
      await provider.init(mockConfig)
      await provider.init(mockConfig)

      expect(mockOneSignal.setAppId).toHaveBeenCalledTimes(1)
    })

    it('should setup notification handlers', async () => {
      await provider.init(mockConfig)

      expect(mockOneSignal.setNotificationOpenedHandler).toHaveBeenCalled()
      expect(
        mockOneSignal.setNotificationWillShowInForegroundHandler
      ).toHaveBeenCalled()
    })
  })

  describe('requestPermission', () => {
    beforeEach(async () => {
      await provider.init(mockConfig)
    })

    it('should request push notification permission', async () => {
      mockOneSignal.promptForPushNotificationsWithUserResponse.mockResolvedValue(
        true
      )

      const result = await provider.requestPermission()

      expect(result).toBe(true)
      expect(
        mockOneSignal.promptForPushNotificationsWithUserResponse
      ).toHaveBeenCalled()
    })

    it('should return false if permission denied', async () => {
      mockOneSignal.promptForPushNotificationsWithUserResponse.mockResolvedValue(
        false
      )

      const result = await provider.requestPermission()

      expect(result).toBe(false)
    })
  })

  describe('checkPermission', () => {
    beforeEach(async () => {
      await provider.init(mockConfig)
    })

    it('should return granted when has permission', async () => {
      mockOneSignal.getDeviceState.mockResolvedValue({
        hasNotificationPermission: true,
        notificationPermissionStatus: 2, // Authorized
      })

      const result = await provider.checkPermission()

      expect(result).toBe('granted')
    })

    it('should return denied when permission denied', async () => {
      mockOneSignal.getDeviceState.mockResolvedValue({
        hasNotificationPermission: false,
        notificationPermissionStatus: 0, // NotDetermined
      })

      const result = await provider.checkPermission()

      expect(result).toBe('denied')
    })

    it('should return prompt when permission not determined', async () => {
      mockOneSignal.getDeviceState.mockResolvedValue({
        hasNotificationPermission: false,
        notificationPermissionStatus: 1, // Denied
      })

      const result = await provider.checkPermission()

      expect(result).toBe('prompt')
    })
  })

  describe('getToken', () => {
    beforeEach(async () => {
      await provider.init(mockConfig)
    })

    it('should return push token from device state', async () => {
      mockOneSignal.getDeviceState.mockResolvedValue({
        pushToken: 'test-token-123',
      })

      const token = await provider.getToken()

      expect(token).toBe('test-token-123')
    })

    it('should return empty string if no token', async () => {
      mockOneSignal.getDeviceState.mockResolvedValue({
        pushToken: null,
      })

      const token = await provider.getToken()

      expect(token).toBe('')
    })
  })

  describe('subscribe/unsubscribe', () => {
    beforeEach(async () => {
      await provider.init(mockConfig)
    })

    it('should subscribe to topic using tags', async () => {
      await provider.subscribe('news')

      expect(mockOneSignal.sendTag).toHaveBeenCalledWith('topic_news', '1')
    })

    it('should unsubscribe from topic', async () => {
      await provider.unsubscribe('news')

      expect(mockOneSignal.deleteTag).toHaveBeenCalledWith('topic_news')
    })

    it('should get subscriptions from tags', async () => {
      mockOneSignal.getTags.mockResolvedValue({
        topic_news: '1',
        topic_updates: '1',
        other_tag: 'value',
      })

      const subscriptions = await provider.getSubscriptions()

      expect(subscriptions).toEqual(['news', 'updates'])
    })
  })

  describe('sendNotification', () => {
    beforeEach(async () => {
      await provider.init(mockConfig)
    })

    it('should send notification using OneSignal API', async () => {
      const payload: PushNotificationPayload = {
        title: 'Test Notification',
        body: 'Test body',
        data: { key: 'value' },
      }

      await provider.sendNotification(payload)

      expect(mockOneSignal.postNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          contents: { en: payload.body },
          headings: { en: payload.title },
          data: payload.data,
        })
      )
    })

    it('should include additional fields if provided', async () => {
      const payload: PushNotificationPayload = {
        title: 'Test',
        body: 'Body',
        data: {},
        image: 'https://example.com/image.png',
        sound: 'custom.wav',
      }

      await provider.sendNotification(payload)

      expect(mockOneSignal.postNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          big_picture: payload.image,
          android_sound: payload.sound,
          ios_sound: payload.sound,
        })
      )
    })
  })

  describe('event listeners', () => {
    beforeEach(async () => {
      await provider.init(mockConfig)
    })

    it('should handle notification opened', async () => {
      const callback = vi.fn()
      provider.onMessage(callback)

      const openedHandler =
        mockOneSignal.setNotificationOpenedHandler.mock.calls[0][0]

      const mockNotification = {
        notification: {
          title: 'Test',
          body: 'Test body',
          additionalData: { key: 'value' },
        },
      }

      openedHandler(mockNotification)

      expect(callback).toHaveBeenCalledWith({
        title: 'Test',
        body: 'Test body',
        data: { key: 'value' },
      })
    })

    it('should handle notification in foreground', async () => {
      const callback = vi.fn()
      provider.onMessage(callback)

      const foregroundHandler =
        mockOneSignal.setNotificationWillShowInForegroundHandler.mock
          .calls[0][0]

      const mockNotification = {
        notification: {
          title: 'Foreground',
          body: 'Foreground body',
          additionalData: { type: 'alert' },
        },
        complete: vi.fn(),
      }

      foregroundHandler(mockNotification)

      expect(callback).toHaveBeenCalledWith({
        title: 'Foreground',
        body: 'Foreground body',
        data: { type: 'alert' },
      })
      expect(mockNotification.complete).toHaveBeenCalledWith(
        mockNotification.notification
      )
    })

    it('should handle subscription changes', async () => {
      const callback = vi.fn()
      provider.onTokenRefresh(callback)

      const subscriptionObserver =
        mockOneSignal.addSubscriptionObserver.mock.calls[0][0]

      subscriptionObserver({
        to: {
          userId: 'new-user-id',
          pushToken: 'new-token',
        },
      })

      expect(callback).toHaveBeenCalledWith('new-token')
    })
  })

  describe('capabilities', () => {
    it('should return provider capabilities', async () => {
      await provider.init(mockConfig)

      const capabilities = await provider.getCapabilities()

      expect(capabilities).toEqual({
        push: true,
        local: false,
        inApp: false,
        channels: false,
        topics: true,
        rich: true,
        actions: true,
        silent: true,
        critical: false,
      })
    })
  })

  describe('destroy', () => {
    it('should clean up resources and observers', async () => {
      await provider.init(mockConfig)

      // Add some observers
      const callback = vi.fn()
      provider.onTokenRefresh(callback)

      await provider.destroy()

      expect(provider.isInitialized()).toBe(false)
      expect(mockOneSignal.removeSubscriptionObserver).toHaveBeenCalled()
      expect(mockOneSignal.removePermissionObserver).toHaveBeenCalled()
    })
  })

  describe('provider info', () => {
    it('should have correct name and type', () => {
      expect(provider.name).toBe('onesignal')
      expect(provider.type).toBe('onesignal')
    })
  })
})
