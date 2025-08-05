# VAPID Keys Guide

## What are VAPID Keys?

VAPID (Voluntary Application Server Identification) keys are used for Web Push notifications to identify your application server to push services. They provide a way to authenticate your server without requiring additional backend infrastructure.

## Why Do You Need VAPID Keys?

- **Authentication**: Proves your server owns the push subscription
- **Security**: Prevents unauthorized servers from sending notifications
- **Required for Web Push**: Modern browsers require VAPID keys for push notifications

## Generating VAPID Keys in Firebase Console

### Step 1: Access Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click the gear icon ⚙️ and select "Project settings"

### Step 2: Navigate to Cloud Messaging

1. Click on the "Cloud Messaging" tab
2. Scroll down to "Web configuration" section

### Step 3: Generate Web Push Certificate

1. Under "Web Push certificates", click "Generate key pair"
2. Firebase will generate a VAPID key pair
3. Copy the displayed key (this is your public VAPID key)

### Step 4: Store Your VAPID Key Securely

```bash
# Add to your .env file
FIREBASE_VAPID_KEY=BNs...your-long-vapid-key...
```

## Using VAPID Keys with notification-kit

```typescript
import { NotificationKit } from 'notification-kit';

NotificationKit.init({
  provider: 'firebase',
  config: {
    // Other Firebase config...
    vapidKey: process.env.FIREBASE_VAPID_KEY // Required for web push
  }
});
```

## Alternative: Generate VAPID Keys Locally

If you prefer to generate keys locally:

### Using Node.js

```bash
npm install -g web-push
web-push generate-vapid-keys
```

This will output:
```
=======================================
Public Key:
BNs...your-public-key...

Private Key:
p2s...your-private-key...
=======================================
```

### Using Online Tools

⚠️ **Security Warning**: Only use trusted tools and never share your private key

- [VAPID Key Generator by web-push-libs](https://vapidkeys.com/)
- Generate keys in your browser (runs locally)

## Important Security Notes

1. **Public Key**: Can be safely used in client-side code
2. **Private Key**: Must be kept secret (server-side only)
3. **Never commit VAPID keys**: Always use environment variables
4. **Rotate regularly**: Consider rotating keys periodically

## Platform-Specific Notes

### Web
- VAPID key is required for web push notifications
- Used in the service worker configuration

### iOS/Android
- VAPID keys are not used for native push notifications
- Native platforms use their own authentication methods:
  - iOS: APNS certificates or tokens
  - Android: FCM server key

## Troubleshooting

### "Invalid VAPID key" Error
- Ensure you're using the public key (not private)
- Check for extra spaces or line breaks
- Verify the key format (should start with 'B')

### Push Notifications Not Working
- Confirm VAPID key is correctly set in environment
- Check browser console for errors
- Verify service worker is registered

## Example: Complete Web Push Setup

```typescript
// 1. Environment configuration
// .env
FIREBASE_VAPID_KEY=BNsT...your-key...

// 2. Initialize notification-kit
import { NotificationKit } from 'notification-kit';

async function setupNotifications() {
  await NotificationKit.init({
    provider: 'firebase',
    config: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      vapidKey: process.env.FIREBASE_VAPID_KEY // ← Required for web
    }
  });
}

// 3. Your service worker will automatically use this configuration
```

## Related Documentation

- [Firebase Cloud Messaging Setup](./firebase-setup.md)
- [Web Push Notifications Guide](../guides/push-notifications.md)
- [Security Best Practices](../guides/security.md)