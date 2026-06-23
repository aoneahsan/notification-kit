import { DynamicLoader } from '@/utils/dynamic-loader'
import { FirebaseNativeBridge } from './FirebaseNativeBridge'
import { ConfigValidator } from '@/utils/config-validator'
import type { FirebaseApp } from 'firebase/app'
import type { Messaging, MessagePayload } from 'firebase/messaging'
import type {
  NotificationProvider,
  FirebaseConfig,
  PushNotificationPayload,
  PermissionStatus,
  ProviderCapabilities,
} from '@/types'
import { isFirebaseAppConfig } from '@/types'
// @ts-ignore - used conditionally
const _ = isFirebaseAppConfig

/**
 * Firebase provider for push notifications
 */
export class FirebaseProvider implements NotificationProvider {
  readonly name = 'firebase'
  readonly type = 'firebase' as const

  private app: FirebaseApp | null = null
  private messaging: Messaging | null = null
  private config: FirebaseConfig | null = null
  private currentToken: string | null = null
  private messageListeners: ((payload: PushNotificationPayload) => void)[] = []
  private tokenListeners: ((token: string) => void)[] = []
  private errorListeners: ((error: Error) => void)[] = []
  private unsubscribeMessage: (() => void) | null = null
  // Native (Capacitor) FCM/APNs state — populated when running on iOS/Android.
  private nativeToken: string | null = null
  private nativeListenerHandles: Array<{ remove: () => Promise<void> }> = []
  private nativeRegistrationResolve: ((token: string) => void) | null = null
  private nativeRegistrationPromise: Promise<string> | null = null

  /**
   * Initialize Firebase provider
   */
  async init(config: FirebaseConfig): Promise<void> {
    try {
      // Import the type guard function
      const { isFirebaseAppConfig } = await import('@/types')
      
      this.config = config

      // Check if an existing Firebase app is provided
      if (isFirebaseAppConfig(config)) {
        // Use existing Firebase app
        this.app = config.app
      } else {
        // Validate configuration for new app creation
        ConfigValidator.validateFirebaseConfig(config)
        ConfigValidator.validateEnvironmentVariables('firebase')

        // Initialize native bridge for secure configuration on mobile platforms
        const isNative = await DynamicLoader.isNativePlatform()
        if (isNative) {
          await FirebaseNativeBridge.initializeNative(config)
        }

        // Initialize Firebase app
        const firebaseConfig: Record<string, string> = {
          apiKey: (config as any).apiKey,
          authDomain: (config as any).authDomain,
          projectId: (config as any).projectId,
          storageBucket: (config as any).storageBucket,
          messagingSenderId: (config as any).messagingSenderId,
          appId: (config as any).appId,
        }

        if ('measurementId' in config && config.measurementId) {
          firebaseConfig.measurementId = config.measurementId
        }

        // Dynamically import and initialize Firebase
        const firebaseApp = await DynamicLoader.loadFirebase()
        if (!firebaseApp) {
          throw new Error('Firebase is required but not installed')
        }
        this.app = firebaseApp.initializeApp(firebaseConfig)
      }

      // Wire up message delivery: native push via @capacitor/push-notifications,
      // web push via firebase/messaging.
      if (await DynamicLoader.isNativePlatform()) {
        await this.setupNativePush()
      } else if (await this.isSupported()) {
        await this.initializeMessaging()
      }
    } catch (error) {
      this.handleError(new Error(`Firebase initialization failed: ${error}`))
      throw error
    }
  }

