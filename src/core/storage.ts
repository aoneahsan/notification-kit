import { Capacitor } from '@capacitor/core'
import type { Platform, StorageConfig } from '@/types'

/**
 * Storage manager for notification data
 */
export class StorageManager {
  private platform: Platform
  private config: StorageConfig
  private prefix: string

  constructor(config: StorageConfig = {}) {
    this.platform = this.detectPlatform()
    this.config = {
      prefix: 'notification_kit_',
      adapter: 'preferences',
      encryption: false,
      ttl: 0,
      ...config
    }
    this.prefix = this.config.prefix!
  }

  /**
   * Store data
   */
  async set(key: string, value: any): Promise<void> {
    const fullKey = this.prefix + key
    const data = this.prepareData(value)

    try {
      if (this.platform === 'web' || this.config.adapter === 'localStorage') {
        await this.setWebStorage(fullKey, data)
      } else {
        await this.setNativeStorage(fullKey, data)
      }
    } catch (error) {
      console.error('Storage set failed:', error)
      throw error
    }
  }

  /**
   * Get data
   */
  async get<T = any>(key: string): Promise<T | null> {
    const fullKey = this.prefix + key

    try {
      let data: string | null
      
      if (this.platform === 'web' || this.config.adapter === 'localStorage') {
        data = await this.getWebStorage(fullKey)
      } else {
        data = await this.getNativeStorage(fullKey)
      }

      if (!data) {
        return null
      }

      return this.parseData<T>(data)
    } catch (error) {
      console.error('Storage get failed:', error)
      return null
    }
  }

  /**
   * Remove data
   */
  async remove(key: string): Promise<void> {
    const fullKey = this.prefix + key

    try {
      if (this.platform === 'web' || this.config.adapter === 'localStorage') {
        await this.removeWebStorage(fullKey)
      } else {
        await this.removeNativeStorage(fullKey)
      }
    } catch (error) {
      console.error('Storage remove failed:', error)
      throw error
    }
  }

  /**
   * Clear all data
   */
  async clear(): Promise<void> {
    try {
      if (this.platform === 'web' || this.config.adapter === 'localStorage') {
        await this.clearWebStorage()
      } else {
        await this.clearNativeStorage()
      }
    } catch (error) {
      console.error('Storage clear failed:', error)
      throw error
    }
  }

  /**
   * Get all keys
   */
  async keys(): Promise<string[]> {
    try {
      if (this.platform === 'web' || this.config.adapter === 'localStorage') {
        return await this.getWebStorageKeys()
      } else {
        return await this.getNativeStorageKeys()
      }
    } catch (error) {
      console.error('Storage keys failed:', error)
      return []
    }
  }

  /**
   * Check if key exists
   */
  async has(key: string): Promise<boolean> {
    const value = await this.get(key)
    return value !== null
  }

  /**
   * Get storage size
   */
  async size(): Promise<number> {
    const keys = await this.keys()
    return keys.length
  }

  /**
   * Set web storage
   */
  private async setWebStorage(key: string, data: string): Promise<void> {
    if (this.config.adapter === 'sessionStorage') {
      sessionStorage.setItem(key, data)
    } else {
      localStorage.setItem(key, data)
    }
  }

  /**
   * Get web storage
   */
  private async getWebStorage(key: string): Promise<string | null> {
    if (this.config.adapter === 'sessionStorage') {
      return sessionStorage.getItem(key)
    } else {
      return localStorage.getItem(key)
    }
  }

  /**
   * Remove web storage
   */
  private async removeWebStorage(key: string): Promise<void> {
    if (this.config.adapter === 'sessionStorage') {
      sessionStorage.removeItem(key)
    } else {
      localStorage.removeItem(key)
    }
  }

  /**
   * Clear web storage
   */
  private async clearWebStorage(): Promise<void> {
    const keys = await this.getWebStorageKeys()
    for (const key of keys) {
      await this.removeWebStorage(key)
    }
  }

  /**
   * Get web storage keys
   */
  private async getWebStorageKeys(): Promise<string[]> {
    const storage = this.config.adapter === 'sessionStorage' ? sessionStorage : localStorage
    const keys: string[] = []
    
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.substring(this.prefix.length))
      }
    }
    
    return keys
  }

  /**
   * Set native storage
   */
  private async setNativeStorage(key: string, data: string): Promise<void> {
    const { Preferences } = await import('@capacitor/preferences')
    await Preferences.set({ key, value: data })
  }

  /**
   * Get native storage
   */
  private async getNativeStorage(key: string): Promise<string | null> {
    const { Preferences } = await import('@capacitor/preferences')
    const result = await Preferences.get({ key })
    return result.value
  }

  /**
   * Remove native storage
   */
  private async removeNativeStorage(key: string): Promise<void> {
    const { Preferences } = await import('@capacitor/preferences')
    await Preferences.remove({ key })
  }

  /**
   * Clear native storage
   */
  private async clearNativeStorage(): Promise<void> {
    const { Preferences } = await import('@capacitor/preferences')
    const keys = await this.getNativeStorageKeys()
    
    for (const key of keys) {
      await Preferences.remove({ key: this.prefix + key })
    }
  }

  /**
   * Get native storage keys
   */
  private async getNativeStorageKeys(): Promise<string[]> {
    const { Preferences } = await import('@capacitor/preferences')
    const result = await Preferences.keys()
    
    return result.keys
      .filter(key => key.startsWith(this.prefix))
      .map(key => key.substring(this.prefix.length))
  }

  /**
   * Prepare data for storage
   */
  private prepareData(value: any): string {
    const data = {
      value,
      timestamp: Date.now(),
      ttl: this.config.ttl
    }

    let serialized = JSON.stringify(data)

    if (this.config.encryption) {
      serialized = this.encrypt(serialized)
    }

    return serialized
  }

  /**
   * Parse data from storage
   */
  private parseData<T>(data: string): T | null {
    try {
      let decrypted = data

      if (this.config.encryption) {
        decrypted = this.decrypt(data)
      }

      const parsed = JSON.parse(decrypted)
      
      // Check TTL
      if (this.config.ttl && this.config.ttl > 0) {
        const now = Date.now()
        const age = now - parsed.timestamp
        
        if (age > this.config.ttl) {
          return null
        }
      }

      return parsed.value
    } catch (error) {
      console.error('Data parsing failed:', error)
      return null
    }
  }

  /**
   * Encrypt data (basic implementation)
   */
  private encrypt(data: string): string {
    // TODO: Implement proper encryption
    return btoa(data)
  }

  /**
   * Decrypt data (basic implementation)
   */
  private decrypt(data: string): string {
    // TODO: Implement proper decryption
    return atob(data)
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
 * Default storage instance
 */
export const storage = new StorageManager()

/**
 * Create storage instance with custom config
 */
export const createStorage = (config: StorageConfig) => new StorageManager(config)