# Secure Configuration Examples

This directory contains examples of secure configuration for notification-kit across different platforms and frameworks.

## Examples Included

- **Next.js** - Environment variable configuration for Next.js apps
- **React Native** - Secure config for React Native with Capacitor
- **Vue.js** - Vue 3 with Vite environment handling
- **Angular** - Angular environment configuration
- **Node.js Backend** - Server-side notification sending

## Security Principles

All examples follow these security principles:

1. **No hardcoded credentials** - All sensitive data comes from environment variables
2. **Runtime injection** - Configuration is provided at runtime, not build time
3. **Platform-specific security** - Each platform uses its recommended security practices
4. **Minimal exposure** - Only expose what's necessary to the client

## Getting Started

1. Choose the example that matches your framework
2. Copy the `.env.example` file to `.env`
3. Fill in your actual credentials in `.env`
4. Never commit `.env` to version control
5. Use platform-specific secret management in production

## Common Patterns

### Client-Side Initialization

```typescript
// Always use environment variables
import { NotificationKit } from 'notification-kit';

NotificationKit.init({
  provider: process.env.NOTIFICATION_PROVIDER as 'firebase' | 'onesignal',
  config: {
    // Provider-specific config from env vars
    ...getConfigFromEnv()
  }
});
```

### Server-Side Operations

```typescript
// Server-side only - never expose admin credentials to client
import * as admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  })
});
```

## Production Deployment

Each example includes deployment guides for:
- Vercel
- Netlify
- AWS
- Google Cloud
- Azure

## Questions?

See the [Security Guide](../../docs/guides/security.md) for comprehensive security documentation.