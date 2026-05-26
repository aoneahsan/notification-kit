---
title: Quick Start
sidebar_position: 1
---

# Quick Start

Get notifications working in a React + Capacitor app in a few minutes. This guide uses Firebase, the recommended provider. For OneSignal, see [Providers](providers.md).

## 1. Install

```bash
yarn add notification-kit
```

The core has **zero runtime dependencies**. Add only the peers you need:

```bash
# Firebase push (web + native)
yarn add firebase @capacitor/push-notifications @capacitor/local-notifications @capacitor/preferences
```

See [Installation](installation.md) for the full peer list and version floors.

## 2. Initialize once

Call `init` a single time, as early as possible in your app's lifecycle.

```tsx
// main.tsx / index.tsx
import { NotificationKit } from 'notification-kit';

await NotificationKit.init({
  provider: 'firebase',
  config: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY, // web push only
  },
});
```

`NotificationKit.init(...)` is a static convenience that initializes the singleton instance. Everything else is reached through the `notifications` object — no provider component to mount.

## 3. Request permission

Request permission in response to a user action (a button click), not on app launch — both browsers and iOS treat unprompted requests poorly.

```tsx
import { notifications } from 'notification-kit';

async function enableNotifications() {
  const granted = await notifications.requestPermission();
  if (granted) {
    const token = await notifications.getToken();
    // Send `token` to your backend so it can target this device.
  }
}
```

## 4. Show an in-app notification

In-app toasts need **no provider and no permission** — they render in your own UI.

```tsx
import { notifications } from 'notification-kit';

notifications.success('Saved!', 'Your changes were stored.');
notifications.error('Upload failed', 'Please try again.');
```

## 5. Schedule a local notification

```tsx
import { notifications } from 'notification-kit';

// One-time, at a specific moment
await notifications.schedule({
  id: 'reminder-1',
  title: 'Reminder',
  body: 'Meeting in 5 minutes',
  at: new Date(Date.now() + 5 * 60 * 1000),
});

// Recurring: every day at 09:00
await notifications.schedule({
  id: 'daily-checkin',
  title: 'Daily Check-in',
  body: 'Time for your review',
  every: 'day',
  on: { hour: 9, minute: 0 },
});
```

## 6. React to push notifications

```tsx
import { notifications } from 'notification-kit';

// Foreground push received
const offPush = notifications.onPush((payload) => {
  console.log('Push received:', payload);
});

// User tapped a notification
const offOpened = notifications.onPushOpened((notification) => {
  if (notification.data?.screen) {
    router.push(notification.data.screen);
  }
});

// Later, to stop listening:
offPush();
offOpened();
```

## Using React hooks

If you prefer hooks, import from `notification-kit/react`:

```tsx
import { useNotifications, useInAppNotification } from 'notification-kit/react';

function EnableButton() {
  const { isPermissionGranted, requestPermission } = useNotifications();
  const { success } = useInAppNotification();

  const handleClick = async () => {
    const granted = await requestPermission();
    if (granted) success('Notifications enabled!');
  };

  return (
    <button onClick={handleClick}>
      {isPermissionGranted ? 'Notifications on' : 'Enable notifications'}
    </button>
  );
}
```

See [React Hooks](../api/react-hooks.md) for the full hook surface.

## Next steps

- [Platform Setup](platform-setup.md) — iOS, Android, and web service-worker configuration.
- [Notification Types](notification-types.md) — push vs. local vs. in-app.
- [Configuration](configuration.md) — all `init` options.
- [Troubleshooting](troubleshooting.md) — common issues.
