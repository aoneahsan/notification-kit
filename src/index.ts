/**
 * notification-kit - A unified notification library for React + Capacitor apps
 *
 * @description One API for push notifications, in-app notifications, and local notifications
 * across Web, iOS, and Android platforms.
 *
 * @author Ahsan Mahmood <aoneahsan@gmail.com>
 * @version 2.0.0
 * @license MIT
 */

// Main API
export { NotificationKit, notifications } from './core/NotificationKit'

// Providers
export { FirebaseProvider } from './providers/FirebaseProvider'
export { OneSignalProvider } from './providers/OneSignalProvider'

// Core utilities
export {
  PermissionManager,
  permissionManager,
  permissions,
} from './core/permissions'
export { PlatformManager, platformManager, platform } from './core/platform'
export { StorageManager, storage, createStorage } from './core/storage'

// Utility functions
export { ValidationUtils, validate } from './utils/validation'
export { FormattingUtils, format } from './utils/formatting'
export { SchedulingUtils } from './utils/scheduling'
export {
  InAppNotificationManager,
  showInAppNotification,
  dismissInAppNotification,
  dismissAllInAppNotifications,
  getActiveInAppNotifications,
  configureInAppNotifications,
  inApp,
} from './utils/inApp'

// Capacitor type conversion utilities
export {
  toCapacitorImportance,
  fromCapacitorImportance,
  toCapacitorChannel,
  fromCapacitorChannel,
  toCapacitorLocalNotification,
  fromCapacitorLocalNotification,
  toPlatformCapabilities,
} from './utils/capacitor-types'

// Types - Core
export type {
  NotificationConfig,
  NotificationProvider,
  NotificationPermissionStatus,
  Notification,
  NotificationAction,
  NotificationChannel,
  NotificationEvents,
  NotificationEventCallback,
  Platform,
  PlatformCapabilities,
  PlatformDetection,
  PlatformConfig,
  PlatformDefaults,
  PlatformCompatibility,
} from './types'

// Types - Providers
export type {
  ProviderConfig,
  FirebaseConfig,
  OneSignalConfig,
  ProviderCapabilities,
  ProviderStatistics,
  ProviderHealth,
  ProviderMetadata,
  ProviderLimits,
  ProviderEndpoints,
  ProviderAuthentication,
  ProviderWebhook,
} from './types'

// Types - Notifications
export type {
  PushNotificationPayload,
  LocalNotificationPayload,
  InAppNotificationPayload,
  ScheduleOptions,
  InAppOptions,
  NotificationSchedule,
  ScheduleAt,
  ScheduleOn,
  ScheduleEvery,
  ScheduleResult,
} from './types'

// Types - Configuration
export type {
  StyleConfig,
  AnimationConfig,
  ServiceWorkerConfig,
  StorageConfig,
  AnalyticsConfig,
  InitOptions,
  EnvironmentConfig,
  FeatureFlags,
  LocalizationConfig,
  SecurityConfig,
  BackupConfig,
} from './types'

// Types - Events
export type {
  NotificationReceivedEvent,
  NotificationActionPerformedEvent,
  NotificationSentEvent,
  NotificationScheduledEvent,
  NotificationCancelledEvent,
  NotificationChannelCreatedEvent,
  NotificationChannelDeletedEvent,
  TokenReceivedEvent,
  TokenRefreshedEvent,
  PermissionChangedEvent,
  SubscribedEvent,
  UnsubscribedEvent,
  ReadyEvent,
  ErrorEvent,
} from './types'

// Types - Permissions
export type { PermissionStatus, PermissionType } from './types'

// Types - Channels
export type {
  ChannelImportance,
  ChannelVisibility,
  ChannelLockScreenVisibility,
  ChannelSound,
  ChannelVibration,
  ChannelLights,
  ChannelGroup,
} from './types'

// Types - Utilities
export type { ValidationError, ValidationWarning } from './types'
export type { InAppNotificationInstance } from './utils/inApp'

// Import NotificationKit for default export and quick start
import { NotificationKit, notifications } from './core/NotificationKit'
import { platform } from './core/platform'

// Default export for convenience
export default NotificationKit

/**
 * Version information
 */
export const version = '2.0.0'

/**
 * Library metadata
 */
export const metadata = {
  name: 'notification-kit',
  version: '2.0.0',
  description: 'A unified notification library for React + Capacitor apps',
  author: 'Ahsan Mahmood',
  license: 'MIT',
  homepage: 'https://github.com/aoneahsan/notification-kit',
  repository: 'https://github.com/aoneahsan/notification-kit.git',
  bugs: 'https://github.com/aoneahsan/notification-kit/issues',
  keywords: [
    'capacitor',
    'react',
    'notifications',
    'push-notifications',
    'local-notifications',
    'in-app-notifications',
    'firebase',
    'onesignal',
    'typescript',
    'mobile',
    'ios',
    'android',
    'web',
  ],
  platforms: ['web', 'ios', 'android', 'electron'],
  frameworks: ['react', 'capacitor'],
  providers: ['firebase', 'onesignal'],
}

