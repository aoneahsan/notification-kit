import type {
  Notification,
  PushNotificationPayload,
  LocalNotificationPayload,
  ScheduleOptions,
  InAppOptions,
  Platform,
  FormattedNotification,
  FormattedPushPayload,
  FormattedLocalPayload,
  FormattedInAppPayload,
  FormattedScheduleOptions,
  FormattedInAppOptions
} from '@/types'

/**
 * Formatting utilities for notifications
 */
export class FormattingUtils {
  /**
   * Format notification for display
   */
  static formatNotification(notification: Notification): FormattedNotification {
    return {
      ...notification,
      title: this.formatTitle(notification.title),
      body: this.formatBody(notification.body),
      data: notification.data || {},
      formatted: true
    }
  }

  /**
   * Format push notification payload
   */
  static formatPushPayload(payload: PushNotificationPayload): FormattedPushPayload {
    const formatted: any = {
      ...payload,
      data: payload.data || {},
      formatted: true
    }
    
    if (payload.notification) {
      formatted.notification = {
        ...payload.notification,
        title: this.formatTitle(payload.notification.title || ''),
        body: this.formatBody(payload.notification.body || '')
      }
    }
    
    return formatted as FormattedPushPayload
  }

  /**
   * Format local notification payload
   */
  static formatLocalPayload(payload: LocalNotificationPayload): FormattedLocalPayload {
    const formatted: any = {
      ...payload,
      title: this.formatTitle(payload.title),
      body: this.formatBody(payload.body),
      extra: payload.extra || {},
      formatted: true
    }
    
    if (payload.summaryText) {
      formatted.summaryText = this.formatTitle(payload.summaryText)
    }
    
    return formatted as FormattedLocalPayload
  }

  /**
   * Format in-app notification payload
   */
  static formatInAppPayload(options: InAppOptions): FormattedInAppPayload {
    const formatted: any = {
      ...options,
      message: this.formatBody(options.message),
      type: options.type || 'info',
      duration: options.duration || 5000,
      position: options.position || 'top-center',
      dismissible: options.dismissible !== false,
      actions: options.actions,
      icon: options.icon,
      data: options.data || {},
      formatted: true
    }
    
    if (options.title) {
      formatted.title = this.formatTitle(options.title)
    }
    
    return formatted as FormattedInAppPayload
  }

  /**
   * Format schedule options
   */
  static formatScheduleOptions(options: ScheduleOptions): FormattedScheduleOptions {
    const formatted: any = {
      ...options,
      formatted: true
    }
    
    return formatted as FormattedScheduleOptions
  }

  /**
   * Format in-app options
   */
  static formatInAppOptions(options: InAppOptions): FormattedInAppOptions {
    const formatted: any = {
      ...options,
      message: this.formatBody(options.message),
      type: options.type || 'info',
      duration: options.duration || 5000,
      position: options.position || 'top-center',
      dismissible: options.dismissible !== false,
      actions: options.actions,
      icon: options.icon,
      data: options.data || {},
      formatted: true
    }
    
    if (options.title) {
      formatted.title = this.formatTitle(options.title)
    }
    
    return formatted as FormattedInAppOptions
  }

  /**
   * Format notification title
   */
  static formatTitle(title: string | undefined): string {
    if (!title || typeof title !== 'string') {
      return ''
    }

    return title
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .substring(0, 100) // Limit to 100 characters
  }

  /**
   * Format notification body
   */
  static formatBody(body: string | undefined): string {
    if (!body || typeof body !== 'string') {
      return ''
    }

    return body
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .substring(0, 500) // Limit to 500 characters
  }

  /**
   * Format timestamp
   */
  static formatTimestamp(timestamp: Date | string | number): Date {
    if (timestamp instanceof Date) {
      return timestamp
    }

    if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      const date = new Date(timestamp)
      return isNaN(date.getTime()) ? new Date() : date
    }

