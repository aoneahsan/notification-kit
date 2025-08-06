# React + Capacitor NotificationKit Example

This example demonstrates how to use the `notification-kit` package in a React + Capacitor application.

## Features Tested

- ✅ **Static init method**: `NotificationKit.init()` works correctly
- ✅ **Convenience methods**: All methods from `notifications` object are accessible
- ✅ **React hooks**: `useNotifications` hook from `notification-kit/react`
- ✅ **In-app notifications**: Success, error, warning, and info notifications
- ✅ **Local notifications**: Schedule notifications for future delivery
- ✅ **Permission management**: Request and check notification permissions
- ✅ **Token management**: Get FCM/push notification tokens

## Running the Example

1. Install dependencies:
   ```bash
   yarn install
   ```

2. Run the development server:
   ```bash
   yarn dev
   ```

3. Build for production:
   ```bash
   yarn build
   ```

4. Add platforms (iOS/Android):
   ```bash
   npx cap add ios
   npx cap add android
   ```

5. Sync and run on device:
   ```bash
   npx cap sync
   npx cap run ios
   # or
   npx cap run android
   ```

## Key Implementation Points

### Initialization
```typescript
// Static init method now works!
await NotificationKit.init({
  provider: 'firebase',
  config: {
    // Firebase config
  }
})
```

### Using React Hooks
```typescript
import { useNotifications } from 'notification-kit/react'

const { isSupported, hasPermission } = useNotifications()
```

### Convenience Methods
```typescript
import { notifications } from 'notification-kit'

// In-app notifications
await notifications.success('Title', 'Message')
await notifications.error('Title', 'Message')

// Local notifications
await notifications.schedule({
  id: 'unique-id',
  title: 'Reminder',
  body: 'Don\'t forget!',
  schedule: { at: new Date(Date.now() + 5000) }
})
```

## What's Fixed

The main issue was that `NotificationKit.init()` wasn't accessible as a static method. This has been fixed in version 2.0.3 by adding:

```typescript
static async init(config: NotificationConfig): Promise<void> {
  return NotificationKit.getInstance().init(config)
}
```

This allows both patterns to work:
- `NotificationKit.init(config)` - Simple static method
- `NotificationKit.getInstance().init(config)` - Instance method