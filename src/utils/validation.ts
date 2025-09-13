import type {
  Notification,
  ScheduleOptions,
  InAppOptions,
  ValidationResult,
  ValidationError,
} from '@/types'
import { SchedulingUtils } from './scheduling'

/**
 * Validation utilities for notification data
 */
export class ValidationUtils {
  /**
   * Validate notification
   */
  static notification(notification: Notification): ValidationResult {
    const errors: ValidationError[] = []

    if (!notification) {
      errors.push({
        field: 'notification',
        message: 'Notification is required',
        code: 'NOTIFICATION_REQUIRED',
      })
      return { valid: false, errors }
    }

    if (!notification.title || notification.title.trim() === '') {
      errors.push({
        field: 'title',
        message: 'Title is required',
        code: 'TITLE_REQUIRED',
      })
    }

    if (!notification.body || notification.body.trim() === '') {
      errors.push({
        field: 'body',
        message: 'Body is required',
        code: 'BODY_REQUIRED',
      })
    }

    if (
      notification.priority &&
      !['min', 'low', 'default', 'high', 'max'].includes(notification.priority)
    ) {
      errors.push({
        field: 'priority',
        message: 'Invalid priority',
        code: 'INVALID_PRIORITY',
        value: notification.priority,
      })
    }

    if (
      notification.visibility &&
      !['public', 'private', 'secret'].includes(notification.visibility)
    ) {
      errors.push({
        field: 'visibility',
        message: 'Invalid visibility',
        code: 'INVALID_VISIBILITY',
        value: notification.visibility,
      })
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Validate schedule options
   */
  static scheduleOptions(options: ScheduleOptions): ValidationResult {
    const result = SchedulingUtils.validateSchedule(options)
    return {
      valid: result.valid,
      errors: result.errors.map(error => ({
        field: error.field || 'schedule',
        message: error.message,
        code: error.code || undefined,
        value: error.value,
      })) as ValidationError[],
    }
  }

  /**
   * Validate in-app options
   */
  static inAppOptions(options: InAppOptions): ValidationResult {
    const errors: ValidationError[] = []

    if (!options) {
      errors.push({
        field: 'options',
        message: 'Options are required',
        code: 'OPTIONS_REQUIRED',
      })
      return { valid: false, errors }
    }

    if (!options.message || options.message.trim() === '') {
      errors.push({
        field: 'message',
        message: 'Message is required',
        code: 'MESSAGE_REQUIRED',
      })
    }

    if (
      options.type &&
      !['success', 'error', 'warning', 'info', 'custom'].includes(options.type)
    ) {
      errors.push({
        field: 'type',
        message: 'Invalid type',
        code: 'INVALID_TYPE',
        value: options.type,
      })
    }

    if (options.duration !== undefined && options.duration < 0) {
      errors.push({
        field: 'duration',
        message: 'Duration must be non-negative',
        code: 'INVALID_DURATION',
        value: options.duration,
      })
    }

    if (
      options.position &&
      ![
        'top-left',
        'top-center',
        'top-right',
        'bottom-left',
        'bottom-center',
        'bottom-right',
        'center',
      ].includes(options.position)
    ) {
      errors.push({
        field: 'position',
        message: 'Invalid position',
        code: 'INVALID_POSITION',
        value: options.position,
      })
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Validate channel configuration
   */
  static channel(channel: any): ValidationResult {
    const errors: ValidationError[] = []

    if (!channel) {
      errors.push({
        field: 'channel',
        message: 'Channel is required',
        code: 'CHANNEL_REQUIRED',
      })
      return { valid: false, errors }
    }

    if (!channel.id || channel.id.trim() === '') {
      errors.push({
        field: 'id',
        message: 'Channel ID is required',
        code: 'CHANNEL_ID_REQUIRED',
      })
    }

    if (!channel.name || channel.name.trim() === '') {
      errors.push({
        field: 'name',
        message: 'Channel name is required',
        code: 'CHANNEL_NAME_REQUIRED',
      })
    }

    if (
      channel.importance &&
      !['none', 'min', 'low', 'default', 'high', 'max'].includes(
        channel.importance
      )
    ) {
      errors.push({
        field: 'importance',
        message: 'Invalid importance',
        code: 'INVALID_IMPORTANCE',
        value: channel.importance,
      })
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Validate permission status
   */
  static permissionStatus(status: string): boolean {
    return ['prompt', 'granted', 'denied'].includes(status)
  }

  /**
   * Validate platform
   */
  static platform(platform: string): boolean {
    return ['web', 'ios', 'android', 'electron'].includes(platform)
  }

  /**
   * Validate provider
   */
  static provider(provider: string): boolean {
    return ['firebase', 'onesignal'].includes(provider)
  }
}

/**
 * Convenience validation functions
 */
export const validate = {
  notification: (notification: Notification) =>
    ValidationUtils.notification(notification),
  scheduleOptions: (options: ScheduleOptions) =>
    ValidationUtils.scheduleOptions(options),
  inAppOptions: (options: InAppOptions) =>
    ValidationUtils.inAppOptions(options),
  channel: (channel: any) => ValidationUtils.channel(channel),
  permissionStatus: (status: string) =>
    ValidationUtils.permissionStatus(status),
  platform: (platform: string) => ValidationUtils.platform(platform),
  provider: (provider: string) => ValidationUtils.provider(provider),
}
