---
title: Configuration
sidebar_position: 3
---

# Configuration

All configuration happens in a single `NotificationKit.init(...)` call. Run it once, as early as possible in your app.

```ts
NotificationKit.init(config: NotificationConfig): Promise<void>
```

## Minimal configuration

### Firebase

```tsx
import { NotificationKit } from 'notification-kit';

await NotificationKit.init({
  provider: 'firebase',
  config: {
    apiKey: '...',
    authDomain: '...',
    projectId: '...',
    storageBucket: '...',
    messagingSenderId: '...',
    appId: '...',
    measurementId: '...', // optional
    vapidKey: '...',       // required for web push
  },
});
```

You can also pass an **existing** Firebase app instead of raw credentials:

```tsx
import { initializeApp } from 'firebase/app';

const app = initializeApp({ /* ... */ });

await NotificationKit.init({
  provider: 'firebase',
  config: { app, vapidKey: '...' },
});
```

### OneSignal

```tsx
await NotificationKit.init({
  provider: 'onesignal',
  config: {
    appId: 'your-onesignal-app-id',
    safariWebId: '...',   // optional
    autoPrompt: false,    // optional
  },
});
```

Or reuse an existing OneSignal instance: `config: { instance: OneSignal }`.

## In-app notification options

The optional `inApp` block sets defaults for toast notifications.

```tsx
await NotificationKit.init({
  provider: 'firebase',
  config: { /* ... */ },
  inApp: {
    position: 'top-right', // top | top-left | top-right | bottom | bottom-left | bottom-right | center
    duration: 4000,        // ms before auto-dismiss
    maxStack: 3,           // max simultaneously visible
    zIndex: 9999,
    animation: { in: 'slide', out: 'fade', duration: 250 },
  },
});
```

## Styling

The optional `styles` block themes in-app notifications.

```tsx
await NotificationKit.init({
  provider: 'firebase',
  config: { /* ... */ },
  styles: {
    theme: 'auto', // light | dark | auto
    colors: {
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6',
      background: '#ffffff',
      text: '#111827',
    },
    borderRadius: '8px',
    fontFamily: 'system-ui, sans-serif',
    fontSize: '14px',
  },
});
```

## Other options

`NotificationConfig` also accepts these optional fields:

| Field | Type | Purpose |
|---|---|---|
| `debug` | `boolean` | Enable verbose internal logging |
| `serviceWorkerPath` | `string` | Custom path to the web push service worker |
| `autoInit` | `boolean` | Auto-initialize behavior |
| `storage` | `StorageConfig` | Token/state storage adapter and options |
| `analytics` | `AnalyticsConfig` | Analytics hooks |
| `environment` | `EnvironmentConfig` | Per-environment flags |
| `features` | `FeatureFlags` | Toggle individual features |
| `localization` | `LocalizationConfig` | i18n strings |
| `security` | `SecurityConfig` | Allowed origins, CSP, HTTPS enforcement |
| `backup` | `BackupConfig` | Backup interval/retention |

See [Types](../api/types.md) for the full shape of each.

## Environment variables

Never hardcode credentials. Read them from environment variables (the example below uses Vite's `import.meta.env`):

```tsx
config: {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ...
}
```

:::note Server keys never belong in the client
The OneSignal `restApiKey` and any Firebase Admin/server credential are for **server-side** sending only. Do not ship them in client bundles. The kit registers tokens and displays notifications on the device; sending is done from your backend.
:::

## Next steps

- [Platform Setup](platform-setup.md) — iOS, Android, web service worker.
- [Providers](providers.md) — Firebase vs. OneSignal capabilities.
- [Core API](../api/core.md) — methods available after init.
