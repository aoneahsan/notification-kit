# Quick Start Guide

Get up and running with notification-kit in just a few minutes!

## 🚀 Installation

```bash
# Install the package
npm install notification-kit

# Install required Capacitor plugins
npm install @capacitor/push-notifications @capacitor/local-notifications

# Sync with native projects
npx cap sync
```

## 🔧 Basic Setup

### 1. Initialize notification-kit

Choose your notification provider and initialize once in your app:

#### Firebase Setup

```typescript
// App.tsx or main.tsx
import { NotificationKit } from 'notification-kit';

// Initialize with Firebase
await NotificationKit.init({
  provider: 'firebase',
  config: {
    apiKey: 'your-api-key',
    authDomain: 'your-auth-domain',
    projectId: 'your-project-id',
    storageBucket: 'your-storage-bucket',
    messagingSenderId: 'your-sender-id',
    appId: 'your-app-id',
    vapidKey: 'your-vapid-key' // Required for web push
  }
});
```

#### OneSignal Setup

```typescript
// App.tsx or main.tsx
import { NotificationKit } from 'notification-kit';

// Initialize with OneSignal
await NotificationKit.init({
  provider: 'onesignal',
  config: {
    appId: 'your-onesignal-app-id'
  }
});
```

### 2. Request Permissions

```typescript
import { notifications } from 'notification-kit';

// Request notification permissions
const granted = await notifications.requestPermission();

if (granted) {
  console.log('Notification permissions granted!');
  
  // Get the device token
  const token = await notifications.getToken();
  console.log('Device token:', token);
}
```

## 📱 Basic Usage

### Show In-App Notifications

No setup required - just import and use!

```typescript
import { notifications } from 'notification-kit';

// Success notification
notifications.success('Profile updated successfully!');

// Error notification
notifications.error('Failed to save changes');

// Warning notification
notifications.warning('Low storage space');

// Info notification
notifications.info('New update available');
```

### Schedule Local Notifications

```typescript
import { notifications } from 'notification-kit';

// Schedule in 5 minutes
await notifications.schedule({
  title: 'Reminder',
  body: 'Don\'t forget your meeting!',
  in: { minutes: 5 }
});

// Schedule at specific time
await notifications.schedule({
  title: 'Lunch Time',
  body: 'Time for a break!',
  at: new Date('2024-03-20 12:00:00')
});
```

### Handle Push Notifications

```typescript
import { notifications } from 'notification-kit';

// Listen for incoming push notifications
notifications.onPush((notification) => {
  console.log('Push received:', notification);
});

// Handle notification tap
notifications.onPushOpened((notification) => {
  // Navigate based on notification data
  if (notification.data?.screen) {
    router.push(notification.data.screen);
  }
});
```

## ⚛️ React Integration

### Using React Hooks

```typescript
import { useNotifications, useInAppNotification } from 'notification-kit/react';

function MyComponent() {
  const { isPermissionGranted, requestPermission, token } = useNotifications();
  const notify = useInAppNotification();

  const handleAction = async () => {
    if (!isPermissionGranted) {
      await requestPermission();
    }
    
    // Perform action
    await saveData();
    
    // Show success notification
    notify.success('Saved successfully!');
  };

  return (
    <button onClick={handleAction}>
      Save Changes
    </button>
  );
}
```

## 🎨 Customization

### Configure In-App Notifications

```typescript
NotificationKit.init({
  provider: 'firebase',
  config: { /* ... */ },
  
  // Customize in-app notifications
  inApp: {
    position: 'top-right',
    duration: 4000,
    theme: {
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6'
    }
  }
});
```

### Custom In-App Notification

```typescript
notifications.showInApp({
  title: 'New Message',
  message: 'John sent you a message',
  type: 'info',
  duration: 5000,
  position: 'bottom-right',
  action: {
    label: 'View',
    onClick: () => router.push('/messages')
  }
});
```

## 📋 Complete Example

Here's a complete example putting it all together:

```typescript
// App.tsx
import { useEffect } from 'react';
import { NotificationKit, notifications } from 'notification-kit';
import { useNotifications } from 'notification-kit/react';

// Initialize on app start
NotificationKit.init({
  provider: 'firebase',
  config: {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
  }
});

function App() {
  const { requestPermission, isPermissionGranted } = useNotifications();

  useEffect(() => {
    // Request permissions on mount
    if (!isPermissionGranted) {
      requestPermission();
    }

    // Set up push notification handlers
    const unsubscribePush = notifications.onPush((notification) => {
      notifications.info(
        notification.title || 'New Notification',
        notification.body
      );
    });

    const unsubscribeOpened = notifications.onPushOpened((notification) => {
      // Handle navigation
      console.log('Notification opened:', notification);
    });

    return () => {
      unsubscribePush();
      unsubscribeOpened();
    };
  }, [isPermissionGranted]);

  return (
    <div className="app">
      {/* Your app content */}
    </div>
  );
}

export default App;
```

## 🎯 What's Next?

- [Platform Setup](./platform-setup.md) - Configure iOS, Android, and Web
- [Push Notifications](./push-notifications.md) - Deep dive into push notifications
- [Local Notifications](./local-notifications.md) - Advanced scheduling options
- [React Hooks](./react-hooks.md) - All available React hooks
- [TypeScript](./typescript.md) - TypeScript best practices

## 💡 Tips

1. **Initialize Early**: Call `NotificationKit.init()` as early as possible in your app
2. **Handle Permissions**: Always check permissions before scheduling notifications
3. **Test on Devices**: Push notifications require real devices for testing
4. **Use TypeScript**: Take advantage of full TypeScript support for better development experience

## 🆘 Need Help?

- Check the [FAQ](./faq.md)
- Read the [Troubleshooting Guide](./troubleshooting.md)
- [Open an issue](https://github.com/aoneahsan/notification-kit/issues)