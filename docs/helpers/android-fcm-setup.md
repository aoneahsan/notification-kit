# Android FCM Setup Guide

## Overview

This guide walks you through setting up Firebase Cloud Messaging (FCM) for Android push notifications. FCM is Google's free service for sending notifications to Android devices.

## Prerequisites

- Firebase project created (see [Firebase Setup Guide](./firebase-setup.md))
- Android app package name (e.g., `com.example.myapp`)
- Android Studio installed (for testing)

## Step 1: Add Android App to Firebase

### 1.1 Register Your App

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click "Add app" or the Android icon
4. Enter your Android package name:
   ```
   Package name: com.example.myapp
   ```
   **Important**: This must match your app's package name exactly

5. (Optional) Add app nickname
6. (Optional) Add SHA-1 certificate (required for certain features)
7. Click "Register app"

### 1.2 Download Configuration File

1. Download `google-services.json`
2. **Security**: Store this file securely
3. **Never commit to version control**

## Step 2: Configure with notification-kit

### Using Runtime Configuration (Recommended)

```typescript
// Initialize notification-kit with Firebase config
await NotificationKit.init({
  provider: 'firebase',
  config: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  }
});
```

### Traditional Setup (If Required)

If you must use the traditional setup:

1. Place `google-services.json` in:
   ```
   android/app/google-services.json
   ```

2. Add to `.gitignore`:
   ```
   android/app/google-services.json
   ```

## Step 3: Gradle Configuration

### 3.1 Project-level build.gradle

In `android/build.gradle`:

```gradle
buildscript {
    dependencies {
        // Add this line
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

### 3.2 App-level build.gradle

In `android/app/build.gradle`:

```gradle
// Add at the bottom
apply plugin: 'com.google.gms.google-services'

dependencies {
    // Firebase dependencies are handled by Capacitor
    implementation platform('com.google.firebase:firebase-bom:32.7.0')
    implementation 'com.google.firebase:firebase-messaging'
}
```

## Step 4: Android Manifest Configuration

### 4.1 Permissions

In `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

### 4.2 FCM Service (Optional)

For custom notification handling:

```xml
<service
    android:name=".MyFirebaseMessagingService"
    android:exported="false">
    <intent-filter>
        <action android:name="com.google.firebase.MESSAGING_EVENT" />
    </intent-filter>
</service>
```

### 4.3 Default Notification Icon

```xml
<meta-data
    android:name="com.google.firebase.messaging.default_notification_icon"
    android:resource="@drawable/ic_notification" />
    
<meta-data
    android:name="com.google.firebase.messaging.default_notification_color"
    android:resource="@color/colorAccent" />
```

## Step 5: Notification Channels (Android 8+)

### Create Default Channel

```typescript
// In your app initialization
await notifications.createChannel({
  id: 'default',
  name: 'Default Notifications',
  description: 'General app notifications',
  importance: 4, // HIGH
  sound: 'default',
  vibration: true,
  lights: true
});
```

### Channel Categories

Common channel configurations:

```typescript
// High priority - makes sound, shows everywhere
await notifications.createChannel({
  id: 'alerts',
  name: 'Alerts',
  importance: 4
});

// Default priority - makes sound
await notifications.createChannel({
  id: 'messages',
  name: 'Messages',
  importance: 3
});

// Low priority - no sound
await notifications.createChannel({
  id: 'updates',
  name: 'Updates',
  importance: 2
});
```

## Step 6: Testing FCM Setup

### 6.1 Get FCM Token

```typescript
const token = await notifications.getToken();
console.log('FCM Token:', token);
```

### 6.2 Send Test Message

1. Go to Firebase Console > Cloud Messaging
2. Click "Send your first message"
3. Enter notification details:
   - Title: "Test Notification"
   - Text: "This is a test"
4. Select "Send test message"
5. Paste your FCM token
6. Click "Test"

### 6.3 Using Firebase Admin SDK

For server-side testing:

```javascript
const admin = require('firebase-admin');

// Initialize admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Send message
const message = {
  notification: {
    title: 'Test Notification',
    body: 'This is a test message'
  },
  token: fcmToken
};

admin.messaging().send(message)
  .then(response => console.log('Successfully sent:', response))
  .catch(error => console.log('Error sending:', error));
```

## Step 7: Handle Notification Icons

### Create Notification Icons

1. Use Android Studio's Image Asset Studio:
   - Right-click `res` folder
   - New > Image Asset
   - Icon Type: Notification Icons
   - Create icons for different densities

2. Icon requirements:
   - Must be white on transparent
   - Simple design (will be tinted)
   - Multiple sizes: 24x24, 36x36, 48x48, 72x72, 96x96

### Icon Files Structure

```
android/app/src/main/res/
├── drawable-mdpi/
│   └── ic_notification.png (24x24)
├── drawable-hdpi/
│   └── ic_notification.png (36x36)
├── drawable-xhdpi/
│   └── ic_notification.png (48x48)
├── drawable-xxhdpi/
│   └── ic_notification.png (72x72)
└── drawable-xxxhdpi/
    └── ic_notification.png (96x96)
```

## Step 8: Advanced Configuration

### Data-Only Messages

For background processing:

```typescript
// Server-side
const message = {
  data: {
    type: 'sync',
    action: 'update_cache'
  },
  // No notification block - won't show UI
  token: fcmToken
};
```

### Priority and TTL

```typescript
const message = {
  notification: {
    title: 'Urgent',
    body: 'Time-sensitive message'
  },
  android: {
    priority: 'high', // 'high' or 'normal'
    ttl: 3600 * 1000, // 1 hour in milliseconds
  },
  token: fcmToken
};
```

### Custom Sound

1. Add sound file to `android/app/src/main/res/raw/`
2. Reference in notification:

```typescript
const message = {
  notification: {
    title: 'Custom Sound',
    body: 'This has a custom sound'
  },
  android: {
    notification: {
      sound: 'custom_sound' // without file extension
    }
  },
  token: fcmToken
};
```

## Common Issues

### "Failed to get token" Error
- Check Google Play Services is installed
- Verify internet connection
- Ensure `google-services.json` is correct

### Notifications Not Showing
- Check notification permissions
- Verify channel importance is 3 or higher
- Test on physical device (not emulator)

### "Invalid registration" Error
- Token might be outdated
- App package name mismatch
- Firebase project mismatch

### Background Notifications
- Ensure app has necessary permissions
- Check battery optimization settings
- Some manufacturers restrict background activity

## Security Best Practices

1. **Never expose server keys**: Keep FCM server key secret
2. **Use environment variables**: Don't hardcode configuration
3. **Validate tokens**: Verify tokens server-side
4. **Implement token refresh**: Handle token updates
5. **Secure your backend**: Authenticate notification requests

## Android 13+ Permissions

For Android 13 (API 33) and above:

```typescript
// Request notification permission
if (Platform.isAndroid()) {
  const permission = await notifications.requestPermission();
  if (permission.granted) {
    console.log('Notification permission granted');
  }
}
```

## Next Steps

1. [Security Best Practices](../guides/security.md)
2. [Notification Channels Guide](../guides/notification-channels.md)
3. [Rich Media Notifications](../guides/rich-media.md)

## Useful Links

- [FCM Documentation](https://firebase.google.com/docs/cloud-messaging/android/client)
- [Android Notifications Guide](https://developer.android.com/guide/topics/ui/notifiers/notifications)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)