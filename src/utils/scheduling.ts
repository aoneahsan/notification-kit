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

    // If the time has already passed, roll forward to the next future occurrence
    // of that time-of-day. (The old code added a single day, which left dates
    // more than a day in the past still in the past.)
    if (scheduledTime <= now) {
      scheduledTime.setFullYear(now.getFullYear(), now.getMonth(), now.getDate())
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1)
      }
    }

    return scheduledTime
  }

  /**
   * Calculate the next scheduled time from `on` components.
   *
   * Precedence (the two are mutually exclusive — mixing them is ambiguous):
   *  - If `weekday` is set → WEEKDAY mode: year/month/day are ignored and the
   *    next matching weekday (at the given time-of-day) is chosen.
   *  - Otherwise → DATE mode: the explicit year/month/day are applied; if the
   *    resulting time is in the past it rolls forward (by a month when a
   *    day-of-month was specified, else by a day).
   *
   * All math is in LOCAL time (matching the device); the `timezone` option is
   * not applied here.
   */
  static calculateOnTime(on: DateComponents, now: Date): Date {
    const scheduledTime = new Date(now)

    // Time-of-day applies in both modes.
    if (on.hour !== undefined) scheduledTime.setHours(on.hour)
    if (on.minute !== undefined) scheduledTime.setMinutes(on.minute)
    if (on.second !== undefined) scheduledTime.setSeconds(on.second)
    if (on.second === undefined) scheduledTime.setSeconds(0)
    scheduledTime.setMilliseconds(0)

    if (on.weekday !== undefined) {
      // WEEKDAY mode.
      const weekdayNumber = this.weekdayToNumber(on.weekday as WeekDay)
      const dayDiff = (weekdayNumber - scheduledTime.getDay() + 7) % 7
      scheduledTime.setDate(scheduledTime.getDate() + dayDiff)
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 7)
      }
      return scheduledTime
    }

    // DATE mode.
    if (on.year !== undefined) scheduledTime.setFullYear(on.year)
    if (on.month !== undefined) scheduledTime.setMonth(on.month - 1) // 0-indexed
    if (on.day !== undefined) scheduledTime.setDate(on.day)

    if (scheduledTime <= now) {
      if (on.day !== undefined) {
        scheduledTime.setMonth(scheduledTime.getMonth() + 1)
      } else {
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

    // Handle based on the frequency type. (All math is in LOCAL time.)
    switch (every.frequency) {
      case 'daily':
        scheduledTime.setDate(scheduledTime.getDate() + Number(frequency))
        break
      case 'weekly':
        scheduledTime.setDate(scheduledTime.getDate() + Number(frequency) * 7)
        break
      case 'monthly': {
        // Clamp the day so e.g. Jan 31 + 1 month → Feb 28/29, not a rollover to
        // March (setMonth alone overflows when the target month is shorter).
        const day = scheduledTime.getDate()
        scheduledTime.setDate(1)
        scheduledTime.setMonth(scheduledTime.getMonth() + Number(frequency))
        const daysInTargetMonth = new Date(
          scheduledTime.getFullYear(),
          scheduledTime.getMonth() + 1,
          0
        ).getDate()
        scheduledTime.setDate(Math.min(day, daysInTargetMonth))
        break
      }
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
      // Validated against the absolute calendar range (1-31), not per-month.
      // A day greater than the target month's length (e.g. day 31 in a 30-day
      // month) is intentionally NOT rejected here; per JavaScript Date
      // semantics it rolls forward into the following month when the time is
      // computed. Use a per-month day if you need exact-day behavior.
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
    // Basic cron parsing: supports a single numeric value or '*' per field.
    // Ranges (1-5), steps (*/2), and lists (1,3,5) are NOT supported — such
    // fields are treated as '*'. The 5 fields are: minute hour day-of-month
    // month day-of-week.
    const parts = cron.trim().split(/\s+/)
    if (parts.length !== 5) {
      return null
    }

    const [
      minute = '*',
      hour = '*',
      dayOfMonth = '*',
      month = '*',
      dayOfWeek = '*',
    ] = parts

    const schedule: ScheduleOptions = {
      title: '',
      body: '',
    }

    const on: DateComponents = {}
    const setField = (raw: string, assign: (n: number) => void): void => {
      if (raw === '*') return
      const parsed = parseInt(raw, 10)
      if (!isNaN(parsed)) assign(parsed)
    }

    setField(minute, n => (on.minute = n))
    setField(hour, n => (on.hour = n))
    setField(dayOfMonth, n => (on.day = n))
    setField(month, n => (on.month = n))
    // Cron day-of-week is 0-6 (Sun-Sat) with 7 also meaning Sunday.
    setField(dayOfWeek, n => (on.weekday = (n === 7 ? 0 : n) as WeekDay))

    if (Object.keys(on).length > 0) {
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
      const dayOfWeek =
        schedule.on.weekday !== undefined
          ? this.weekdayToNumber(schedule.on.weekday as WeekDay)
          : '*'

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
            // Cron cannot express "every N weeks"; emit weekly-on-Sunday.
            return `0 0 * * 0`
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
}
