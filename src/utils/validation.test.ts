import { describe, it, expect } from 'vitest'
import { ValidationUtils, validate } from './validation'
import type {
  Notification,
  ScheduleOptions,
  InAppOptions,
  NotificationChannel,
} from '@/types'

describe('ValidationUtils', () => {
  describe('notification', () => {
    it('should validate valid notification', () => {
      const notification: Notification = {
        id: '123',
        title: 'Test Title',
        body: 'Test body',
        data: { key: 'value' },
        timestamp: new Date(),
        platform: 'ios',
        type: 'push',
      }

      const result = ValidationUtils.notification(notification)
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should require notification object', () => {
      const result = ValidationUtils.notification(null as any)
      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'notification',
        message: 'Notification is required',
        code: 'NOTIFICATION_REQUIRED',
      })
    })

    it('should require title', () => {
      const notification = {
        body: 'Test body',
      } as any

      const result = ValidationUtils.notification(notification)
      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'title',
        message: 'Title is required',
        code: 'TITLE_REQUIRED',
      })
    })

    it('should require body', () => {
      const notification = {
        title: 'Test title',
        body: '',
      } as any

      const result = ValidationUtils.notification(notification)
      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'body',
        message: 'Body is required',
        code: 'BODY_REQUIRED',
      })
    })

    it('should validate priority', () => {
      const notification = {
        title: 'Test',
        body: 'Test body',
        priority: 'invalid',
      } as any

      const result = ValidationUtils.notification(notification)
      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'priority',
        message: 'Invalid priority',
        code: 'INVALID_PRIORITY',
        value: 'invalid',
      })
    })

    it('should accept valid priorities', () => {
      const validPriorities = ['min', 'low', 'default', 'high', 'max']
      
      validPriorities.forEach(priority => {
        const notification = {
          title: 'Test',
          body: 'Test body',
          priority,
        } as any

        const result = ValidationUtils.notification(notification)
        expect(result.valid).toBe(true)
      })
    })

    it('should validate visibility', () => {
      const notification = {
        title: 'Test',
        body: 'Test body',
        visibility: 'invalid',
      } as any

      const result = ValidationUtils.notification(notification)
      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'visibility',
        message: 'Invalid visibility',
        code: 'INVALID_VISIBILITY',
        value: 'invalid',
      })
    })

    it('should accept valid visibilities', () => {
      const validVisibilities = ['public', 'private', 'secret']
      
      validVisibilities.forEach(visibility => {
        const notification = {
          title: 'Test',
          body: 'Test body',
          visibility,
        } as any

        const result = ValidationUtils.notification(notification)
        expect(result.valid).toBe(true)
      })
    })
  })

  describe('scheduleOptions', () => {
    it('should delegate to SchedulingUtils', () => {
      const options: ScheduleOptions = {
        at: new Date(Date.now() + 60000),
      }

      const result = ValidationUtils.scheduleOptions(options)
      expect(result).toBeDefined()
      expect(result).toHaveProperty('valid')
      expect(result).toHaveProperty('errors')
    })
  })

  describe('inAppOptions', () => {
    it('should validate valid in-app options', () => {
      const options: InAppOptions = {
        message: 'Test message',
        type: 'success',
        duration: 5000,
        position: 'top-right',
      }

      const result = ValidationUtils.inAppOptions(options)
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should require options object', () => {
      const result = ValidationUtils.inAppOptions(null as any)
      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'options',
        message: 'Options are required',
        code: 'OPTIONS_REQUIRED',
      })
    })

    it('should require message', () => {
      const options: InAppOptions = {
        message: '',
      }

      const result = ValidationUtils.inAppOptions(options)
      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'message',
        message: 'Message is required',
        code: 'MESSAGE_REQUIRED',
      })
    })

    it('should validate type', () => {
      const options: InAppOptions = {
        message: 'Test',
        type: 'invalid' as any,
      }

      const result = ValidationUtils.inAppOptions(options)
      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'type',
        message: 'Invalid type',
        code: 'INVALID_TYPE',
        value: 'invalid',
      })
    })

    it('should accept valid types', () => {
      const validTypes = ['success', 'error', 'warning', 'info', 'custom']
      
      validTypes.forEach(type => {
        const options: InAppOptions = {
          message: 'Test',
          type: type as any,
        }

        const result = ValidationUtils.inAppOptions(options)
        expect(result.valid).toBe(true)
      })
    })

    it('should validate duration', () => {
      const options: InAppOptions = {
        message: 'Test',
        duration: -1000,
      }

      const result = ValidationUtils.inAppOptions(options)
      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'duration',
        message: 'Duration must be non-negative',
        code: 'INVALID_DURATION',
        value: -1000,
      })
    })

    it('should validate position', () => {
      const options: InAppOptions = {
        message: 'Test',
        position: 'invalid' as any,
      }

      const result = ValidationUtils.inAppOptions(options)
      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'position',
        message: 'Invalid position',
        code: 'INVALID_POSITION',
        value: 'invalid',
      })
    })

    it('should accept valid positions', () => {
      const validPositions = [
        'top-left',
        'top-center',
        'top-right',
        'bottom-left',
        'bottom-center',
        'bottom-right',
        'center',
      ]
      
      validPositions.forEach(position => {
        const options: InAppOptions = {
          message: 'Test',
          position: position as any,
        }

        const result = ValidationUtils.inAppOptions(options)
        expect(result.valid).toBe(true)
      })
    })
  })

  describe('channel', () => {
    it('should validate valid channel', () => {
      const channel: NotificationChannel = {
        id: 'test-channel',
        name: 'Test Channel',
        description: 'Test channel description',
        importance: 'high',
      }

      const result = ValidationUtils.channel(channel)
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should require channel object', () => {
      const result = ValidationUtils.channel(null)
      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'channel',
        message: 'Channel is required',
        code: 'CHANNEL_REQUIRED',
      })
    })

    it('should require channel ID', () => {
      const channel = {
        name: 'Test Channel',
      }

      const result = ValidationUtils.channel(channel)
      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'id',
        message: 'Channel ID is required',
        code: 'CHANNEL_ID_REQUIRED',
      })
    })

    it('should require channel name', () => {
      const channel = {
        id: 'test-channel',
        name: '',
      }

      const result = ValidationUtils.channel(channel)
      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'name',
        message: 'Channel name is required',
        code: 'CHANNEL_NAME_REQUIRED',
      })
    })

    it('should validate importance', () => {
      const channel = {
        id: 'test',
        name: 'Test',
        importance: 'invalid',
      }

      const result = ValidationUtils.channel(channel)
      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'importance',
        message: 'Invalid importance',
        code: 'INVALID_IMPORTANCE',
        value: 'invalid',
      })
    })

    it('should accept valid importance levels', () => {
      const validLevels = ['none', 'min', 'low', 'default', 'high', 'max']
      
      validLevels.forEach(importance => {
        const channel = {
          id: 'test',
          name: 'Test',
          importance,
        }

        const result = ValidationUtils.channel(channel)
        expect(result.valid).toBe(true)
      })
    })
  })

  describe('permissionStatus', () => {
    it('should validate valid permission statuses', () => {
      const validStatuses = ['prompt', 'granted', 'denied']
      
      validStatuses.forEach(status => {
        expect(ValidationUtils.permissionStatus(status)).toBe(true)
      })
    })

    it('should reject invalid permission status', () => {
      expect(ValidationUtils.permissionStatus('invalid')).toBe(false)
    })
  })

  describe('platform', () => {
    it('should validate valid platforms', () => {
      const validPlatforms = ['web', 'ios', 'android', 'electron']
      
      validPlatforms.forEach(platform => {
        expect(ValidationUtils.platform(platform)).toBe(true)
      })
    })

    it('should reject invalid platform', () => {
      expect(ValidationUtils.platform('invalid')).toBe(false)
    })
  })

  describe('provider', () => {
    it('should validate valid providers', () => {
      const validProviders = ['firebase', 'onesignal']
      
      validProviders.forEach(provider => {
        expect(ValidationUtils.provider(provider)).toBe(true)
      })
    })

    it('should reject invalid provider', () => {
      expect(ValidationUtils.provider('invalid')).toBe(false)
    })
  })
})

describe('validate convenience functions', () => {
  it('should export all validation methods', () => {
    expect(validate.notification).toBeDefined()
    expect(validate.scheduleOptions).toBeDefined()
    expect(validate.inAppOptions).toBeDefined()
    expect(validate.channel).toBeDefined()
    expect(validate.permissionStatus).toBeDefined()
    expect(validate.platform).toBeDefined()
    expect(validate.provider).toBeDefined()
  })

  it('should call corresponding ValidationUtils methods', () => {
    const notification: Notification = {
      id: '123',
      title: 'Test',
      body: 'Test body',
      data: {},
      timestamp: new Date(),
      platform: 'ios',
      type: 'push',
    }

    const result = validate.notification(notification)
    expect(result.valid).toBe(true)
  })
})
