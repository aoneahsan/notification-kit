# AI Integration Guide - notification-kit

Quick reference for AI development agents (Claude Code, Cursor, Copilot, etc.) to integrate notification-kit into React + Capacitor projects.

## Installation

```bash
yarn add notification-kit
```

### With Firebase (Recommended)
```bash
yarn add notification-kit firebase @capacitor/push-notifications @capacitor/local-notifications
```

### With OneSignal
```bash
yarn add notification-kit react-onesignal @capacitor/push-notifications @capacitor/local-notifications
```

## Core Concepts

notification-kit provides a unified API for:
1. **Push Notifications** - Firebase or OneSignal backend
2. **Local Notifications** - Scheduled/triggered notifications
3. **In-App Notifications** - Toast-style notifications

## Quick Start

### Initialize with Firebase

```typescript
import NotificationKit from 'notification-kit';

await NotificationKit.getInstance().init({
  provider: 'firebase',
  config: {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    vapidKey: process.env.VITE_FIREBASE_VAPID_KEY, // For web push
  },
});
```

### Initialize with OneSignal

```typescript
import NotificationKit from 'notification-kit';

await NotificationKit.getInstance().init({
  provider: 'onesignal',
  config: {
    appId: process.env.VITE_ONESIGNAL_APP_ID,
  },
});
```

### Quick Start Helper

```typescript
import { quickStart } from 'notification-kit';

// Initialize Firebase
await quickStart.initFirebase({
  apiKey: '...',
  authDomain: '...',
  projectId: '...',
  // ... rest of config
});

// Request permissions and get token
const { granted, token } = await quickStart.setup();

// Show notifications
quickStart.success('Success!', 'Operation completed');
quickStart.error('Error', 'Something went wrong');
quickStart.warning('Warning', 'Please check this');
quickStart.info('Info', 'FYI message');
```

## API Reference

### Main Exports

```typescript
import NotificationKit, {
  notifications,
  quickStart,
  platform,
  permissions,
  inApp,
} from 'notification-kit';
```

### Core Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `NotificationKit.getInstance()` | Get singleton instance | `NotificationKit` |
| `init(config)` | Initialize with provider | `Promise<boolean>` |
| `requestPermission()` | Request notification permission | `Promise<boolean>` |
| `getToken()` | Get push notification token | `Promise<string>` |
| `subscribe(topic)` | Subscribe to topic | `Promise<void>` |
| `unsubscribe(topic)` | Unsubscribe from topic | `Promise<void>` |

### notifications Object

```typescript
import { notifications } from 'notification-kit';

// In-app notifications
notifications.success(title, message);
notifications.error(title, message);
notifications.warning(title, message);
notifications.info(title, message);

// Push notification events
notifications.onPush((notification) => { /* handle */ });
notifications.onPushOpened((notification) => { /* handle */ });

// Local notifications
await notifications.schedule({
  id: 'reminder-1',
  title: 'Reminder',
  body: 'Time to check the app!',
  at: new Date(Date.now() + 3600000), // 1 hour from now
});

await notifications.cancel('reminder-1');
await notifications.cancelAll();
const pending = await notifications.getPending();
```

### In-App Notifications

```typescript
import { inApp, showInAppNotification } from 'notification-kit';

// Simple toast notifications
inApp.success('Done!', 'Task completed');
inApp.error('Failed', 'Please try again');
inApp.warning('Caution', 'Low storage');
inApp.info('Tip', 'Double-click to edit');

// Advanced in-app notification
showInAppNotification({
  type: 'success',
  title: 'Order Placed',
  message: 'Your order #12345 has been confirmed',
  duration: 5000,
  position: 'top-right',
  actions: [
    { label: 'View Order', onClick: () => navigate('/orders/12345') },
    { label: 'Dismiss' },
  ],
});

// Dismiss notifications
dismissInAppNotification(notificationId);
dismissAllInAppNotifications();
```

### Local Notifications with Scheduling

