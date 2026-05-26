import type { PermissionStatus, Platform } from '@/types'
import { DynamicLoader } from '@/utils/dynamic-loader'

/**
 * Permission management utilities
 */
export class PermissionManager {
  private platform: Platform

  constructor() {
    this.platform = 'unknown' // Will be detected on first use
  }

  /**
   * Request notification permissions
   */
  async requestPermission(): Promise<boolean> {
    try {
      await this.ensurePlatform()
      if (this.platform === 'web') {
        return await this.requestWebPermission()
      } else {
        return await this.requestNativePermission()
      }
    } catch (error) {
      // Permission request failed, return false
      return false
    }
  }

  /**
   * Check current permission status
   */
  async checkPermission(): Promise<PermissionStatus> {
    try {
      await this.ensurePlatform()
      if (this.platform === 'web') {
        return await this.checkWebPermission()
      } else {
        return await this.checkNativePermission()
      }
    } catch (error) {
      // Permission check failed, assume denied
      return 'denied'
    }
  }

  /**
   * Check if permission is granted
   */
  async isPermissionGranted(): Promise<boolean> {
    const status = await this.checkPermission()
    return status === 'granted'
  }

  /**
   * Check if permission can be requested
   */
  async canRequestPermission(): Promise<boolean> {
    const status = await this.checkPermission()
    return status === 'prompt' || status === 'default'
  }

  /**
   * Open the system notification settings.
   *
   * This is intentionally NOT implemented internally: doing so requires a native
   * plugin, which would break the zero-dependency guarantee. Rather than
   * silently resolving (and misleading callers into thinking settings opened),
   * it throws a descriptive error. Open settings from your app using a plugin
   * such as `@capacitor-community/native-settings`:
   *
   * ```ts
   * import { NativeSettings, AndroidSettings, IOSSettings } from '@capacitor-community/native-settings'
   * await NativeSettings.open({ optionAndroid: AndroidSettings.AppNotification, optionIOS: IOSSettings.App })
   * ```
   */
  async openSettings(): Promise<void> {
    await this.ensurePlatform()
    if (this.platform === 'web') {
      throw new Error(
        'notification-kit: cannot open system settings from the web. Direct users ' +
          'to their browser/site notification settings instead.'
      )
    }
    throw new Error(
      'notification-kit: openSettings() is not implemented internally to preserve the ' +
        "zero-dependency design. Open the OS settings from your app using a native " +
        "plugin (e.g. '@capacitor-community/native-settings')."
    )
  }

  /**
   * Request web notification permission
   */
  private async requestWebPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported in this browser')
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission === 'denied') {
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  /**
   * Check web notification permission
   */
  private async checkWebPermission(): Promise<PermissionStatus> {
    if (!('Notification' in window)) {
      return 'denied'
    }

    const permission = Notification.permission

    // Map web permission values to our PermissionStatus type
    if (permission === 'default') {
      return 'prompt'
    }
    return permission as PermissionStatus
  }

  /**
   * Request native notification permission
   */
  private async requestNativePermission(): Promise<boolean> {
    try {
      const pushNotificationsModule = await DynamicLoader.loadPushNotifications()
      if (!pushNotificationsModule) {
        throw new Error('Push notifications are not available on this platform')
      }
      const { PushNotifications } = pushNotificationsModule
      const result = await PushNotifications.requestPermissions()
      return result.receive === 'granted'
    } catch (error) {
      // Native permission request failed
      return false
    }
  }

  /**
   * Check native notification permission
   */
  private async checkNativePermission(): Promise<PermissionStatus> {
    try {
      const pushNotificationsModule = await DynamicLoader.loadPushNotifications()
      if (!pushNotificationsModule) {
        throw new Error('Push notifications are not available on this platform')
      }
      const { PushNotifications } = pushNotificationsModule
      const result = await PushNotifications.checkPermissions()

      // Map Capacitor permission values to our PermissionStatus type
      if (result.receive === 'granted') {
        return 'granted'
      } else if (result.receive === 'denied') {
        return 'denied'
      } else if (result.receive === 'prompt') {
        return 'prompt'
      } else {
        return 'unknown'
      }
    } catch (error) {
      // Native permission check failed
      return 'denied'
    }
  }

  /**
   * Detect current platform
   */
  private async detectPlatform(): Promise<Platform> {
    return DynamicLoader.getPlatform()
  }
  
  /**
   * Ensure platform is detected
   */
  private async ensurePlatform(): Promise<void> {
    if (this.platform === 'unknown') {
      this.platform = await this.detectPlatform()
    }
  }
}

/**
 * Global permission manager instance
 */
export const permissionManager = new PermissionManager()

/**
 * Convenience functions
 */
export const permissions = {
  request: () => permissionManager.requestPermission(),
  check: () => permissionManager.checkPermission(),
  isGranted: () => permissionManager.isPermissionGranted(),
  canRequest: () => permissionManager.canRequestPermission(),
  openSettings: () => permissionManager.openSettings(),
}
