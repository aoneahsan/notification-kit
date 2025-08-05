# OneSignal Native Platform Setup

## Overview

This guide explains how notification-kit handles OneSignal configuration securely for native platforms (iOS and Android) without hardcoding credentials in configuration files.

## How It Works

### Security-First Approach

Unlike traditional OneSignal setup guides that recommend adding your App ID to Info.plist (iOS) or AndroidManifest.xml (Android), notification-kit uses a **runtime configuration approach**:

1. **No Hardcoded Credentials**: App IDs and API keys are never stored in static configuration files
2. **Runtime Injection**: Configuration is provided at runtime through environment variables
3. **Native Bridge**: A secure bridge handles native SDK initialization programmatically

### Architecture

```
┌─────────────────────────┐
│   Your App Code         │
│ NotificationKit.init()  │
└───────────┬─────────────┘
            │
┌───────────▼─────────────┐
│  OneSignalProvider      │
│ (Detects Platform)      │
└───────────┬─────────────┘
            │
    ┌───────┴───────┐
    │               │
┌───▼────┐    ┌────▼──────┐
│  Web   │    │  Native   │
│(react- │    │ (Bridge)  │
│signal) │    └────┬──────┘
└────────┘         │
            ┌──────▼──────┐
            │ OneSignal   │
            │Native SDK   │
            │(iOS/Android)│
            └─────────────┘
```

## Implementation Details

### 1. JavaScript/TypeScript Layer

Your app initializes notification-kit with OneSignal configuration:

```typescript
import { NotificationKit } from 'notification-kit';

// Configuration from environment variables
NotificationKit.init({
  provider: 'onesignal',
  config: {
    appId: process.env.ONESIGNAL_APP_ID,
    restApiKey: process.env.ONESIGNAL_REST_API_KEY,
    // Other configuration options
  }
});
```

### 2. Provider Detection

The OneSignalProvider automatically detects the platform:
- **Web**: Uses `react-onesignal` package
- **Native**: Uses OneSignalNativeBridge for iOS/Android

### 3. Native Bridge

For native platforms, the OneSignalNativeBridge:
1. Receives configuration at runtime
2. Initializes OneSignal SDK programmatically
3. Does NOT require Info.plist or AndroidManifest.xml entries

## Native SDK Integration

### iOS Implementation

Instead of adding to Info.plist:
```xml
<!-- DON'T DO THIS -->
<key>OneSignal_app_id</key>
<string>YOUR_APP_ID</string>
```

The native bridge programmatically initializes OneSignal:
```swift
// This happens internally when you call NotificationKit.init()
OneSignal.initWithLaunchOptions(
    launchOptions,
    appId: runtimeConfig.appId // Provided at runtime
)
```

### Android Implementation

Instead of adding to AndroidManifest.xml:
```xml
<!-- DON'T DO THIS -->
<meta-data
    android:name="onesignal_app_id"
    android:value="YOUR_APP_ID" />
```

The native bridge programmatically initializes OneSignal:
```java
// This happens internally when you call NotificationKit.init()
OneSignal.initWithContext(
    context,
    runtimeConfig.getAppId() // Provided at runtime
);
```

## Capacitor Plugin Requirement

For this approach to work in a Capacitor app, you need the OneSignal Capacitor plugin that supports programmatic initialization. The official OneSignal SDK documentation provides guidance on this approach.

### Installation

```bash
# Install the OneSignal Capacitor plugin
npm install onesignal-cordova-plugin
npm install @capacitor/push-notifications
npx cap sync
```

### Custom Capacitor Plugin (If Needed)

If the official plugin doesn't support runtime configuration, you can create a custom Capacitor plugin:

```typescript
// capacitor-onesignal-bridge/src/index.ts
import { registerPlugin } from '@capacitor/core';

export interface OneSignalBridgePlugin {
  initialize(options: { appId: string }): Promise<void>;
}

const OneSignalBridge = registerPlugin<OneSignalBridgePlugin>('OneSignalBridge', {
  web: () => import('./web').then(m => new m.OneSignalBridgeWeb()),
});

export { OneSignalBridge };
```

## Environment Configuration

### Development

Create a `.env` file (never commit this):
```bash
ONESIGNAL_APP_ID=your-development-app-id
ONESIGNAL_REST_API_KEY=your-development-rest-api-key
```

### Production

Use your deployment platform's secret management:
- **Vercel**: Environment Variables in project settings
- **AWS**: Secrets Manager or Parameter Store
- **Google Cloud**: Secret Manager
- **Azure**: Key Vault

### CI/CD

Configure secrets in your CI/CD pipeline:
```yaml
# GitHub Actions example
env:
  ONESIGNAL_APP_ID: ${{ secrets.ONESIGNAL_APP_ID }}
  ONESIGNAL_REST_API_KEY: ${{ secrets.ONESIGNAL_REST_API_KEY }}
```

## Security Benefits

1. **No Credential Exposure**: App IDs are never in your git repository
2. **Environment-Specific Config**: Different credentials for dev/staging/prod
3. **Rotation Support**: Easy to rotate credentials without code changes
4. **Compliance**: Meets security audit requirements

## Troubleshooting

### OneSignal Not Initializing

1. Check environment variables are loaded:
```typescript
console.log('App ID exists:', !!process.env.ONESIGNAL_APP_ID);
```

2. Verify native bridge initialization:
```typescript
import { OneSignalNativeBridge } from 'notification-kit/providers';
console.log('Native initialized:', OneSignalNativeBridge.isNativeInitialized());
```

### iOS Specific Issues

- Ensure push notification capability is enabled in Xcode
- Verify provisioning profile includes push notifications
- Check that the OneSignal SDK is properly linked

### Android Specific Issues

- Verify google-services.json is present (for FCM)
- Check ProGuard rules if using code obfuscation
- Ensure minimum SDK version is compatible

## Migration from Traditional Setup

If you're migrating from a traditional OneSignal setup:

1. **Remove hardcoded values** from Info.plist and AndroidManifest.xml
2. **Update initialization** to use notification-kit
3. **Configure environment variables** in your build system
4. **Test thoroughly** on both platforms

## Next Steps

- Review [Security Best Practices](./platform-setup.md#security-best-practices)
- Learn about [Provider Configuration](./providers.md)
- Implement [Push Notifications](./push-notifications.md)