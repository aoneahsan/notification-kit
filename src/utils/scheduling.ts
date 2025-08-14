import type {
  ScheduleOptions,
  EventValidationError,
  DateComponents,
  RepeatOptions,
  WeekDay,
} from '@/types'

interface ScheduleValidationResult {
  valid: boolean
  errors: EventValidationError[]
}

/**
 * Scheduling utilities for local notifications
 */
export class SchedulingUtils {
  /**
   * Calculate next scheduled time
   */
  static calculateNextScheduledTime(schedule: ScheduleOptions): Date | null {
    if (!schedule) {
      return null
    }

    const now = new Date()

    if (schedule.at) {
      return this.calculateAtTime(schedule.at as Date, now)
    }

    if (schedule.on) {
      return this.calculateOnTime(schedule.on, now)
    }

    if (schedule.every) {
      return this.calculateEveryTime(schedule.every as unknown as RepeatOptions, now)
    }

    return null
  }

  /**
   * Calculate schedule at specific time
   */
  static calculateAtTime(at: Date, now: Date): Date {
    const scheduledTime = new Date(at)

    // If the time has already passed, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1)
    }

    return scheduledTime
  }

  /**
   * Calculate schedule on specific day/time
   */
  static calculateOnTime(on: DateComponents, now: Date): Date {
    const scheduledTime = new Date(now)

    if (on.year) scheduledTime.setFullYear(on.year)
    if (on.month) scheduledTime.setMonth(on.month - 1) // Month is 0-indexed
    if (on.day) scheduledTime.setDate(on.day)
    if (on.hour !== undefined) scheduledTime.setHours(on.hour)
    if (on.minute !== undefined) scheduledTime.setMinutes(on.minute)
    if (on.second !== undefined) scheduledTime.setSeconds(on.second)

    // If the time has already passed, find the next occurrence
    if (scheduledTime <= now) {
      if (on.weekday !== undefined) {
        // Schedule for next occurrence of the weekday
        const weekdayNumber = this.weekdayToNumber(on.weekday as WeekDay)
        const dayDiff = (weekdayNumber - scheduledTime.getDay() + 7) % 7
        scheduledTime.setDate(scheduledTime.getDate() + (dayDiff || 7))
      } else {
        // Schedule for next occurrence
        scheduledTime.setDate(scheduledTime.getDate() + 1)
      }
    }

    return scheduledTime
  }

  /**
   * Calculate schedule every interval
   */
  static calculateEveryTime(every: RepeatOptions, now: Date): Date {
    const scheduledTime = new Date(now)
    const frequency = every.interval || 1

    // Handle based on the frequency type
    switch (every.frequency) {
      case 'daily':
        scheduledTime.setDate(scheduledTime.getDate() + Number(frequency))
        break
      case 'weekly':
        scheduledTime.setDate(scheduledTime.getDate() + Number(frequency) * 7)
        break
      case 'monthly':
        scheduledTime.setMonth(scheduledTime.getMonth() + Number(frequency))
        break
      case 'yearly':
        scheduledTime.setFullYear(scheduledTime.getFullYear() + Number(frequency))
        break
    }

    return scheduledTime
  }

  /**
   * Validate schedule options
   */
  static validateSchedule(schedule: ScheduleOptions): ScheduleValidationResult {
    const errors: EventValidationError[] = []

    if (!schedule) {
      errors.push({
        code: 'SCHEDULE_REQUIRED',
        message: 'Schedule is required',
        field: 'schedule',
        value: schedule,
      })
      return { valid: false, errors }
    }

    let hasValidSchedule = false

    if (schedule.at) {
      const result = this.validateAtSchedule(schedule.at as Date)
      if (result.valid) {
        hasValidSchedule = true
      } else {
        errors.push(...result.errors)
      }
    }

    if (schedule.on) {
      const result = this.validateOnSchedule(schedule.on)
      if (result.valid) {
        hasValidSchedule = true
      } else {
        errors.push(...result.errors)
      }
    }

    if (schedule.every) {
      const result = this.validateEverySchedule(schedule.every as unknown as RepeatOptions)
      if (result.valid) {
        hasValidSchedule = true
      } else {
        errors.push(...result.errors)
      }
    }

    if (!hasValidSchedule) {
      errors.push({
        code: 'NO_VALID_SCHEDULE',
        message: 'At least one valid schedule type (at, on, every) is required',
        field: 'schedule',
        value: schedule,
      })
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Validate "at" schedule
   */
  static validateAtSchedule(at: Date): ScheduleValidationResult {
    const errors: EventValidationError[] = []

    const date = new Date(at)
    if (isNaN(date.getTime())) {
      errors.push({
        code: 'INVALID_DATE',
        message: 'Invalid date format for "at" schedule',
        field: 'at',
        value: at,
      })
    } else if (date <= new Date()) {
      errors.push({
        code: 'PAST_DATE',
        message: 'Schedule date must be in the future',
        field: 'at',
        value: at,
      })
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Validate "on" schedule
   */
  static validateOnSchedule(on: DateComponents): ScheduleValidationResult {
    const errors: EventValidationError[] = []

    if (on.year !== undefined) {
      const currentYear = new Date().getFullYear()
      if (on.year < currentYear || on.year > currentYear + 100) {
        errors.push({
          code: 'INVALID_YEAR',
          message: 'Year must be between current year and 100 years from now',
          field: 'on.year',
          value: on.year,
        })
      }
    }

    if (on.month !== undefined) {
      if (on.month < 1 || on.month > 12) {
        errors.push({
          code: 'INVALID_MONTH',
          message: 'Month must be between 1 and 12',
          field: 'on.month',
          value: on.month,
        })
      }
    }

    if (on.day !== undefined) {
      if (on.day < 1 || on.day > 31) {
        errors.push({
          code: 'INVALID_DAY',
          message: 'Day must be between 1 and 31',
          field: 'on.day',
          value: on.day,
        })
      }
    }

    if (on.hour !== undefined) {
      if (on.hour < 0 || on.hour > 23) {
        errors.push({
          code: 'INVALID_HOUR',
          message: 'Hour must be between 0 and 23',
          field: 'on.hour',
          value: on.hour,
        })
      }
    }

    if (on.minute !== undefined) {
      if (on.minute < 0 || on.minute > 59) {
        errors.push({
          code: 'INVALID_MINUTE',
          message: 'Minute must be between 0 and 59',
          field: 'on.minute',
          value: on.minute,
        })
      }
    }

    if (on.second !== undefined) {
      if (on.second < 0 || on.second > 59) {
        errors.push({
          code: 'INVALID_SECOND',
          message: 'Second must be between 0 and 59',
          field: 'on.second',
          value: on.second,
        })
      }
    }

    if (on.weekday !== undefined) {
      const validWeekdays = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        1, 2, 3, 4, 5, 6, 7
      ]
      if (!validWeekdays.includes(on.weekday as any)) {
        errors.push({
          code: 'INVALID_WEEKDAY',
          message: 'Invalid weekday value',
          field: 'on.weekday',
          value: on.weekday,
        })
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Validate "every" schedule
   */
  static validateEverySchedule(every: RepeatOptions): ScheduleValidationResult {
    const errors: EventValidationError[] = []

    const validFrequencies: RepeatOptions['frequency'][] = [
      'daily',
      'weekly',
      'monthly',
      'yearly',
    ]
    if (!validFrequencies.includes(every.frequency)) {
      errors.push({
        code: 'INVALID_FREQUENCY',
        message: 'Invalid frequency type',
        field: 'every.frequency',
        value: every.frequency,
      })
    }

    if (every.count !== undefined && every.count < 1) {
      errors.push({
        code: 'INVALID_COUNT',
        message: 'Count must be at least 1',
        field: 'every.count',
        value: every.count,
      })
    }

    if (every.until !== undefined) {
      const untilDate = new Date(every.until)
      if (isNaN(untilDate.getTime())) {
        errors.push({
          code: 'INVALID_UNTIL_DATE',
          message: 'Invalid until date format',
          field: 'every.until',
          value: every.until,
        })
      } else if (untilDate <= new Date()) {
        errors.push({
          code: 'PAST_UNTIL_DATE',
          message: 'Until date must be in the future',
          field: 'every.until',
          value: every.until,
        })
      }
    }

    if (every.interval !== undefined && every.interval < 1) {
      errors.push({
        code: 'INVALID_INTERVAL',
        message: 'Interval must be at least 1',
        field: 'every.interval',
        value: every.interval,
      })
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Parse cron expression to schedule options
   */
  static parseCronExpression(cron: string): ScheduleOptions | null {
    // Basic cron parsing (simplified)
    const parts = cron.split(' ')
    if (parts.length !== 5) {
      return null
    }

    const [
      minute = '*',
      hour = '*',
      dayOfMonth = '*',
      month = '*',
      _dayOfWeek = '*',
    ] = parts

    const schedule: ScheduleOptions = {
      title: '',
      body: ''
    }

    // Handle simple cases
    if (minute !== '*' || hour !== '*') {
      const on: DateComponents = {}

      if (minute !== '*') {
        const parsed = parseInt(minute, 10)
        if (!isNaN(parsed)) on.minute = parsed
      }
      if (hour !== '*') {
        const parsed = parseInt(hour, 10)
        if (!isNaN(parsed)) on.hour = parsed
      }
      if (dayOfMonth !== '*') {
        const parsed = parseInt(dayOfMonth, 10)
        if (!isNaN(parsed)) on.day = parsed
      }
      if (month !== '*') {
        const parsed = parseInt(month, 10)
        if (!isNaN(parsed)) on.month = parsed
      }

      schedule.on = on as any
    }

    return schedule
  }

  /**
   * Convert schedule options to cron expression
   */
  static toCronExpression(schedule: ScheduleOptions): string | null {
    if (schedule.on) {
      const minute = schedule.on.minute !== undefined ? schedule.on.minute : '*'
      const hour = schedule.on.hour !== undefined ? schedule.on.hour : '*'
      const dayOfMonth = schedule.on.day !== undefined ? schedule.on.day : '*'
      const month = schedule.on.month !== undefined ? schedule.on.month : '*'
      const dayOfWeek = '*' // Simplified for now

      return `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`
    }

    if (schedule.every) {
      // Check if it's a RepeatInterval string or RepeatOptions object
      if (typeof schedule.every === 'string') {
        // It's a RepeatInterval
        switch (schedule.every) {
          case 'day':
            return '0 0 * * *'
          case 'week':
            return '0 0 * * 0'
          case 'month':
            return '0 0 1 * *'
          case 'year':
            return '0 0 1 1 *'
          default:
            return null
        }
      } else {
        // It's a RepeatOptions with frequency
        const interval = (schedule.every as any).interval || 1
        switch ((schedule.every as any).frequency) {
          case 'daily':
            return `0 0 */${interval} * *`
          case 'weekly':
            return `0 0 * * ${interval === 1 ? '0' : '*'}`
          case 'monthly':
            return `0 0 1 */${interval} *`
          case 'yearly':
            return `0 0 1 1 *`
          default:
            return null
        }
      }
    }

    return null
  }

  /**
   * Get human-readable schedule description
   */
  static getScheduleDescription(schedule: ScheduleOptions): string {
    if (schedule.at) {
      const date = new Date(schedule.at)
      return `At ${date.toLocaleString()}`
    }

    if (schedule.on) {
      const parts: string[] = []
      if (schedule.on.year) parts.push(`year ${schedule.on.year}`)
      if (schedule.on.month) parts.push(`month ${schedule.on.month}`)
      if (schedule.on.day) parts.push(`day ${schedule.on.day}`)
      if (schedule.on.hour !== undefined)
        parts.push(`${schedule.on.hour}:${schedule.on.minute || 0}`)
      if (schedule.on.weekday) parts.push(`on ${schedule.on.weekday}`)
      return `On ${parts.join(', ')}`
    }

    if (schedule.every) {
      if (typeof schedule.every === 'string') {
        return `Every ${schedule.every}`
      } else {
        const interval = (schedule.every as any).interval || 1
        const frequency = (schedule.every as any).frequency
        return `Every ${interval} ${frequency}`
      }
    }

    return 'No schedule defined'
  }

  /**
   * Convert weekday to number
   */
  private static weekdayToNumber(weekday: WeekDay): number {
    const map: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    }
    return typeof weekday === 'number' ? weekday : (map[weekday] || 0)
  }

  /**
   * Convert number to weekday
   */
  // Currently unused but may be needed for future functionality
  // private static numberToWeekday(num: number): WeekDay | undefined {
  //   const weekdays: WeekDay[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  //   return weekdays[num]
  // }
}
