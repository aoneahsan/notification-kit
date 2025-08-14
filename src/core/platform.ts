import type {
  Platform,
  PlatformCapabilities,
  PlatformDetection,
  PlatformDefaults,
  PlatformCompatibility,
} from '@/types'
import { DynamicLoader } from '@/utils/dynamic-loader'

/**
 * Platform detection and capability management
 */
export class PlatformManager {
  private detection: PlatformDetection | null = null
  private capabilities: PlatformCapabilities | null = null

  /**
   * Detect current platform
   */
  async detect(): Promise<PlatformDetection> {
    if (this.detection) {
      return this.detection
    }

    const platform = await this.getPlatform()
    const isCapacitor = await DynamicLoader.isNativePlatform()
    const isHybrid = isCapacitor
    const isNative = isCapacitor
    const isWeb = platform === 'web'
    const isMobile = platform === 'ios' || platform === 'android'
    const isDesktop = platform === 'electron' || (!isMobile && isWeb)
    const isTablet = false // TODO: Implement tablet detection
    const userAgent =
      typeof navigator !== 'undefined' ? navigator.userAgent : ''
    const version = this.getVersion()

    this.detection = {
      platform,
      isCapacitor,
      isHybrid,
      isNative,
      isWeb,
      isMobile,
      isDesktop,
      isTablet,
      version,
      userAgent,
      supportedFeatures: this.getSupportedFeatures(platform),
      limitations: this.getLimitations(platform),
      warnings: this.getWarnings(platform),
    }

    return this.detection
  }

  /**
   * Get platform capabilities
   */
  async getCapabilities(platform?: Platform): Promise<PlatformCapabilities> {
    const targetPlatform = platform || await this.getPlatform()

    if (this.capabilities && !platform) {
      return this.capabilities
    }

    const capabilities = this.buildCapabilities(targetPlatform)

    if (!platform) {
      this.capabilities = capabilities
    }

    return capabilities
  }

  /**
   * Check if feature is supported
   */
  async isSupported(
    feature: keyof PlatformCapabilities,
    platform?: Platform
  ): Promise<boolean> {
    const capabilities = await this.getCapabilities(platform)
    return capabilities[feature] || false
  }

  /**
   * Get platform defaults
   */
  getDefaults(): PlatformDefaults {
    return {
      sound: 'default',
      badge: '1',
      icon: 'notification-icon',
      web: {
        sound: 'default.mp3',
      },
      ios: {
        sound: 'default.caf',
        badge: 'auto',
      },
      android: {
        sound: 'default',
        icon: 'ic_notification',
      },
      electron: {
        sound: 'default',
      },
    }
  }

  /**
   * Get platform compatibility matrix
   */
  getCompatibility(): PlatformCompatibility {
    return {
      pushNotifications: true,
      localNotifications: true,
      inAppNotifications: true,
      channels: true,
      actions: true,
      badges: true,
      sounds: true,
      criticalAlerts: false,
    }
  }

  /**
   * Get current platform
   */
  private async getPlatform(): Promise<Platform> {
    return DynamicLoader.getPlatform()
  }

  /**
   * Get platform version
   */
  private getVersion(): string {
    if (typeof window !== 'undefined') {
      return window.navigator.userAgent
    }
    return 'unknown'
  }

  /**
   * Build platform capabilities
   */
  private buildCapabilities(platform: Platform): PlatformCapabilities {
    const defaults = this.getDefaults()
    const platformDefaults = (defaults as any)[platform] || {}

    return {
      pushNotifications: false,
      localNotifications: false,
      inAppNotifications: false,
      notificationChannels: false,
      notificationActions: false,
      notificationBadging: false,
      notificationSound: false,
      notificationVibration: false,
      notificationLights: false,
      notificationGrouping: false,
      notificationImportance: false,
      notificationVisibility: false,
      notificationLockScreen: false,
      notificationFullScreen: false,
      notificationHeadsUp: false,
      notificationOngoing: false,
      notificationProgress: false,
      notificationBigText: false,
      notificationBigPicture: false,
      notificationInbox: false,
      notificationMedia: false,
      notificationCustom: false,
      notificationScheduling: false,
      notificationGeofencing: false,
      notificationTriggers: false,
      serviceWorker: false,
      webPushProtocol: false,
      backgroundSync: false,
      foregroundService: false,
      criticalAlerts: false,
      provisionalAuth: false,
      appBadge: false,
      quietHours: false,
      doNotDisturb: false,
      ...platformDefaults,
    }
  }

  /**
   * Get supported features for platform
   */
  private getSupportedFeatures(platform: Platform): string[] {
    const capabilities = this.buildCapabilities(platform)
    return Object.entries(capabilities)
      .filter(([, supported]) => supported)
      .map(([feature]) => feature)
  }

  /**
   * Get platform limitations
   */
  private getLimitations(platform: Platform): string[] {
    const limitations: string[] = []

    switch (platform) {
      case 'web':
        limitations.push('No local notifications')
        limitations.push('No notification channels')
        limitations.push('No app badging')
        limitations.push('Requires HTTPS for push notifications')
        limitations.push('Service worker required')
        break
      case 'ios':
        limitations.push('No notification channels')
        limitations.push('No notification lights')
        limitations.push('Critical alerts require entitlement')
        limitations.push('Limited customization')
        break
      case 'android':
        limitations.push('Notification channels required (API 26+)')
        limitations.push('Background restrictions')
        limitations.push('Battery optimization affects delivery')
        break
      case 'electron':
        limitations.push('Platform-specific implementation')
        limitations.push('Limited mobile features')
        break
    }

    return limitations
  }

  /**
   * Get platform warnings
   */
  private getWarnings(platform: Platform): string[] {
    const warnings: string[] = []

    switch (platform) {
      case 'web':
        if (typeof window !== 'undefined' && !window.isSecureContext) {
          warnings.push('HTTPS required for push notifications')
        }
        if (
          typeof navigator !== 'undefined' &&
          !('serviceWorker' in navigator)
        ) {
          warnings.push('Service Worker not supported')
        }
        break
      case 'ios':
        warnings.push('iOS notification permissions are sensitive')
        warnings.push('Users may have notifications disabled globally')
        break
      case 'android':
        warnings.push('Android notification behavior varies by OEM')
        warnings.push('Users may have battery optimization enabled')
        break
    }

    return warnings
  }
}

/**
 * Global platform manager instance
 */
export const platformManager = new PlatformManager()

/**
 * Convenience functions
 */
export const platform = {
  detect: () => platformManager.detect(),
  getCapabilities: (platform?: Platform) =>
    platformManager.getCapabilities(platform),
  isSupported: (feature: keyof PlatformCapabilities, platform?: Platform) =>
    platformManager.isSupported(feature, platform),
  getDefaults: () => platformManager.getDefaults(),
  getCompatibility: () => platformManager.getCompatibility(),
}
