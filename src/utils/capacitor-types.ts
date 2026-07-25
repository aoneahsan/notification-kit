/**
 * Type conversion utilities for Capacitor compatibility
 */

import type {
  LocalNotificationSchema,
  Channel as CapacitorChannel,
  Importance as CapacitorImportance,
} from '@capacitor/local-notifications'
import type {
  ScheduleOptions,
  NotificationChannel,
  ChannelImportance,
  LocalNotificationPayload,
  Duration,
} from '@/types'

/**
 * Convert a relative delay (Duration object or millisecond number) to ms.
 */
function durationToMs(value: number | Duration): number {
  if (typeof value === 'number') {
    return value
  }
  return (
    (value.seconds ?? 0) * 1000 +
    (value.minutes ?? 0) * 60_000 +
    (value.hours ?? 0) * 3_600_000 +
    (value.days ?? 0) * 86_400_000
  )
}

/**
 * Convert our ChannelImportance to Capacitor's Importance
 */
export function toCapacitorImportance(
  importance: ChannelImportance
): CapacitorImportance {
  const map: Record<ChannelImportance, CapacitorImportance> = {
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
  }
  return map[importance] || 3
}

/**
 * Convert Capacitor's Importance to our ChannelImportance
 */
export function fromCapacitorImportance(
  importance: CapacitorImportance
): ChannelImportance {
  const map: Record<CapacitorImportance, ChannelImportance> = {
    // Capacitor's Importance is 0-5; ours is 1-5. Android's 0 (IMPORTANCE_NONE,
    // notifications suppressed) has no equivalent on our scale, so it resolves to
    // default — which is what the `|| 3` fallback below already did at runtime.
    0: 3,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
  }
  return map[importance] || 3
}

/**
 * Convert our NotificationChannel to Capacitor's Channel
 */
export function toCapacitorChannel(
  channel: NotificationChannel
): CapacitorChannel {
  const capacitorChannel: any = {
    id: channel.id,
    name: channel.name,
    description: channel.description ?? '',
    importance: channel.importance
      ? toCapacitorImportance(channel.importance)
      : undefined,
    visibility: channel.visibility as any, // Capacitor uses similar values
  }

  if (channel.sound !== undefined) {
    capacitorChannel.sound = channel.sound
  }

  if (channel.vibration !== undefined) {
    capacitorChannel.vibration = channel.vibration
  }

  if (channel.lights !== undefined) {
    capacitorChannel.lights = channel.lights
  }

  return capacitorChannel as CapacitorChannel
}

/**
 * Convert Capacitor's Channel to our NotificationChannel
 */
export function fromCapacitorChannel(
  channel: CapacitorChannel
): NotificationChannel {
  const notificationChannel: any = {
    id: channel.id,
    name: channel.name,
    description: channel.description ?? '',
    importance: channel.importance
      ? fromCapacitorImportance(channel.importance as CapacitorImportance)
      : 'default',
    visibility: channel.visibility as any,
  }

  if (channel.sound !== undefined) {
    notificationChannel.sound = channel.sound
  }

  if (channel.vibration !== undefined) {
    notificationChannel.vibration = channel.vibration
  }

  if (channel.lights !== undefined) {
    notificationChannel.lights = channel.lights
  }

  return notificationChannel as NotificationChannel
}

/**
 * Convert our ScheduleOptions to Capacitor's LocalNotificationSchema
 */
