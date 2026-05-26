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
    const userAgent =
      typeof navigator !== 'undefined' ? navigator.userAgent : ''
    const isTablet = this.detectTablet(userAgent)
    // A tablet is not a desktop, even though it is "not a phone".
    const isDesktop = platform === 'electron' || (isWeb && !isMobile && !isTablet)
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
   * Best-effort platform/browser version extracted from the user agent. Returns
   * `'unknown'` when it cannot be parsed (the full string is available
   * separately as `userAgent`, so this no longer just echoes it).
   */
  private getVersion(): string {
    if (typeof navigator === 'undefined') {
      return 'unknown'
    }
    const match = /(?:Version|Chrome|Firefox|Edg|OPR|OS)[/ ]([0-9._]+)/.exec(
      navigator.userAgent
    )
    return match?.[1]?.replace(/_/g, '.') ?? 'unknown'
  }

  /**
   * Heuristically detect tablets from the user agent. Covers iPad, Android
   * tablets (Android UA without the "Mobile" token), common e-readers, and
   * iPadOS 13+ which masquerades as macOS (detected via touch points).
   */
  private detectTablet(userAgent: string): boolean {
    if (!userAgent) {
      return false
    }
    if (/\b(iPad|Tablet|PlayBook|Silk|Kindle)\b/i.test(userAgent)) {
      return true
    }
    if (/\bAndroid\b/i.test(userAgent) && !/\bMobile\b/i.test(userAgent)) {
      return true
    }
    const maxTouchPoints =
      typeof navigator !== 'undefined'
        ? ((navigator as { maxTouchPoints?: number }).maxTouchPoints ?? 0)
        : 0
    // iPadOS 13+ reports a Mac UA; a touch-capable "Mac" is really an iPad.
    return /\bMacintosh\b/i.test(userAgent) && maxTouchPoints > 1
  }

  /**
   * Build platform capabilities.
   *
   * Returns a real per-platform truth table. (Previously every flag was `false`
   * with the platform's *string* defaults spread on top, which both polluted
   * the boolean map and made `isSupported()` return false on every platform.)
   */
  private buildCapabilities(platform: Platform): PlatformCapabilities {
    const base: PlatformCapabilities = {
      pushNotifications: false,
      localNotifications: false,
      inAppNotifications: false,
      channels: false,
      actions: false,
      badges: false,
      sounds: false,
      criticalAlerts: false,
    }

    switch (platform) {
      case 'web':
        // Web push via service worker; no native channels / critical alerts.
        return {
          ...base,
          pushNotifications: true,
          inAppNotifications: true,
          actions: true,
          badges: true,
          sounds: true,
        }
      case 'ios':
        // iOS has no notification channels; critical alerts need an entitlement.
        return {
          ...base,
          pushNotifications: true,
          localNotifications: true,
          inAppNotifications: true,
          actions: true,
          badges: true,
          sounds: true,
          criticalAlerts: true,
        }
      case 'android':
        return {
          ...base,
          pushNotifications: true,
          localNotifications: true,
          inAppNotifications: true,
          channels: true,
          actions: true,
          badges: true,
          sounds: true,
        }
      case 'electron':
        return {
          ...base,
          localNotifications: true,
          inAppNotifications: true,
          actions: true,
          sounds: true,
        }
      default:
        // Unknown platform: a DOM may still be present, so only the
        // framework-agnostic in-app notifications can be assumed.
        return {
          ...base,
          inAppNotifications: true,
        }
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
