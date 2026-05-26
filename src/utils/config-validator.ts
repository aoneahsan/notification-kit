import { Logger } from './logger'
import type { FirebaseConfig, OneSignalConfig } from '@/types'
import { isFirebaseAppConfig, isOneSignalInstanceConfig } from '@/types'

/**
 * Configuration validator with security checks
 */
export class ConfigValidator {
  /**
   * Validate Firebase configuration
   */
  static validateFirebaseConfig(config: FirebaseConfig): void {
    // Skip validation if using existing app
    if (isFirebaseAppConfig(config)) {
      return
    }

    const requiredFields = [
      'apiKey',
      'authDomain',
      'projectId',
      'storageBucket',
      'messagingSenderId',
      'appId',
    ]

    const missingFields = requiredFields.filter(field => !(field in config))

    if (missingFields.length > 0) {
      throw new Error(
        `Missing required Firebase configuration fields: ${missingFields.join(', ')}. ` +
        'Make sure all required environment variables are set.'
      )
    }

    // Security checks
    this.performSecurityChecks(config)
  }

  /**
   * Validate OneSignal configuration
   */
  static validateOneSignalConfig(config: OneSignalConfig): void {
    // Skip validation if using existing instance
    if (isOneSignalInstanceConfig(config)) {
      return
    }

    if (!config.appId) {
      throw new Error(
        'Missing required OneSignal appId. ' +
        'Make sure ONESIGNAL_APP_ID environment variable is set.'
      )
    }

    // Validate REST API key if provided (needed for server operations)
    if ('restApiKey' in config && config.restApiKey && config.restApiKey.length < 48) {
      Logger.warn(
        'OneSignal REST API key appears to be invalid. ' +
        'Server-side operations may fail.'
      )
    }

    // Security checks
    this.performSecurityChecks(config)
  }

  /**
   * Perform best-effort security checks on configuration.
   *
   * Note: this intentionally does NOT attempt to detect "hardcoded" credentials
   * by scanning `process.env`. Once a value reaches the config object it is just
   * a string regardless of whether it originated from an env var, so that check
   * produced false positives and missed common prefixes (GATSBY_, EXPO_PUBLIC_,
   * etc.). Keeping secrets out of source is enforced by the developer's tooling
   * (gitignore, secret scanning) — not reliably by a client library at runtime.
   */
  private static performSecurityChecks(config: Record<string, any>): void {
    if (!this.isProduction()) return

    // Warn when localhost endpoints are shipped to production.
    const localhostFields = ['authDomain', 'databaseURL']
    for (const field of localhostFields) {
      const value = config[field]
      if (typeof value === 'string' && value.includes('localhost')) {
        Logger.warn(
          `notification-kit: configuration field '${field}' contains 'localhost' ` +
            'in production — this is likely a misconfiguration.'
        )
      }
    }
  }

  /**
   * Best-effort production check that is safe in non-Node (browser) runtimes
   * where `process` is not defined.
   */
  private static isProduction(): boolean {
    return (
      typeof process !== 'undefined' &&
      !!process.env &&
      process.env.NODE_ENV === 'production'
    )
  }

  /**
   * Validate environment variables are set
   */
  static validateEnvironmentVariables(provider: 'firebase' | 'onesignal'): void {
    if (typeof process === 'undefined' || !process.env) {
      // Not in Node.js environment, skip validation
      return
    }

    const requiredEnvVars = provider === 'firebase' 
      ? this.getRequiredFirebaseEnvVars()
      : this.getRequiredOneSignalEnvVars()

    const missingEnvVars: string[] = []
    
    for (const envVars of requiredEnvVars) {
      const hasAny = envVars.some(envVar => !!process.env[envVar])
      if (!hasAny) {
        missingEnvVars.push(envVars.join(' or '))
      }
    }

    if (missingEnvVars.length > 0) {
      Logger.warn(
        `Missing environment variables for ${provider}: ${missingEnvVars.join(', ')}. ` +
        'Make sure to set these in your .env file or deployment environment.'
      )
    }
  }

  /**
   * Get required Firebase environment variables (with common prefixes)
   */
  private static getRequiredFirebaseEnvVars(): string[][] {
    return [
      ['FIREBASE_API_KEY', 'NEXT_PUBLIC_FIREBASE_API_KEY', 'REACT_APP_FIREBASE_API_KEY', 'VITE_FIREBASE_API_KEY'],
      ['FIREBASE_AUTH_DOMAIN', 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 'REACT_APP_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_AUTH_DOMAIN'],
      ['FIREBASE_PROJECT_ID', 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'REACT_APP_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_PROJECT_ID'],
      ['FIREBASE_STORAGE_BUCKET', 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', 'REACT_APP_FIREBASE_STORAGE_BUCKET', 'VITE_FIREBASE_STORAGE_BUCKET'],
      ['FIREBASE_MESSAGING_SENDER_ID', 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', 'REACT_APP_FIREBASE_MESSAGING_SENDER_ID', 'VITE_FIREBASE_MESSAGING_SENDER_ID'],
      ['FIREBASE_APP_ID', 'NEXT_PUBLIC_FIREBASE_APP_ID', 'REACT_APP_FIREBASE_APP_ID', 'VITE_FIREBASE_APP_ID'],
    ]
  }

  /**
   * Get required OneSignal environment variables (with common prefixes)
   */
  private static getRequiredOneSignalEnvVars(): string[][] {
    return [
      ['ONESIGNAL_APP_ID', 'NEXT_PUBLIC_ONESIGNAL_APP_ID', 'REACT_APP_ONESIGNAL_APP_ID', 'VITE_ONESIGNAL_APP_ID'],
    ]
  }
}