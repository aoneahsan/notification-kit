---
title: Notifications API
sidebar_position: 2
---

# Notifications API

Reference for scheduling local notifications, showing in-app toasts, managing channels, and handling events through the `notifications` object.

```ts
import { notifications } from 'notification-kit';
```

## Local notifications

### `schedule(options)`

```ts
notifications.schedule(options: ScheduleOptions): Promise<void>
```

Schedules a local notification. Key fields:

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Identifier for later cancel (recommended) |
| `title` | `string` | Required |
| `body` | `string` | Required |
| `at` | `Date \| string` | Fire once at this time |
| `every` | `'second' \| 'minute' \| 'hour' \| 'day' \| 'week' \| 'two-weeks' \| 'month' \| 'year'` | Recurring interval |
| `on` | `{ weekday?, hour?, minute?, second?, ... }` | Time-of-day / weekday for recurring |
| `channelId` | `string` | Android channel (8+) |
| `data` | `Record<string, any>` | Custom payload |
| `sound` | `string` | Custom sound |

See [Types](types.md#scheduleoptions) for the complete list.

#### One-time

```tsx
await notifications.schedule({
  id: 'standup',
  title: 'Daily Standup',
  body: 'Team meeting starting',
  at: new Date('2026-03-20T09:00:00'),
});
```

#### Recurring

Recurring uses **top-level** `every` + `on` — there is no nested `schedule: {}` object.

```tsx
// Every day at 09:00
await notifications.schedule({
  id: 'daily',
  title: 'Daily Check-in',
  body: 'Time for your review',
  every: 'day',
  on: { hour: 9, minute: 0 },
});

// Every week on Monday at 10:00 (weekday 1 = Monday … 7 = Sunday)
await notifications.schedule({
  id: 'weekly',
  title: 'Weekly Report',
  body: 'Review your weekly stats',
  every: 'week',
  on: { weekday: 1, hour: 10, minute: 0 },
});
```

### `cancel(id)`

```ts
notifications.cancel(id: string | number): Promise<void>
```

Cancels a scheduled notification by id.

### `cancelAll()`

```ts
notifications.cancelAll(): Promise<void>
```

Cancels all pending notifications.

### `getPending()`

```ts
notifications.getPending(): Promise<Notification[]>
```

Returns all currently pending notifications.

## In-app notifications

Toast-style notifications rendered in your UI. No provider or permission required. Each call returns the notification id.

```ts
notifications.success(title: string, message?: string): Promise<string>
notifications.error(title: string, message?: string): Promise<string>
notifications.warning(title: string, message?: string): Promise<string>
notifications.info(title: string, message?: string): Promise<string>
notifications.showInApp(options: InAppOptions): Promise<string>
```

```tsx
notifications.success('Saved!', 'Your changes were stored.');

const id = await notifications.showInApp({
  title: 'New message',
  message: 'John sent you a message',
  type: 'info',
  duration: 5000,
  position: 'top-right',
  action: { label: 'View', onClick: () => router.push('/messages') },
});
```

`InAppOptions` supports `title`, `message`, `type`, `duration`, `position`, `dismissible`, a single `action`, multiple `actions`, `icon`, `data`, and styling hooks. See [Types](types.md#inappoptions).

To dismiss programmatically, use the standalone helpers:

```ts
import { dismissInAppNotification, dismissAllInAppNotifications } from 'notification-kit';

dismissInAppNotification(id);
dismissAllInAppNotifications();
```

## Channels (Android)

```ts
notifications.createChannel(channel: NotificationChannel): Promise<void>
notifications.deleteChannel(id: string): Promise<void>
notifications.listChannels(): Promise<NotificationChannel[]>
```

```tsx
await notifications.createChannel({
  id: 'important',
  name: 'Important Notifications',
  description: 'Critical app notifications',
  importance: 4, // 1 (min) – 5 (max)
  sound: 'default',
  vibration: true,
});
```

See [Types](types.md#notificationchannel).

## Events

```ts
notifications.on(event, callback): () => void
notifications.off(event, callback?): void
notifications.onPush(callback): () => void
notifications.onPushOpened(callback): () => void
```

`on` and the helpers return an **unsubscribe** function.

### Valid event keys

| Event | Fires when |
|---|---|
| `notificationReceived` | A push/local notification arrives (foreground) |
| `notificationActionPerformed` | The user taps the notification or an action button |
| `tokenReceived` | The initial push token is obtained |
| `tokenRefreshed` | The push token changes — resend it to your backend |
| `permissionChanged` | The notification permission status changes |

:::warning Invalid names
`'push'`, `'pushOpened'`, `'tokenRefresh'`, and `'permissionChange'` are **not** valid event keys. For the common push cases use `onPush(...)` and `onPushOpened(...)`.
:::

```tsx
const offPush = notifications.onPush((payload) => {
  console.log('Received:', payload.title);
});

const offOpened = notifications.onPushOpened((notification) => {
  if (notification.data?.screen) router.push(notification.data.screen);
});

const offToken = notifications.on('tokenRefreshed', (event) => {
  sendTokenToBackend(event.token);
});

const offAction = notifications.on('notificationActionPerformed', (event) => {
  if (event.actionId === 'complete') markComplete(event.notification.id);
});

// Stop listening
offPush(); offOpened(); offToken(); offAction();
```

## Next steps

- [Types](types.md)
- [Core API](core.md)
- [React Hooks](react-hooks.md)
