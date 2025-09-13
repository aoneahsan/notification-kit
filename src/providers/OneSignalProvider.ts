import { DynamicLoader } from '@/utils/dynamic-loader'
import { OneSignalNativeBridge } from './OneSignalNativeBridge'
import { ConfigValidator } from '@/utils/config-validator'
import type OneSignal from 'react-onesignal'
import type {
  NotificationProvider,
  OneSignalConfig,
  PushNotificationPayload,
  PermissionStatus,
  ProviderCapabilities,
} from '@/types'
import { isOneSignalInstanceConfig } from '@/types'
// @ts-ignore - used conditionally  
const _ = isOneSignalInstanceConfig

/**
 * OneSignal provider for push notifications
 */
export class OneSignalProvider implements NotificationProvider {
  readonly name = 'onesignal'
  readonly type = 'onesignal' as const

  private config: OneSignalConfig | null = null
  private initialized = false
  private OneSignal: typeof OneSignal | null = null
  private messageListeners: ((payload: PushNotificationPayload) => void)[] = []
  private tokenListeners: ((token: string) => void)[] = []
  private errorListeners: ((error: Error) => void)[] = []

  /**
   * Initialize OneSignal provider
   */
  async init(config: OneSignalConfig): Promise<void> {
    try {
      // Import the type guard function
      const { isOneSignalInstanceConfig } = await import('@/types')
      
      this.config = config

      // Check if an existing OneSignal instance is provided
      if (isOneSignalInstanceConfig(config)) {
        // Use existing OneSignal instance
        this.OneSignal = config.instance
        this.initialized = true
        
        const isNative = await DynamicLoader.isNativePlatform()
        if (isNative) {
          await this.setupNativeEventListeners()
        } else {
          await this.setupEventListeners()
        }
      } else {
        // Validate configuration for new initialization
        ConfigValidator.validateOneSignalConfig(config)
        ConfigValidator.validateEnvironmentVariables('onesignal')

        const isNative = await DynamicLoader.isNativePlatform()
        
        if (isNative) {
          // For native platforms, initialize through the native bridge
          await OneSignalNativeBridge.initializeNative(config)
          
          // Native platforms use the OneSignal Capacitor SDK
          // which has a different API than react-onesignal
          this.initialized = true
          await this.setupNativeEventListeners()
        } else {
          // For web platform, use react-onesignal
          const initOptions: Record<string, unknown> = {
            appId: config.appId,
            safari_web_id: config.safariWebId,
            autoPrompt: config.autoPrompt ?? true,
            autoResubscribe: config.autoResubscribe ?? true,
            path: config.path,
            serviceWorkerPath: config.serviceWorkerPath,
            serviceWorkerUpdaterPath: config.serviceWorkerUpdaterPath,
            notificationClickHandlerMatch:
              config.notificationClickHandlerMatch ?? 'origin',
            notificationClickHandlerAction:
              config.notificationClickHandlerAction ?? 'focusOrNavigate',
            allowLocalhostAsSecureOrigin:
              config.allowLocalhostAsSecureOrigin ?? false,
          }

          if (config.promptOptions) {
            initOptions.promptOptions = config.promptOptions
          }

          if (config.welcomeNotification) {
            initOptions.welcomeNotification = config.welcomeNotification
          }

          // Dynamically import OneSignal
          const oneSignalModule = await DynamicLoader.loadOneSignal()
          if (!oneSignalModule) {
            throw new Error('OneSignal is required but not installed')
          }
          this.OneSignal = oneSignalModule.default
          
          await this.OneSignal.init(initOptions as Parameters<typeof this.OneSignal.init>[0])

          this.initialized = true
          await this.setupEventListeners()
        }
      }
    } catch (error) {
      this.handleError(new Error(`OneSignal initialization failed: ${error}`))
      throw error
    }
  }

