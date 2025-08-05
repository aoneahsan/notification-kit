import { Logger } from './logger'
import type { FirebaseConfig, OneSignalConfig } from '@/types'

/**
 * Configuration validator with security checks
 */
export class ConfigValidator {
  /**
   * Validate Firebase configuration
   */
  static validateFirebaseConfig(config: FirebaseConfig): void {
    const requiredFields: (keyof FirebaseConfig)[] = [
      'apiKey',
      'authDomain',
      'projectId',
      'storageBucket',
      'messagingSenderId',
      'appId',
    ]

    const missingFields = requiredFields.filter(field => !config[field])

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
    if (!config.appId) {
      throw new Error(
        'Missing required OneSignal appId. ' +
        'Make sure ONESIGNAL_APP_ID environment variable is set.'
      )
    }

    // Validate REST API key if provided (needed for server operations)
    if (config.restApiKey && config.restApiKey.length < 48) {
      Logger.warn(
        'OneSignal REST API key appears to be invalid. ' +
        'Server-side operations may fail.'
      )
    }

    // Security checks
    this.performSecurityChecks(config)
  }

  /**
   * Perform security checks on configuration
   */
  private static performSecurityChecks(config: Record<string, any>): void {
    // Check for hardcoded credentials (common patterns)
    const suspiciousPatterns = [
      { field: 'apiKey', pattern: /^AIzaSy/, provider: 'Firebase' },
      { field: 'appId', pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-/, provider: 'OneSignal' },
    ]

    for (const { field, pattern, provider } of suspiciousPatterns) {
      if (config[field] && typeof config[field] === 'string') {
        const value = config[field] as string
        
        // Check if it looks like a real credential
        if (pattern.test(value)) {
          // Check if it's from environment variable
          const isFromEnv = this.isFromEnvironmentVariable(value)
          
          if (!isFromEnv && process.env.NODE_ENV === 'production') {
            Logger.warn(
              `Potential hardcoded ${provider} ${field} detected. ` +
              'Consider using environment variables for better security.'
            )
          }
        }
      }
    }

    // Check for localhost in production
    if (process.env.NODE_ENV === 'production') {
      const localhostFields = ['authDomain', 'databaseURL']
      for (const field of localhostFields) {
        if (config[field] && config[field].includes('localhost')) {
          Logger.warn(
            `Configuration field '${field}' contains 'localhost' in production. ` +
            'This may cause issues.'
          )
        }
      }
    }
  }

  /**
   * Check if a value likely comes from an environment variable
   */
  private static isFromEnvironmentVariable(value: string): boolean {
    // This is a heuristic - in a browser environment we can't directly check
    // if a value came from process.env, but we can check common patterns
    
    // Check if running in Node.js environment
    if (typeof process !== 'undefined' && process.env) {
      // Check common environment variable names
      const commonEnvVars = [
        'FIREBASE_API_KEY',
        'NEXT_PUBLIC_FIREBASE_API_KEY',
        'REACT_APP_FIREBASE_API_KEY',
        'VITE_FIREBASE_API_KEY',
        'VUE_APP_FIREBASE_API_KEY',
        'ONESIGNAL_APP_ID',
        'NEXT_PUBLIC_ONESIGNAL_APP_ID',
        'REACT_APP_ONESIGNAL_APP_ID',
        'VITE_ONESIGNAL_APP_ID',
        'VUE_APP_ONESIGNAL_APP_ID',
      ]

      return commonEnvVars.some(envVar => process.env[envVar] === value)
    }

    return false
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