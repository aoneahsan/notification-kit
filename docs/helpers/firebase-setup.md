# Firebase Project Setup Guide

## Overview

This guide walks you through creating and configuring a Firebase project for use with notification-kit. Firebase provides free push notification services through Firebase Cloud Messaging (FCM).

## Prerequisites

- Google account
- Basic understanding of push notifications
- Your app's bundle ID (iOS) or package name (Android)

## Step 1: Create Firebase Project

### 1.1 Access Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Sign in with your Google account

### 1.2 Create New Project

1. Click "Create a project" or "Add project"
2. Enter your project name (e.g., "MyApp Notifications")
3. (Optional) Edit the project ID if needed
4. Click "Continue"

### 1.3 Configure Google Analytics (Optional)

1. Toggle Google Analytics on/off based on your needs
2. If enabled, select or create an Analytics account
3. Click "Create project"

## Step 2: Add Your App to Firebase

### For Web Applications

1. In Firebase Console, click the Web icon (</>) 
2. Register your app:
   - App nickname: "MyApp Web"
   - (Optional) Check "Also set up Firebase Hosting"
3. Click "Register app"
4. **Important**: Copy the configuration object:

```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

5. Save these values to your `.env` file:

```bash
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-auth-domain
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-storage-bucket
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
```

### For iOS Applications

1. Click "Add app" > iOS icon
2. Enter your iOS bundle ID (e.g., `com.example.myapp`)
3. (Optional) Add app nickname and App Store ID
4. Click "Register app"
5. Download `GoogleService-Info.plist`
6. **Security Note**: Do NOT commit this file to version control

### For Android Applications

1. Click "Add app" > Android icon
2. Enter your Android package name (e.g., `com.example.myapp`)
3. (Optional) Add app nickname
4. Click "Register app"
5. Download `google-services.json`
6. **Security Note**: Do NOT commit this file to version control

## Step 3: Enable Cloud Messaging

1. In Firebase Console, go to Project Settings (gear icon)
2. Click "Cloud Messaging" tab
3. Ensure Cloud Messaging API is enabled:
   - If you see "Cloud Messaging API (Legacy) Disabled", click the three dots
   - Select "Manage API in Google Cloud Console"
   - Click "Enable"

## Step 4: Generate Web Push Certificate (VAPID Key)

1. In Cloud Messaging settings, find "Web configuration"
2. Under "Web Push certificates", click "Generate key pair"
3. Copy the generated key
4. Add to your `.env` file:

```bash
FIREBASE_VAPID_KEY=your-vapid-key
```

See [VAPID Keys Guide](./vapid-keys.md) for more details.

## Step 5: Configure Server Key (Optional)

For server-side operations:

1. In Cloud Messaging settings, find "Project credentials"
2. Copy the "Server key" (legacy) or use Firebase Admin SDK
3. **Never expose this key in client-side code**

## Step 6: Set Up Authentication (Recommended)

For secure notifications:

1. Go to "Authentication" in Firebase Console
2. Click "Get started"
3. Enable your preferred sign-in methods
4. Configure authorized domains

## Security Configuration

### API Key Restrictions

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your Firebase project
3. Go to "APIs & Services" > "Credentials"
4. Click on your API key
5. Set application restrictions:
   - **For Web**: HTTP referrers (add your domains)
   - **For iOS**: iOS apps (add bundle IDs)
   - **For Android**: Android apps (add package names)

### Firebase Security Rules

If using Firestore or Realtime Database:

```javascript
// Firestore rules example
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Notification tokens collection
    match /tokens/{tokenId} {
      allow write: if request.auth != null;
      allow read: if false; // Only server should read
    }
  }
}
```

## Using with notification-kit

```typescript
import { NotificationKit } from 'notification-kit';

// Initialize with your Firebase config
await NotificationKit.init({
  provider: 'firebase',
  config: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    vapidKey: process.env.FIREBASE_VAPID_KEY // Web only
  }
});
```

## Common Issues

### "No Firebase App" Error
- Ensure all required config fields are provided
- Check for typos in environment variables

### "Permission Denied" Error
- Verify API key restrictions
- Check Firebase security rules
- Ensure authentication is set up correctly

### Push Notifications Not Received
- Verify Cloud Messaging is enabled
- Check VAPID key for web platforms
- Ensure proper certificates for iOS

## Next Steps

1. [Platform-specific setup](../guides/platform-setup.md)
2. [Security best practices](../guides/security.md)
3. [Testing notifications](../guides/troubleshooting.md)

## Useful Links

- [Firebase Documentation](https://firebase.google.com/docs)
- [FCM Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Firebase Status Dashboard](https://status.firebase.google.com)