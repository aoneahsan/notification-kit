import { Capacitor } from '@capacitor/core'
import type {
  Platform,
  PlatformCapabilities,
  PlatformDetection,
  PlatformDefaults,
  PlatformCompatibility,
} from '@/types'

/**
 * Platform detection and capability management
 */
export class PlatformManager {
  private detection: PlatformDetection | null = null
  private capabilities: PlatformCapabilities | null = null

  /**
   * Detect current platform
   */
  detect(): PlatformDetection {
    if (this.detection) {
      return this.detection
    }

    const platform = this.getPlatform()
    const isCapacitor = Capacitor.isNativePlatform()
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
  getCapabilities(platform?: Platform): PlatformCapabilities {
    const targetPlatform = platform || this.getPlatform()

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
  isSupported(
    feature: keyof PlatformCapabilities,
    platform?: Platform
  ): boolean {
    const capabilities = this.getCapabilities(platform)
    return capabilities[feature] || false
  }

  /**
   * Get platform defaults
   */
  getDefaults(): PlatformDefaults {
    return {
      web: {
        pushNotifications: true,
        localNotifications: false,
        inAppNotifications: true,
        notificationChannels: false,
        notificationActions: true,
        notificationBadging: false,
        notificationSound: true,
        notificationVibration: false,
        serviceWorker: true,
        webPushProtocol: true,
        backgroundSync: true,
      },
      ios: {
        pushNotifications: true,
        localNotifications: true,
        inAppNotifications: true,
        notificationChannels: false,
        notificationActions: true,
        notificationBadging: true,
        notificationSound: true,
        notificationVibration: true,
        criticalAlerts: true,
        provisionalAuth: true,
        appBadge: true,
      },
      android: {
        pushNotifications: true,
        localNotifications: true,
        inAppNotifications: true,
        notificationChannels: true,
        notificationActions: true,
        notificationBadging: true,
        notificationSound: true,
        notificationVibration: true,
        notificationLights: true,
        notificationGrouping: true,
        notificationImportance: true,
        notificationVisibility: true,
        foregroundService: true,
      },
      electron: {
        pushNotifications: true,
        localNotifications: true,
        inAppNotifications: true,
        notificationActions: true,
        notificationBadging: true,
        notificationSound: true,
      },
      unknown: {
        pushNotifications: false,
        localNotifications: false,
        inAppNotifications: false,
        notificationChannels: false,
        notificationActions: false,
        notificationBadging: false,
        notificationSound: false,
        notificationVibration: false,
      },
    }
  }

  /**
   * Get platform compatibility matrix
   */
  getCompatibility(): PlatformCompatibility {
    return {
      pushNotifications: {
        web: true,
        ios: true,
        android: true,
        electron: true,
        notes: 'Requires service worker on web',
      },
      localNotifications: {
        web: false,
        ios: true,
        android: true,
        electron: true,
        notes: 'Not supported in browsers',
      },
      inAppNotifications: {
        web: true,
        ios: true,
        android: true,
        electron: true,
        notes: 'Custom implementation across platforms',
      },
      notificationChannels: {
        web: false,
        ios: false,
        android: true,
        electron: false,
        notes: 'Android 8.0+ only',
      },
      notificationActions: {
        web: true,
        ios: true,
        android: true,
        electron: true,
        notes: 'Limited on some platforms',
      },
      notificationBadging: {
        web: false,
        ios: true,
        android: true,
        electron: true,
        notes: 'iOS and Android native support',
      },
      criticalAlerts: {
        web: false,
        ios: true,
        android: false,
        electron: false,
        notes: 'iOS only with special entitlement',
      },
      provisionalAuth: {
        web: false,
        ios: true,
        android: false,
        electron: false,
        notes: 'iOS 12+ quiet notifications',
      },
      backgroundSync: {
        web: true,
        ios: true,
        android: true,
        electron: true,
        notes: 'Service worker required on web',
      },
      quietHours: {
        web: false,
        ios: true,
        android: true,
        electron: false,
        notes: 'System-level feature',
      },
      doNotDisturb: {
        web: false,
        ios: true,
        android: true,
        electron: false,
        notes: 'Respects system settings',
      },
    }
  }

  /**
   * Get current platform
   */
  private getPlatform(): Platform {
    if (Capacitor.isNativePlatform()) {
      return Capacitor.getPlatform() as Platform
    } else if (typeof window !== 'undefined') {
      if (window.navigator.userAgent.includes('Electron')) {
        return 'electron'
      }
      return 'web'
    } else {
      return 'unknown'
    }
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
    const platformDefaults = defaults[platform] || {}

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
