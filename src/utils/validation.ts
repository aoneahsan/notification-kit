import type {
  NotificationConfig,
  ScheduleOptions,
  InAppOptions,
  NotificationChannel,
  PushNotificationPayload,
  FirebaseConfig,
  OneSignalConfig
} from '@/types'

/**
 * Validation utilities for notification data
 */
export class ValidationUtils {
  /**
   * Validate notification configuration
   */
  static validateConfig(config: NotificationConfig): ValidationResult {
    const errors: string[] = []

    if (!config.provider) {
      errors.push('Provider is required')
    } else if (!['firebase', 'onesignal'].includes(config.provider)) {
      errors.push('Provider must be either "firebase" or "onesignal"')
    }

    if (!config.config) {
      errors.push('Provider configuration is required')
    } else {
      if (config.provider === 'firebase') {
        const firebaseErrors = this.validateFirebaseConfig(config.config as FirebaseConfig)
        errors.push(...firebaseErrors)
      } else if (config.provider === 'onesignal') {
        const oneSignalErrors = this.validateOneSignalConfig(config.config as OneSignalConfig)
        errors.push(...oneSignalErrors)
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate Firebase configuration
   */
  static validateFirebaseConfig(config: FirebaseConfig): string[] {
    const errors: string[] = []

    if (!config.apiKey) errors.push('Firebase API key is required')
    if (!config.authDomain) errors.push('Firebase auth domain is required')
    if (!config.projectId) errors.push('Firebase project ID is required')
    if (!config.storageBucket) errors.push('Firebase storage bucket is required')
    if (!config.messagingSenderId) errors.push('Firebase messaging sender ID is required')
    if (!config.appId) errors.push('Firebase app ID is required')

    // Validate format
    if (config.apiKey && !config.apiKey.startsWith('AIza')) {
      errors.push('Invalid Firebase API key format')
    }

    if (config.authDomain && !config.authDomain.includes('.firebaseapp.com')) {
      errors.push('Invalid Firebase auth domain format')
    }

    if (config.messagingSenderId && !/^\d+$/.test(config.messagingSenderId)) {
      errors.push('Firebase messaging sender ID must be numeric')
    }

    return errors
  }

  /**
   * Validate OneSignal configuration
   */
  static validateOneSignalConfig(config: OneSignalConfig): string[] {
    const errors: string[] = []

    if (!config.appId) {
      errors.push('OneSignal app ID is required')
    } else if (!this.isValidUUID(config.appId)) {
      errors.push('OneSignal app ID must be a valid UUID')
    }

    if (config.restApiKey && !config.restApiKey.startsWith('Basic ')) {
      errors.push('OneSignal REST API key must start with "Basic "')
    }

    if (config.safariWebId && !this.isValidSafariWebId(config.safariWebId)) {
      errors.push('Invalid Safari Web ID format')
    }

    return errors
  }

  /**
   * Validate schedule options
   */
  static validateScheduleOptions(options: ScheduleOptions & {title?: string, body?: string, id?: string | number}): ValidationResult {
    const errors: string[] = []

    // Validate notification payload properties if present
    if ('id' in options && options.id !== undefined) {
      if (typeof options.id !== 'string' && typeof options.id !== 'number') {
        errors.push('Notification ID must be a string or number')
      }
    }

    if ('title' in options && options.title !== undefined) {
      if (typeof options.title !== 'string') {
        errors.push('Notification title must be a string')
      } else if (options.title.length > 100) {
        errors.push('Notification title must be 100 characters or less')
      }
    }

    if ('body' in options && options.body !== undefined) {
      if (typeof options.body !== 'string') {
        errors.push('Notification body must be a string')
      } else if (options.body.length > 500) {
        errors.push('Notification body must be 500 characters or less')
      }
    }

    // Validate schedule-specific properties
    if (options.at) {
      const scheduleDate = new Date(options.at)
      if (isNaN(scheduleDate.getTime())) {
        errors.push('Invalid schedule date')
      } else if (scheduleDate <= new Date()) {
        errors.push('Schedule date must be in the future')
      }
    }

    if (options.every) {
      if (!options.every.interval) {
        errors.push('Repeat interval is required')
      } else if (options.every.frequency && options.every.frequency <= 0) {
        errors.push('Repeat frequency must be positive')
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate in-app notification options
   */
  static validateInAppOptions(options: InAppOptions): ValidationResult {
    const errors: string[] = []

    if (!options.title) {
      errors.push('In-app notification title is required')
    } else if (typeof options.title !== 'string') {
      errors.push('In-app notification title must be a string')
    } else if (options.title.length > 100) {
      errors.push('In-app notification title must be 100 characters or less')
    }

    if (options.message && typeof options.message !== 'string') {
      errors.push('In-app notification message must be a string')
    } else if (options.message && options.message.length > 300) {
      errors.push('In-app notification message must be 300 characters or less')
    }

    if (options.type && !['success', 'error', 'warning', 'info'].includes(options.type)) {
      errors.push('In-app notification type must be one of: success, error, warning, info')
    }

    if (options.duration && (options.duration < 1000 || options.duration > 30000)) {
      errors.push('In-app notification duration must be between 1000ms and 30000ms')
    }

    if (options.position && !['top', 'bottom', 'center'].includes(options.position)) {
      errors.push('In-app notification position must be one of: top, bottom, center')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate notification channel
   */
  static validateNotificationChannel(channel: NotificationChannel): ValidationResult {
    const errors: string[] = []

    if (!channel.id) {
      errors.push('Channel ID is required')
    } else if (typeof channel.id !== 'string') {
      errors.push('Channel ID must be a string')
    } else if (!/^[a-zA-Z0-9_-]+$/.test(channel.id)) {
      errors.push('Channel ID must contain only alphanumeric characters, hyphens, and underscores')
    }

    if (!channel.name) {
      errors.push('Channel name is required')
    } else if (typeof channel.name !== 'string') {
      errors.push('Channel name must be a string')
    } else if (channel.name.length > 50) {
      errors.push('Channel name must be 50 characters or less')
    }

    if (channel.description && typeof channel.description !== 'string') {
      errors.push('Channel description must be a string')
    } else if (channel.description && channel.description.length > 200) {
      errors.push('Channel description must be 200 characters or less')
    }

    if (channel.importance && !['min', 'low', 'default', 'high', 'max'].includes(channel.importance)) {
      errors.push('Channel importance must be one of: min, low, default, high, max')
    }

    if (channel.visibility && !['private', 'public', 'secret'].includes(channel.visibility)) {
      errors.push('Channel visibility must be one of: private, public, secret')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate push notification payload
   */
  static validatePushPayload(payload: PushNotificationPayload): ValidationResult {
    const errors: string[] = []

    if (!payload.notification?.title) {
      errors.push('Push notification title is required')
    } else if (typeof payload.notification.title !== 'string') {
      errors.push('Push notification title must be a string')
    } else if (payload.notification.title.length > 100) {
      errors.push('Push notification title must be 100 characters or less')
    }

    if (!payload.notification?.body) {
      errors.push('Push notification body is required')
    } else if (typeof payload.notification.body !== 'string') {
      errors.push('Push notification body must be a string')
    } else if (payload.notification.body.length > 500) {
      errors.push('Push notification body must be 500 characters or less')
    }

    if (payload.data && typeof payload.data !== 'object') {
      errors.push('Push notification data must be an object')
    }

    if (payload.notification) {
      if (payload.notification.icon && !this.isValidUrl(payload.notification.icon)) {
        errors.push('Invalid notification icon URL')
      }

      if (payload.notification.image && !this.isValidUrl(payload.notification.image)) {
        errors.push('Invalid notification image URL')
      }

      if (payload.notification.badge && !this.isValidUrl(payload.notification.badge)) {
        errors.push('Invalid notification badge URL')
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validate URL format
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * Validate UUID format
   */
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  /**
   * Validate Safari Web ID format
   */
  static isValidSafariWebId(webId: string): boolean {
    const safariWebIdRegex = /^web\.[a-zA-Z0-9.-]+$/
    return safariWebIdRegex.test(webId)
  }

  /**
   * Sanitize text input
   */
  static sanitizeText(text: string): string {
    return text
      .replace(/[<>]/g, '') // Remove < and > characters
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim()
  }

  /**
   * Validate and sanitize notification text
   */
  static validateAndSanitizeText(text: string, maxLength: number): ValidationResult<string> {
    if (!text || typeof text !== 'string') {
      return {
        valid: false,
        errors: ['Text is required and must be a string'],
        value: ''
      }
    }

    const sanitized = this.sanitizeText(text)
    
    if (sanitized.length === 0) {
      return {
        valid: false,
        errors: ['Text cannot be empty after sanitization'],
        value: sanitized
      }
    }

    if (sanitized.length > maxLength) {
      return {
        valid: false,
        errors: [`Text must be ${maxLength} characters or less`],
        value: sanitized.substring(0, maxLength)
      }
    }

    return {
      valid: true,
      errors: [],
      value: sanitized
    }
  }

  /**
   * Validate object structure
   */
  static validateObjectStructure(obj: any, required: string[]): ValidationResult {
    const errors: string[] = []

    if (!obj || typeof obj !== 'object') {
      errors.push('Object is required')
      return { valid: false, errors }
    }

    for (const field of required) {
      if (!(field in obj)) {
        errors.push(`Missing required field: ${field}`)
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate array structure
   */
  static validateArray(arr: any, validator: (item: any) => ValidationResult): ValidationResult {
    if (!Array.isArray(arr)) {
      return {
        valid: false,
        errors: ['Value must be an array']
      }
    }

    const errors: string[] = []

    arr.forEach((item, index) => {
      const result = validator(item)
      if (!result.valid) {
        errors.push(`Item ${index}: ${result.errors.join(', ')}`)
      }
    })

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

/**
 * Validation result interface
 */
export interface ValidationResult<T = void> {
  valid: boolean
  errors: string[]
  value?: T
}

/**
 * Convenience validation functions
 */
export const validate = {
  config: (config: NotificationConfig) => ValidationUtils.validateConfig(config),
  scheduleOptions: (options: ScheduleOptions) => ValidationUtils.validateScheduleOptions(options),
  inAppOptions: (options: InAppOptions) => ValidationUtils.validateInAppOptions(options),
  notificationChannel: (channel: NotificationChannel) => ValidationUtils.validateNotificationChannel(channel),
  pushPayload: (payload: PushNotificationPayload) => ValidationUtils.validatePushPayload(payload),
  email: (email: string) => ValidationUtils.isValidEmail(email),
  url: (url: string) => ValidationUtils.isValidUrl(url),
  uuid: (uuid: string) => ValidationUtils.isValidUUID(uuid),
  text: (text: string, maxLength: number) => ValidationUtils.validateAndSanitizeText(text, maxLength),
  object: (obj: any, required: string[]) => ValidationUtils.validateObjectStructure(obj, required),
  array: (arr: any, validator: (item: any) => ValidationResult) => ValidationUtils.validateArray(arr, validator)
}