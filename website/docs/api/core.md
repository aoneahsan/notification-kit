---
title: Core API
sidebar_position: 1
---

# Core API

The core API is exposed two ways:

- **`NotificationKit`** — the class. Use `NotificationKit.init(...)` and `NotificationKit.getInstance()`.
- **`notifications`** — a convenience object that forwards every call to the singleton instance.

```ts
import { NotificationKit, notifications } from 'notification-kit';
```

There is no React provider to mount — state lives in the singleton.

## Initialization

### `NotificationKit.init(config)`

```ts
NotificationKit.init(config: NotificationConfig): Promise<void>
```

Initializes the singleton with a provider and options. Call once, as early as possible. See [Configuration](../guides/configuration.md) for the full `NotificationConfig` shape and [Types](types.md) for field definitions.

```tsx
await NotificationKit.init({
  provider: 'firebase',
  config: { apiKey: '...', projectId: '...', /* ... */ vapidKey: '...' },
});
```

### `NotificationKit.getInstance()`

```ts
NotificationKit.getInstance(): NotificationKit
```

Returns the singleton. Rarely needed directly — prefer the `notifications` object.

## Permissions

```ts
notifications.requestPermission(): Promise<boolean>
notifications.checkPermission(): Promise<PermissionStatus>
notifications.isPermissionGranted(): Promise<boolean>
```

See [Permissions](../guides/permissions.md).

## Tokens

```ts
notifications.getToken(): Promise<string>
```

Returns the device push token. Send it to your backend to target this device. Requires granted permission and provider/platform setup.

## Topics

```ts
notifications.subscribe(topic: string): Promise<void>
notifications.unsubscribe(topic: string): Promise<void>
```

- **Firebase:** topic (un)subscription is **server-side only** — these throw on the client with a clear message. Subscribe devices from your backend.
- **OneSignal:** mapped to tags via the v3 User API.

See [Providers](../guides/providers.md).

## Local notifications

```ts
notifications.schedule(options: ScheduleOptions): Promise<void>
notifications.cancel(id: string | number): Promise<void>
notifications.cancelAll(): Promise<void>
notifications.getPending(): Promise<Notification[]>
```

See [Notifications API](notifications.md) for `schedule` options and recurring patterns.

## In-app notifications

```ts
notifications.success(title: string, message?: string): Promise<string>
notifications.error(title: string, message?: string): Promise<string>
notifications.warning(title: string, message?: string): Promise<string>
notifications.info(title: string, message?: string): Promise<string>
notifications.showInApp(options: InAppOptions): Promise<string>
```

Each returns the notification id (useful for dismissing). See [Notifications API](notifications.md#in-app-notifications).

## Android channels

```ts
notifications.createChannel(channel: NotificationChannel): Promise<void>
notifications.deleteChannel(id: string): Promise<void>
notifications.listChannels(): Promise<NotificationChannel[]>
```

See [Notification Types](../guides/notification-types.md#android-channels).

## Events

```ts
notifications.on(event, callback): () => void   // subscribe; returns unsubscribe
notifications.off(event, callback?): void        // unsubscribe
notifications.onPush(callback): () => void        // foreground push received
notifications.onPushOpened(callback): () => void  // user tapped a notification
```

Valid `event` keys: `notificationReceived`, `notificationActionPerformed`, `tokenReceived`, `tokenRefreshed`, `permissionChanged`. The names `'push'` / `'pushOpened'` / `'tokenRefresh'` / `'permissionChange'` are **invalid**. See [Notifications API → Events](notifications.md#events).

## Other exports

The package also exports helpers and managers:

```ts
import {
  quickStart,   // shortcut helpers: initFirebase, initOneSignal, setup, ...
  platform,     // platform.detect(), platform.getCapabilities()
  permissions,  // permission manager
  inApp,        // in-app helpers: inApp.success(...), etc.
  showInAppNotification, dismissInAppNotification, dismissAllInAppNotifications,
} from 'notification-kit';
```

See [Types](types.md) for the complete export list.

## Next steps

- [Notifications API](notifications.md)
- [Types](types.md)
- [React Hooks](react-hooks.md)
