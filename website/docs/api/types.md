---
title: Types
sidebar_position: 3
---

# Types

`notification-kit` ships complete TypeScript definitions. Import types directly from the package:

```ts
import type {
  NotificationConfig,
  ScheduleOptions,
  InAppOptions,
  NotificationChannel,
  Notification,
  PermissionStatus,
} from 'notification-kit';
```

This page documents the most commonly used types. Every type below is exported.

## NotificationConfig

The argument to `NotificationKit.init(...)`.

```ts
interface NotificationConfig {
  provider: 'firebase' | 'onesignal';
  config: ProviderConfig;       // FirebaseConfig | OneSignalConfig
  inApp?: InAppConfig;          // in-app toast defaults
  styles?: StyleConfig;         // theming
  debug?: boolean;
  serviceWorkerPath?: string;
  autoInit?: boolean;
  storage?: StorageConfig;
  analytics?: AnalyticsConfig;
  environment?: EnvironmentConfig;
  features?: FeatureFlags;
  localization?: LocalizationConfig;
  security?: SecurityConfig;
  backup?: BackupConfig;
}
```

See [Configuration](../guides/configuration.md) for usage.

## Provider configs

```ts
type ProviderConfig = FirebaseConfig | OneSignalConfig;

type FirebaseConfig =
  | { app: FirebaseApp; vapidKey?: string }     // existing Firebase app
  | {
      apiKey: string;
      authDomain: string;
      projectId: string;
      storageBucket: string;
      messagingSenderId: string;
      appId: string;
      measurementId?: string;
      vapidKey?: string;                          // required for web push
    };

type OneSignalConfig =
  | { instance: any }                             // existing OneSignal instance
  | {
      appId: string;
      restApiKey?: string;   // server-side only — do not ship in the client
      safariWebId?: string;
      autoPrompt?: boolean;
      autoResubscribe?: boolean;
      // ...additional OneSignal options
    };
```

## ScheduleOptions

The argument to `notifications.schedule(...)`. Selected fields:

```ts
interface ScheduleOptions {
  id?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  channelId?: string;             // Android channel
  sound?: string;
  // Timing
  at?: Date | string;             // one-time
  every?: RepeatInterval;         // recurring interval
  on?: ScheduleOn;                // time-of-day / weekday for recurring
  in?: number;
  count?: number;
  until?: Date;
  days?: number[];
  // Presentation
  smallIcon?: string;
  largeIcon?: string;
  group?: string;
  groupSummary?: boolean;
  ongoing?: boolean;
  autoCancel?: boolean;
  badge?: number;
  priority?: 'high' | 'normal' | 'low';
}

type RepeatInterval =
  | 'second' | 'minute' | 'hour' | 'day'
  | 'week' | 'two-weeks' | 'month' | 'year';

interface ScheduleOn {
  year?: number;
  month?: number;
  day?: number;
  weekday?: 1 | 2 | 3 | 4 | 5 | 6 | 7; // 1 = Monday … 7 = Sunday
  hour?: number;
  minute?: number;
  second?: number;
}
```

See [Notifications API](notifications.md#local-notifications) for examples.

## InAppOptions

The argument to `notifications.showInApp(...)`.

```ts
interface InAppOptions {
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;             // ms
  position?: NotificationPosition;
  dismissible?: boolean;
  action?: { label: string; onClick: () => void };
  actions?: Array<{ id?: string; label: string; onClick: () => void }>;
  icon?: string;
  data?: Record<string, any>;
  className?: string;
  style?: React.CSSProperties;
  onDismiss?: () => void;
}

type NotificationPosition =
  | 'top' | 'top-left' | 'top-right'
  | 'bottom' | 'bottom-left' | 'bottom-right'
  | 'center';
```

## NotificationChannel

The argument to `notifications.createChannel(...)`.

```ts
interface NotificationChannel {
  id: string;
  name: string;
  description?: string;
  importance?: 1 | 2 | 3 | 4 | 5;   // 1 = min … 5 = max
  visibility?: -1 | 0 | 1;
  sound?: string;
  vibration?: boolean | number[];
  lights?: boolean;
  lightColor?: string;
  showBadge?: boolean;
  group?: string;
}
```

## Notification

Returned by `notifications.getPending()` and present in events.

```ts
interface Notification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  icon?: string;
  image?: string;
  badge?: string;
  sound?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
  timestamp?: Date;
  platform?: Platform;
  type?: 'push' | 'local' | 'inApp';
  priority?: 'high' | 'normal' | 'low';
  visibility?: 'public' | 'private' | 'secret';
}
```

## Permissions and platform

```ts
type PermissionStatus =
  | 'granted' | 'denied' | 'prompt'
  | 'provisional' | 'default' | 'unknown';

type Platform = 'web' | 'ios' | 'android' | 'electron' | 'unknown';
```

## Events

```ts
type NotificationEvents =
  | 'notificationReceived'
  | 'notificationActionPerformed'
  | 'tokenReceived'
  | 'tokenRefreshed'
  | 'permissionChanged'
  | /* ...additional internal events */ string;
```

Each event has a typed payload (e.g. `TokenRefreshedEvent`, `PermissionChangedEvent`, `NotificationActionPerformedEvent`). See [Notifications API → Events](notifications.md#events).

## Next steps

- [Core API](core.md)
- [Notifications API](notifications.md)
- [React Hooks](react-hooks.md)
