import { initializeApp, type FirebaseApp } from 'firebase/app'
import { 
  getMessaging, 
  getToken, 
  onMessage, 
  deleteToken,
  type Messaging,
  type MessagePayload,
  isSupported
} from 'firebase/messaging'
import { Capacitor } from '@capacitor/core'
import type {
  NotificationProvider,
  FirebaseConfig,
  PushNotificationPayload,
  PermissionStatus,
  ProviderCapabilities
} from '@/types'

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

  /**
   * Initialize Firebase provider
   */
  async init(config: FirebaseConfig): Promise<void> {
    try {
      this.config = config
      
      // Initialize Firebase app
      const firebaseConfig: any = {
        apiKey: config.apiKey,
        authDomain: config.authDomain,
        projectId: config.projectId,
        storageBucket: config.storageBucket,
        messagingSenderId: config.messagingSenderId,
        appId: config.appId
      }
      
      if (config.measurementId) {
        firebaseConfig.measurementId = config.measurementId
      }
      
      this.app = initializeApp(firebaseConfig)

      // Initialize messaging if supported
      if (await this.isSupported()) {
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

      if (this.currentToken && this.messaging) {
        await deleteToken(this.messaging)
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
      if (Capacitor.isNativePlatform()) {
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
      if (Capacitor.isNativePlatform()) {
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
    if (!this.messaging) {
      throw new Error('Firebase messaging not initialized')
    }

    try {
      const token = await getToken(this.messaging, this.config?.vapidKey ? {
        vapidKey: this.config.vapidKey
      } : undefined)
      
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

    try {
      // Delete current token
      if (this.currentToken) {
        await deleteToken(this.messaging)
      }

      // Get new token
      const newToken = await this.getToken()
      this.notifyTokenListeners(newToken)
      return newToken
    } catch (error) {
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
      await deleteToken(this.messaging)
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

    try {
      // Topic subscription is typically handled server-side
      // This is a placeholder for the API call
      await this.callTopicAPI('subscribe', topic, this.currentToken)
    } catch (error) {
      this.handleError(new Error(`Topic subscription failed: ${error}`))
      throw error
    }
  }

  /**
   * Unsubscribe from topic
   */
  async unsubscribe(topic: string): Promise<void> {
    if (!this.currentToken) {
      throw new Error('No FCM token available')
    }

    try {
      // Topic unsubscription is typically handled server-side
      // This is a placeholder for the API call
      await this.callTopicAPI('unsubscribe', topic, this.currentToken)
    } catch (error) {
      this.handleError(new Error(`Topic unsubscription failed: ${error}`))
      throw error
    }
  }

  /**
   * Get subscribed topics
   */
  async getSubscriptions(): Promise<string[]> {
    if (!this.currentToken) {
      throw new Error('No FCM token available')
    }

    try {
      // This would typically be handled server-side
      // Return empty array as placeholder
      return []
    } catch (error) {
      this.handleError(new Error(`Get subscriptions failed: ${error}`))
      throw error
    }
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
      if (Capacitor.isNativePlatform()) {
        return true
      } else {
        return await isSupported()
      }
    } catch (error) {
      return false
    }
  }

  /**
   * Get provider capabilities
   */
  async getCapabilities(): Promise<ProviderCapabilities> {
    const isWeb = !Capacitor.isNativePlatform()
    
    return {
      pushNotifications: true,
      topics: true,
      richMedia: true,
      actions: true,
      backgroundSync: true,
      analytics: true,
      segmentation: true,
      scheduling: false, // Server-side only
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
      templates: false,
      abTesting: false,
      automation: false,
      journeys: false,
      realTimeUpdates: true
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
      this.messaging = getMessaging(this.app)
      
      // Setup message listener
      this.unsubscribeMessage = onMessage(this.messaging, (payload: MessagePayload) => {
        const notificationPayload: PushNotificationPayload = {
          data: payload.data || {},
          to: payload.from,
          collapse_key: payload.collapseKey
        }
        
        if (payload.notification) {
          const notification: any = {}
          if (payload.notification.title) notification.title = payload.notification.title
          if (payload.notification.body) notification.body = payload.notification.body
          if (payload.notification.icon) notification.icon = payload.notification.icon
          if (payload.notification.image) notification.image = payload.notification.image
          if (payload.data) notification.data = payload.data
          
          notificationPayload.notification = notification
        }
        
        this.notifyMessageListeners(notificationPayload)
      })
    } catch (error) {
      throw new Error(`Firebase messaging initialization failed: ${error}`)
    }
  }

  /**
   * Request native permission
   */
  private async requestNativePermission(): Promise<boolean> {
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications')
      const result = await PushNotifications.requestPermissions()
      return result.receive === 'granted'
    } catch (error) {
      return false
    }
  }

  /**
   * Check native permission
   */
  private async checkNativePermission(): Promise<PermissionStatus> {
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications')
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
    } catch (error) {
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
   * Call topic API (placeholder)
   */
  private async callTopicAPI(action: 'subscribe' | 'unsubscribe', _topic: string, _token: string): Promise<void> {
    // This would typically call your backend API
    // For now, we'll throw an error to indicate server-side implementation needed
    throw new Error(`Topic ${action} must be implemented server-side`)
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
        console.error('Error in error listener:', listenerError)
      }
    })
  }
}