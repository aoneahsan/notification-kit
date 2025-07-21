import { Capacitor } from '@capacitor/core'
import type {
  NotificationConfig,
  NotificationProvider,
  Notification,
  PermissionStatus,
  ScheduleOptions,
  InAppOptions,
  NotificationChannel,
  PushNotificationPayload,
  LocalNotificationPayload,
  EventListener,
  NotificationEvent,
  NotificationEventCallback,
  NotificationEventMap,
  Platform,
  PlatformCapabilities,
} from '@/types'
import {
  toCapacitorLocalNotification,
  fromCapacitorLocalNotification,
  toCapacitorChannel,
  fromCapacitorChannel,
  toPlatformCapabilities,
} from '@/utils/capacitor-types'

/**
 * Main NotificationKit class - provides unified API for all notification types
 */
export class NotificationKit {
  private static instance: NotificationKit | null = null
  private provider: NotificationProvider | null = null
  private config: NotificationConfig | null = null
  private initialized = false
  private eventListeners: Map<string, EventListener[]> = new Map()
  private platform: Platform = 'unknown'
  private capabilities: PlatformCapabilities | null = null

  private constructor() {
    this.detectPlatform()
  }

  /**
   * Get singleton instance
   */
  static getInstance(): NotificationKit {
    if (!NotificationKit.instance) {
      NotificationKit.instance = new NotificationKit()
    }
    return NotificationKit.instance
  }

  /**
   * Initialize notification kit with configuration
   */
  async init(config: NotificationConfig): Promise<void> {
    if (this.initialized) {
      return
    }

    try {
      this.config = config
      await this.initializeProvider()
      await this.setupEventListeners()
      this.initialized = true
      this.emit('ready', {
        platform: this.platform,
        capabilities: this.capabilities,
      })
    } catch (error) {
      this.emit('error', { error, context: 'initialization' })
      throw error
    }
  }

  /**
   * Destroy notification kit instance
   */
  async destroy(): Promise<void> {
    if (this.provider) {
      await this.provider.destroy()
      this.provider = null
    }
    this.eventListeners.clear()
    this.initialized = false
    this.config = null
    NotificationKit.instance = null
  }

  /**
   * Check if notification kit is initialized
   */
  isInitialized(): boolean {
    return this.initialized
  }

  /**
   * Get current platform
   */
  getPlatform(): Platform {
    return this.platform
  }

  /**
   * Get platform capabilities
   */
  getCapabilities(): PlatformCapabilities | null {
    return this.capabilities
  }

  /**
   * Get current provider
   */
  getProvider(): NotificationProvider | null {
    return this.provider
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    this.ensureInitialized()
    try {
      const granted = await this.provider!.requestPermission()
      this.emit('permissionChanged', {
        granted,
        status: granted ? 'granted' : 'denied',
      })
      return granted
    } catch (error) {
      this.emit('error', { error, context: 'permission' })
      throw error
    }
  }

  /**
   * Check notification permission status
   */
  async checkPermission(): Promise<PermissionStatus> {
    this.ensureInitialized()
    try {
      return await this.provider!.checkPermission()
    } catch (error) {
      this.emit('error', { error, context: 'permission' })
      throw error
    }
  }

  /**
   * Get notification token
   */
  async getToken(): Promise<string> {
    this.ensureInitialized()
    try {
      const token = await this.provider!.getToken()
      this.emit('tokenReceived', { token })
      return token
    } catch (error) {
      this.emit('error', { error, context: 'token' })
      throw error
    }
  }

  /**
   * Subscribe to topic
   */
  async subscribe(topic: string): Promise<void> {
    this.ensureInitialized()
    try {
      await this.provider!.subscribe(topic)
      this.emit('subscribed', { topic })
    } catch (error) {
      this.emit('error', { error, context: 'subscription' })
      throw error
    }
  }

  /**
   * Unsubscribe from topic
   */
  async unsubscribe(topic: string): Promise<void> {
    this.ensureInitialized()
    try {
      await this.provider!.unsubscribe(topic)
      this.emit('unsubscribed', { topic })
    } catch (error) {
      this.emit('error', { error, context: 'subscription' })
      throw error
    }
  }

  /**
   * Send push notification
   */
  async sendPushNotification(payload: PushNotificationPayload): Promise<void> {
    this.ensureInitialized()
    try {
      await this.provider!.sendNotification(payload)
      this.emit('notificationSent', { payload, type: 'push' })
    } catch (error) {
      this.emit('error', { error, context: 'push' })
      throw error
    }
  }

