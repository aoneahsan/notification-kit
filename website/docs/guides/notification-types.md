---
title: Notification Types
sidebar_position: 3
---

# Notification Types

`notification-kit` covers three kinds of notification through one API. This page explains when to use each and how to send them.

| Type | Triggered by | Provider required | Permission required |
|---|---|---|---|
| **Push** | Your server, via Firebase/OneSignal | Yes | Yes |
| **Local** | The device OS, on a schedule | No (Capacitor) | Yes (to display) |
| **In-app** | Your own code, in your UI | No | No |

## Push notifications

Push messages are sent from your backend and delivered to the device by the provider. On the device, the kit registers a token and surfaces incoming messages.

```tsx
import { notifications } from 'notification-kit';

// Register / retrieve the device token (send this to your backend)
const token = await notifications.getToken();

// Foreground push received
const offPush = notifications.onPush((payload) => {
  console.log('Received:', payload.title, payload.body);
});

// User tapped the notification
const offOpened = notifications.onPushOpened((notification) => {
  if (notification.data?.screen) router.push(notification.data.screen);
});
```

Topic/audience targeting is provider-specific — see [Providers](providers.md). **Sending** push is a server-side job; the client never holds the provider secret key.

## Local notifications

Local notifications are scheduled on the device and fired by the OS — no network or provider needed. They require the `@capacitor/local-notifications` peer and run on native platforms.

### One-time

```tsx
// Fire at a specific moment
await notifications.schedule({
  id: 'standup',
  title: 'Daily Standup',
  body: 'Team meeting starting',
  at: new Date('2026-03-20T09:00:00'),
});
```

### Recurring

Recurring schedules use **top-level** fields — `every` plus `on` for the time of day. There is no nested `schedule: {}` object.

```tsx
// Every day at 09:00
await notifications.schedule({
  id: 'daily-checkin',
  title: 'Daily Check-in',
  body: 'Time for your review',
  every: 'day',
  on: { hour: 9, minute: 0 },
});

// Every week on Monday at 10:00 (weekday 1 = Monday … 7 = Sunday)
await notifications.schedule({
  id: 'weekly-report',
  title: 'Weekly Report',
  body: 'Review your weekly stats',
  every: 'week',
  on: { weekday: 1, hour: 10, minute: 0 },
});
```

Valid `every` values: `second`, `minute`, `hour`, `day`, `week`, `two-weeks`, `month`, `year`.

### Managing scheduled notifications

```tsx
await notifications.cancel('standup');     // by id (string or number)
await notifications.cancelAll();           // clear all pending
const pending = await notifications.getPending(); // list pending
```

### Android channels

On Android 8+, notifications are delivered through a **channel**. Create channels once, then reference them by `channelId`.

```tsx
await notifications.createChannel({
  id: 'important',
  name: 'Important Notifications',
  description: 'Critical app notifications',
  importance: 4, // 1 (min) – 5 (max)
  sound: 'default',
  vibration: true,
});

await notifications.schedule({
  id: 'alert-1',
  title: 'Important!',
  body: 'This is critical',
  channelId: 'important',
});

await notifications.deleteChannel('important');
const channels = await notifications.listChannels();
```

## In-app notifications

In-app notifications are toast messages rendered in your own UI. They need **no provider and no permission**, and work even on a plain React web app.

```tsx
notifications.success('Saved!', 'Your changes were stored.');
notifications.error('Upload failed', 'Please try again.');
notifications.warning('Low storage');
notifications.info('A new version is available');

// Full control
const id = await notifications.showInApp({
  title: 'New message',
  message: 'John sent you a message',
  type: 'info',
  duration: 5000,
  position: 'top-right',
  action: { label: 'View', onClick: () => router.push('/messages') },
});
```

In React, prefer the [`useInAppNotification`](../api/react-hooks.md#useinappnotification) hook.

## Next steps

- [Permissions](permissions.md)
- [Core API](../api/core.md)
- [Examples](../examples/basic.md)
