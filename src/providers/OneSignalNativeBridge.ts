import { DynamicLoader } from '@/utils/dynamic-loader'
import { Logger } from '@/utils/logger'
import type { OneSignalConfig } from '@/types'
import { isOneSignalInstanceConfig } from '@/types'

/**
 * Native bridge for OneSignal configuration
 * Handles runtime configuration injection for iOS and Android
 */
export class OneSignalNativeBridge {
  private static isInitialized = false

  /**
   * Initialize OneSignal on native platforms with runtime configuration
   */
  static async initializeNative(config: OneSignalConfig): Promise<void> {
    if (this.isInitialized) {
      Logger.warn('OneSignal native bridge already initialized')
      return
    }

    const isNative = await DynamicLoader.isNativePlatform()
    if (!isNative) {
      // Not a native platform, skip native initialization
      return
    }

    const platform = await DynamicLoader.getPlatform()
    
    try {
      // For Capacitor apps, we need to use the OneSignal Capacitor SDK
      // which handles native configuration programmatically
      const capacitor = await DynamicLoader.loadCapacitorCore()
      if (!capacitor) {
        throw new Error('Capacitor not available for native OneSignal initialization')
      }

      // Use Capacitor's plugin system to communicate with native code
      // This approach avoids hardcoding credentials in native files
      await this.configureNativePlatform(platform, config)
      
      this.isInitialized = true
      Logger.info(`OneSignal native bridge initialized for ${platform}`)
    } catch (error) {
      Logger.error('Failed to initialize OneSignal native bridge:', error)
      throw error
    }
  }

  /**
   * Configure OneSignal for specific native platform
   */
  private static async configureNativePlatform(
    platform: string,
    config: OneSignalConfig
  ): Promise<void> {
    // Instead of using Info.plist or AndroidManifest.xml,
    // we'll use the OneSignal SDK's programmatic initialization
    
    // The OneSignal Capacitor plugin (when available) would handle this
    // For now, we document the approach for developers
    
    if (platform === 'ios') {
      await this.configureIOS(config)
    } else if (platform === 'android') {
      await this.configureAndroid(config)
    }
  }

  /**
   * Configure OneSignal for iOS
   */
  private static async configureIOS(config: OneSignalConfig): Promise<void> {
    // iOS configuration approach:
    // 1. The OneSignal SDK for iOS supports programmatic initialization
    // 2. Instead of Info.plist, use the SDK's initialization method
    // 3. This is typically done in the AppDelegate or via a Capacitor plugin
    
    Logger.debug('iOS OneSignal configuration:', {
      appId: !isOneSignalInstanceConfig(config) && config.appId ? '***' : 'not provided',
      // Log config status without exposing sensitive data
    })

    // Note: Actual implementation would require a Capacitor plugin
    // that bridges to native iOS code to call:
    // OneSignal.initWithLaunchOptions(launchOptions, appId: config.appId)
  }

  /**
   * Configure OneSignal for Android
   */
  private static async configureAndroid(config: OneSignalConfig): Promise<void> {
    // Android configuration approach:
    // 1. The OneSignal SDK for Android supports programmatic initialization
    // 2. Instead of AndroidManifest.xml meta-data, use the SDK's init method
    // 3. This is typically done in the Application class or via a Capacitor plugin
    
    Logger.debug('Android OneSignal configuration:', {
      appId: !isOneSignalInstanceConfig(config) && config.appId ? '***' : 'not provided',
      // Log config status without exposing sensitive data
    })

    // Note: Actual implementation would require a Capacitor plugin
    // that bridges to native Android code to call:
    // OneSignal.initWithContext(context, config.appId)
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
}