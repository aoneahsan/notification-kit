# iOS Push Certificate Setup Guide

## Overview

This guide explains how to create and configure Apple Push Notification service (APNs) certificates for iOS push notifications. You'll need this for both Firebase and OneSignal.

## Prerequisites

- Apple Developer Account ($99/year)
- macOS with Xcode installed
- Your app's Bundle ID

## Choose Your Method

Apple offers two authentication methods:

1. **Token-Based (Recommended)**: Modern, never expires
2. **Certificate-Based**: Traditional, expires yearly

## Method 1: Token-Based Authentication (P8 Key)

### Step 1: Create APNs Key

1. Log in to [Apple Developer Portal](https://developer.apple.com)
2. Go to Certificates, Identifiers & Profiles
3. Select "Keys" from the left menu
4. Click the "+" button to create a new key

### Step 2: Configure Key

1. Enter a key name (e.g., "Push Notifications Key")
2. Check "Apple Push Notifications service (APNs)"
3. Click "Continue"
4. Click "Register"

### Step 3: Download and Store Key

1. Click "Download" to get your .p8 file
2. **Important**: This can only be downloaded once!
3. Note your:
   - Key ID (10-character string)
   - Team ID (found in Membership section)

### Step 4: Secure Storage

```bash
# Store these securely - never commit to git
APNS_KEY_ID=your-key-id
APNS_TEAM_ID=your-team-id
APNS_KEY_FILE=path/to/AuthKey_XXXXXXXXXX.p8
```

## Method 2: Certificate-Based Authentication

### Step 1: Create Certificate Signing Request (CSR)

1. Open Keychain Access on macOS
2. Menu: Keychain Access > Certificate Assistant > Request a Certificate from a Certificate Authority
3. Fill in:
   - Email: your@email.com
   - Common Name: Your App Push
   - Select "Saved to disk"
4. Save the .certSigningRequest file

### Step 2: Create APNs Certificate

1. Go to [Apple Developer Portal](https://developer.apple.com)
2. Certificates, Identifiers & Profiles > Certificates
3. Click "+" to create new certificate
4. Choose certificate type:
   - **Development**: Apple Push Notification service SSL (Sandbox)
   - **Production**: Apple Push Notification service SSL (Sandbox & Production)
5. Select your App ID
6. Upload your CSR file
7. Download the certificate

### Step 3: Export P12 File

1. Double-click the downloaded certificate to add to Keychain
2. In Keychain Access, find your certificate
3. Right-click > Export
4. Choose format: Personal Information Exchange (.p12)
5. Set a password (remember this!)
6. Save the .p12 file

## Using with Firebase

### For Token-Based (P8)

1. In Firebase Console > Project Settings > Cloud Messaging
2. iOS app configuration > APNs authentication key
3. Upload your .p8 file
4. Enter:
   - Key ID
   - Team ID

### For Certificate-Based (P12)

1. Upload your .p12 file
2. Enter the password
3. Choose environment (Development/Production)

## Using with OneSignal

### For Token-Based (P8)

1. In OneSignal Dashboard > Settings > Platforms > Apple iOS
2. Select "Token Based" authentication
3. Upload your .p8 file
4. Enter:
   - Key ID
   - Team ID
   - Bundle ID

### For Certificate-Based (P12)

1. Select "Certificate Based"
2. Upload your .p12 file
3. Enter password
4. OneSignal auto-detects environment

## Entitlements Configuration

### In Xcode

1. Select your project
2. Select your target
3. Go to "Signing & Capabilities"
4. Click "+" and add "Push Notifications"
5. Ensure "Background Modes" includes "Remote notifications"

### Entitlements File

Your `App.entitlements` should include:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>aps-environment</key>
    <string>development</string>
    <!-- or "production" for production builds -->
</dict>
</plist>
```

## Security Best Practices

### For P8 Keys

1. **Never share** your .p8 file
2. **Store securely**: Use password managers or secure vaults
3. **Limit access**: Only give to necessary team members
4. **Rotate periodically**: Create new keys periodically

### For P12 Certificates

1. **Strong passwords**: Use complex passwords
2. **Secure storage**: Encrypt certificate files
3. **Track expiration**: Certificates expire after 1 year
4. **Separate environments**: Use different certs for dev/prod

## Testing Push Notifications

### Using Xcode

1. Run your app on a physical device (not simulator)
2. Accept notification permissions
3. Get device token in console
4. Send test notification

### Using Push Notification Tester

1. Download [Push Notification Tester](https://github.com/noodlewerk/NWPusher)
2. Select your certificate
3. Enter device token
4. Send test payload:

```json
{
  "aps": {
    "alert": {
      "title": "Test Notification",
      "body": "This is a test message"
    },
    "badge": 1,
    "sound": "default"
  }
}
```

## Common Issues

### "Invalid Certificate" Error
- Ensure certificate matches environment (dev/prod)
- Check certificate hasn't expired
- Verify bundle ID matches

### "Bad Device Token" Error
- Ensure using correct environment
- Token from development build ≠ production
- Check token format

### Notifications Not Received
- Verify entitlements are correct
- Check device has internet connection
- Ensure app has notification permissions

## Certificate Renewal

### For P12 Certificates (Annual)

1. Create new certificate (follow steps above)
2. Update in Firebase/OneSignal
3. Test thoroughly
4. Remove old certificate

### For P8 Keys

- No renewal needed! They don't expire
- Rotate periodically for security

## Next Steps

1. [Platform Setup Guide](../guides/platform-setup.md)
2. [Firebase Setup](./firebase-setup.md)
3. [OneSignal Setup](./onesignal-setup.md)

## Useful Links

- [Apple Push Notification Service](https://developer.apple.com/documentation/usernotifications)
- [APNs Overview](https://developer.apple.com/library/archive/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/APNSOverview.html)
- [Troubleshooting Push Notifications](https://developer.apple.com/documentation/usernotifications/troubleshooting_push_notifications)