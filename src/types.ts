/**
 * Type definitions for notification-kit
 */

import type { FirebaseApp } from 'firebase/app'

// Core Types
export type Platform = 'web' | 'ios' | 'android' | 'electron' | 'unknown'

export interface PlatformCapabilities {
  pushNotifications: boolean
  localNotifications: boolean
  inAppNotifications: boolean
  channels: boolean
  actions: boolean
  badges: boolean
  sounds: boolean
  criticalAlerts: boolean
}

export interface PlatformDetection {
  platform: Platform
  userAgent: string
  version?: string
  browser?: string
  device?: string
}

export interface PlatformConfig {
  web?: Record<string, any>
  ios?: Record<string, any>
  android?: Record<string, any>
  electron?: Record<string, any>
}

export interface PlatformDefaults {
  sound?: string
  badge?: string
  icon?: string
}

export interface PlatformCompatibility {
  minVersion?: string
  maxVersion?: string
  features?: string[]
}

// Provider Types
export interface NotificationProvider {
  init(config: ProviderConfig): Promise<void>
  destroy(): Promise<void>
  requestPermission(): Promise<boolean>
  checkPermission(): Promise<PermissionStatus>
  getToken(): Promise<string>
  deleteToken?(): Promise<void>
  subscribe(topic: string): Promise<void>
  unsubscribe(topic: string): Promise<void>
  sendNotification(payload: PushNotificationPayload): Promise<void>
  getCapabilities(): Promise<ProviderCapabilities>
  onMessage(callback: (payload: PushNotificationPayload) => void): void
  onTokenRefresh(callback: (token: string) => void): void
  onError(callback: (error: Error) => void): void
}

export type ProviderConfig = FirebaseConfig | OneSignalConfig

// Updated Firebase config to support existing app
export type FirebaseConfig = 
  | {
      app: FirebaseApp // Existing Firebase app instance
      vapidKey?: string
    }
  | {
      apiKey: string
      authDomain: string
      projectId: string
      storageBucket: string
      messagingSenderId: string
      appId: string
      measurementId?: string
      vapidKey?: string
    }

// Updated OneSignal config to support existing instance
export type OneSignalConfig = 
  | {
      instance: any // Existing OneSignal instance
    }
  | {
      appId: string
      restApiKey?: string
      safariWebId?: string
      notifyButton?: {
        enable: boolean
        size?: 'small' | 'medium' | 'large'
        position?: 'bottom-left' | 'bottom-right'
        showCredit?: boolean
      }
      welcomeNotification?: {
        title?: string
        message?: string
        url?: string
      }
      promptOptions?: {
        slidedown?: {
          prompts?: Array<{
            type: 'push' | 'category' | 'sms' | 'email'
            autoPrompt?: boolean
            text?: {
              actionMessage?: string
              acceptButton?: string
              cancelButton?: string
            }
          }>
        }
      }
    }

export interface ProviderCapabilities {
  topics: boolean
  scheduling: boolean
  analytics: boolean
  segmentation: boolean
  templates: boolean
  webhooks: boolean
  batch: boolean
  priority: boolean
  ttl: boolean
  collapse: boolean
}

export interface ProviderStatistics {
  sent: number
  delivered: number
  opened: number
  failed: number
  subscriptions: number
}

export interface ProviderHealth {
  status: 'healthy' | 'degraded' | 'down'
  lastCheck: Date
  uptime: number
  errors: number
}

export interface ProviderMetadata {
  name: string
  version: string
  documentation: string
  support: string
}

export interface ProviderLimits {
  maxPayloadSize: number
  maxTokens: number
  maxTopics: number
  rateLimit: number
}

export interface ProviderEndpoints {
  send: string
  subscribe: string
  unsubscribe: string
  stats: string
}

export interface ProviderAuthentication {
  type: 'apiKey' | 'oauth' | 'jwt'
  credentials: Record<string, any>
}

export interface ProviderWebhook {
  url: string
  events: string[]
  headers?: Record<string, string>
  secret?: string
}

// Main Configuration
export interface NotificationConfig {
  provider: 'firebase' | 'onesignal'
  config: ProviderConfig
  inApp?: InAppConfig
  styles?: StyleConfig
  debug?: boolean
  serviceWorkerPath?: string
  autoInit?: boolean
  storage?: StorageConfig
  analytics?: AnalyticsConfig
  environment?: EnvironmentConfig
  features?: FeatureFlags
  localization?: LocalizationConfig
  security?: SecurityConfig
  backup?: BackupConfig
}

// Configuration Options
export interface InAppConfig {
  position?: NotificationPosition
  duration?: number
  maxStack?: number
  animation?: AnimationConfig
  zIndex?: number
  container?: string | HTMLElement
}

