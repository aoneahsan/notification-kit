import { beforeEach, describe, expect, it, vi } from 'vitest'
import { waitFor } from '@testing-library/react'
import { OneSignalProvider } from './OneSignalProvider'
import { DynamicLoader } from '@/utils/dynamic-loader'
import { ConfigValidator } from '@/utils/config-validator'
import { OneSignalNativeBridge } from './OneSignalNativeBridge'
import type { OneSignalConfig, PushNotificationPayload } from '@/types'

const mockOneSignal = {
  init: vi.fn(),
  showSlidedownPrompt: vi.fn(),
  isPushNotificationsEnabled: vi.fn(),
  getUserId: vi.fn(),
  sendTag: vi.fn(),
  deleteTag: vi.fn(),
  getTags: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
}

vi.mock('@/utils/dynamic-loader', () => ({
  DynamicLoader: {
    isNativePlatform: vi.fn(),
    loadOneSignal: vi.fn(),
    loadPushNotifications: vi.fn(),
  },
}))

vi.mock('@/utils/config-validator', () => ({
  ConfigValidator: {
    validateOneSignalConfig: vi.fn(),
    validateEnvironmentVariables: vi.fn(),
  },
}))

vi.mock('./OneSignalNativeBridge', () => ({
  OneSignalNativeBridge: {
    initializeNative: vi.fn(),
  },
}))

