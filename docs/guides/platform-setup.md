# Platform Setup Guide

## Overview

notification-kit works across Web, iOS, and Android platforms. Each platform requires specific configuration for push notifications to work properly.

## iOS Setup

### 1. Enable Push Notifications Capability

In Xcode:
1. Open your `.xcworkspace` file
2. Select your app target
3. Go to "Signing & Capabilities"
4. Click "+" and add "Push Notifications"
5. Add "Background Modes" and check "Remote notifications"

### 2. Configure Info.plist

Add the following to your `ios/App/App/Info.plist`:

```xml
<key>UIBackgroundModes</key>
<array>
  <string>fetch</string>
  <string>remote-notification</string>
</array>
```

### 3. Firebase Setup (if using Firebase)

1. Download `GoogleService-Info.plist` from Firebase Console
2. Add it to your Xcode project (drag into the App folder)
3. Ensure it's added to your app target

### 4. OneSignal Setup (if using OneSignal)

1. Add OneSignal App ID to Info.plist:
```xml
<key>OneSignal_app_id</key>
<string>YOUR_ONESIGNAL_APP_ID</string>
```

### 5. Request Authorization

notification-kit handles this automatically, but you can customize the request:

```typescript
import { notifications } from 'notification-kit';

// Custom permission request
const granted = await notifications.requestPermission();
```

### 6. iOS-Specific Features

#### Provisional Authorization (iOS 12+)

```typescript
// Request provisional authorization
const granted = await notifications.requestPermission({
  provisional: true // iOS only
});
```

#### Critical Alerts

```typescript
// Request critical alert permission (requires special entitlement)
const granted = await notifications.requestPermission({
  criticalAlert: true // iOS only
});
```

## Android Setup

### 1. Firebase Setup (if using Firebase)

1. Download `google-services.json` from Firebase Console
2. Place it in `android/app/`
3. Update `android/build.gradle`:

```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

4. Update `android/app/build.gradle`:

```gradle
apply plugin: 'com.google.gms.google-services'

dependencies {
    implementation 'com.google.firebase:firebase-messaging:23.3.1'
}
```

### 2. OneSignal Setup (if using OneSignal)

1. Update `android/app/build.gradle`:

```gradle
dependencies {
    implementation 'com.onesignal:OneSignal:4.8.6'
}
```

2. Add to `AndroidManifest.xml`:

```xml
<meta-data
    android:name="com.onesignal.NotificationOpened.DEFAULT"
    android:value="DISABLE" />
```

### 3. Configure AndroidManifest.xml

Add permissions:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

### 4. Notification Channels (Android 8+)

notification-kit automatically creates a default channel, but you can create custom channels:

```typescript
import { notifications } from 'notification-kit';

// Create custom notification channel
await notifications.createChannel({
  id: 'important',
  name: 'Important Notifications',
  description: 'Urgent app notifications',
  importance: 'high',
  sound: 'notification_sound.mp3',
  vibration: true,
  lights: true,
  lightColor: '#FF0000'
});
```

### 5. Android-Specific Features

#### Notification Icons

Place notification icons in `android/app/src/main/res/drawable/`:
- `ic_notification.png` - Small icon (must be white with transparency)
- `ic_notification_large.png` - Large icon (optional)

#### Custom Sounds

Place sound files in `android/app/src/main/res/raw/`:
- `notification_sound.mp3`

## Web Setup

### 1. Service Worker

notification-kit automatically registers a service worker, but you can provide a custom one:

```typescript
NotificationKit.init({
  provider: 'firebase',
  config: firebaseConfig,
  serviceWorkerPath: '/sw.js'
});
```

### 2. Firebase Setup (if using Firebase)

Create a `public/firebase-messaging-sw.js`:

```javascript
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'your-api-key',
  authDomain: 'your-auth-domain',
  projectId: 'your-project-id',
  storageBucket: 'your-storage-bucket',
  messagingSenderId: 'your-sender-id',
  appId: 'your-app-id'
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const { title, body, image } = payload.notification;
  
  self.registration.showNotification(title, {
    body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    image
  });
});
```

### 3. VAPID Key (Web Push)

1. Generate VAPID keys in Firebase Console
2. Add to your configuration:

```typescript
NotificationKit.init({
  provider: 'firebase',
  config: {
    ...firebaseConfig,
    vapidKey: 'YOUR_VAPID_KEY'
  }
});
```

### 4. HTTPS Requirement

Web push notifications require HTTPS. For local development:
- Use `localhost` (automatically uses HTTPS)
- Use a tool like `ngrok` for testing
- Use a local HTTPS certificate

### 5. Web-Specific Features

#### Notification Actions

```typescript
await notifications.showWebNotification({
  title: 'New Message',
  body: 'You have a new message',
  actions: [
    { action: 'view', title: 'View' },
    { action: 'dismiss', title: 'Dismiss' }
  ]
});
```

#### Notification Badge

```typescript
await notifications.showWebNotification({
  title: 'Updates',
  body: '5 new updates',
  badge: '/badge-72x72.png'
});
```

## Common Setup Issues

### iOS Issues

1. **Push notifications not working in simulator**
   - Push notifications only work on real devices

2. **Missing entitlements**
   - Ensure Push Notifications capability is added in Xcode

3. **Invalid provisioning profile**
   - Regenerate provisioning profile with push notification capability

### Android Issues

1. **google-services.json not found**
   - Ensure the file is in `android/app/` directory

2. **Notification icon not showing**
   - Android requires white icons with transparency
   - Use Android Asset Studio to generate proper icons

3. **Notifications not showing when app is killed**
   - Some device manufacturers restrict background services
   - Add app to battery optimization exceptions

### Web Issues

1. **Service worker registration failed**
   - Ensure HTTPS is enabled
   - Check service worker path is correct

2. **Permission denied**
   - User must explicitly grant permission
   - Cannot request permission again if denied

3. **Notifications not showing**
   - Check browser notification settings
   - Ensure service worker is registered

## Testing Push Notifications

### iOS Testing

1. Use real device (not simulator)
2. Use development/production APNS certificates
3. Test with Xcode console for debugging

### Android Testing

1. Use Firebase Console test message feature
2. Check logcat for debugging:
   ```bash
   adb logcat | grep -i notification
   ```

### Web Testing

1. Use Chrome DevTools > Application > Service Workers
2. Test with Firebase Console
3. Check browser console for errors

## Next Steps

- Learn about [notification types](./notification-types.md)
- Configure [notification providers](./providers.md)
- Implement [push notifications](./push-notifications.md)