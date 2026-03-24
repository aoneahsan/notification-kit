# Installation Guide

## Overview

notification-kit is designed with a zero-dependency architecture, meaning the core library has no runtime dependencies. You only install what you need for your specific use case.

## Basic Installation

### yarn (recommended)
```bash
yarn add notification-kit
```

## Optional Dependencies

Depending on your use case, you may need to install additional packages:

### For Capacitor Apps (iOS/Android)

```bash
# Install Capacitor dependencies
yarn add @capacitor/core @capacitor/push-notifications @capacitor/local-notifications @capacitor/preferences

# Sync native projects
yarn cap sync
```

### For Push Notifications

#### Firebase Provider
```bash
yarn add firebase
```

#### OneSignal Provider
```bash
yarn add react-onesignal
```

### For React Integration

If you're using the React hooks:

```bash
yarn add react react-dom
```

## Platform-Specific Setup

After installation, you'll need to configure each platform:

- [iOS Setup](./platform-setup.md#ios)
- [Android Setup](./platform-setup.md#android)
- [Web Setup](./platform-setup.md#web)

## Verify Installation

Create a simple test to verify the installation:

```typescript
import { NotificationKit } from 'notification-kit';

// Check if the library is loaded
console.log('NotificationKit available:', !!NotificationKit);
```

## TypeScript Support

notification-kit includes TypeScript definitions out of the box. No additional `@types` packages are required.

## Next Steps

- Read the [Quick Start Guide](./quick-start.md) to get up and running
- Configure your [notification provider](./providers.md)
- Set up [platform-specific configurations](./platform-setup.md)

## Troubleshooting Installation

### Module Resolution Issues

If you encounter module resolution issues:

1. Clear your package manager cache:
   ```bash
   yarn cache clean
   ```

2. Delete node_modules and reinstall:
   ```bash
   rm -rf node_modules
   yarn install
   ```

### Capacitor Sync Issues

If `yarn cap sync` fails:

1. Ensure Capacitor is properly initialized:
   ```bash
   yarn cap init
   ```

2. Add platforms if not already added:
   ```bash
   yarn cap add ios
   yarn cap add android
   ```

### Version Conflicts

Check for version compatibility:

```bash
# Check installed versions
yarn list notification-kit
yarn list @capacitor/core
```

notification-kit requires:
- Capacitor 4.0.0 or higher
- React 16.8.0 or higher (if using React hooks)
- Node.js 16.0.0 or higher