    return new Date()
  }

  /**
   * Format duration (milliseconds to human readable)
   */
  static formatDuration(duration: number): string {
    if (duration < 1000) {
      return `${duration}ms`
    }

    const seconds = Math.floor(duration / 1000)
    if (seconds < 60) {
      return `${seconds}s`
    }

    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) {
      return `${minutes}m ${seconds % 60}s`
    }

    const hours = Math.floor(minutes / 60)
    return `${hours}h ${minutes % 60}m`
  }

  /**
   * Format file size
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Format platform name
   */
  static formatPlatform(platform: Platform): string {
    switch (platform) {
      case 'web':
        return 'Web'
      case 'ios':
        return 'iOS'
      case 'android':
        return 'Android'
      case 'electron':
        return 'Electron'
      default:
        return 'Unknown'
    }
  }

  /**
   * Format notification type
   */
  static formatNotificationType(type: string): string {
    switch (type) {
      case 'push':
        return 'Push Notification'
      case 'local':
        return 'Local Notification'
      case 'inApp':
        return 'In-App Notification'
      default:
        return 'Notification'
    }
  }

  /**
   * Truncate text with ellipsis
   */
  static truncateText(text: string, maxLength: number): string {
    if (!text || typeof text !== 'string') {
      return ''
    }

    if (text.length <= maxLength) {
      return text
    }

    return text.substring(0, maxLength - 3) + '...'
  }

  /**
   * Capitalize first letter
   */
  static capitalize(text: string): string {
    if (!text || typeof text !== 'string') {
      return ''
    }

    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  /**
   * Convert to title case
   */
  static toTitleCase(text: string): string {
    if (!text || typeof text !== 'string') {
      return ''
    }

    return text.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )
  }

  /**
   * Format relative time
   */
  static formatRelativeTime(date: Date): string {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (seconds < 60) {
      return 'Just now'
    } else if (minutes < 60) {
      return `${minutes}m ago`
    } else if (hours < 24) {
      return `${hours}h ago`
    } else if (days < 7) {
      return `${days}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  /**
   * Format absolute time
   */
  static formatAbsoluteTime(date: Date): string {
    return date.toLocaleString()
  }

  /**
   * Format notification count
   */
  static formatNotificationCount(count: number): string {
    if (count === 0) {
      return 'No notifications'
    } else if (count === 1) {
      return '1 notification'
    } else if (count < 1000) {
      return `${count} notifications`
    } else if (count < 1000000) {
      return `${(count / 1000).toFixed(1)}K notifications`
    } else {
      return `${(count / 1000000).toFixed(1)}M notifications`
    }
  }

  /**
   * Format badge count
   */
  static formatBadgeCount(count: number): string {
    if (count === 0) {
      return ''
    } else if (count < 100) {
      return count.toString()
    } else {
      return '99+'
    }
  }

  /**
   * Clean HTML tags
   */
  static stripHtml(html: string): string {
    if (!html || typeof html !== 'string') {
      return ''
    }

    return html.replace(/<[^>]*>/g, '')
  }

  /**
   * Format notification data
   */
  static formatNotificationData(data: Record<string, any>): Record<string, string> {
    const formatted: Record<string, string> = {}

    for (const [key, value] of Object.entries(data)) {
      if (value !== null && value !== undefined) {
        formatted[key] = String(value)
      }
    }

    return formatted
  }

  /**
   * Format error message
   */
  static formatErrorMessage(error: Error | string): string {
    if (typeof error === 'string') {
      return error
    }

    return error.message || 'An unknown error occurred'
  }
}

/**
 * Convenience formatting functions
 */
export const format = {
  notification: (notification: Notification) => FormattingUtils.formatNotification(notification),
  pushPayload: (payload: PushNotificationPayload) => FormattingUtils.formatPushPayload(payload),
  localPayload: (payload: LocalNotificationPayload) => FormattingUtils.formatLocalPayload(payload),
  inAppPayload: (options: InAppOptions) => FormattingUtils.formatInAppPayload(options),
  scheduleOptions: (options: ScheduleOptions) => FormattingUtils.formatScheduleOptions(options),
  inAppOptions: (options: InAppOptions) => FormattingUtils.formatInAppOptions(options),
  title: (title: string) => FormattingUtils.formatTitle(title),
  body: (body: string) => FormattingUtils.formatBody(body),
  timestamp: (timestamp: Date | string | number) => FormattingUtils.formatTimestamp(timestamp),
  duration: (duration: number) => FormattingUtils.formatDuration(duration),
  fileSize: (bytes: number) => FormattingUtils.formatFileSize(bytes),
  platform: (platform: Platform) => FormattingUtils.formatPlatform(platform),
  notificationType: (type: string) => FormattingUtils.formatNotificationType(type),
  truncate: (text: string, maxLength: number) => FormattingUtils.truncateText(text, maxLength),
  capitalize: (text: string) => FormattingUtils.capitalize(text),
  titleCase: (text: string) => FormattingUtils.toTitleCase(text),
  relativeTime: (date: Date) => FormattingUtils.formatRelativeTime(date),
  absoluteTime: (date: Date) => FormattingUtils.formatAbsoluteTime(date),
  notificationCount: (count: number) => FormattingUtils.formatNotificationCount(count),
  badgeCount: (count: number) => FormattingUtils.formatBadgeCount(count),
  stripHtml: (html: string) => FormattingUtils.stripHtml(html),
  notificationData: (data: Record<string, any>) => FormattingUtils.formatNotificationData(data),
  errorMessage: (error: Error | string) => FormattingUtils.formatErrorMessage(error)
}