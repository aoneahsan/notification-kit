# Notification Providers Guide

## Overview

notification-kit supports two major push notification providers:
- **Firebase Cloud Messaging (FCM)** - Google's free push notification service
- **OneSignal** - Feature-rich notification platform with advanced targeting

## Provider Comparison

| Feature | Firebase | OneSignal |
|---------|----------|----------|
| **Cost** | Free (with limits) | Free tier + paid plans |
| **Setup Complexity** | Moderate | Simple |
| **Analytics** | Basic | Advanced |
| **Segmentation** | Basic | Advanced |
| **A/B Testing** | Limited | Built-in |
| **Automation** | Cloud Functions | Built-in |
| **Rich Media** | Supported | Enhanced support |
| **In-App Messages** | Separate product | Integrated |
| **Web Push** | Supported | Supported |
| **iOS/Android** | Supported | Supported |
| **API Access** | Full | Full |
| **Dashboard** | Firebase Console | OneSignal Dashboard |

## Firebase Provider

### When to Use Firebase

- You're already using Firebase services
- You need a free solution
- You want full control over your infrastructure
- You're building a simple notification system
- You need tight integration with other Google services

### Firebase Setup

#### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create Project"
3. Follow the setup wizard

#### 2. Add Your App

**Web:**
1. Click "Add app" > Web icon
2. Register your app
3. Copy the configuration

**iOS:**
1. Click "Add app" > iOS icon
2. Enter your bundle ID
3. Download `GoogleService-Info.plist`

**Android:**
1. Click "Add app" > Android icon
2. Enter your package name
3. Download `google-services.json`

#### 3. Enable Cloud Messaging

1. Go to Project Settings > Cloud Messaging
2. Enable Cloud Messaging API
3. Generate Web Push certificates (for web)

#### 4. Configure notification-kit

```typescript
import { NotificationKit } from 'notification-kit';

NotificationKit.init({
  provider: 'firebase',
  config: {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id",
    vapidKey: "your-vapid-key" // For web push
  }
});
```

### Firebase Features

#### Topic Messaging

```typescript
// Subscribe to topics
await notifications.subscribe('news');
await notifications.subscribe('sports');

// Unsubscribe
await notifications.unsubscribe('news');
```

#### Data Messages

```typescript
// Send data with notifications
const message = {
  notification: {
    title: 'New Order',
    body: 'You have a new order #1234'
  },
  data: {
    orderId: '1234',
    type: 'new_order'
  }
};
```

#### Conditional Sending

```typescript
// Server-side: Send to specific conditions
const condition = "'stock-GOOG' in topics || 'industry-tech' in topics";
```

## OneSignal Provider

### When to Use OneSignal

- You need advanced analytics and segmentation
- You want built-in A/B testing
- You need automated messaging
- You want an easy setup process
- You need advanced targeting options

### OneSignal Setup

#### 1. Create OneSignal App

1. Go to [OneSignal Dashboard](https://onesignal.com)
2. Click "New App/Website"
3. Enter app name
4. Select platforms

#### 2. Platform Configuration

**Web:**
1. Choose "Typical Site"
2. Enter site URL
3. Copy App ID

**iOS:**
1. Upload .p12 certificate
2. Enter bundle ID
3. Configure iOS settings

**Android:**
1. Enter Firebase Server Key
2. Enter Firebase Sender ID
3. Configure Android settings

#### 3. Configure notification-kit

```typescript
import { NotificationKit } from 'notification-kit';

NotificationKit.init({
  provider: 'onesignal',
  config: {
    appId: "your-onesignal-app-id",
    safariWebId: "web.onesignal.auto.xxxxx", // For Safari
    restApiKey: "your-rest-api-key" // For server operations
  }
});
```

### OneSignal Features

#### User Segmentation

```typescript
// Tag users for segmentation
await notifications.setTags({
  premium_user: true,
  interests: ['sports', 'technology'],
  last_purchase: '2024-01-15'
});

// Remove tags
await notifications.deleteTags(['old_tag']);
```

#### In-App Messages

```typescript
// Trigger in-app message
await notifications.triggerInAppMessage('welcome_message');
```

#### Email & SMS

```typescript
// Set email (if email is enabled)
await notifications.setEmail('user@example.com');

// Set SMS (if SMS is enabled)
await notifications.setSMSNumber('+1234567890');
```

## Provider Migration

### Migrating from Firebase to OneSignal

1. Export Firebase tokens
2. Import tokens to OneSignal
3. Update provider configuration:

```typescript
// Before (Firebase)
NotificationKit.init({
  provider: 'firebase',
  config: firebaseConfig
});

// After (OneSignal)
NotificationKit.init({
  provider: 'onesignal',
  config: oneSignalConfig
});
```

### Migrating from OneSignal to Firebase

1. Set up Firebase project
2. Implement server-side token management
3. Update provider configuration
4. Handle feature differences

## Provider-Specific Features

### Firebase-Only Features

- Firebase Analytics integration
- Cloud Functions triggers
- Firestore integration
- Firebase Authentication integration
- Remote Config integration

### OneSignal-Only Features

- Built-in A/B testing
- Automated messages
- Advanced analytics dashboard
- Email and SMS support
- In-app message campaigns
- Outcome tracking

## Best Practices

### Token Management

```typescript
// Handle token refresh
notifications.onTokenRefresh(async (newToken) => {
  // Send to your server
  await api.updateUserToken(newToken);
});
```

### Error Handling

```typescript
// Provider-specific error handling
try {
  await notifications.send(message);
} catch (error) {
  if (error.code === 'messaging/invalid-token') {
    // Handle invalid token
  } else if (error.code === 'OneSignal-404') {
    // Handle OneSignal error
  }
}
```

### Provider Abstraction

```typescript
// Use notification-kit's unified API
// Same code works with both providers
const token = await notifications.getToken();
await notifications.subscribe('updates');
await notifications.showInApp({
  title: 'Welcome!',
  message: 'Thanks for using our app'
});
```

## Server-Side Integration

### Firebase Admin SDK

```javascript
// Node.js server
const admin = require('firebase-admin');

const message = {
  notification: {
    title: 'Server Notification',
    body: 'Sent from server'
  },
  token: userToken
};

await admin.messaging().send(message);
```

### OneSignal REST API

```javascript
// Node.js server
const OneSignal = require('onesignal-node');

const notification = {
  contents: { en: 'Server Notification' },
  include_player_ids: [playerId]
};

await client.createNotification(notification);
```

## Troubleshooting Providers

### Firebase Issues

1. **Invalid token errors**
   - Regenerate FCM token
   - Check server key configuration

2. **Messages not received**
   - Verify google-services.json/GoogleService-Info.plist
   - Check Firebase Console for errors

### OneSignal Issues

1. **Subscription not working**
   - Verify App ID is correct
   - Check platform configuration

2. **Tags not updating**
   - Ensure user is subscribed
   - Check REST API key permissions

## Next Steps

- Configure [push notifications](./push-notifications.md)
- Set up [platform-specific features](./platform-setup.md)
- Implement [notification events](./events.md)