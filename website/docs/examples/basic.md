---
title: Basic Example
sidebar_position: 1
---

# Basic Example

A small React + Capacitor app that initializes the kit, requests permission, schedules a local notification, shows in-app toasts, and reacts to push. It uses Firebase, the recommended provider.

## 1. Install

```bash
yarn add notification-kit firebase \
  @capacitor/core @capacitor/push-notifications \
  @capacitor/local-notifications @capacitor/preferences \
  react react-dom
yarn cap sync
```

## 2. Initialize once at startup

```tsx
// src/main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { NotificationKit } from 'notification-kit';
import App from './App';

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
  inApp: { position: 'top-right', duration: 4000 },
});

createRoot(document.getElementById('root')!).render(<App />);
```

## 3. A component using hooks

```tsx
// src/App.tsx
import { useEffect } from 'react';
import { notifications } from 'notification-kit';
import { useNotifications, useInAppNotification } from 'notification-kit/react';

export default function App() {
  const { isPermissionGranted, requestPermission, getToken } = useNotifications();
  const { success, error } = useInAppNotification();

  // React to incoming push; clean up on unmount
  useEffect(() => {
    const offPush = notifications.onPush((payload) => {
      console.log('Push received:', payload.title);
    });
    const offOpened = notifications.onPushOpened((notification) => {
      if (notification.data?.screen) {
        // navigate(notification.data.screen)
      }
    });
    return () => {
      offPush();
      offOpened();
    };
  }, []);

  const enableNotifications = async () => {
    const granted = await requestPermission();
    if (!granted) {
      error('Notifications off', 'Enable them in system settings.');
      return;
    }
    const token = await getToken();
    // await sendTokenToBackend(token);
    success('Notifications enabled!');
  };

  const scheduleReminder = async () => {
    await notifications.schedule({
      id: 'reminder-1',
      title: 'Reminder',
      body: 'Meeting in 5 minutes',
      at: new Date(Date.now() + 5 * 60 * 1000),
    });
    success('Reminder scheduled', 'You will be notified in 5 minutes.');
  };

  return (
    <main style={{ padding: 24, display: 'grid', gap: 12, maxWidth: 360 }}>
      <button onClick={enableNotifications}>
        {isPermissionGranted ? 'Notifications on' : 'Enable notifications'}
      </button>
      <button onClick={scheduleReminder}>Schedule reminder</button>
      <button onClick={() => notifications.info('Hello', 'This is an in-app toast.')}>
        Show in-app toast
      </button>
    </main>
  );
}
```

## 4. Recurring reminder (optional)

Recurring schedules use top-level `every` + `on`:

```tsx
await notifications.schedule({
  id: 'daily-checkin',
  title: 'Daily Check-in',
  body: 'Time for your review',
  every: 'day',
  on: { hour: 9, minute: 0 },
});
```

## 5. Web push service worker

For web push with Firebase, create `public/firebase-messaging-sw.js`:

```js
importScripts('https://www.gstatic.com/firebasejs/12.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.13.0/firebase-messaging-compat.js');

firebase.initializeApp({
  // Same config you passed to NotificationKit.init()
});

const messaging = firebase.messaging();
```

See [Platform Setup](../guides/platform-setup.md) for iOS/Android steps.

## A note on sending push

This example **receives** and displays notifications. It does not send push — that is a server-side job using Firebase's Admin API and a secret key that must never ship in client code. Send the device token (from `getToken()`) to your backend, and trigger pushes from there.

## Next steps

- [Notification Types](../guides/notification-types.md)
- [React Hooks](../api/react-hooks.md)
- [Troubleshooting](../guides/troubleshooting.md)
