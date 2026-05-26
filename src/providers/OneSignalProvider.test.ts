import { beforeEach, describe, expect, it, vi } from 'vitest'
import { waitFor } from '@testing-library/react'
import { OneSignalProvider } from './OneSignalProvider'
import { DynamicLoader } from '@/utils/dynamic-loader'
import { ConfigValidator } from '@/utils/config-validator'
import { OneSignalNativeBridge } from './OneSignalNativeBridge'
import type { OneSignalConfig, PushNotificationPayload } from '@/types'

// react-onesignal v3 namespaced API mock.
const mockPushSubscription = {
  id: 'test-user-id',
  token: 'test-push-token',
  optedIn: true,
  optIn: vi.fn().mockResolvedValue(undefined),
  optOut: vi.fn().mockResolvedValue(undefined),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}
const mockOneSignal = {
  init: vi.fn(),
  login: vi.fn().mockResolvedValue(undefined),
  logout: vi.fn().mockResolvedValue(undefined),
  Notifications: {
    permission: true,
    requestPermission: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
  User: {
    addTag: vi.fn(),
    addTags: vi.fn(),
    removeTag: vi.fn(),
    removeTags: vi.fn(),
    getTags: vi.fn(() => ({})),
    PushSubscription: mockPushSubscription,
  },
  Slidedown: {
    promptPush: vi.fn().mockResolvedValue(undefined),
  },
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
    mockOneSignal.Notifications.permission = true
    mockOneSignal.Notifications.requestPermission.mockResolvedValue(true)
    mockOneSignal.User.getTags.mockReturnValue({})
    mockPushSubscription.id = 'test-user-id'
    mockPushSubscription.optOut.mockResolvedValue(undefined)
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
      // v3 registers 2 notification listeners (foregroundWillDisplay + click)
      // and 1 push-subscription change listener.
      expect(mockOneSignal.Notifications.addEventListener).toHaveBeenCalledTimes(
        2
      )
      expect(
        mockOneSignal.User.PushSubscription.addEventListener
      ).toHaveBeenCalledTimes(1)
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
      mockOneSignal.Notifications.requestPermission.mockResolvedValue(true)

      const result = await provider.requestPermission()

      expect(result).toBe(true)
      expect(mockOneSignal.Notifications.requestPermission).toHaveBeenCalled()
    })

    it('should return false if the web prompt is rejected', async () => {
      mockOneSignal.Notifications.requestPermission.mockRejectedValue(
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
      mockOneSignal.Notifications.permission = true

      const result = await provider.checkPermission()

      expect(result).toBe('granted')
    })

    it('should return prompt when push is not enabled on web', async () => {
      mockOneSignal.Notifications.permission = false
      vi.stubGlobal('Notification', { permission: 'default' })

      const result = await provider.checkPermission()

      expect(result).toBe('prompt')
    })
  })

  describe('getToken', () => {
    beforeEach(async () => {
      await provider.init(mockConfig)
    })

    it('should return the OneSignal subscription id', async () => {
      mockPushSubscription.id = 'test-token-123'

      const token = await provider.getToken()

      expect(token).toBe('test-token-123')
    })

    it('should reject if no subscription id is available', async () => {
      mockPushSubscription.id = ''

      await expect(provider.getToken()).rejects.toThrow(
        'No OneSignal subscription ID available'
      )
    })
  })

  describe('subscribe/unsubscribe', () => {
    beforeEach(async () => {
      await provider.init(mockConfig)
    })

    it('should subscribe to a topic using tags', async () => {
      await provider.subscribe('news')

      expect(mockOneSignal.User.addTag).toHaveBeenCalledWith('news', 'true')
    })

    it('should unsubscribe from a topic', async () => {
      await provider.unsubscribe('news')

      expect(mockOneSignal.User.removeTag).toHaveBeenCalledWith('news')
    })

    it('should return all subscribed tag keys', async () => {
      mockOneSignal.User.getTags.mockReturnValue({
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

    it('refuses to send from the client and never transmits the REST API key', async () => {
      const payload: PushNotificationPayload = {
        title: 'Test Notification',
        body: 'Test body',
        data: { key: 'value' },
      }

      // Client-side sending is disabled for security: the OneSignal REST API
      // key is an account-level secret and must stay server-side.
      await expect(provider.sendNotification(payload)).rejects.toThrow(
        /client|server|REST API key/i
      )
      expect(fetch).not.toHaveBeenCalled()
    })
  })

  describe('event listeners', () => {
    beforeEach(async () => {
      await provider.init(mockConfig)
    })

    it('should handle notification clicked events', async () => {
      const callback = vi.fn()
      provider.onMessage(callback)

      const clickedHandler =
        mockOneSignal.Notifications.addEventListener.mock.calls.find(
          call => call[0] === 'click'
        )?.[1]

      clickedHandler?.({
        notification: {
          title: 'Clicked',
          body: 'Clicked body',
          additionalData: { source: 'test' },
        },
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
      provider.onTokenRefresh(callback)

      const changeHandler =
        mockOneSignal.User.PushSubscription.addEventListener.mock.calls.find(
          call => call[0] === 'change'
        )?.[1]

      changeHandler?.({ current: { id: 'new-token' } })

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