/**
 * Quick start helper
 */
export const quickStart = {
  /**
   * Initialize with Firebase
   */
  initFirebase: async (config: {
    apiKey: string
    authDomain: string
    projectId: string
    storageBucket: string
    messagingSenderId: string
    appId: string
    measurementId?: string
    vapidKey?: string
  }) => {
    return await NotificationKit.getInstance().init({
      provider: 'firebase',
      config,
    })
  },

  /**
   * Initialize with OneSignal
   */
  initOneSignal: async (config: {
    appId: string
    restApiKey?: string
    safariWebId?: string
  }) => {
    return await NotificationKit.getInstance().init({
      provider: 'onesignal',
      config,
    })
  },

  /**
   * Request permissions and get token
   */
  setup: async () => {
    const kit = NotificationKit.getInstance()
    const granted = await kit.requestPermission()

    if (granted) {
      const token = await kit.getToken()
      return { granted, token }
    }

    return { granted, token: null }
  },

  /**
   * Show success notification
   */
  success: (title: string, message?: string) =>
    notifications.success(title, message),

  /**
   * Show error notification
   */
  error: (title: string, message?: string) =>
    notifications.error(title, message),

  /**
   * Show warning notification
   */
  warning: (title: string, message?: string) =>
    notifications.warning(title, message),

  /**
   * Show info notification
   */
  info: (title: string, message?: string) => notifications.info(title, message),

  /**
   * Schedule a local notification
   */
  scheduleLocal: (options: {
    id: string | number
    title: string
    body: string
    schedule: {
      at: Date | string
    }
  }) =>
    notifications.schedule({
      ...options,
      id: String(options.id),
      schedule: {
        at:
          options.schedule.at instanceof Date
            ? options.schedule.at
            : new Date(options.schedule.at),
      },
    }),

  /**
   * Subscribe to a topic
   */
  subscribe: (topic: string) => notifications.subscribe(topic),

  /**
   * Unsubscribe from a topic
   */
  unsubscribe: (topic: string) => notifications.unsubscribe(topic),
}

/**
 * Library feature flags
 */
export const features = {
  pushNotifications: true,
  localNotifications: true,
  inAppNotifications: true,
  channels: true,
  actions: true,
  scheduling: true,
  topics: true,
  analytics: true,
  permissions: true,
  storage: true,
  validation: true,
  formatting: true,
  react: true,
  firebase: true,
  onesignal: true,
  typescript: true,
}

/**
 * Browser compatibility information
 */
export const compatibility = {
  web: {
    chrome: '50+',
    firefox: '44+',
    safari: '16+',
    edge: '79+',
    opera: '37+',
  },
  mobile: {
    ios: '10+',
    android: '5.0+',
  },
  features: {
    pushNotifications: [
      'chrome',
      'firefox',
      'safari',
      'edge',
      'ios',
      'android',
    ],
    serviceWorker: ['chrome', 'firefox', 'safari', 'edge'],
    notifications: ['chrome', 'firefox', 'safari', 'edge', 'ios', 'android'],
    vibration: ['chrome', 'firefox', 'opera', 'android'],
    badging: ['chrome', 'edge', 'ios', 'android'],
  },
}

/**
 * Development helpers
 */
export const dev = {
  /**
   * Enable debug mode
   */
  enableDebug: () => {
    if (typeof window !== 'undefined') {
      ;(window as any).__NOTIFICATION_KIT_DEBUG__ = true
    }
  },

  /**
   * Disable debug mode
   */
  disableDebug: () => {
    if (typeof window !== 'undefined') {
      ;(window as any).__NOTIFICATION_KIT_DEBUG__ = false
    }
  },

  /**
   * Check if debug mode is enabled
   */
  isDebugEnabled: () => {
    if (typeof window !== 'undefined') {
      return (window as any).__NOTIFICATION_KIT_DEBUG__ === true
    }
    return false
  },

  /**
   * Get platform information
   */
  getPlatformInfo: () => platform.detect(),

  /**
   * Get capabilities
   */
  getCapabilities: () => platform.getCapabilities(),

  /**
   * Test notifications
   */
  test: {
    inApp: () =>
      notifications.info(
        'Test Notification',
        'This is a test in-app notification'
      ),
    permission: () => notifications.requestPermission(),
    token: () => notifications.getToken(),
    schedule: () =>
      notifications.schedule({
        id: 'test',
        title: 'Test Local Notification',
        body: 'This is a test local notification',
        schedule: {
          at: new Date(Date.now() + 5000), // 5 seconds from now
        },
      }),
  },
}