  /**
   * Destroy Firebase provider
   */
  async destroy(): Promise<void> {
    try {
      if (this.unsubscribeMessage) {
        this.unsubscribeMessage()
        this.unsubscribeMessage = null
      }

      // Remove native push listeners so they don't fire into a torn-down
      // provider or accumulate across re-init.
      for (const handle of this.nativeListenerHandles) {
        try {
          await handle.remove()
        } catch (error) {
          this.handleError(new Error(`Failed to remove native listener: ${error}`))
        }
      }
      this.nativeListenerHandles = []
      this.nativeToken = null
      this.nativeRegistrationPromise = null
      this.nativeRegistrationResolve = null

      if (this.currentToken && this.messaging) {
        const firebaseMessaging = await DynamicLoader.loadFirebaseMessaging()
        if (firebaseMessaging) {
          await firebaseMessaging.deleteToken(this.messaging)
        }
      }

      this.app = null
      this.messaging = null
      this.config = null
      this.currentToken = null
      this.messageListeners = []
      this.tokenListeners = []
      this.errorListeners = []
    } catch (error) {
      this.handleError(new Error(`Firebase destroy failed: ${error}`))
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
   * Get FCM token
   */
  async getToken(): Promise<string> {
    // Native: the FCM/APNs token arrives via the 'registration' event after
    // PushNotifications.register() (called from requestPermission()).
    if (await DynamicLoader.isNativePlatform()) {
      if (this.nativeToken) {
        return this.nativeToken
      }
      if (this.nativeRegistrationPromise) {
        return await this.nativeRegistrationPromise
      }
      throw new Error(
        'No FCM token yet. Call requestPermission() first — it registers the device ' +
          'for push, and the token is delivered on the registration event.'
      )
    }

    if (!this.messaging) {
      throw new Error('Firebase messaging not initialized')
    }

    try {
      const firebaseMessaging = await DynamicLoader.loadFirebaseMessaging()
      if (!firebaseMessaging) {
        throw new Error('Firebase messaging is required but not installed')
      }
      const token = await firebaseMessaging.getToken(
        this.messaging,
        this.config?.vapidKey
          ? {
              vapidKey: this.config.vapidKey,
            }
          : undefined
      )

      if (token) {
        this.currentToken = token
        return token
      } else {
        throw new Error('No registration token available')
      }
    } catch (error) {
      this.handleError(new Error(`Token retrieval failed: ${error}`))
      throw error
    }
  }

  /**
   * Refresh FCM token
   */
  async refreshToken(): Promise<string> {
    if (!this.messaging) {
      throw new Error('Firebase messaging not initialized')
    }

    const previousToken = this.currentToken
    try {
      // Delete the current token so the next getToken() issues a fresh one.
      if (this.currentToken) {
        const firebaseMessaging = await DynamicLoader.loadFirebaseMessaging()
        if (firebaseMessaging) {
          await firebaseMessaging.deleteToken(this.messaging)
          this.currentToken = null
        }
      }

      // Get new token
      const newToken = await this.getToken()
      this.notifyTokenListeners(newToken)
      return newToken
    } catch (error) {
      // Restore the previous token reference so a failed refresh doesn't leave
      // the provider reporting a null/stale token.
      this.currentToken = previousToken
      this.handleError(new Error(`Token refresh failed: ${error}`))
      throw error
    }
  }

  /**
   * Delete FCM token
   */
  async deleteToken(): Promise<void> {
    if (!this.messaging) {
      throw new Error('Firebase messaging not initialized')
    }

    try {
      const firebaseMessaging = await DynamicLoader.loadFirebaseMessaging()
      if (!firebaseMessaging) {
        throw new Error('Firebase messaging is required but not installed')
      }
      await firebaseMessaging.deleteToken(this.messaging)
      this.currentToken = null
    } catch (error) {
      this.handleError(new Error(`Token deletion failed: ${error}`))
      throw error
    }
  }

  /**
   * Subscribe to topic
   */
  async subscribe(topic: string): Promise<void> {
    if (!this.currentToken) {
      throw new Error('No FCM token available')
    }

    // FCM topic subscription is a privileged, server-side operation — it cannot
    // be performed from client code. callTopicAPI throws a descriptive error
    // telling the caller to subscribe the device token via their backend.
    await this.callTopicAPI('subscribe', topic, this.currentToken)
  }

  /**
   * Unsubscribe from topic
   */
  async unsubscribe(topic: string): Promise<void> {
    if (!this.currentToken) {
      throw new Error('No FCM token available')
    }

    // Like subscribe(), FCM topic unsubscription is server-side only.
    // callTopicAPI throws a descriptive error pointing the caller to their backend.
    await this.callTopicAPI('unsubscribe', topic, this.currentToken)
  }

  /**
   * Get subscribed topics
   */
  async getSubscriptions(): Promise<string[]> {
    if (!this.currentToken) {
      throw new Error('No FCM token available')
    }

    // FCM does not expose a device's topic subscriptions to the client — they
    // are only known server-side. Returns an empty list (rather than throwing)
    // so callers can treat "unknown" as "none"; track subscriptions in your
    // backend if you need an authoritative list.
    return []
  }

  /**
   * Send notification (server-side only)
   */
  async sendNotification(_payload: PushNotificationPayload): Promise<void> {
    try {
      // This would typically be handled server-side with Admin SDK
      // Client-side sending is not supported for security reasons
      throw new Error('Client-side notification sending not supported')
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
   * Check if Firebase messaging is supported
   */
  async isSupported(): Promise<boolean> {
    try {
      const isNative = await DynamicLoader.isNativePlatform()
      if (isNative) {
        return true
      } else {
        const firebaseMessaging = await DynamicLoader.loadFirebaseMessaging()
        return firebaseMessaging ? await firebaseMessaging.isSupported() : false
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
      topics: true,
      scheduling: false, // Server-side only
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
      geofencing: false,
      inAppMessages: false,
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
      categories: false,
      quietHours: false,
      deliveryReceipts: true,
      clickTracking: true,
      impressionTracking: true,
      customData: true,
      multipleDevices: true,
      userTags: false,
      triggers: false,
      abTesting: false,
      automation: false,
      journeys: false,
      realTimeUpdates: true,
    }
  }

  /**
   * Initialize Firebase messaging
   */
  private async initializeMessaging(): Promise<void> {
    if (!this.app) {
      throw new Error('Firebase app not initialized')
    }

    try {
      const firebaseMessaging = await DynamicLoader.loadFirebaseMessaging()
      if (!firebaseMessaging) {
        throw new Error('Firebase messaging is required but not installed')
      }
      
      this.messaging = firebaseMessaging.getMessaging(this.app)

      // Setup message listener
      this.unsubscribeMessage = firebaseMessaging.onMessage(
        this.messaging,
        (payload: MessagePayload) => {
          const notificationPayload: PushNotificationPayload = {
            // Surface the real title/body at the top level (consumers read
            // payload.title/payload.body); previously these were always '').
            title: payload.notification?.title || '',
            body: payload.notification?.body || '',
            data: payload.data || {},
            ...(payload.from && { to: payload.from }),
            ...(payload.collapseKey && { collapseKey: payload.collapseKey }),
          }

          if (payload.notification) {
            const notification: Record<string, unknown> = {}
            if (payload.notification.title)
              notification.title = payload.notification.title
            if (payload.notification.body)
              notification.body = payload.notification.body
            if (payload.notification.icon)
              notification.icon = payload.notification.icon
            if (payload.notification.image)
              notification.image = payload.notification.image
            if (payload.data) notification.data = payload.data

            notificationPayload.notification = notification
          }

          this.notifyMessageListeners(notificationPayload)
        }
      )
    } catch (error) {
      throw new Error(`Firebase messaging initialization failed: ${error}`)
    }
  }

  /**
   * Set up native push (FCM on Android, APNs on iOS) via
   * @capacitor/push-notifications. The token is delivered asynchronously on the
   * 'registration' event after PushNotifications.register() (see
   * requestNativePermission()). Listener handles are stored for cleanup.
   */
  private async setupNativePush(): Promise<void> {
    const pushNotificationsModule = await DynamicLoader.loadPushNotifications()
    if (!pushNotificationsModule) {
      return
    }
    const { PushNotifications } = pushNotificationsModule

    const registrationHandle = await PushNotifications.addListener(
      'registration',
      (token: any) => {
        this.nativeToken = token.value
        this.currentToken = token.value
        if (this.nativeRegistrationResolve) {
          this.nativeRegistrationResolve(token.value)
          this.nativeRegistrationResolve = null
        }
        this.notifyTokenListeners(token.value)
      }
    )
    this.nativeListenerHandles.push(registrationHandle)

    const registrationErrorHandle = await PushNotifications.addListener(
      'registrationError',
      (err: any) => {
        this.handleError(new Error(`FCM registration error: ${err?.error}`))
      }
    )
    this.nativeListenerHandles.push(registrationErrorHandle)

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
        this.notifyMessageListeners(this.fromNativePush(action?.notification))
      }
    )
    this.nativeListenerHandles.push(actionHandle)
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
      // Register the device for push so the FCM/APNs token is delivered on the
      // 'registration' event (wired in setupNativePush()). Prime a promise so a
      // getToken() racing the event resolves once the token arrives.
      if (!this.nativeToken) {
        this.nativeRegistrationPromise = new Promise<string>(resolve => {
          this.nativeRegistrationResolve = resolve
        })
      }
      await PushNotifications.register()
      return true
    } catch (error) {
      this.handleError(new Error(`Native permission request failed: ${error}`))
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
    if (!('Notification' in window)) {
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission === 'denied') {
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  /**
   * Check web permission
   */
  private async checkWebPermission(): Promise<PermissionStatus> {
    if (!('Notification' in window)) {
      return 'denied'
    }

    const permission = Notification.permission
    if (permission === 'default') {
      return 'prompt'
    }
    return permission as PermissionStatus
  }

  /**
   * Topic (un)subscription dispatcher. FCM topic management is a privileged,
   * server-side operation (Firebase Admin SDK / IID API) with no client-side
   * path, so this always throws a descriptive error directing the caller to
   * their backend rather than failing silently.
   */
  private async callTopicAPI(
    action: 'subscribe' | 'unsubscribe',
    _topic: string,
    _token: string
  ): Promise<void> {
    // FCM topic (un)subscription is a privileged, server-side operation
    // (Firebase Admin SDK or the IID API) — it cannot be performed from client
    // code, which has no admin credentials. Send the device token from
    // getToken() to your backend and (un)subscribe it there.
    throw new Error(
      `notification-kit: Firebase topic "${action}" must be performed server-side ` +
        '(Firebase Admin SDK / IID API), not from the client. Send the device token ' +
        'from getToken() to your backend and (un)subscribe it there.'
    )
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