  /**
   * Schedule local notification
   */
  async scheduleLocalNotification(
    options: ScheduleOptions & LocalNotificationPayload
  ): Promise<void> {
    this.ensureInitialized()
    try {
      const { LocalNotifications } = await import(
        '@capacitor/local-notifications'
      )
      const capacitorNotification = toCapacitorLocalNotification(options)
      await LocalNotifications.schedule({
        notifications: [capacitorNotification],
      })
      this.emit('notificationScheduled', { options, type: 'local' })
    } catch (error) {
      this.emit('error', { error, context: 'local' })
      throw error
    }
  }

  /**
   * Cancel local notification
   */
  async cancelLocalNotification(id: string | number): Promise<void> {
    this.ensureInitialized()
    try {
      const { LocalNotifications } = await import(
        '@capacitor/local-notifications'
      )
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id
      await LocalNotifications.cancel({
        notifications: [{ id: numericId }],
      })
      this.emit('notificationCancelled', { id, type: 'local' })
    } catch (error) {
      this.emit('error', { error, context: 'local' })
      throw error
    }
  }

  /**
   * Get pending local notifications
   */
  async getPendingLocalNotifications(): Promise<Notification[]> {
    this.ensureInitialized()
    try {
      const { LocalNotifications } = await import(
        '@capacitor/local-notifications'
      )
      const result = await LocalNotifications.getPending()
      return result.notifications.map(n => ({
        id: n.id.toString(),
        title: n.title,
        body: n.body,
        data: n.extra,
        platform: this.platform,
        type: 'local',
        timestamp: new Date(),
      }))
    } catch (error) {
      this.emit('error', { error, context: 'local' })
      throw error
    }
  }

  /**
   * Show in-app notification
   */
  async showInAppNotification(options: InAppOptions): Promise<string> {
    try {
      // Import the in-app notification utility
      const { showInAppNotification } = await import('@/utils/inApp')
      const id = await showInAppNotification(options, this.config?.inApp)
      this.emit('notificationShown', { options, type: 'inApp', id })
      return id
    } catch (error) {
      this.emit('error', { error, context: 'inApp' })
      throw error
    }
  }

  /**
   * Check if notifications are supported
   */
  async isSupported(): Promise<boolean> {
    try {
      const { platform } = await import('@/core/platform')
      const capabilities = platform.getCapabilities()
      return (
        capabilities.pushNotifications ||
        capabilities.localNotifications ||
        false
      )
    } catch (error) {
      console.warn('Failed to check support:', error)
      return false
    }
  }

  /**
   * Create notification channel (Android)
   */
  async createChannel(channel: NotificationChannel): Promise<void> {
    if (this.platform !== 'android') {
      return
    }

    try {
      const { LocalNotifications } = await import(
        '@capacitor/local-notifications'
      )
      const capacitorChannel = toCapacitorChannel(channel)
      await LocalNotifications.createChannel(capacitorChannel)
      this.emit('channelCreated', { channel })
    } catch (error) {
      this.emit('error', { error, context: 'channel' })
      throw error
    }
  }

  /**
   * Delete notification channel (Android)
   */
  async deleteChannel(channelId: string): Promise<void> {
    if (this.platform !== 'android') {
      return
    }

    try {
      const { LocalNotifications } = await import(
        '@capacitor/local-notifications'
      )
      await LocalNotifications.deleteChannel({ id: channelId })
      this.emit('channelDeleted', { channelId })
    } catch (error) {
      this.emit('error', { error, context: 'channel' })
      throw error
    }
  }

  /**
   * List notification channels (Android)
   */
  async listChannels(): Promise<NotificationChannel[]> {
    if (this.platform !== 'android') {
      return []
    }

    try {
      const { LocalNotifications } = await import(
        '@capacitor/local-notifications'
      )
      const result = await LocalNotifications.listChannels()
      return result.channels.map(channel => fromCapacitorChannel(channel))
    } catch (error) {
      this.emit('error', { error, context: 'channel' })
      throw error
    }
  }

  /**
   * Add event listener
   */
  on<T extends keyof NotificationEventMap>(
    event: T,
    callback: NotificationEventCallback<NotificationEventMap[T]>
  ): () => void {
    const listeners = this.eventListeners.get(event as string) || []
    listeners.push(callback as EventListener)
    this.eventListeners.set(event as string, listeners)

    // Return unsubscribe function
    return () => {
      const currentListeners = this.eventListeners.get(event as string) || []
      const index = currentListeners.indexOf(callback as EventListener)
      if (index > -1) {
        currentListeners.splice(index, 1)
        this.eventListeners.set(event as string, currentListeners)
      }
    }
  }

