/**
 * React integration for notification-kit
 */

// Hooks
export { useNotifications } from './hooks/useNotifications'
export { 
  useInAppNotification,
  useInAppNotificationSimple,
  useInAppNotificationQueue,
  useInAppNotificationPersistence
} from './hooks/useInAppNotification'

// Types
export type { UseNotificationsState, UseNotificationsReturn } from './hooks/useNotifications'
export type { 
  UseInAppNotificationState, 
  UseInAppNotificationReturn 
} from './hooks/useInAppNotification'

// Re-export core types for convenience
export type {
  NotificationConfig,
  NotificationProvider,
  NotificationPermissionStatus,
  ScheduleOptions,
  InAppOptions,
  NotificationChannel,
  Notification,
  PushNotificationPayload,
  LocalNotificationPayload,
  InAppNotificationPayload,
  NotificationEvents,
  NotificationEventCallback,
  FirebaseConfig,
  OneSignalConfig,
  Platform,
  PlatformCapabilities
} from '@/types'

// Re-export utility functions for convenience
export { 
  showInAppNotification,
  dismissInAppNotification,
  dismissAllInAppNotifications,
  getActiveInAppNotifications,
  configureInAppNotifications,
  inApp
} from '@/utils/inApp'

export { validate } from '@/utils/validation'
export { format } from '@/utils/formatting'
export { SchedulingUtils } from '@/utils/scheduling'
export { permissions } from '@/core/permissions'
export { storage } from '@/core/storage'
export { platform } from '@/core/platform'