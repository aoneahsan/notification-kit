# Basic Usage Examples

## Quick Start

### Initialize notification-kit

```typescript
import { NotificationKit, notifications } from 'notification-kit';

// Initialize once in your app
await NotificationKit.init({
  provider: 'firebase',
  config: {
    // Your Firebase config
  }
});
```

## Permission Examples

### Request Permission with UI Feedback

```typescript
async function setupNotifications() {
  const status = await notifications.checkPermission();
  
  if (status === 'prompt') {
    const granted = await notifications.requestPermission();
    if (granted) {
      console.log('✅ Notifications enabled');
    } else {
      console.log('❌ Notifications denied');
    }
  }
}
```

## In-App Notifications

### Basic Toast Notifications

```typescript
// Success notification
await notifications.success('Profile updated!');

// Error with message
await notifications.error('Upload failed', 'File too large');

// Warning notification
await notifications.warning('Low storage space');

// Info notification
await notifications.info('New version available');
```

### Custom In-App Notification

```typescript
await notifications.showInApp({
  title: 'New Message',
  message: 'John sent you a message',
  type: 'info',
  duration: 5000,
  position: 'top-right',
  action: {
    label: 'View',
    onClick: () => {
      // Navigate to messages
    }
  }
});
```

## Push Notifications

### Listen for Push Notifications

```typescript
// Set up listeners
const unsubscribePush = notifications.onPush((payload) => {
  console.log('Push received:', payload);
  
  // Show in-app notification when app is open
  notifications.info(payload.title, payload.body);
});

const unsubscribeOpened = notifications.onPushOpened((payload) => {
  console.log('Push opened:', payload);
  
  // Navigate based on data
  if (payload.data?.screen) {
    navigate(payload.data.screen);
  }
});

// Clean up
unsubscribePush();
unsubscribeOpened();
```

### Topic Subscriptions

```typescript
// Subscribe to topics
await notifications.subscribe('breaking-news');
await notifications.subscribe('sports');

// Unsubscribe
await notifications.unsubscribe('sports');
```

## Local Notifications

### Simple Reminder

```typescript
// Schedule in 5 minutes
await notifications.schedule({
  title: 'Reminder',
  body: 'Don\'t forget to check your tasks',
  in: { minutes: 5 }
});
```

### Schedule at Specific Time

```typescript
// Schedule for tomorrow at 9 AM
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(9, 0, 0, 0);

await notifications.schedule({
  title: 'Daily Standup',
  body: 'Team meeting in 15 minutes',
  at: tomorrow
});
```

### Recurring Notification

```typescript
// Daily reminder
await notifications.schedule({
  title: 'Daily Review',
  body: 'Time to review your goals',
  every: 'day',
  on: { hour: 20, minute: 0 } // 8 PM
});
```

## React Examples

### Basic Hook Usage

```typescript
import { useNotifications } from 'notification-kit/react';

function NotificationButton() {
  const { permission, requestPermission } = useNotifications();
  
  if (permission === 'granted') {
    return <span>✅ Notifications enabled</span>;
  }
  
  return (
    <button onClick={requestPermission}>
      Enable Notifications
    </button>
  );
}
```

### Form with Notifications

```typescript
function ContactForm() {
  const notify = useInAppNotification();
  
  const handleSubmit = async (data) => {
    try {
      await submitForm(data);
      notify.success('Message sent successfully!');
    } catch (error) {
      notify.error('Failed to send message');
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Complete Example

```typescript
import { NotificationKit, notifications } from 'notification-kit';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Initialize
    NotificationKit.init({
      provider: 'firebase',
      config: { /* ... */ }
    });
    
    // Request permission
    notifications.requestPermission();
    
    // Set up listeners
    const unsubscribe = notifications.onPush((payload) => {
      // Handle push notification
      console.log('Received:', payload);
    });
    
    // Subscribe to topics
    notifications.subscribe('app-updates');
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  return <YourApp />;
}
```