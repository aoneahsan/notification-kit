# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **notification-kit** - a unified notification library for React + Capacitor applications. The project provides a single API for push notifications, in-app notifications, and local notifications across Web, iOS, and Android platforms.

**Current Status**: Early development stage - comprehensive documentation exists but implementation is pending.

## Project Architecture

### Core Design Principles
- **Framework Independent**: Works without providers or wrappers
- **Type Safe**: Full TypeScript support with comprehensive type definitions
- **Cross-Platform**: Unified API for Web, iOS, and Android
- **Zero Configuration**: Simple initialization with minimal setup required
- **Provider Agnostic**: Supports Firebase and OneSignal backends

### Key Components Structure
Based on the API documentation, the project should be structured around:

1. **Core API** (`notification-kit`)
   - `NotificationKit` - Main initialization class
   - `notifications` - Core notification functions
   - Provider adapters for Firebase and OneSignal

2. **React Integration** (`notification-kit/react`)
   - `useNotifications` - Main React hook
   - `useInAppNotification` - In-app notification hook

3. **Notification Types**
   - Push notifications with Firebase/OneSignal
   - Local notifications using Capacitor APIs
   - In-app notifications (toast-style)

## Dependencies and Technology Stack

### Required Dependencies
- `@capacitor/push-notifications` - Push notification support
- `@capacitor/local-notifications` - Local notification scheduling
- Firebase SDK (for Firebase provider)
- OneSignal SDK (for OneSignal provider)

### Development Dependencies
- TypeScript - Full type safety
- Vitest - Testing framework (per user preferences)
- ESLint/Prettier - Code quality
- Rollup/Vite - Build tooling
- Yarn - Package manager

### Target Platforms
- Web (with service worker for push notifications)
- iOS (with proper Info.plist configuration)
- Android (with Firebase/OneSignal setup)

## Development Commands

**Note**: Project currently has no package.json - these commands need to be established:

```bash
# Install dependencies
yarn install

# Development mode
yarn dev

# Build library
yarn build

# Run tests
yarn test

# Type checking
yarn type-check

# Lint code
yarn lint

# Publish to npm
yarn publish
```

## API Structure

### Initialization Pattern
```typescript
NotificationKit.init({
  provider: 'firebase' | 'onesignal',
  config: ProviderConfig,
  inApp?: InAppConfig,
  styles?: StyleConfig
})
```

### Core Functions
- Permission management (`requestPermission`, `isPermissionGranted`)
- Token management (`getToken`)
- Push notifications (`subscribe`, `unsubscribe`, `onPush`, `onPushOpened`)
- Local notifications (`schedule`, `cancel`, `getPending`)
- In-app notifications (`success`, `error`, `warning`, `info`, `showInApp`)
- Channels (Android) and rich notifications

### React Integration
- `useNotifications()` - Main hook for notification management
- `useInAppNotification()` - Simplified in-app notification hook

## TypeScript Types

The project emphasizes full type safety with comprehensive type definitions:
- `NotificationConfig` - Initialization configuration
- `ScheduleOptions` - Local notification scheduling
- `InAppOptions` - In-app notification options
- `Notification` - Core notification type
- Platform-specific types for iOS/Android features

## Platform Configuration

### iOS Requirements
- Push Notifications capability in Xcode
- Background modes in Info.plist
- GoogleService-Info.plist for Firebase

### Android Requirements
- google-services.json for Firebase
- Gradle plugin configuration
- Notification channels for Android 8+

### Web Requirements
- Service worker for push notifications
- Firebase messaging configuration

## Testing Strategy

Per user preferences, use Vitest for testing:
- Unit tests for core functionality
- Integration tests for provider implementations
- Platform-specific testing for iOS/Android
- React hook testing for React integration

## Development Guidelines

- Keep components under 500 lines
- Use absolute imports with route aliases
- Update packages to latest versions
- Follow defensive security practices
- Maintain comprehensive documentation
- Implement full offline support where applicable