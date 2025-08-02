import type { Platform } from '@/types'
import { Logger } from '@/utils/logger'

/**
 * Dynamic dependency loader with runtime checks
 */
export class DynamicLoader {
  private static loadedModules = new Map<string, any>()
  private static loadingPromises = new Map<string, Promise<any>>()

  /**
   * Check if Capacitor is available
   */
  static isCapacitorAvailable(): boolean {
    try {
      return typeof window !== 'undefined' && 'Capacitor' in window
    } catch {
      return false
    }
  }

  /**
   * Load Capacitor Core dynamically
   */
  static async loadCapacitorCore(): Promise<typeof import('@capacitor/core') | null> {
    const cacheKey = '@capacitor/core'
    
    if (this.loadedModules.has(cacheKey)) {
      return this.loadedModules.get(cacheKey)
    }

    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)
    }

    const loadPromise = (async () => {
      try {
        if (!this.isCapacitorAvailable()) {
          return null
        }
        const module = await import('@capacitor/core')
        this.loadedModules.set(cacheKey, module)
        return module
      } catch (error) {
        Logger.warn('Capacitor Core not available. Some features may be limited.')
        return null
      }
    })()

    this.loadingPromises.set(cacheKey, loadPromise)
    return loadPromise
  }

  /**
   * Load Capacitor Push Notifications
   */
  static async loadPushNotifications(): Promise<typeof import('@capacitor/push-notifications') | null> {
    const cacheKey = '@capacitor/push-notifications'
    
    if (this.loadedModules.has(cacheKey)) {
      return this.loadedModules.get(cacheKey)
    }

    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)
    }

    const loadPromise = (async () => {
      try {
        const module = await import('@capacitor/push-notifications')
        this.loadedModules.set(cacheKey, module)
        return module
      } catch (error) {
        throw new Error(
          'Push notifications require @capacitor/push-notifications. ' +
          'Please install it: yarn add @capacitor/push-notifications'
        )
      }
    })()

    this.loadingPromises.set(cacheKey, loadPromise)
    return loadPromise
  }

  /**
   * Load Capacitor Local Notifications
   */
  static async loadLocalNotifications(): Promise<typeof import('@capacitor/local-notifications') | null> {
    const cacheKey = '@capacitor/local-notifications'
    
    if (this.loadedModules.has(cacheKey)) {
      return this.loadedModules.get(cacheKey)
    }

    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)
    }

    const loadPromise = (async () => {
      try {
        const module = await import('@capacitor/local-notifications')
        this.loadedModules.set(cacheKey, module)
        return module
      } catch (error) {
        throw new Error(
          'Local notifications require @capacitor/local-notifications. ' +
          'Please install it: yarn add @capacitor/local-notifications'
        )
      }
    })()

    this.loadingPromises.set(cacheKey, loadPromise)
    return loadPromise
  }

  /**
   * Load Capacitor Preferences
   */
  static async loadPreferences(): Promise<typeof import('@capacitor/preferences') | null> {
    const cacheKey = '@capacitor/preferences'
    
    if (this.loadedModules.has(cacheKey)) {
      return this.loadedModules.get(cacheKey)
    }

    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)
    }

    const loadPromise = (async () => {
      try {
        const module = await import('@capacitor/preferences')
        this.loadedModules.set(cacheKey, module)
        return module
      } catch (error) {
        // Preferences are optional, fallback to localStorage
        return null
      }
    })()

    this.loadingPromises.set(cacheKey, loadPromise)
    return loadPromise
  }

  /**
   * Load Firebase
   */
  static async loadFirebase(): Promise<typeof import('firebase/app') | null> {
    const cacheKey = 'firebase/app'
    
    if (this.loadedModules.has(cacheKey)) {
      return this.loadedModules.get(cacheKey)
    }

    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)
    }

    const loadPromise = (async () => {
      try {
        const module = await import('firebase/app')
        this.loadedModules.set(cacheKey, module)
        return module
      } catch (error) {
        throw new Error(
          'Firebase provider requires firebase. ' +
          'Please install it: yarn add firebase'
        )
      }
    })()

    this.loadingPromises.set(cacheKey, loadPromise)
    return loadPromise
  }

  /**
   * Load Firebase Messaging
   */
  static async loadFirebaseMessaging(): Promise<typeof import('firebase/messaging') | null> {
    const cacheKey = 'firebase/messaging'
    
    if (this.loadedModules.has(cacheKey)) {
      return this.loadedModules.get(cacheKey)
    }

    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)
    }

    const loadPromise = (async () => {
      try {
        const module = await import('firebase/messaging')
        this.loadedModules.set(cacheKey, module)
        return module
      } catch (error) {
        throw new Error(
          'Firebase messaging requires firebase. ' +
          'Please install it: yarn add firebase'
        )
      }
    })()

    this.loadingPromises.set(cacheKey, loadPromise)
    return loadPromise
  }

  /**
   * Load OneSignal
   */
  static async loadOneSignal(): Promise<typeof import('react-onesignal') | null> {
    const cacheKey = 'react-onesignal'
    
    if (this.loadedModules.has(cacheKey)) {
      return this.loadedModules.get(cacheKey)
    }

    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)
    }

    const loadPromise = (async () => {
      try {
        const module = await import('react-onesignal')
        this.loadedModules.set(cacheKey, module)
        return module
      } catch (error) {
        throw new Error(
          'OneSignal provider requires react-onesignal. ' +
          'Please install it: yarn add react-onesignal'
        )
      }
    })()

    this.loadingPromises.set(cacheKey, loadPromise)
    return loadPromise
  }

  /**
   * Get current platform without Capacitor
   */
  static async getPlatform(): Promise<Platform> {
    const capacitor = await this.loadCapacitorCore()
    
    if (capacitor && capacitor.Capacitor.isNativePlatform()) {
      return capacitor.Capacitor.getPlatform() as Platform
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
   * Check if platform is native
   */
  static async isNativePlatform(): Promise<boolean> {
    const capacitor = await this.loadCapacitorCore()
    return capacitor ? capacitor.Capacitor.isNativePlatform() : false
  }

  /**
   * Clear module cache
   */
  static clearCache(): void {
    this.loadedModules.clear()
    this.loadingPromises.clear()
  }
}