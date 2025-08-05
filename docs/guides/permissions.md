# Permissions Guide

## Overview

Notification permissions are required for push and local notifications. notification-kit provides a unified API for managing permissions across platforms.

## Permission States

- **granted** - User has granted permission
- **denied** - User has denied permission
- **prompt** - User hasn't been asked yet

## Basic Permission Management

### Check Permission Status

```typescript
const status = await notifications.checkPermission();
console.log('Permission status:', status); // 'granted' | 'denied' | 'prompt'

// Convenience method
const isGranted = await notifications.isPermissionGranted();
console.log('Has permission:', isGranted); // true | false
```

### Request Permission

```typescript
const granted = await notifications.requestPermission();
if (granted) {
  console.log('Permission granted!');
} else {
  console.log('Permission denied');
}
```

## Platform-Specific Behavior

### iOS

- First request shows system dialog
- If denied, user must enable in Settings
- Supports provisional authorization (iOS 12+)

```typescript
// Request provisional permission (silent notifications)
const granted = await notifications.requestPermission({
  provisional: true
});
```

### Android

- Android 13+ requires permission dialog
- Android 12 and below auto-granted
- Notification channels affect visibility

```typescript
// Check Android version
if (platform === 'android' && androidVersion >= 33) {
  await notifications.requestPermission();
}
```

### Web

- Shows browser permission dialog
- HTTPS required
- One-time decision per origin

```typescript
// Web-specific permission handling
if (platform === 'web') {
  if (Notification.permission === 'default') {
    await notifications.requestPermission();
  }
}
```

## Best Practices

### 1. Explain Value First

```typescript
// Show explanation before requesting
async function setupNotifications() {
  const hasAsked = await storage.get('hasAskedPermission');
  
  if (!hasAsked) {
    const wantsNotifications = await showOnboardingDialog();
    
    if (wantsNotifications) {
      const granted = await notifications.requestPermission();
      await storage.set('hasAskedPermission', true);
    }
  }
}
```

### 2. Handle Denial Gracefully

```typescript
async function enableNotifications() {
  const status = await notifications.checkPermission();
  
  if (status === 'denied') {
    // Can't request again, guide to settings
    showSettingsPrompt();
  } else if (status === 'prompt') {
    // Can request
    await notifications.requestPermission();
  }
}
```

### 3. Progressive Disclosure

```typescript
// Request permission when needed
async function scheduleReminder() {
  const hasPermission = await notifications.isPermissionGranted();
  
  if (!hasPermission) {
    const granted = await notifications.requestPermission();
    if (!granted) return;
  }
  
  await notifications.schedule({
    title: 'Reminder',
    body: 'Your reminder is here'
  });
}
```

## Permission Events

```typescript
// Listen for permission changes
notifications.on('permissionChanged', (status) => {
  console.log('Permission changed to:', status);
  updateUI(status);
});
```

## Testing Permissions

### Reset Permissions (Development)

**Chrome:**
1. Click lock icon in address bar
2. Reset notification permission

**Safari:**
1. Preferences → Websites → Notifications
2. Remove site

**iOS Simulator:**
1. Settings → General → Reset
2. Reset Location & Privacy

**Android:**
1. App Info → Permissions
2. Toggle notifications

## Common Issues

### Permission Dialog Not Showing

1. Already denied - check status first
2. Not HTTPS on web
3. iOS simulator - use real device
4. Service worker not registered (web)

### Silent Failures

```typescript
// Always check result
const granted = await notifications.requestPermission();
if (!granted) {
  // Handle failure
  console.warn('Notifications not enabled');
}
```