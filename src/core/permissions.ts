import { Capacitor } from '@capacitor/core'
import type { PermissionStatus, Platform } from '@/types'

/**
 * Permission management utilities
 */
export class PermissionManager {
  private platform: Platform

  constructor() {
    this.platform = this.detectPlatform()
  }

  /**
   * Request notification permissions
   */
  async requestPermission(): Promise<boolean> {
    try {
      if (this.platform === 'web') {
        return await this.requestWebPermission()
      } else {
        return await this.requestNativePermission()
      }
    } catch (error) {
      console.error('Permission request failed:', error)
      return false
    }
  }

  /**
   * Check current permission status
   */
  async checkPermission(): Promise<PermissionStatus> {
    try {
      if (this.platform === 'web') {
        return await this.checkWebPermission()
      } else {
        return await this.checkNativePermission()
      }
    } catch (error) {
      console.error('Permission check failed:', error)
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
   * Open system settings for notifications
   */
  async openSettings(): Promise<void> {
    if (this.platform === 'web') {
      // Can't open settings from web
      throw new Error('Cannot open settings from web platform')
    }

    try {
      // TODO: Add native settings support when package is available
      // const { NativeSettings } = await import('@capacitor-community/native-settings')
      // await NativeSettings.open({
      //   optionAndroid: 'APPLICATION_DETAILS_SETTINGS',
      //   optionIOS: 'App-Prefs:NOTIFICATIONS_ID'
      // })
      console.warn('Native settings functionality not yet implemented')
    } catch (error) {
      console.error('Failed to open settings:', error)
      throw error
    }
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
      const { PushNotifications } = await import(
        '@capacitor/push-notifications'
      )
      const result = await PushNotifications.requestPermissions()
      return result.receive === 'granted'
    } catch (error) {
      console.error('Native permission request failed:', error)
      return false
    }
  }

  /**
   * Check native notification permission
   */
  private async checkNativePermission(): Promise<PermissionStatus> {
    try {
      const { PushNotifications } = await import(
        '@capacitor/push-notifications'
      )
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
      console.error('Native permission check failed:', error)
      return 'denied'
    }
  }

  /**
   * Detect current platform
   */
  private detectPlatform(): Platform {
    if (Capacitor.isNativePlatform()) {
      return Capacitor.getPlatform() as Platform
    } else if (typeof window !== 'undefined') {
      return 'web'
    } else {
      return 'unknown'
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