export interface StyleConfig {
  theme?: 'light' | 'dark' | 'auto'
  colors?: {
    success?: string
    error?: string
    warning?: string
    info?: string
    background?: string
    text?: string
  }
  borderRadius?: string
  boxShadow?: string
  fontFamily?: string
  fontSize?: string
}

export interface AnimationConfig {
  in?: string
  out?: string
  duration?: number
  easing?: string
}

export interface StorageConfig {
  type?: 'localStorage' | 'sessionStorage' | 'indexedDB' | 'memory'
  prefix?: string
  encryption?: boolean
}

export interface AnalyticsConfig {
  enabled?: boolean
  provider?: 'google' | 'segment' | 'custom'
  trackingId?: string
  events?: string[]
}

export interface EnvironmentConfig {
  production?: boolean
  development?: boolean
  staging?: boolean
  custom?: Record<string, any>
}

export interface FeatureFlags {
  [key: string]: boolean
}

export interface LocalizationConfig {
  defaultLocale?: string
  locales?: string[]
  messages?: Record<string, Record<string, string>>
}

export interface SecurityConfig {
  allowedOrigins?: string[]
  contentSecurityPolicy?: string
  requireHttps?: boolean
}

export interface BackupConfig {
  enabled?: boolean
  interval?: number
  maxBackups?: number
}

export interface ServiceWorkerConfig {
  path?: string
  scope?: string
  updateViaCache?: 'imports' | 'all' | 'none'
}

export interface InitOptions {
  timeout?: number
  retries?: number
  delay?: number
}

// Notification Types
export interface Notification {
  id: string
  title: string
  body: string
  data?: Record<string, any>
  icon?: string
  image?: string
  badge?: string
  sound?: string
  tag?: string
  requireInteraction?: boolean
  actions?: NotificationAction[]
  timestamp?: Date
  platform?: Platform
  type?: 'push' | 'local' | 'inApp'
}

export interface NotificationAction {
  action: string
  title: string
  icon?: string
  type?: 'button' | 'text'
  placeholder?: string
}

export interface NotificationChannel {
  id: string
  name: string
  description?: string
  importance?: ChannelImportance
  visibility?: ChannelVisibility
  sound?: string
  vibration?: boolean | number[]
  lights?: boolean
  lightColor?: string
  showBadge?: boolean
  group?: string
}

export interface ChannelGroup {
  id: string
  name: string
  description?: string
}

export type ChannelImportance = 1 | 2 | 3 | 4 | 5
export type ChannelVisibility = -1 | 0 | 1
export type ChannelLockScreenVisibility = 'secret' | 'private' | 'public'
export type ChannelSound = 'default' | 'none' | string
export type ChannelVibration = boolean | number[]
export type ChannelLights = boolean | { color: string; onMs: number; offMs: number }

// Payload Types
export interface PushNotificationPayload {
  title: string
  body: string
  data?: Record<string, any>
  token?: string
  tokens?: string[]
  topic?: string
  condition?: string
  priority?: 'high' | 'normal'
  ttl?: number
  collapseKey?: string
  sound?: string
  badge?: number
  icon?: string
  image?: string
  clickAction?: string
  color?: string
  tag?: string
  analyticsLabel?: string
}

export interface LocalNotificationPayload {
  id: string
  title: string
  body: string
  data?: Record<string, any>
  smallIcon?: string
  largeIcon?: string
  sound?: string
  channelId?: string
  schedule?: NotificationSchedule
  attachments?: string[]
  threadIdentifier?: string
  summaryArgument?: string
  group?: string
  groupSummary?: boolean
  ongoing?: boolean
  autoCancel?: boolean
}

export interface InAppNotificationPayload {
  id?: string
  title: string
  message?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  dismissible?: boolean
  actions?: Array<{
    label: string
    onClick: () => void
  }>
}

// Schedule Types
export interface ScheduleOptions {
  id?: string
  title: string
  body: string
  data?: Record<string, any>
  schedule?: NotificationSchedule
  channelId?: string
  smallIcon?: string
  largeIcon?: string
  sound?: string
  attachments?: string[]
  threadIdentifier?: string
  summaryArgument?: string
  group?: string
  groupSummary?: boolean
  ongoing?: boolean
  autoCancel?: boolean
}

export interface NotificationSchedule {
  at?: Date
  in?: Duration
  every?: RepeatInterval
  on?: ScheduleOn
  count?: number
  end?: Date
}

export interface ScheduleAt {
  date: Date
  allowWhileIdle?: boolean
}

export interface ScheduleOn {
  year?: number
  month?: number
  day?: number
  weekday?: Weekday
  hour?: number
  minute?: number
  second?: number
}

