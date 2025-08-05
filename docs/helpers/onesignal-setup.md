# OneSignal Dashboard Setup Guide

## Overview

This guide walks you through creating and configuring a OneSignal app for use with notification-kit. OneSignal provides a feature-rich notification platform with a generous free tier.

## Prerequisites

- Email address for OneSignal account
- Your app's bundle ID (iOS) or package name (Android)
- Firebase Server Key (for Android push)
- Apple Push Certificate (for iOS push)

## Step 1: Create OneSignal Account

### 1.1 Sign Up

1. Go to [OneSignal.com](https://onesignal.com)
2. Click "Sign Up" or "Get Started"
3. Enter your email and create a password
4. Verify your email address

### 1.2 Initial Setup

1. Select your role (Developer, Product Manager, etc.)
2. Choose your primary goal with OneSignal
3. Complete the onboarding flow

## Step 2: Create New App

### 2.1 Add Your App

1. Click "New App/Website" in the dashboard
2. Enter your app name (e.g., "MyApp")
3. Select your organization (or create one)
4. Click "Next: Configure Your Platform"

### 2.2 Select Platforms

Choose the platforms you'll support:
- Web Push
- iOS (Apple Push Notification Service)
- Android (Firebase Cloud Messaging)

## Step 3: Platform Configuration

### Web Push Setup

1. Select "Web" platform
2. Choose your site setup:
   - **Typical Site**: For standard HTTPS websites
   - **WordPress**: For WordPress sites
   - **Custom Code**: For advanced setups

3. Enter site configuration:
   ```
   Site Name: My App
   Site URL: https://myapp.com
   ```

4. Choose permission prompt setup:
   - Slide Prompt (Recommended)
   - Native Browser Prompt
   - Custom Prompt

5. (Optional) Upload default icon (192x192px recommended)

6. **Important**: Note your OneSignal App ID

### iOS Setup

1. Select "Apple iOS" platform
2. Upload your Push Certificate (.p12 file):
   - See [iOS Push Certificate Guide](./ios-push-certificate.md)
   - Enter certificate password if required

3. (Optional) Configure additional settings:
   - Enable provisional authorization
   - Set up notification service extension

### Android Setup

1. Select "Google Android" platform
2. Enter your Firebase Server Key:
   - Get from Firebase Console > Project Settings > Cloud Messaging
   - See [Android FCM Setup Guide](./android-fcm-setup.md)

3. Enter your Firebase Sender ID

## Step 4: Retrieve Your Credentials

### App ID

1. Go to Settings > Keys & IDs
2. Copy your OneSignal App ID
3. Add to your `.env` file:

```bash
ONESIGNAL_APP_ID=your-onesignal-app-id
```

### REST API Key

1. In Settings > Keys & IDs
2. Copy your REST API Key
3. **Security**: Only use server-side, never in client code

```bash
# Server-only
ONESIGNAL_REST_API_KEY=your-rest-api-key
```

### Safari Web ID (Web Push on Safari)

If supporting Safari:
1. Find in Settings > Platforms > Web
2. Copy Safari Web ID

```bash
ONESIGNAL_SAFARI_WEB_ID=web.onesignal.auto.xxxxx
```

## Step 5: Configure Features

### Segmentation

1. Go to Audience > Segments
2. Create custom segments:
   - Premium Users
   - Geographic regions
   - User behavior

### Tags & User Properties

Set up data tags for targeting:

```typescript
// In your app
await notifications.setTags({
  subscription_type: 'premium',
  preferred_language: 'en',
  last_active: new Date().toISOString()
});
```

### Notification Templates

1. Go to Templates
2. Create reusable templates:
   - Welcome message
   - Order updates
   - Promotional content

## Step 6: Security Configuration

### Secure Your App

1. **API Key Security**:
   - Never expose REST API key in client code
   - Use environment variables
   - Implement server-side sending only

2. **Domain Restrictions** (Web):
   - Go to Settings > Platforms > Web
   - Add allowed domains
   - Enable HTTPS only

3. **User Authentication**:
   ```typescript
   // Set external user ID with hash
   const userId = 'user123';
   const hash = await generateHash(userId); // Your server generates this
   await notifications.setExternalUserId(userId, hash);
   ```

## Using with notification-kit

```typescript
import { NotificationKit } from 'notification-kit';

// Initialize with OneSignal
await NotificationKit.init({
  provider: 'onesignal',
  config: {
    appId: process.env.ONESIGNAL_APP_ID,
    // Optional: for Safari web push
    safariWebId: process.env.ONESIGNAL_SAFARI_WEB_ID,
    // Server-side only
    restApiKey: process.env.ONESIGNAL_REST_API_KEY
  }
});
```

## Testing Your Setup

### Send Test Notification

1. Go to Messages > New Push
2. Select your audience (test users)
3. Compose your message
4. Click "Send Message"

### Check Analytics

1. Go to Analytics > Overview
2. Monitor:
   - Delivery rates
   - Click rates
   - Opt-out rates

## Advanced Features

### A/B Testing

1. Create new message
2. Enable A/B testing
3. Create variants
4. Set success metrics

### Automation

1. Go to Messages > Automated
2. Create triggers:
   - User signup
   - Cart abandonment
   - Re-engagement

### In-App Messages

1. Go to Messages > In-App
2. Create in-app campaigns
3. Set display triggers

## Common Issues

### "Invalid App ID" Error
- Verify App ID in Settings > Keys & IDs
- Check for extra spaces or characters
- Ensure environment variable is loaded

### Notifications Not Received
- Check platform configuration
- Verify user subscriptions in Audience > All Users
- Review delivery reports

### iOS/Android Issues
- Verify certificates/keys are valid
- Check expiration dates
- Test with OneSignal dashboard first

## Best Practices

1. **Segment Your Users**: Don't blast everyone
2. **Personalize Content**: Use tags and user data
3. **Time Zones**: Send at appropriate times
4. **Frequency**: Avoid notification fatigue
5. **Rich Media**: Use images when relevant
6. **Analytics**: Monitor and optimize

## Next Steps

1. [Platform-specific setup](../guides/platform-setup.md)
2. [OneSignal Native Configuration](../guides/onesignal-native-setup.md)
3. [Security best practices](../guides/security.md)

## Useful Links

- [OneSignal Documentation](https://documentation.onesignal.com)
- [OneSignal API Reference](https://documentation.onesignal.com/reference)
- [OneSignal Status Page](https://status.onesignal.com)