```typescript
import { notifications } from 'notification-kit';

// Schedule at a specific time (one-time)
await notifications.schedule({
  id: 'meeting',
  title: 'Meeting Reminder',
  body: 'Team standup in 15 minutes',
  at: new Date('2026-01-21T09:45:00'),
});

// Recurring notification (every day at 09:00)
await notifications.schedule({
  id: 'daily-reminder',
  title: 'Daily Check-in',
  body: 'Time for your daily review',
  every: 'day',
  on: { hour: 9, minute: 0 },
});

// Weekly notification (Mondays at 10:00)
await notifications.schedule({
  id: 'weekly-report',
  title: 'Weekly Report',
  body: 'Review your weekly stats',
  on: { weekday: 1, hour: 10, minute: 0 }, // 1 = Monday
});
```

### Android Notification Channels

```typescript
import { notifications } from 'notification-kit';

// Create channel (Android 8+)
await notifications.createChannel({
  id: 'promotions',
  name: 'Promotions',
  description: 'Promotional offers and deals',
  importance: 'default',
  sound: 'default',
  vibration: true,
});

// Schedule with channel
await notifications.schedule({
  id: 'promo-1',
  title: 'Special Offer!',
  body: '50% off today only',
  channelId: 'promotions',
  at: new Date(),
});
```

## React Integration

```typescript
import { useNotifications, useInAppNotification } from 'notification-kit/react';

function MyComponent() {
  const {
    isPermissionGranted,
    token,
    requestPermission,
    subscribe,
    unsubscribe,
  } = useNotifications();

  const { success } = useInAppNotification();

  const handleEnable = async () => {
    const granted = await requestPermission();
    if (granted) {
      success('Enabled!', 'Push notifications are now active');
      await subscribe('news');
    }
  };

  return (
    <button onClick={handleEnable}>
      {isPermissionGranted ? 'Notifications On' : 'Enable Notifications'}
    </button>
  );
}
```

## Platform Detection

```typescript
import { platform } from 'notification-kit';

const info = platform.detect();
// { platform: 'ios' | 'android' | 'web', isCapacitor: boolean, ... }

const capabilities = platform.getCapabilities();
// { pushNotifications: true, localNotifications: true, ... }
```

## Event Listeners

```typescript
import { notifications } from 'notification-kit';

// Push notification received (foreground). Returns an unsubscribe function.
const offPush = notifications.onPush((payload) => {
  console.log('Push received:', payload);
});

// Notification opened / action performed (user tapped).
const offOpened = notifications.onPushOpened((notification) => {
  console.log('Notification opened:', notification);
  // Navigate to the relevant screen
});

// Token refreshed — send the new token to your backend.
const offToken = notifications.on('tokenRefreshed', (event) => {
  console.log('New token:', event.token);
});

// Permission changed.
const offPermission = notifications.on('permissionChanged', (event) => {
  console.log('Permission:', event.status);
});

// Call the returned functions to stop listening:
// offPush(); offOpened(); offToken(); offPermission();
```

> Valid `on(...)` event keys: `notificationReceived`, `notificationActionPerformed`,
> `tokenReceived`, `tokenRefreshed`, `permissionChanged`. Use the `onPush` /
> `onPushOpened` helpers above for the common push cases.

## Platform Setup

### iOS (Info.plist)

```xml
<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
</array>
```

### Android (AndroidManifest.xml)

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
```

### Web (Service Worker)

Create `public/firebase-messaging-sw.js`:
```javascript
importScripts('https://www.gstatic.com/firebasejs/12.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.13.0/firebase-messaging-compat.js');

firebase.initializeApp({
  // Your Firebase config
});

const messaging = firebase.messaging();
```

## Common Patterns

### Request Permission on User Action

```typescript
// Don't request on app start - wait for user action
const handleNotificationSetup = async () => {
  const { granted, token } = await quickStart.setup();
  if (granted && token) {
    await saveTokenToBackend(token);
    await notifications.subscribe('general');
  }
};
```

### Handle Deep Links from Notifications

```typescript
import { notifications } from 'notification-kit';

notifications.onPushOpened((notification) => {
  const data = notification?.data;
  if (data?.screen) {
    navigate(data.screen);
  }
});
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No permission prompt | Check if already denied in system settings |
| Token null | Ensure init() completed and permission granted |
| Notifications not showing | Check channel importance (Android), check foreground handling |
| Web push not working | Verify service worker and VAPID key |

## Links

- [Full Documentation](./docs/)
- [Examples](./docs/examples/)
- [Platform Setup Guide](./docs/guides/platform-setup.md)
- [Troubleshooting](./docs/guides/troubleshooting.md)
