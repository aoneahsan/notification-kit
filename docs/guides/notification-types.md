# Notification Types

## Overview

notification-kit supports three types of notifications:
- **Push Notifications** - Remote notifications from server
- **Local Notifications** - Scheduled device notifications
- **In-App Notifications** - Toast-style UI notifications

## Push Notifications

Remote notifications sent from your server through Firebase or OneSignal.

### Features
- Real-time delivery
- Background handling
- Rich media support
- Action buttons
- Deep linking

### Usage
```typescript
// Listen for push notifications
notifications.onPush((payload) => {
  console.log('Received:', payload);
});

// Handle notification taps
notifications.onPushOpened((payload) => {
  // Navigate to relevant screen
});
```

## Local Notifications

Notifications scheduled on the device without server involvement.

### Features
- Schedule for specific time
- Recurring notifications
- Cancel/update scheduled
- Works offline

### Usage
```typescript
// Schedule notification
await notifications.schedule({
  title: 'Reminder',
  body: 'Don\'t forget your meeting',
  at: new Date(Date.now() + 3600000) // 1 hour
});
```

## In-App Notifications

Toast-style notifications shown while app is active.

### Features
- No permissions required
- Customizable styling
- Multiple positions
- Action buttons

### Usage
```typescript
// Show success notification
await notifications.success('Saved successfully!');

// Custom notification
await notifications.showInApp({
  title: 'New Message',
  message: 'You have a new message',
  type: 'info',
  duration: 5000
});
```

## Choosing the Right Type

| Use Case | Notification Type |
|----------|------------------|
| Time-sensitive alerts | Push |
| Marketing messages | Push |
| Reminders | Local |
| Offline notifications | Local |
| Success/error feedback | In-App |
| Non-intrusive updates | In-App |

## Platform Support

| Type | Web | iOS | Android |
|------|-----|-----|---------|
| Push | ✅ | ✅ | ✅ |
| Local | ❌ | ✅ | ✅ |
| In-App | ✅ | ✅ | ✅ |