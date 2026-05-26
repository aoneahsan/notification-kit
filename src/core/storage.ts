import { DynamicLoader } from '@/utils/dynamic-loader'
import { Logger } from '@/utils/logger'
import type { Platform, StorageConfig } from '@/types'

/**
 * Storage manager for notification data
 */
export class StorageManager {
  private platform: Platform
  private config: StorageConfig
  private prefix: string

  constructor(config: StorageConfig = {}) {
    this.platform = 'unknown' // Will be detected on first use
    this.config = {
      prefix: 'notification_kit_',
      adapter: 'preferences',
      encryption: false,
      ttl: 0,
      ...config,
    }
    this.prefix = this.config.prefix!
  }

  /**
   * Store data
   */
  async set(key: string, value: any): Promise<void> {
    await this.ensurePlatform()
    const fullKey = this.prefix + key
    const data = this.prepareData(value)

    try {
      if (this.platform === 'web' || this.config.adapter === 'localStorage') {
        await this.setWebStorage(fullKey, data)
      } else {
        await this.setNativeStorage(fullKey, data)
      }
    } catch (error) {
      // Storage set failed
      throw error
    }
  }

  /**
   * Get data
   */
  async get<T = any>(key: string): Promise<T | null> {
    await this.ensurePlatform()
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
      Logger.debug('notification-kit: storage get failed', error)
      return null
    }
  }

  /**
   * Remove data
   */
  async remove(key: string): Promise<void> {
    await this.ensurePlatform()
    const fullKey = this.prefix + key

    try {
      if (this.platform === 'web' || this.config.adapter === 'localStorage') {
        await this.removeWebStorage(fullKey)
      } else {
        await this.removeNativeStorage(fullKey)
      }
    } catch (error) {
      // Storage remove failed
      throw error
    }
  }

  /**
   * Clear all data
   */
  async clear(): Promise<void> {
    await this.ensurePlatform()
    try {
      if (this.platform === 'web' || this.config.adapter === 'localStorage') {
        await this.clearWebStorage()
      } else {
        await this.clearNativeStorage()
      }
    } catch (error) {
      // Storage clear failed
      throw error
    }
  }

  /**
   * Get all keys
   */
  async keys(): Promise<string[]> {
    await this.ensurePlatform()
    try {
      if (this.platform === 'web' || this.config.adapter === 'localStorage') {
        return await this.getWebStorageKeys()
      } else {
        return await this.getNativeStorageKeys()
      }
    } catch (error) {
      Logger.debug('notification-kit: storage keys lookup failed', error)
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
    // getWebStorageKeys() returns keys with the prefix already stripped, so the
    // prefix must be re-added before removal (otherwise clear() is a no-op).
    const keys = await this.getWebStorageKeys()
    for (const key of keys) {
      await this.removeWebStorage(this.prefix + key)
    }
  }

  /**
   * Get web storage keys
   */
  private async getWebStorageKeys(): Promise<string[]> {
    const storage =
      this.config.adapter === 'sessionStorage' ? sessionStorage : localStorage
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
    const preferencesModule = await DynamicLoader.loadPreferences()
    if (!preferencesModule) {
      // Fallback to web storage if Preferences not available
      return this.setWebStorage(key, data)
    }
    await preferencesModule.Preferences.set({ key, value: data })
  }

  /**
   * Get native storage
   */
  private async getNativeStorage(key: string): Promise<string | null> {
    const preferencesModule = await DynamicLoader.loadPreferences()
    if (!preferencesModule) {
      // Fallback to web storage if Preferences not available
      return this.getWebStorage(key)
    }
    const result = await preferencesModule.Preferences.get({ key })
    return result.value
  }

  /**
   * Remove native storage
   */
  private async removeNativeStorage(key: string): Promise<void> {
    const preferencesModule = await DynamicLoader.loadPreferences()
    if (!preferencesModule) {
      // Fallback to web storage if Preferences not available
      return this.removeWebStorage(key)
    }
    await preferencesModule.Preferences.remove({ key })
  }

  /**
   * Clear native storage
   */
  private async clearNativeStorage(): Promise<void> {
    const preferencesModule = await DynamicLoader.loadPreferences()
    if (!preferencesModule) {
      // Fallback to web storage if Preferences not available
      return this.clearWebStorage()
    }
    const keys = await this.getNativeStorageKeys()

    for (const key of keys) {
      await preferencesModule.Preferences.remove({ key: this.prefix + key })
    }
  }

  /**
   * Get native storage keys
   */
  private async getNativeStorageKeys(): Promise<string[]> {
    const preferencesModule = await DynamicLoader.loadPreferences()
    if (!preferencesModule) {
      // Fallback to web storage if Preferences not available
      return this.getWebStorageKeys()
    }
    const result = await preferencesModule.Preferences.keys()

    return result.keys
      .filter((key: any) => key.startsWith(this.prefix))
      .map((key: any) => key.substring(this.prefix.length))
  }

  /**
   * Prepare data for storage
   */
  private prepareData(value: any): string {
    const data = {
      value,
      timestamp: Date.now(),
      ttl: this.config.ttl,
    }

    let serialized = JSON.stringify(data)

    if (this.config.encryption) {
      serialized = this.obfuscate(serialized)
    }

    return serialized
  }

  /**
   * Parse data from storage
   */
  private parseData<T>(data: string): T | null {
    try {
      let decoded = data

      if (this.config.encryption) {
        decoded = this.deobfuscate(data)
      }

      const parsed = JSON.parse(decoded)

      // Honor the TTL that was stored WITH the record, not the current config —
      // otherwise changing config.ttl later would retroactively expire/extend
      // already-written records.
      const recordTtl = typeof parsed.ttl === 'number' ? parsed.ttl : 0
      if (recordTtl > 0) {
        const age = Date.now() - parsed.timestamp
        if (age > recordTtl) {
          return null
        }
      }

      return parsed.value
    } catch (error) {
      Logger.debug('notification-kit: failed to parse stored data', error)
      return null
    }
  }

  /**
   * Lightweight, Unicode-safe base64 OBFUSCATION (NOT encryption).
   *
   * ⚠️ This only base64-encodes the payload to keep it from being trivially
   * human-readable in storage. It is reversible by anyone and provides NO
   * confidentiality — never store secrets/credentials here. (The previous
   * implementation used bare `btoa`, which throws on non-Latin1 characters and
   * caused silent data loss for any value containing emoji/non-ASCII text.)
   * For real protection, encrypt at the application layer before storing.
   */
  private obfuscate(data: string): string {
    const bytes = new TextEncoder().encode(data)
    let binary = ''
    for (const byte of bytes) {
      binary += String.fromCharCode(byte)
    }
    return btoa(binary)
  }

  /**
   * Reverse of {@link obfuscate} — Unicode-safe base64 decode.
   */
  private deobfuscate(data: string): string {
    const binary = atob(data)
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  }

  /**
   * Ensure platform is detected
   */
  private async ensurePlatform(): Promise<void> {
    if (this.platform === 'unknown') {
      this.platform = await DynamicLoader.getPlatform()
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
export const createStorage = (config: StorageConfig) =>
  new StorageManager(config)