export interface ScheduleEvery {
  interval: RepeatInterval
  count?: number
}

export interface ScheduleResult {
  id: string
  success: boolean
  error?: Error
}

export interface Duration {
  seconds?: number
  minutes?: number
  hours?: number
  days?: number
}

export type RepeatInterval = 
  | 'year'
  | 'month'
  | 'two-weeks'
  | 'week'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second'

export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7

// In-App Notification Types
export interface InAppOptions {
  title: string
  message?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  position?: NotificationPosition
  dismissible?: boolean
  action?: {
    label: string
    onClick: () => void
  }
  icon?: string
  className?: string
  style?: React.CSSProperties
  onDismiss?: () => void
}

export type NotificationPosition = 
  | 'top'
  | 'top-left'
  | 'top-right'
  | 'bottom'
  | 'bottom-left'
  | 'bottom-right'
  | 'center'

// Permission Types
export type PermissionStatus = 'granted' | 'denied' | 'prompt' | 'provisional'
export type NotificationPermissionStatus = PermissionStatus
export type PermissionType = 'notifications' | 'location' | 'camera' | 'microphone'

// Event Types
export interface NotificationEvent {
  id: string
  type: string
  timestamp: Date
  data?: any
}

export interface NotificationReceivedEvent extends NotificationEvent {
  type: 'notificationReceived'
  payload: PushNotificationPayload | LocalNotificationPayload
  platform: Platform
}

export interface NotificationActionPerformedEvent extends NotificationEvent {
  type: 'notificationActionPerformed'
  action: string
  notification: Notification
  inputValue?: string
  platform: Platform
}

export interface NotificationSentEvent extends NotificationEvent {
  type: 'notificationSent'
  payload: PushNotificationPayload | LocalNotificationPayload
}

export interface NotificationScheduledEvent extends NotificationEvent {
  type: 'notificationScheduled'
  options: ScheduleOptions
}

export interface NotificationCancelledEvent extends NotificationEvent {
  type: 'notificationCancelled'
  id: string | number
}

export interface NotificationChannelCreatedEvent extends NotificationEvent {
  type: 'channelCreated'
  channel: NotificationChannel
}

export interface NotificationChannelDeletedEvent extends NotificationEvent {
  type: 'channelDeleted'
  channelId: string
}

export interface TokenReceivedEvent extends NotificationEvent {
  type: 'tokenReceived'
  token: string
}

export interface TokenRefreshedEvent extends NotificationEvent {
  type: 'tokenRefreshed'
  token: string
}

export interface PermissionChangedEvent extends NotificationEvent {
  type: 'permissionChanged'
  granted: boolean
  status: PermissionStatus
}

export interface SubscribedEvent extends NotificationEvent {
  type: 'subscribed'
  topic: string
}

export interface UnsubscribedEvent extends NotificationEvent {
  type: 'unsubscribed'
  topic: string
}

export interface ReadyEvent extends NotificationEvent {
  type: 'ready'
  platform: Platform
  capabilities: PlatformCapabilities | null
}

export interface ErrorEvent extends NotificationEvent {
  type: 'error'
  error: Error
  context: string
}

// Event Map
export interface NotificationEventMap {
  notificationReceived: NotificationReceivedEvent
  notificationActionPerformed: NotificationActionPerformedEvent
  notificationSent: NotificationSentEvent
  notificationScheduled: NotificationScheduledEvent
  notificationCancelled: NotificationCancelledEvent
  notificationShown: NotificationEvent
  channelCreated: NotificationChannelCreatedEvent
  channelDeleted: NotificationChannelDeletedEvent
  tokenReceived: TokenReceivedEvent
  tokenRefreshed: TokenRefreshedEvent
  permissionChanged: PermissionChangedEvent
  subscribed: SubscribedEvent
  unsubscribed: UnsubscribedEvent
  ready: ReadyEvent
  error: ErrorEvent
}

export type NotificationEvents = keyof NotificationEventMap

export type NotificationEventCallback<T = NotificationEvent> = (event: T) => void

export type EventListener = (event: NotificationEvent) => void

// Validation Types
export interface ValidationError {
  field: string
  message: string
  value?: any
}

export interface ValidationWarning {
  field: string
  message: string
  suggestion?: string
}

// Utility type to check if FirebaseConfig has existing app
export function isFirebaseAppConfig(config: FirebaseConfig): config is { app: FirebaseApp; vapidKey?: string } {
  return 'app' in config
}

// Utility type to check if OneSignalConfig has existing instance
export function isOneSignalInstanceConfig(config: OneSignalConfig): config is { instance: any } {
  return 'instance' in config
}