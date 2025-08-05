# Configuration Guide

## Overview

notification-kit can be configured to work with different notification providers and customized to match your app's needs.

## Basic Configuration

### Minimal Setup

```typescript
import { NotificationKit } from 'notification-kit';

// Initialize with minimal configuration
NotificationKit.init({
  provider: 'firebase',
  config: {
    // Your Firebase config
  }
});
```

### Complete Configuration

```typescript
import { NotificationKit } from 'notification-kit';

NotificationKit.init({
  // Required: Choose your provider
  provider: 'firebase', // or 'onesignal'
  
  // Required: Provider configuration
  config: {
    // Firebase config
    apiKey: 'your-api-key',
    authDomain: 'your-auth-domain',
    projectId: 'your-project-id',
    storageBucket: 'your-storage-bucket',
    messagingSenderId: 'your-sender-id',
    appId: 'your-app-id',
    measurementId: 'your-measurement-id', // Optional
    vapidKey: 'your-vapid-key' // Required for web push
  },
  
  // Optional: In-app notification configuration
  inApp: {
    position: 'top-right',
    duration: 4000,
    animationDuration: 300,
    maxVisible: 3,
    removeOnClick: true,
    pauseOnHover: true,
    showProgressBar: true,
    newestOnTop: true,
    preventDuplicates: true,
    rtl: false,
    theme: 'light', // or 'dark', 'auto'
    containerClassName: 'notification-container',
    notificationClassName: 'notification'
  },
  
  // Optional: Custom styles
  styles: {
    container: {
      zIndex: 9999,
      pointerEvents: 'none'
    },
    notification: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '14px',
      lineHeight: '1.5'
    },
    success: {
      backgroundColor: '#10b981',
      color: '#ffffff'
    },
    error: {
      backgroundColor: '#ef4444',
      color: '#ffffff'
    },
    warning: {
      backgroundColor: '#f59e0b',
      color: '#ffffff'
    },
    info: {
      backgroundColor: '#3b82f6',
      color: '#ffffff'
    }
  },
  
  // Optional: Debug mode
  debug: true,
  
  // Optional: Custom service worker (web only)
  serviceWorkerPath: '/custom-sw.js',
  
  // Optional: Auto-initialize on import
  autoInit: false
});
```

## Provider Configuration

### Firebase Configuration

```typescript
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  vapidKey: process.env.FIREBASE_VAPID_KEY // Web push notifications
};

NotificationKit.init({
  provider: 'firebase',
  config: firebaseConfig
});
```

### OneSignal Configuration

```typescript
const oneSignalConfig = {
  appId: process.env.ONESIGNAL_APP_ID,
  safariWebId: process.env.ONESIGNAL_SAFARI_WEB_ID, // Optional: Safari web push
  restApiKey: process.env.ONESIGNAL_REST_API_KEY // Optional: Server-side operations
};

NotificationKit.init({
  provider: 'onesignal',
  config: oneSignalConfig
});
```

## In-App Notification Options

### Position Options

- `'top'` - Top center
- `'top-left'` - Top left corner
- `'top-right'` - Top right corner (default)
- `'bottom'` - Bottom center
- `'bottom-left'` - Bottom left corner
- `'bottom-right'` - Bottom right corner
- `'center'` - Center of screen

### Theme Options

- `'light'` - Light theme
- `'dark'` - Dark theme
- `'auto'` - Follows system preference

### Animation Options

```typescript
inApp: {
  animationDuration: 300, // milliseconds
  animationIn: 'slideIn', // or 'fadeIn', 'bounceIn'
  animationOut: 'slideOut' // or 'fadeOut', 'bounceOut'
}
```

## Environment-Specific Configuration

### Development vs Production

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

NotificationKit.init({
  provider: 'firebase',
  config: isDevelopment ? devConfig : prodConfig,
  debug: isDevelopment,
  serviceWorkerPath: isDevelopment ? '/dev-sw.js' : '/sw.js'
});
```

### Platform-Specific Configuration

```typescript
import { Capacitor } from '@capacitor/core';

const platform = Capacitor.getPlatform();

NotificationKit.init({
  provider: 'firebase',
  config: firebaseConfig,
  inApp: {
    position: platform === 'ios' ? 'top' : 'top-right',
    duration: platform === 'web' ? 5000 : 3000
  }
});
```

## Advanced Configuration

### Custom Notification Renderer

```typescript
NotificationKit.init({
  provider: 'firebase',
  config: firebaseConfig,
  inApp: {
    customRenderer: (notification) => {
      // Return custom HTML or React element
      return `
        <div class="custom-notification">
          <h3>${notification.title}</h3>
          <p>${notification.message}</p>
        </div>
      `;
    }
  }
});
```

### Notification Interceptor

```typescript
NotificationKit.init({
  provider: 'firebase',
  config: firebaseConfig,
  interceptor: async (notification) => {
    // Modify notification before display
    if (notification.data?.priority === 'high') {
      notification.title = `🚨 ${notification.title}`;
    }
    return notification;
  }
});
```

### Custom Event Handlers

```typescript
NotificationKit.init({
  provider: 'firebase',
  config: firebaseConfig,
  onReady: () => {
    console.log('NotificationKit is ready');
  },
  onError: (error) => {
    console.error('NotificationKit error:', error);
  },
  onPermissionChange: (status) => {
    console.log('Permission status:', status);
  }
});
```

## Configuration Validation

notification-kit validates your configuration and provides helpful error messages:

```typescript
try {
  await NotificationKit.init(config);
} catch (error) {
  console.error('Configuration error:', error.message);
  // Example: "Missing required config.apiKey for Firebase provider"
}
```

## Dynamic Configuration Updates

```typescript
// Update in-app notification settings
NotificationKit.updateConfig({
  inApp: {
    position: 'bottom-right',
    duration: 6000
  }
});

// Update styles
NotificationKit.updateStyles({
  success: {
    backgroundColor: '#059669'
  }
});
```

## Configuration Best Practices

1. **Use Environment Variables**: Keep sensitive configuration in environment variables
2. **Validate Early**: Initialize notification-kit early in your app lifecycle
3. **Handle Errors**: Always wrap initialization in try-catch
4. **Platform Testing**: Test configuration on all target platforms
5. **Keep It Simple**: Start with minimal configuration and add options as needed

## Next Steps

- Set up [platform-specific configurations](./platform-setup.md)
- Configure your [notification provider](./providers.md)
- Learn about [notification types](./notification-types.md)