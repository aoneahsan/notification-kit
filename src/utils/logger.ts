/**
 * Simple logger utility for notification-kit
 */
export class Logger {
  private static isDebugEnabled = false

  static enableDebug(): void {
    Logger.isDebugEnabled = true
  }

  static disableDebug(): void {
    Logger.isDebugEnabled = false
  }

  static debug(...args: any[]): void {
    if (Logger.isDebugEnabled && typeof console !== 'undefined') {
      console.log('[notification-kit]', ...args)
    }
  }

  static info(...args: any[]): void {
    if (typeof console !== 'undefined') {
      console.info('[notification-kit]', ...args)
    }
  }

  static warn(...args: any[]): void {
    if (typeof console !== 'undefined') {
      console.warn('[notification-kit]', ...args)
    }
  }

  static error(...args: any[]): void {
    if (typeof console !== 'undefined') {
      console.error('[notification-kit]', ...args)
    }
  }
}