export function toCapacitorLocalNotification(
  options: ScheduleOptions & LocalNotificationPayload
): LocalNotificationSchema {
  const notification: any = {
    id:
      typeof options.id === 'string'
        ? parseInt(options.id, 10)
        : options.id || Date.now(),
    title: options.title || '',
    body: options.body || '',
    largeBody: options.body,
  }

  if (options.summaryText !== undefined) {
    notification.summaryText = options.summaryText
  }

  // Map the schedule timing: one-time `at`, plus recurring `every`/`on`/`count`
  // (previously only `at` was wired, so recurring schedules were silently
  // dropped). All timing fields are read from the top level of ScheduleOptions.
  const schedule: any = {}
  if (options.at) {
    schedule.at = options.at instanceof Date ? options.at : new Date(options.at)
  }
  if (options.in !== undefined && schedule.at === undefined) {
    // Relative delay -> absolute time (ignored when an explicit `at` is given).
    schedule.at = new Date(Date.now() + durationToMs(options.in))
  }
  if (options.on) {
    schedule.on = options.on
  }
  if (options.every) {
    schedule.every = options.every
    schedule.repeats = true
  }
  if (options.count !== undefined) {
    schedule.count = options.count
  }
  if (options.allowWhileIdle !== undefined) {
    schedule.allowWhileIdle = options.allowWhileIdle
  }
  if (Object.keys(schedule).length > 0) {
    notification.schedule = schedule
  }

  if (options.sound !== undefined) {
    notification.sound = options.sound
  }

  if (options.smallIcon !== undefined) {
    notification.smallIcon = options.smallIcon
  }

  if (options.largeIcon !== undefined) {
    notification.largeIcon = options.largeIcon
  }

  if (options.color !== undefined) {
    notification.iconColor = options.color
  }

  if (options.channelId !== undefined) {
    notification.channelId = options.channelId
  }

  if (options.ongoing !== undefined) {
    notification.ongoing = options.ongoing
  }

  if (options.autoCancel !== undefined) {
    notification.autoCancel = options.autoCancel
  }

  if (options.group !== undefined) {
    notification.group = options.group
  }

  if (options.groupSummary !== undefined) {
    notification.groupSummary = options.groupSummary
  }

  if (options.extra || options.data) {
    notification.extra = options.extra || options.data
  }

  return notification as LocalNotificationSchema
}

/**
 * Convert Capacitor's LocalNotificationSchema to our types
 */
export function fromCapacitorLocalNotification(
  notification: LocalNotificationSchema
): LocalNotificationPayload {
  const payload: any = {
    id: notification.id.toString(),
    title: notification.title,
    body: notification.body,
  }

  if (notification.summaryText !== undefined) {
    payload.summaryText = notification.summaryText
  }

  if (notification.sound !== undefined) {
    payload.sound = notification.sound
  }

  if (notification.smallIcon !== undefined) {
    payload.smallIcon = notification.smallIcon
  }

  if (notification.largeIcon !== undefined) {
    payload.largeIcon = notification.largeIcon
  }

  if (notification.iconColor !== undefined) {
    payload.color = notification.iconColor
  }

  if (notification.channelId !== undefined) {
    payload.channelId = notification.channelId
  }

  if (notification.ongoing !== undefined) {
    payload.ongoing = notification.ongoing
  }

  if (notification.autoCancel !== undefined) {
    payload.autoCancel = notification.autoCancel
  }

  if (notification.group !== undefined) {
    payload.group = notification.group
  }

  if (notification.groupSummary !== undefined) {
    payload.groupSummary = notification.groupSummary
  }

  if (notification.extra !== undefined) {
    payload.extra = notification.extra
    payload.data = notification.extra
  }

  return payload as LocalNotificationPayload
}

/**
 * Convert ProviderCapabilities to PlatformCapabilities
 */
export function toPlatformCapabilities(providerCaps: any): any {
  // For now, we'll create a basic mapping. In a real implementation,
  // this would map provider-specific capabilities to platform capabilities
  return {
    pushNotifications: providerCaps.pushNotifications || false,
    localNotifications: true, // Always true if Capacitor is available
    inAppNotifications: true, // Always true
    notificationChannels: providerCaps.channels || false,
    notificationActions: providerCaps.actions || false,
    notificationBadging: providerCaps.badges || false,
    notificationSound: providerCaps.sounds || false,
    notificationVibration: providerCaps.vibration || false,
    notificationLights: providerCaps.lights || false,
    notificationGrouping: providerCaps.groups || false,
    notificationImportance: providerCaps.channels || false,
    notificationVisibility: providerCaps.channels || false,
    notificationLockScreen: providerCaps.channels || false,
    notificationFullScreen: false,
    notificationHeadsUp: providerCaps.channels || false,
    notificationOngoing: providerCaps.channels || false,
    notificationProgress: providerCaps.progress || false,
    notificationBigText: providerCaps.bigText || false,
    notificationBigPicture: providerCaps.bigPicture || false,
    notificationInbox: providerCaps.inbox || false,
    notificationMedia: providerCaps.richMedia || false,
    notificationCustom: providerCaps.customData || false,
    notificationScheduling: providerCaps.scheduling || false,
    notificationGeofencing: providerCaps.geofencing || false,
    notificationTriggers: providerCaps.triggers || false,
    serviceWorker: providerCaps.webPush || false,
    webPushProtocol: providerCaps.webPush || false,
    backgroundSync: providerCaps.backgroundSync || false,
    foregroundService: false,
    criticalAlerts: false,
    provisionalAuth: false,
    appBadge: providerCaps.badges || false,
    quietHours: providerCaps.quietHours || false,
    doNotDisturb: false,
  }
}
