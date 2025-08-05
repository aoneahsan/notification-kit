# Security Guide

## Overview

This guide covers security best practices for using notification-kit across all platforms (Web, iOS, Android) and providers (Firebase, OneSignal). Following these practices ensures your sensitive data is never exposed in version control or client-side code.

## Core Security Principles

### 1. Never Hardcode Credentials

**❌ DON'T DO THIS:**
```typescript
// BAD - Hardcoded credentials
NotificationKit.init({
  provider: 'firebase',
  config: {
    apiKey: 'AIzaSyDOCAbC123dEf456GhI789jKl01-MnO',
    appId: '1:1234567890:ios:abcdef123456',
    // ... other hardcoded values
  }
});
```

**✅ DO THIS:**
```typescript
// GOOD - Environment variables
NotificationKit.init({
  provider: 'firebase',
  config: {
    apiKey: process.env.FIREBASE_API_KEY,
    appId: process.env.FIREBASE_APP_ID,
    // ... other env variables
  }
});
```

### 2. Secure Configuration Storage

#### Development Environment

Create a `.env` file in your project root:
```bash
# .env
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-auth-domain
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-storage-bucket
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
FIREBASE_VAPID_KEY=your-vapid-key

ONESIGNAL_APP_ID=your-onesignal-app-id
ONESIGNAL_REST_API_KEY=your-rest-api-key
```

Add to `.gitignore`:
```gitignore
# Environment variables
.env
.env.local
.env.*.local

# Firebase
google-services.json
GoogleService-Info.plist

# Never commit these
*.p8
*.p12
*.key
*.pem
```

#### Production Environment

Use your platform's secret management:

**Vercel:**
```bash
vercel env add FIREBASE_API_KEY production
```

**AWS Secrets Manager:**
```typescript
import { SecretsManager } from 'aws-sdk';
const secretsManager = new SecretsManager();
const secrets = await secretsManager.getSecretValue({ SecretId: 'notification-config' }).promise();
```

**GitHub Actions:**
```yaml
env:
  FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
  ONESIGNAL_APP_ID: ${{ secrets.ONESIGNAL_APP_ID }}
```

### 3. Runtime Configuration Injection

notification-kit uses runtime configuration injection to avoid hardcoded credentials:

#### Web Platform

Service workers receive configuration at runtime:
```javascript
// firebase-messaging-sw.js
self.addEventListener('message', (event) => {
  if (event.data?.type === 'FIREBASE_CONFIG') {
    // Configuration injected at runtime
    firebase.initializeApp(event.data.config);
  }
});
```

#### Native Platforms (iOS/Android)

Native bridges configure SDKs programmatically:
```typescript
// No Info.plist or AndroidManifest.xml entries needed
NotificationKit.init({
  provider: 'onesignal',
  config: {
    appId: process.env.ONESIGNAL_APP_ID
  }
});
```

## Platform-Specific Security

### iOS Security

1. **No Hardcoded Values in Info.plist**
   - ❌ Don't add `OneSignal_app_id` to Info.plist
   - ❌ Don't commit GoogleService-Info.plist
   - ✅ Use runtime configuration

2. **Keychain Storage**
   ```swift
   // Store sensitive data in Keychain
   KeychainWrapper.standard.set(token, forKey: "pushToken")
   ```

3. **Certificate Security**
   - Store .p8/.p12 files securely
   - Use Apple's token-based authentication
   - Rotate certificates regularly

### Android Security

1. **No Hardcoded Values in AndroidManifest.xml**
   - ❌ Don't add OneSignal meta-data
   - ❌ Don't commit google-services.json
   - ✅ Use runtime configuration

2. **Android Keystore**
   ```java
   // Use Android Keystore for sensitive data
   KeyStore keyStore = KeyStore.getInstance("AndroidKeyStore");
   ```

3. **ProGuard Rules**
   ```proguard
   # Keep notification classes
   -keep class com.onesignal.** { *; }
   -keep class com.google.firebase.** { *; }
   ```

### Web Security

