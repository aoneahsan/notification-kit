import { DynamicLoader } from '@/utils/dynamic-loader'
import { Logger } from '@/utils/logger'
import type { FirebaseConfig } from '@/types'
import { isFirebaseAppConfig } from '@/types'

/**
 * Native bridge for Firebase configuration
 * Handles secure runtime configuration for iOS and Android
 */
export class FirebaseNativeBridge {
  private static isInitialized = false

  /**
   * Initialize Firebase on native platforms with runtime configuration
   */
  static async initializeNative(config: FirebaseConfig): Promise<void> {
    if (this.isInitialized) {
      Logger.warn('Firebase native bridge already initialized')
      return
    }

    const isNative = await DynamicLoader.isNativePlatform()
    if (!isNative) {
      // Not a native platform, skip native initialization
      return
    }

    const platform = await DynamicLoader.getPlatform()
    
    try {
      // Validate configuration
      this.validateConfig(config)
      
      // Configure platform-specific settings
      await this.configureNativePlatform(platform, config)
      
      this.isInitialized = true
      Logger.info(`Firebase native bridge initialized for ${platform}`)
    } catch (error) {
      Logger.error('Failed to initialize Firebase native bridge:', error)
      throw error
    }
  }

  /**
   * Validate Firebase configuration
   */
  private static validateConfig(config: FirebaseConfig): void {
    // If config has app property, it's already initialized
    if (isFirebaseAppConfig(config)) {
      Logger.debug('Firebase configuration uses existing app instance')
      return
    }

    const requiredFields = [
      'apiKey',
      'authDomain',
      'projectId',
      'storageBucket',
      'messagingSenderId',
      'appId'
    ]

    const missingFields = requiredFields.filter(field => !(field in config))
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required Firebase configuration fields: ${missingFields.join(', ')}`)
    }

    // Log configuration status without exposing sensitive data
    Logger.debug('Firebase configuration validated', {
      hasApiKey: 'apiKey' in config,
      hasAuthDomain: 'authDomain' in config,
      hasProjectId: 'projectId' in config,
      hasMessagingSenderId: 'messagingSenderId' in config,
      hasAppId: 'appId' in config,
      hasVapidKey: 'vapidKey' in config,
    })
  }

  /**
   * Configure Firebase for specific native platform
   */
  private static async configureNativePlatform(
    platform: string,
    config: FirebaseConfig
  ): Promise<void> {
    if (platform === 'ios') {
      await this.configureIOS(config)
    } else if (platform === 'android') {
      await this.configureAndroid(config)
    }
  }

  /**
   * Configure Firebase for iOS
   * 
   * IMPORTANT: This approach ensures that:
   * 1. GoogleService-Info.plist is NOT required in the repository
   * 2. Firebase configuration is provided at runtime
   * 3. Sensitive data never appears in version control
   */
  private static async configureIOS(_config: FirebaseConfig): Promise<void> {
    // iOS Firebase configuration approach:
    // Instead of using GoogleService-Info.plist, we configure Firebase programmatically
    // This would be done through a Capacitor plugin that bridges to native iOS code
    
    Logger.debug('iOS Firebase configuration prepared (credentials hidden)')

    // Note: The actual implementation would require a Capacitor plugin
    // that bridges to native iOS code to call:
    // 
    // let options = FirebaseOptions(
    //   googleAppID: config.appId,
    //   gcmSenderID: config.messagingSenderId,
    //   projectID: config.projectId,
    //   apiKey: config.apiKey,
    //   databaseURL: config.authDomain,
    //   storageBucket: config.storageBucket
    // )
    // FirebaseApp.configure(options: options)
    
    // This avoids the need for GoogleService-Info.plist in the repository
  }

  /**
   * Configure Firebase for Android
   * 
   * IMPORTANT: This approach ensures that:
   * 1. google-services.json is NOT required in the repository
   * 2. Firebase configuration is provided at runtime
   * 3. Sensitive data never appears in version control
   */
  private static async configureAndroid(_config: FirebaseConfig): Promise<void> {
    // Android Firebase configuration approach:
    // Instead of using google-services.json, we configure Firebase programmatically
    // This would be done through a Capacitor plugin that bridges to native Android code
    
    Logger.debug('Android Firebase configuration prepared (credentials hidden)')

    // Note: The actual implementation would require a Capacitor plugin
    // that bridges to native Android code to call:
    // 
    // FirebaseOptions options = new FirebaseOptions.Builder()
    //   .setApplicationId(config.appId)
    //   .setApiKey(config.apiKey)
    //   .setDatabaseUrl(config.authDomain)
    //   .setProjectId(config.projectId)
    //   .setStorageBucket(config.storageBucket)
    //   .setGcmSenderId(config.messagingSenderId)
    //   .build();
    // FirebaseApp.initializeApp(context, options);
    
    // This avoids the need for google-services.json in the repository
  }

  /**
   * Get initialization status
   */
  static isNativeInitialized(): boolean {
    return this.isInitialized
  }

  /**
   * Reset initialization (useful for testing)
   */
  static reset(): void {
    this.isInitialized = false
  }

  /**
   * Validate environment variables
   */
  static validateEnvironmentVariables(): void {
    const requiredEnvVars = [
      'FIREBASE_API_KEY',
      'FIREBASE_AUTH_DOMAIN',
      'FIREBASE_PROJECT_ID',
      'FIREBASE_STORAGE_BUCKET',
      'FIREBASE_MESSAGING_SENDER_ID',
      'FIREBASE_APP_ID'
    ]

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])
    
    if (missingEnvVars.length > 0) {
      Logger.warn(
        `Missing Firebase environment variables: ${missingEnvVars.join(', ')}. ` +
        'Make sure to set these in your .env file or deployment environment.'
      )
    }
  }
}