describe('OneSignalProvider', () => {
  let provider: OneSignalProvider
  const mockConfig: OneSignalConfig = {
    appId: 'test-app-id',
    restApiKey: 'test-rest-key',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    provider = new OneSignalProvider()

    vi.mocked(DynamicLoader.isNativePlatform).mockResolvedValue(false)
    vi.mocked(DynamicLoader.loadOneSignal).mockResolvedValue({
      default: mockOneSignal,
    } as never)
    vi.mocked(ConfigValidator.validateOneSignalConfig).mockImplementation(
      () => undefined
    )
    vi.mocked(ConfigValidator.validateEnvironmentVariables).mockImplementation(
      () => undefined
    )

    mockOneSignal.init.mockResolvedValue(undefined)
    mockOneSignal.showSlidedownPrompt.mockResolvedValue(true)
    mockOneSignal.isPushNotificationsEnabled.mockResolvedValue(true)
    mockOneSignal.getUserId.mockResolvedValue('test-user-id')
    mockOneSignal.sendTag.mockResolvedValue(undefined)
    mockOneSignal.deleteTag.mockResolvedValue(undefined)
    mockOneSignal.getTags.mockResolvedValue({})
    mockOneSignal.on.mockImplementation(() => undefined)
    mockOneSignal.off.mockImplementation(() => undefined)
  })

  describe('init', () => {
    it('should initialize react-onesignal on web', async () => {
      await provider.init(mockConfig)

      expect(ConfigValidator.validateOneSignalConfig).toHaveBeenCalledWith(
        mockConfig
      )
      expect(ConfigValidator.validateEnvironmentVariables).toHaveBeenCalledWith(
        'onesignal'
      )
      expect(mockOneSignal.init).toHaveBeenCalledWith(
        expect.objectContaining({
          appId: 'test-app-id',
          autoPrompt: true,
          autoResubscribe: true,
          allowLocalhostAsSecureOrigin: false,
        })
      )
      expect(mockOneSignal.on).toHaveBeenCalledTimes(3)
      expect((provider as any).initialized).toBe(true)
    })

    it('should initialize native bridge on native platforms', async () => {
      vi.mocked(DynamicLoader.isNativePlatform).mockResolvedValue(true)
      vi.mocked(DynamicLoader.loadPushNotifications).mockResolvedValue({
        PushNotifications: {
          addListener: vi.fn().mockResolvedValue(undefined),
        },
      } as never)

      await provider.init(mockConfig)

      expect(OneSignalNativeBridge.initializeNative).toHaveBeenCalledWith(
        mockConfig
      )
      expect((provider as any).initialized).toBe(true)
    })
  })

  describe('requestPermission', () => {
    beforeEach(async () => {
      await provider.init(mockConfig)
    })

    it('should request push notification permission on web', async () => {
      mockOneSignal.showSlidedownPrompt.mockResolvedValue(true)

      const result = await provider.requestPermission()

      expect(result).toBe(true)
      expect(mockOneSignal.showSlidedownPrompt).toHaveBeenCalled()
    })

    it('should return false if the web prompt is rejected', async () => {
      mockOneSignal.showSlidedownPrompt.mockRejectedValue(
        new Error('prompt unavailable')
      )
      vi.stubGlobal('Notification', {
        requestPermission: vi.fn().mockResolvedValue('denied'),
      })

      const result = await provider.requestPermission()

      expect(result).toBe(false)
    })
  })

  describe('checkPermission', () => {
    beforeEach(async () => {
      await provider.init(mockConfig)
    })

    it('should return granted when push is enabled on web', async () => {
      mockOneSignal.isPushNotificationsEnabled.mockResolvedValue(true)

      const result = await provider.checkPermission()

      expect(result).toBe('granted')
    })

    it('should return prompt when push is not enabled on web', async () => {
      mockOneSignal.isPushNotificationsEnabled.mockResolvedValue(false)

      const result = await provider.checkPermission()

      expect(result).toBe('prompt')
    })
  })

  describe('getToken', () => {
    beforeEach(async () => {
      await provider.init(mockConfig)
    })

    it('should return the OneSignal user id', async () => {
      mockOneSignal.getUserId.mockResolvedValue('test-token-123')

      const token = await provider.getToken()

      expect(token).toBe('test-token-123')
    })

    it('should reject if no player id is available', async () => {
      mockOneSignal.getUserId.mockResolvedValue('')

      await expect(provider.getToken()).rejects.toThrow(
        'No OneSignal player ID available'
      )
    })
  })

  describe('subscribe/unsubscribe', () => {
    beforeEach(async () => {
      await provider.init(mockConfig)
    })

    it('should subscribe to a topic using tags', async () => {
      await provider.subscribe('news')

      expect(mockOneSignal.sendTag).toHaveBeenCalledWith('news', 'true')
    })

    it('should unsubscribe from a topic', async () => {
      await provider.unsubscribe('news')

      expect(mockOneSignal.deleteTag).toHaveBeenCalledWith('news')
    })

    it('should return all subscribed tag keys', async () => {
      mockOneSignal.getTags.mockResolvedValue({
        news: 'true',
        updates: 'true',
      })

      const subscriptions = await provider.getSubscriptions()

      expect(subscriptions).toEqual(['news', 'updates'])
    })
  })

  describe('sendNotification', () => {
    beforeEach(async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ ok: true, statusText: 'OK' })
      )
      await provider.init(mockConfig)
    })

    it('should send notification using the OneSignal REST API', async () => {
      const payload: PushNotificationPayload = {
        title: 'Test Notification',
        body: 'Test body',
        data: { key: 'value' },
      }

      await provider.sendNotification(payload)

      expect(fetch).toHaveBeenCalledWith(
        'https://onesignal.com/api/v1/notifications',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Basic test-rest-key',
          }),
        })
      )
    })
  })

  describe('event listeners', () => {
    beforeEach(async () => {
      await provider.init(mockConfig)
    })

    it('should handle notification clicked events', async () => {
      const callback = vi.fn()
      provider.onMessage(callback)

      const clickedHandler = mockOneSignal.on.mock.calls.find(
        call => call[0] === 'notificationClicked'
      )?.[1]

      clickedHandler?.({
        heading: 'Clicked',
        content: 'Clicked body',
        additionalData: { source: 'test' },
      })

      expect(callback).toHaveBeenCalledWith({
        title: 'Clicked',
        body: 'Clicked body',
        data: { source: 'test' },
        notification: {
          title: 'Clicked',
          body: 'Clicked body',
        },
      })
    })

    it('should handle subscription changes by notifying token listeners', async () => {
      const callback = vi.fn()
      mockOneSignal.getUserId.mockResolvedValue('new-token')
      provider.onTokenRefresh(callback)

      const subscriptionChangedHandler = mockOneSignal.on.mock.calls.find(
        call => call[0] === 'subscriptionChanged'
      )?.[1]

      subscriptionChangedHandler?.(true)

      await waitFor(() => {
        expect(callback).toHaveBeenCalledWith('new-token')
      })
    })
  })

  describe('capabilities', () => {
    it('should return provider capabilities', async () => {
      await provider.init(mockConfig)

      const capabilities = await provider.getCapabilities()

      expect(capabilities).toEqual(
        expect.objectContaining({
          topics: true,
          scheduling: true,
          analytics: true,
          actions: true,
          pushNotifications: true,
          richMedia: true,
          inAppMessages: true,
        })
      )
    })
  })

  describe('destroy', () => {
    it('should clean up provider state', async () => {
      await provider.init(mockConfig)
      await provider.destroy()

      expect((provider as any).initialized).toBe(false)
      expect((provider as any).config).toBeNull()
    })
  })

  describe('provider info', () => {
    it('should have correct name and type', () => {
      expect(provider.name).toBe('onesignal')
      expect(provider.type).toBe('onesignal')
    })
  })
})
