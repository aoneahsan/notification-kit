# Architecture Overview

## Core Architecture

notification-kit follows a modular, provider-agnostic architecture:

```
┌─────────────────────────────────────┐
│         Application Code            │
├─────────────────────────────────────┤
│      notification-kit API           │
├─────────────────────────────────────┤
│        Provider Adapter             │
│    (Firebase / OneSignal)           │
├─────────────────────────────────────┤
│      Platform Abstraction           │
│   (Web / iOS / Android)             │
└─────────────────────────────────────┘
```

## Key Components

### 1. NotificationKit Class
- Singleton pattern
- Manages initialization
- Provider lifecycle
- Configuration storage

### 2. Provider System
- Abstract provider interface
- Firebase implementation
- OneSignal implementation
- Dynamic provider loading

### 3. Platform Layer
- Capacitor integration
- Web API fallbacks
- Platform detection
- Capability checking

### 4. Event System
- Event emitter pattern
- Type-safe events
- Lifecycle hooks
- Error handling

## Design Principles

### Zero Dependencies
- Core has no runtime dependencies
- Providers loaded dynamically
- Graceful degradation

### Provider Agnostic
- Unified API surface
- Provider switching
- Feature detection

### Type Safety
- Full TypeScript support
- Compile-time checks
- IDE autocomplete

### Extensibility
- Plugin architecture
- Custom providers
- Event hooks

## Data Flow

1. **Initialization**
   ```
   App → NotificationKit.init() → Provider.setup() → Platform.configure()
   ```

2. **Notification Reception**
   ```
   Provider → Platform → NotificationKit → Event Handlers → App
   ```

3. **User Actions**
   ```
   App → notifications.method() → Provider → Platform → Native/Web APIs
   ```

## File Structure

```
notification-kit/
├── src/
│   ├── core/
│   │   ├── NotificationKit.ts
│   │   ├── types.ts
│   │   └── events.ts
│   ├── providers/
│   │   ├── base.ts
│   │   ├── firebase.ts
│   │   └── onesignal.ts
│   ├── platforms/
│   │   ├── web.ts
│   │   ├── ios.ts
│   │   └── android.ts
│   └── react/
│       └── hooks.ts
└── dist/
    ├── index.js
    └── index.d.ts
```