import { DynamicLoader } from '@/utils/dynamic-loader'
import { OneSignalNativeBridge } from './OneSignalNativeBridge'
import { ConfigValidator } from '@/utils/config-validator'
import { Logger } from '@/utils/logger'
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
  // Native (Capacitor) device-push state. NOTE: native OneSignal here uses the
  // generic @capacitor/push-notifications device token, NOT the OneSignal native
  // SDK (which this zero-dependency library does not bundle). OneSignal-specific
  // targeting on native requires adding onesignal's native plugin in your app;
  // for native push prefer the Firebase (FCM) provider.
  private nativeToken: string | null = null
  private nativeListenerHandles: Array<{ remove: () => Promise<void> }> = []

  /**
   * Initialize OneSignal provider
   */
  async init(config: OneSignalConfig): Promise<void> {
    try {
      // Guard against accidental double-initialization (re-init replaces the
      // previously stored config).
      if (this.config || this.initialized) {
        Logger.warn(
          'OneSignalProvider.init() called more than once; re-initializing with the new config.'
        )
      }

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
      // Remove native push listeners so they don't fire into a torn-down
      // provider or accumulate across re-init.
      for (const handle of this.nativeListenerHandles) {
        try {
          await handle.remove()
        } catch (error) {
          Logger.debug(
            'notification-kit: failed to remove OneSignal native listener',
            error
          )
        }
      }
      this.nativeListenerHandles = []
      this.nativeToken = null

      // OneSignal (web) has no teardown API; clear our own state.
      this.initialized = false
      this.config = null
      this.OneSignal = null
      this.messageListeners = []
      this.tokenListeners = []
      this.errorListeners = []
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
      const isNative = await DynamicLoader.isNativePlatform()
      if (isNative) {
        if (this.nativeToken) {
          return this.nativeToken
        }
        throw new Error(
          'No native push token yet. Call requestPermission() first — it registers ' +
            'the device and the token arrives on the registration event.'
        )
      }

      if (!this.OneSignal) {
        throw new Error('OneSignal not initialized')
      }
      // v3: the push subscription id (the v1 "player id" equivalent) is the
      // value you target when sending. It's a property, not an async call.
      const subscriptionId = this.OneSignal.User.PushSubscription.id
      if (subscriptionId) {
        return subscriptionId
      }
      throw new Error('No OneSignal subscription ID available yet')
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
      // v3: opt the device out of push (invalidates the subscription).
      await this.OneSignal.User.PushSubscription.optOut()
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
      // v3: tags are OneSignal's topic equivalent. addTag is synchronous.
      this.OneSignal.User.addTag(topic, 'true')
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
      this.OneSignal.User.removeTag(topic)
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
      const tags = this.OneSignal.User.getTags()
      return Object.keys(tags || {})
    } catch (error) {
      this.handleError(new Error(`Get subscriptions failed: ${error}`))
      throw error
    }
  }

  /**
   * Sending notifications is intentionally NOT supported from the client.
   *
   * The OneSignal REST API key is an account-level secret. Calling the
   * OneSignal notifications endpoint requires it in an `Authorization` header,
   * so doing it from client/app code (web, iOS, Android) would embed the key
   * in your JavaScript bundle and leak it over the network — allowing anyone
   * to send notifications from, and read data in, your OneSignal account.
   *
   * Send notifications from a trusted server instead: your backend calls
   * `POST https://api.onesignal.com/notifications` with the REST API key kept
   * server-side. This method always throws to prevent the insecure pattern.
   *
   * @throws Always — client-side sending would leak the REST API key.
   */
  async sendNotification(_payload: PushNotificationPayload): Promise<void> {
    throw new Error(
      'notification-kit: sending OneSignal notifications from the client is ' +
        'disabled for security. The OneSignal REST API key is an account-level ' +
        'secret and must never ship in client code. Send notifications from your ' +
        'trusted backend (POST https://api.onesignal.com/notifications with the ' +
        'REST API key in a server-side Authorization header).'
    )
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

      const receivedHandle = await PushNotifications.addListener(
        'pushNotificationReceived',
        (notification: any) => {
          this.notifyMessageListeners(this.fromNativePush(notification))
        }
      )
      this.nativeListenerHandles.push(receivedHandle)

      const actionHandle = await PushNotifications.addListener(
        'pushNotificationActionPerformed',
        (action: any) => {
          // Consistent optional chaining — action.notification can be undefined.
          this.notifyMessageListeners(this.fromNativePush(action?.notification))
        }
      )
      this.nativeListenerHandles.push(actionHandle)

      const registrationHandle = await PushNotifications.addListener(
        'registration',
        (token: any) => {
          this.nativeToken = token?.value ?? null
          if (token?.value) {
            this.notifyTokenListeners(token.value)
          }
        }
      )
      this.nativeListenerHandles.push(registrationHandle)

      const registrationErrorHandle = await PushNotifications.addListener(
        'registrationError',
        (error: any) => {
          this.handleError(new Error(`Registration error: ${error?.error}`))
        }
      )
      this.nativeListenerHandles.push(registrationErrorHandle)
    } catch (error) {
      this.handleError(new Error(`Native event listener setup failed: ${error}`))
    }
  }

  /**
   * Map a native Capacitor push notification to the library payload shape.
   */
  private fromNativePush(notification: any): PushNotificationPayload {
    const title = notification?.title || ''
    const body = notification?.body || ''
    return {
      title,
      body,
      data: notification?.data || {},
      notification: {
        title,
        body,
        ...(notification?.id && { id: notification.id }),
        ...(notification?.badge && { badge: String(notification.badge) }),
      },
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
      const oneSignal = this.OneSignal

      // Foreground notification received (v3 API).
      oneSignal.Notifications.addEventListener('foregroundWillDisplay', event => {
        this.notifyMessageListeners(this.fromOSNotification(event.notification))
      })

      // Notification clicked / opened.
      oneSignal.Notifications.addEventListener('click', event => {
        this.notifyMessageListeners(this.fromOSNotification(event.notification))
      })

      // Push subscription changes — notify token listeners whenever a (new)
      // subscription id is present (covers initial subscribe and resubscribe).
      oneSignal.User.PushSubscription.addEventListener('change', event => {
        const id = event.current?.id
        if (id) {
          this.notifyTokenListeners(id)
        }
      })
    } catch (error) {
      this.handleError(new Error(`Event listener setup failed: ${error}`))
    }
  }

  /**
   * Map an OSNotification (react-onesignal v3) to the library payload shape.
   */
  private fromOSNotification(notification: any): PushNotificationPayload {
    const title = (notification?.title as string) || ''
    const body = (notification?.body as string) || ''
    return {
      title,
      body,
      data: (notification?.additionalData as Record<string, unknown>) || {},
      notification: {
        title,
        body,
        ...(notification?.notificationId && { id: notification.notificationId }),
      },
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
      if (result.receive !== 'granted') {
        return false
      }
      // Register so the FCM/APNs device token arrives on the 'registration'
      // event wired in setupNativeEventListeners().
      await PushNotifications.register()
      return true
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
      // v3: resolves to whether permission is now granted.
      return await this.OneSignal.Notifications.requestPermission()
    } catch (_error) {
      // Fallback to the native browser permission prompt.
      if (typeof window !== 'undefined' && 'Notification' in window) {
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
      // v3: Notifications.permission is a boolean (true = granted).
      if (this.OneSignal.Notifications.permission) {
        return 'granted'
      }
      // Not granted — distinguish prompt vs denied via the browser permission.
      if (typeof window !== 'undefined' && 'Notification' in window) {
        return Notification.permission === 'denied' ? 'denied' : 'prompt'
      }
      return 'prompt'
    } catch (_error) {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const permission = Notification.permission
        return permission === 'default'
          ? 'prompt'
          : (permission as PermissionStatus)
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