  /**
   * Remove event listener
   */
  off<T extends keyof NotificationEventMap>(
    event: T,
    callback?: NotificationEventCallback<NotificationEventMap[T]>
  ): void {
    if (!callback) {
      this.eventListeners.delete(event as string)
      return
    }

    const listeners = this.eventListeners.get(event as string) || []
    const index = listeners.indexOf(callback as EventListener)
    if (index > -1) {
      listeners.splice(index, 1)
      this.eventListeners.set(event as string, listeners)
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event) || []
    const notificationEvent: NotificationEvent = {
      id: Date.now().toString(),
      type: event,
      timestamp: new Date(),
      data,
      ...data,
    }
    listeners.forEach(callback => {
      try {
        callback(notificationEvent)
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error)
      }
    })
  }

  /**
   * Detect current platform
   */
  private detectPlatform(): void {
    if (Capacitor.isNativePlatform()) {
      this.platform = Capacitor.getPlatform() as Platform
    } else if (typeof window !== 'undefined') {
      this.platform = 'web'
    } else {
      this.platform = 'unknown'
    }
  }

  /**
   * Initialize provider based on configuration
   */
  private async initializeProvider(): Promise<void> {
    if (!this.config) {
      throw new Error('Configuration is required')
    }

    try {
      if (this.config.provider === 'firebase') {
        const { FirebaseProvider } = await import(
          '@/providers/FirebaseProvider'
        )
        this.provider = new FirebaseProvider()
      } else if (this.config.provider === 'onesignal') {
        const { OneSignalProvider } = await import(
          '@/providers/OneSignalProvider'
        )
        this.provider = new OneSignalProvider()
      } else {
        throw new Error(`Unknown provider: ${this.config.provider}`)
      }

      await this.provider.init(this.config.config)
      const providerCapabilities = await this.provider.getCapabilities()
      this.capabilities = toPlatformCapabilities(providerCapabilities)
    } catch (error) {
      throw new Error(`Failed to initialize provider: ${error}`)
    }
  }

  /**
   * Setup event listeners for provider
   */
  private async setupEventListeners(): Promise<void> {
    if (!this.provider) {
      return
    }

    // Listen for provider messages
    this.provider.onMessage((payload: PushNotificationPayload) => {
      this.emit('notificationReceived', {
        payload,
        type: 'push',
        platform: this.platform,
      })
    })

    // Listen for token refresh
    this.provider.onTokenRefresh((token: string) => {
      this.emit('tokenRefreshed', { token })
    })

    // Listen for provider errors
    this.provider.onError((error: Error) => {
      this.emit('error', { error, context: 'provider' })
    })

    // Setup local notification listeners
    if (this.platform !== 'web') {
      try {
        const { LocalNotifications } = await import(
          '@capacitor/local-notifications'
        )

        LocalNotifications.addListener(
          'localNotificationReceived',
          notification => {
            this.emit('notificationReceived', {
              payload: fromCapacitorLocalNotification(notification),
              type: 'local',
              platform: this.platform,
            })
          }
        )

        LocalNotifications.addListener(
          'localNotificationActionPerformed',
          action => {
            this.emit('notificationActionPerformed', {
              action: action.actionId,
              notification: action.notification,
              inputValue: action.inputValue,
              platform: this.platform,
            })
          }
        )
      } catch (error) {
        console.warn('Local notifications not available:', error)
      }
    }
  }

  /**
   * Ensure notification kit is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('NotificationKit must be initialized before use')
    }
  }
}

/**
 * Convenience methods for common operations
 */