  /**
   * Destroy OneSignal provider
   */
  async destroy(): Promise<void> {
    try {
      if (this.initialized) {
        // OneSignal doesn't have a destroy method, so we'll just clean up our state
        this.initialized = false
        this.config = null
        this.messageListeners = []
        this.tokenListeners = []
        this.errorListeners = []
      }
    } catch (error) {
      this.handleError(new Error(`OneSignal destroy failed: ${error}`))
      throw error
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    try {
      const isNative = await DynamicLoader.isNativePlatform()
      if (isNative) {
        return await this.requestNativePermission()
      } else {
        return await this.requestWebPermission()
      }
    } catch (error) {
      this.handleError(new Error(`Permission request failed: ${error}`))
      return false
    }
  }

  /**
   * Check notification permission status
   */
  async checkPermission(): Promise<PermissionStatus> {
    try {
      const isNative = await DynamicLoader.isNativePlatform()
      if (isNative) {
        return await this.checkNativePermission()
      } else {
        return await this.checkWebPermission()
      }
    } catch (error) {
      this.handleError(new Error(`Permission check failed: ${error}`))
      return 'denied'
    }
  }

  /**
   * Get OneSignal player ID (token)
   */
  async getToken(): Promise<string> {
    try {
      if (!this.OneSignal) {
        throw new Error('OneSignal not initialized')
      }
      const playerId = await (
        this.OneSignal as unknown as { getUserId: () => Promise<string> }
      ).getUserId()

      if (playerId) {
        return playerId
      } else {
        throw new Error('No OneSignal player ID available')
      }
    } catch (error) {
      this.handleError(new Error(`Token retrieval failed: ${error}`))
      throw error
    }
  }

  /**
   * Refresh OneSignal token
   */
  async refreshToken(): Promise<string> {
    try {
      // OneSignal handles token refresh automatically
      const newToken = await this.getToken()
      this.notifyTokenListeners(newToken)
      return newToken
    } catch (error) {
      this.handleError(new Error(`Token refresh failed: ${error}`))
      throw error
    }
  }

  /**
   * Delete OneSignal token
   */
  async deleteToken(): Promise<void> {
    try {
      if (!this.OneSignal) {
        throw new Error('OneSignal not initialized')
      }
      await (
        this.OneSignal as unknown as { logoutUser: () => Promise<void> }
      ).logoutUser()
    } catch (error) {
      this.handleError(new Error(`Token deletion failed: ${error}`))
      throw error
    }
  }

  /**
   * Subscribe to tag (OneSignal's equivalent of topics)
   */
  async subscribe(topic: string): Promise<void> {
    try {
      if (!this.OneSignal) {
        throw new Error('OneSignal not initialized')
      }
      await (
        this.OneSignal as unknown as {
          sendTag: (key: string, value: string) => Promise<void>
        }
      ).sendTag(topic, 'true')
    } catch (error) {
      this.handleError(new Error(`Tag subscription failed: ${error}`))
      throw error
    }
  }

  /**
   * Unsubscribe from tag
   */
  async unsubscribe(topic: string): Promise<void> {
    try {
      if (!this.OneSignal) {
        throw new Error('OneSignal not initialized')
      }
      await (
        this.OneSignal as unknown as { deleteTag: (key: string) => Promise<void> }
      ).deleteTag(topic)
    } catch (error) {
      this.handleError(new Error(`Tag unsubscription failed: ${error}`))
      throw error
    }
  }

  /**
   * Get subscribed tags
   */
  async getSubscriptions(): Promise<string[]> {
    try {
      if (!this.OneSignal) {
        throw new Error('OneSignal not initialized')
      }
      const tags = await (
        this.OneSignal as unknown as {
          getTags: () => Promise<Record<string, string>>
        }
      ).getTags()
      return Object.keys(tags || {})
    } catch (error) {
      this.handleError(new Error(`Get subscriptions failed: ${error}`))
      throw error
    }
  }

  /**
   * Send notification (requires REST API)
   */
  async sendNotification(payload: PushNotificationPayload): Promise<void> {
    if (!this.config || isOneSignalInstanceConfig(this.config) || !this.config.restApiKey) {
      throw new Error('REST API key required for sending notifications')
    }

    try {
      const response = await fetch(
        'https://onesignal.com/api/v1/notifications',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${this.config.restApiKey}`,
          },
          body: JSON.stringify({
            app_id: this.config.appId,
            headings: { en: payload.notification?.title || 'Notification' },
            contents: { en: payload.notification?.body || '' },
            data: payload.data,
            included_segments: ['All'],
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`OneSignal API error: ${response.statusText}`)
      }
    } catch (error) {
      this.handleError(new Error(`Send notification failed: ${error}`))
      throw error
    }
  }

  /**
   * Listen for messages
   */
  onMessage(callback: (payload: PushNotificationPayload) => void): () => void {
    this.messageListeners.push(callback)

    return () => {
      const index = this.messageListeners.indexOf(callback)
      if (index > -1) {
        this.messageListeners.splice(index, 1)
      }
    }
  }

  /**
   * Listen for token refresh
   */
  onTokenRefresh(callback: (token: string) => void): () => void {
    this.tokenListeners.push(callback)

    return () => {
      const index = this.tokenListeners.indexOf(callback)
      if (index > -1) {
        this.tokenListeners.splice(index, 1)
      }
    }
  }

  /**
   * Listen for errors
   */
  onError(callback: (error: Error) => void): () => void {
    this.errorListeners.push(callback)

    return () => {
      const index = this.errorListeners.indexOf(callback)
      if (index > -1) {
        this.errorListeners.splice(index, 1)
      }
    }
  }

  /**
   * Check if OneSignal is supported
   */
  async isSupported(): Promise<boolean> {
    try {
      const isNative = await DynamicLoader.isNativePlatform()
      if (isNative) {
        return true
      } else {
        // Check if we're in a supported browser environment
        return (
          typeof window !== 'undefined' &&
          'serviceWorker' in navigator &&
          'PushManager' in window
        )
      }
    } catch (_error) {
      return false
    }
  }

  /**
   * Get provider capabilities
   */
  async getCapabilities(): Promise<ProviderCapabilities> {
    const isWeb = !(await DynamicLoader.isNativePlatform())

    return {
      topics: true, // Using tags
      scheduling: true,
      analytics: true,
      segmentation: true,
      templates: true,
      webhooks: true,
      batch: true,
      priority: true,
      ttl: true,
      collapse: true,
      pushNotifications: true,
      richMedia: true,
      actions: true,
      backgroundSync: true,
      geofencing: false,
      inAppMessages: true,
      webPush: isWeb,
      badges: !isWeb,
      sounds: true,
      vibration: !isWeb,
      lights: !isWeb,
      bigText: !isWeb,
      bigPicture: !isWeb,
      inbox: false,
      progress: false,
      channels: !isWeb,
      groups: !isWeb,
      categories: true,
      quietHours: true,
      deliveryReceipts: true,
      clickTracking: true,
      impressionTracking: true,
      customData: true,
      multipleDevices: true,
      userTags: true,
      triggers: true,
      abTesting: true,
      automation: true,
      journeys: true,
      realTimeUpdates: true,
    }
  }

  /**
   * Setup native event listeners for Capacitor
   */
  private async setupNativeEventListeners(): Promise<void> {
    try {
      // For native platforms, we use Capacitor's push notification events
      const pushNotificationsModule = await DynamicLoader.loadPushNotifications()
      if (!pushNotificationsModule) {
        throw new Error('Push notifications module not available')
      }
      
      const { PushNotifications } = pushNotificationsModule

      // Listen for push notifications
      await PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
        const payload: PushNotificationPayload = {
          title: notification.title || '',
          body: notification.body || '',
          data: notification.data || {},
          notification: {
            title: notification.title || '',
            body: notification.body || '',
            ...(notification.id && { id: notification.id }),
            ...(notification.badge && { badge: notification.badge.toString() }),
          },
        }
        this.notifyMessageListeners(payload)
      })

      // Listen for notification actions
      await PushNotifications.addListener('pushNotificationActionPerformed', (notificationAction: any) => {
        const payload: PushNotificationPayload = {
          title: notificationAction.notification?.title || '',
          body: notificationAction.notification?.body || '',
          data: notificationAction.notification.data || {},
          notification: {
            title: notificationAction.notification.title || '',
            body: notificationAction.notification.body || '',
            ...(notificationAction.notification.id && { id: notificationAction.notification.id }),
          },
        }
        this.notifyMessageListeners(payload)
      })

      // Listen for registration changes
      await PushNotifications.addListener('registration', (token: any) => {
        this.notifyTokenListeners(token.value)
      })

      // Listen for registration errors
      await PushNotifications.addListener('registrationError', (error: any) => {
        this.handleError(new Error(`Registration error: ${error.error}`))
      })
    } catch (error) {
      this.handleError(new Error(`Native event listener setup failed: ${error}`))
    }
  }

  /**
   * Setup event listeners
   */
  private async setupEventListeners(): Promise<void> {
    try {
      if (!this.OneSignal) {
        throw new Error('OneSignal not initialized')
      }
      const oneSignalInstance = this.OneSignal as unknown as {
        on: (event: string, callback: (data: unknown) => void) => void
      }

      // Listen for notification received
      oneSignalInstance.on('notificationReceived', notification => {
        const notificationData = notification as Record<string, unknown>
        const notificationObj: Record<string, unknown> = {
          title: notificationData.heading as string,
          body: notificationData.content as string,
        }

        if (notificationData.icon)
          notificationObj.icon = notificationData.icon as string
        if (notificationData.badge)
          notificationObj.badge = notificationData.badge as string
        if (notificationData.image)
          notificationObj.image = notificationData.image as string

        const payload: PushNotificationPayload = {
          title: (notificationObj.title as string) || '',
          body: (notificationObj.body as string) || '',
          data:
            (notificationData.additionalData as Record<string, unknown>) || {},
          notification: notificationObj,
        }

        this.notifyMessageListeners(payload)
      })

      // Listen for notification clicked
      oneSignalInstance.on('notificationClicked', notification => {
        const notificationData = notification as Record<string, unknown>
        const notificationObj: Record<string, unknown> = {
          title: notificationData.heading as string,
          body: notificationData.content as string,
        }

        if (notificationData.icon)
          notificationObj.icon = notificationData.icon as string
        if (notificationData.badge)
          notificationObj.badge = notificationData.badge as string
        if (notificationData.image)
          notificationObj.image = notificationData.image as string

        const payload: PushNotificationPayload = {
          title: (notificationObj.title as string) || '',
          body: (notificationObj.body as string) || '',
          data:
            (notificationData.additionalData as Record<string, unknown>) || {},
          notification: notificationObj,
        }

        this.notifyMessageListeners(payload)
      })

      // Listen for subscription changes
      oneSignalInstance.on('subscriptionChanged', isSubscribed => {
        if (isSubscribed) {
          this.getToken()
            .then(token => {
              this.notifyTokenListeners(token)
            })
            .catch(error => {
              this.handleError(
                new Error(
                  `Token refresh on subscription change failed: ${error}`
                )
              )
            })
        }
      })
    } catch (error) {
      this.handleError(new Error(`Event listener setup failed: ${error}`))
    }
  }

  /**
   * Request native permission
   */
  private async requestNativePermission(): Promise<boolean> {
    try {
      const pushNotificationsModule = await DynamicLoader.loadPushNotifications()
      if (!pushNotificationsModule) {
        throw new Error('Push notifications require @capacitor/push-notifications')
      }
      const { PushNotifications } = pushNotificationsModule
      const result = await PushNotifications.requestPermissions()
      return result.receive === 'granted'
    } catch (_error) {
      return false
    }
  }

  /**
   * Check native permission
   */
  private async checkNativePermission(): Promise<PermissionStatus> {
    try {
      const pushNotificationsModule = await DynamicLoader.loadPushNotifications()
      if (!pushNotificationsModule) {
        throw new Error('Push notifications require @capacitor/push-notifications')
      }
      const { PushNotifications } = pushNotificationsModule
      const result = await PushNotifications.checkPermissions()

      if (result.receive === 'granted') {
        return 'granted'
      } else if (result.receive === 'denied') {
        return 'denied'
      } else if (result.receive === 'prompt') {
        return 'prompt'
      } else {
        return 'unknown'
      }
    } catch (_error) {
      return 'denied'
    }
  }

  /**
   * Request web permission
   */
  private async requestWebPermission(): Promise<boolean> {
    try {
      if (!this.OneSignal) {
        throw new Error('OneSignal not initialized')
      }
      const permission = await (
        this.OneSignal as unknown as { showSlidedownPrompt: () => Promise<boolean> }
      ).showSlidedownPrompt()
      return permission
    } catch (_error) {
      // Fallback to native browser permission
      if ('Notification' in window) {
        const permission = await Notification.requestPermission()
        return permission === 'granted'
      }
      return false
    }
  }

  /**
   * Check web permission
   */
  private async checkWebPermission(): Promise<PermissionStatus> {
    try {
      if (!this.OneSignal) {
        throw new Error('OneSignal not initialized')
      }
      const isSubscribed = await (
        this.OneSignal as unknown as {
          isPushNotificationsEnabled: () => Promise<boolean>
        }
      ).isPushNotificationsEnabled()
      return isSubscribed ? 'granted' : 'prompt'
    } catch (_error) {
      // Fallback to native browser permission
      if ('Notification' in window) {
        const permission = Notification.permission
        if (permission === 'default') {
          return 'prompt'
        }
        return permission as PermissionStatus
      }
      return 'denied'
    }
  }

  /**
   * Notify message listeners
   */
  private notifyMessageListeners(payload: PushNotificationPayload): void {
    this.messageListeners.forEach(listener => {
      try {
        listener(payload)
      } catch (error) {
        this.handleError(new Error(`Message listener error: ${error}`))
      }
    })
  }

  /**
   * Notify token listeners
   */
  private notifyTokenListeners(token: string): void {
    this.tokenListeners.forEach(listener => {
      try {
        listener(token)
      } catch (error) {
        this.handleError(new Error(`Token listener error: ${error}`))
      }
    })
  }

  /**
   * Handle errors
   */
  private handleError(error: Error): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(error)
      } catch (listenerError) {
        // Silently ignore error listener failures
      }
    })
  }
}
