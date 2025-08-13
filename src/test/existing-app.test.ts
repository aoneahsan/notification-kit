import { describe, it, expect, vi } from 'vitest'
import { NotificationKit, notifications, quickStart } from '../index'
import type { FirebaseApp } from 'firebase/app'

describe('Existing App Instance Support', () => {
  describe('Firebase Provider', () => {
    it('should accept existing Firebase app instance', async () => {
      // Mock existing Firebase app
      const mockFirebaseApp = {
        name: 'test-app',
        options: {
          apiKey: 'test-key',
          authDomain: 'test.firebaseapp.com',
          projectId: 'test-project',
        },
      } as FirebaseApp

      // Initialize with existing app
      const kit = NotificationKit.getInstance()
      
      // This should work with the existing app
      await expect(
        kit.init({
          provider: 'firebase',
          config: {
            app: mockFirebaseApp,
            vapidKey: 'test-vapid-key',
          },
        })
      ).resolves.not.toThrow()
    })

    it('should accept Firebase config for new app creation', async () => {
      const kit = NotificationKit.getInstance()
      
      // This should work with config for new app
      await expect(
        kit.init({
          provider: 'firebase',
          config: {
            apiKey: 'test-key',
            authDomain: 'test.firebaseapp.com',
            projectId: 'test-project',
            storageBucket: 'test-bucket',
            messagingSenderId: '123456',
            appId: 'test-app-id',
            vapidKey: 'test-vapid-key',
          },
        })
      ).resolves.not.toThrow()
    })

    it('should work with quickStart helper for existing app', async () => {
      const mockFirebaseApp = {
        name: 'test-app',
        options: {
          apiKey: 'test-key',
          authDomain: 'test.firebaseapp.com',
          projectId: 'test-project',
        },
      } as FirebaseApp

      await expect(
        quickStart.initFirebaseWithApp(mockFirebaseApp, 'test-vapid-key')
      ).resolves.not.toThrow()
    })
  })

  describe('OneSignal Provider', () => {
    it('should accept existing OneSignal instance', async () => {
      // Mock existing OneSignal instance
      const mockOneSignalInstance = {
        appId: 'test-app-id',
        initialized: true,
        getExternalUserId: vi.fn(),
        setExternalUserId: vi.fn(),
      }

      const kit = NotificationKit.getInstance()
      
      // This should work with the existing instance
      await expect(
        kit.init({
          provider: 'onesignal',
          config: {
            instance: mockOneSignalInstance,
          },
        })
      ).resolves.not.toThrow()
    })

    it('should accept OneSignal config for new initialization', async () => {
      const kit = NotificationKit.getInstance()
      
      // This should work with config for new initialization
      await expect(
        kit.init({
          provider: 'onesignal',
          config: {
            appId: 'test-app-id',
            safariWebId: 'test-safari-id',
          },
        })
      ).resolves.not.toThrow()
    })

    it('should work with quickStart helper for existing instance', async () => {
      const mockOneSignalInstance = {
        appId: 'test-app-id',
        initialized: true,
        getExternalUserId: vi.fn(),
        setExternalUserId: vi.fn(),
      }

      await expect(
        quickStart.initOneSignalWithInstance(mockOneSignalInstance)
      ).resolves.not.toThrow()
    })
  })

  describe('Type Guards', () => {
    it('should correctly identify Firebase app config', async () => {
      const { isFirebaseAppConfig } = await import('../types')
      
      const appConfig = {
        app: {} as FirebaseApp,
        vapidKey: 'test-key',
      }
      
      const normalConfig = {
        apiKey: 'test',
        authDomain: 'test',
        projectId: 'test',
        storageBucket: 'test',
        messagingSenderId: 'test',
        appId: 'test',
      }
      
      expect(isFirebaseAppConfig(appConfig)).toBe(true)
      expect(isFirebaseAppConfig(normalConfig)).toBe(false)
    })

    it('should correctly identify OneSignal instance config', async () => {
      const { isOneSignalInstanceConfig } = await import('../types')
      
      const instanceConfig = {
        instance: {},
      }
      
      const normalConfig = {
        appId: 'test',
        safariWebId: 'test',
      }
      
      expect(isOneSignalInstanceConfig(instanceConfig)).toBe(true)
      expect(isOneSignalInstanceConfig(normalConfig)).toBe(false)
    })
  })
})