1. **HTTPS Only**
   - Push notifications require HTTPS
   - Use SSL/TLS certificates
   - Enable HSTS headers

2. **Content Security Policy**
   ```html
   <meta http-equiv="Content-Security-Policy" 
         content="default-src 'self'; 
                  script-src 'self' https://www.gstatic.com https://cdn.onesignal.com;
                  connect-src 'self' https://fcm.googleapis.com https://onesignal.com;">
   ```

3. **Service Worker Security**
   - Validate message origins
   - Don't expose sensitive data in logs
   - Use secure communication channels

## API Key Security

### Firebase Security

1. **Restrict API Keys**
   - Go to Google Cloud Console
   - Restrict keys by:
     - HTTP referrers (web)
     - Bundle IDs (iOS)
     - Package names (Android)

2. **Firebase Security Rules**
   ```javascript
   // Firestore rules
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth.uid == userId;
       }
     }
   }
   ```

### OneSignal Security

1. **REST API Key Protection**
   - Never expose REST API key client-side
   - Use only on secure backend
   - Implement request signing

2. **User Authentication**
   ```typescript
   // Set external user ID for secure targeting
   await notifications.setExternalUserId(userId, authHash);
   ```

## Data Protection

### 1. Encrypt Sensitive Notification Data

```typescript
// Server-side encryption
const encryptedData = encrypt(sensitiveData);
await sendNotification({
  data: {
    encrypted: encryptedData,
    iv: initializationVector
  }
});

// Client-side decryption
notifications.onMessage(async (payload) => {
  if (payload.data?.encrypted) {
    const decrypted = await decrypt(payload.data.encrypted, payload.data.iv);
    // Handle decrypted data
  }
});
```

### 2. Validate Notification Sources

```typescript
// Verify notification authenticity
notifications.onMessage(async (payload) => {
  const signature = payload.data?.signature;
  const isValid = await verifySignature(payload, signature);
  
  if (!isValid) {
    console.error('Invalid notification signature');
    return;
  }
  
  // Process verified notification
});
```

### 3. User Privacy

- Don't include PII in notifications
- Use user IDs instead of email addresses
- Implement data retention policies
- Provide opt-out mechanisms

## Common Security Mistakes

### 1. Exposed Configuration Files

**❌ Wrong:**
```javascript
// config.js - DON'T commit this
export const firebaseConfig = {
  apiKey: "AIzaSyDOCAbC123...",
  // ... rest of config
};
```

**✅ Right:**
```javascript
// config.js
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  // ... rest from env
};
```

### 2. Logging Sensitive Data

**❌ Wrong:**
```typescript
console.log('Token:', token); // Exposes token in logs
```

**✅ Right:**
```typescript
console.log('Token received:', !!token); // Log status only
```

### 3. Client-Side Admin Operations

**❌ Wrong:**
```typescript
// Client-side - NEVER do this
await notifications.sendToAll({
  title: 'Broadcast',
  body: 'Message to all users'
});
```

**✅ Right:**
```typescript
// Server-side only
import * as admin from 'firebase-admin';
await admin.messaging().send(message);
```

## Security Checklist

Before deploying to production:

- [ ] All API keys and credentials stored in environment variables
- [ ] No sensitive files in version control
- [ ] `.gitignore` properly configured
- [ ] API keys restricted by platform/domain
- [ ] HTTPS enabled for web platform
- [ ] Service workers validate message origins
- [ ] No client-side admin operations
- [ ] Notification data encrypted if sensitive
- [ ] User privacy controls implemented
- [ ] Security headers configured
- [ ] Regular security audits scheduled
- [ ] Credential rotation policy in place

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** create a public GitHub issue
2. Email security concerns to: security@notification-kit.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Additional Resources

- [Firebase Security Checklist](https://firebase.google.com/docs/projects/security-checklist)
- [OneSignal Security Best Practices](https://documentation.onesignal.com/docs/security)
- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)
- [Web Push Security](https://developers.google.com/web/fundamentals/push-notifications/web-push-security)