export const notifications = {
  /**
   * Initialize notification kit
   */
  init: (config: NotificationConfig) =>
    NotificationKit.getInstance().init(config),

  /**
   * Request permission
   */
  requestPermission: () => NotificationKit.getInstance().requestPermission(),

  /**
   * Check permission
   */
  checkPermission: () => NotificationKit.getInstance().checkPermission(),

  /**
   * Check if permission is granted
   */
  isPermissionGranted: async () => {
    const kit = NotificationKit.getInstance()
    const status = await kit.checkPermission()
    return status === 'granted'
  },

  /**
   * Get permission state
   */
  getPermissionState: () => NotificationKit.getInstance().checkPermission(),

  /**
   * Get token
   */
  getToken: () => NotificationKit.getInstance().getToken(),

  /**
   * Delete token
   */
  deleteToken: async () => {
    const kit = NotificationKit.getInstance()
    if (kit.provider && 'deleteToken' in kit.provider) {
      await kit.provider.deleteToken()
    } else {
      throw new Error('deleteToken not supported by current provider')
    }
  },

  /**
   * Subscribe to topic
   */
  subscribe: (topic: string) => NotificationKit.getInstance().subscribe(topic),

  /**
   * Unsubscribe from topic
   */
  unsubscribe: (topic: string) =>
    NotificationKit.getInstance().unsubscribe(topic),

  /**
   * Schedule local notification
   */
  schedule: (options: ScheduleOptions & LocalNotificationPayload) =>
    NotificationKit.getInstance().scheduleLocalNotification(options),

  /**
   * Cancel local notification
   */
  cancel: (id: number) =>
    NotificationKit.getInstance().cancelLocalNotification(id),

  /**
   * Get pending notifications
   */
  getPending: () =>
    NotificationKit.getInstance().getPendingLocalNotifications(),

  /**
   * Get delivered notifications
   */
  getDelivered: async () => {
    const kit = NotificationKit.getInstance()
    if (kit.platform === 'web') {
      throw new Error('getDelivered not supported on web platform')
    }
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    const result = await LocalNotifications.getDeliveredNotifications()
    return result.notifications
  },

  /**
   * Remove delivered notification
   */
  removeDelivered: async (id: string) => {
    const kit = NotificationKit.getInstance()
    if (kit.platform === 'web') {
      throw new Error('removeDelivered not supported on web platform')
    }
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    await LocalNotifications.removeDeliveredNotifications({
      notifications: [{ id }]
    })
  },

  /**
   * Remove all delivered notifications
   */
  removeAllDelivered: async () => {
    const kit = NotificationKit.getInstance()
    if (kit.platform === 'web') {
      throw new Error('removeAllDelivered not supported on web platform')
    }
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    await LocalNotifications.removeAllDeliveredNotifications()
  },

  /**
   * Cancel all pending notifications
   */
  cancelAll: async () => {
    const kit = NotificationKit.getInstance()
    if (kit.platform === 'web') {
      throw new Error('cancelAll not supported on web platform')
    }
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    const pending = await LocalNotifications.getPending()
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({
        notifications: pending.notifications.map(n => ({ id: n.id }))
      })
    }
  },

  /**
   * Listen for push notifications
   */
  onPush: (callback: (notification: any) => void) => {
    return NotificationKit.getInstance().on('notificationReceived', (event) => {
      if (event.type === 'push') {
        callback(event.payload)
      }
    })
  },

  /**
   * Listen for push notification opened
   */
  onPushOpened: (callback: (notification: any) => void) => {
    return NotificationKit.getInstance().on('notificationActionPerformed', (event) => {
      if (event.action === 'tap') {
        callback(event.notification)
      }
    })
  },

  /**
   * Show in-app notification
   */
  showInApp: (options: InAppOptions): Promise<string> =>
    NotificationKit.getInstance().showInAppNotification(options),

  /**
   * Success notification
   */
  success: (title: string, message?: string): Promise<string> =>
    NotificationKit.getInstance().showInAppNotification({
      title,
      message: message ?? title,
      type: 'success',
    }),

  /**
   * Error notification
   */
  error: (title: string, message?: string): Promise<string> =>
    NotificationKit.getInstance().showInAppNotification({
      title,
      message: message ?? title,
      type: 'error',
    }),

  /**
   * Warning notification
   */
  warning: (title: string, message?: string): Promise<string> =>
    NotificationKit.getInstance().showInAppNotification({
      title,
      message: message ?? title,
      type: 'warning',
    }),

  /**
   * Info notification
   */
  info: (title: string, message?: string): Promise<string> =>
    NotificationKit.getInstance().showInAppNotification({
      title,
      message: message ?? title,
      type: 'info',
    }),

  /**
   * Add event listener
   */
  on: <T extends keyof NotificationEventMap>(
    event: T,
    callback: NotificationEventCallback<NotificationEventMap[T]>
  ) => NotificationKit.getInstance().on(event, callback),

  /**
   * Remove event listener
   */
  off: <T extends keyof NotificationEventMap>(
    event: T,
    callback?: NotificationEventCallback<NotificationEventMap[T]>
  ) => NotificationKit.getInstance().off(event, callback),
}
