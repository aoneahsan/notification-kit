/**
 * Centralized logger for notification-kit.
 *
 * Levels: `debug` < `info` < `warn` (default) < `error` < `silent`. The default
 * is `warn` in both development and production, so only warnings and errors are
 * shown unless the level is lowered.
 *
 * Change the level via (in order of when they apply):
 *  - `localStorage['notification-kit:logLevel']` — persisted; read at startup.
 *  - `Logger.setLevel('debug')` — programmatic (also persists to localStorage).
 *  - `window.__setLogLevel('debug')` — devtools, after `Logger.installDevtools()`.
 *
 * LIBRARY NOTE: unlike the workspace app-logger standard, this logger does NOT
 * auto-patch the host application's global `console` and does NOT auto-install
 * `window` devtools hooks — a library must never silently hijack a consumer's
 * console or globals. The devtools hooks are therefore opt-in via
 * `Logger.installDevtools()`.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 100,
}

const STORAGE_KEY = 'notification-kit:logLevel'
const PREFIX = '[notification-kit]'

function isLogLevel(value: unknown): value is LogLevel {
  return (
    value === 'debug' ||
    value === 'info' ||
    value === 'warn' ||
    value === 'error' ||
    value === 'silent'
  )
}

function readStoredLevel(): LogLevel | null {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (isLogLevel(stored)) {
        return stored
      }
    }
  } catch {
    // localStorage can throw (e.g. privacy mode / sandboxed iframe) — ignore.
  }
  return null
}

/* eslint-disable no-console -- this module is the single sanctioned console sink */
export class Logger {
  private static level: LogLevel = readStoredLevel() ?? 'warn'

  /** Set the active log level (and persist it to localStorage when available). */
  static setLevel(level: LogLevel): void {
    if (!isLogLevel(level)) {
      return
    }
    Logger.level = level
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, level)
      }
    } catch {
      // Ignore persistence failures.
    }
  }

  /** Get the active log level. */
  static getLevel(): LogLevel {
    return Logger.level
  }

  /** Backward-compatible shortcut: lower the level to `debug`. */
  static enableDebug(): void {
    Logger.setLevel('debug')
  }

  /** Backward-compatible shortcut: restore the default `warn` level. */
  static disableDebug(): void {
    if (Logger.level === 'debug') {
      Logger.setLevel('warn')
    }
  }

  private static enabled(level: Exclude<LogLevel, 'silent'>): boolean {
    return (
      typeof console !== 'undefined' &&
      LEVEL_ORDER[level] >= LEVEL_ORDER[Logger.level]
    )
  }

  static debug(...args: unknown[]): void {
    if (Logger.enabled('debug')) {
      console.debug(PREFIX, ...args)
    }
  }

  static info(...args: unknown[]): void {
    if (Logger.enabled('info')) {
      console.info(PREFIX, ...args)
    }
  }

  static warn(...args: unknown[]): void {
    if (Logger.enabled('warn')) {
      console.warn(PREFIX, ...args)
    }
  }

  static error(...args: unknown[]): void {
    if (Logger.enabled('error')) {
      console.error(PREFIX, ...args)
    }
  }

  /**
   * Opt-in: expose `window.__setLogLevel(level)` / `window.__getLogLevel()` for
   * runtime control from devtools. Not called automatically. Returns a function
   * that removes the hooks again.
   */
  static installDevtools(): () => void {
    if (typeof window === 'undefined') {
      return () => {}
    }
    const w = window as unknown as Record<string, unknown>
    w.__setLogLevel = (level: unknown): void => {
      if (isLogLevel(level)) {
        Logger.setLevel(level)
      }
    }
    w.__getLogLevel = (): LogLevel => Logger.getLevel()
    return () => {
      delete w.__setLogLevel
      delete w.__getLogLevel
    }
  }
}
/* eslint-enable no-console */

/** Lowercase alias for ergonomic imports (`import { logger } from ...`). */
export const logger = Logger
