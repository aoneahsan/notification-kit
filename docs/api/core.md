# Core API Reference

The core API provides the main functionality for notification-kit.

## NotificationKit Class

The main class for initializing and managing the notification system.

### Static Methods

#### `getInstance()`

Get the singleton instance of NotificationKit.

```typescript
const kit = NotificationKit.getInstance();
```

### Instance Methods

#### `init(config: NotificationConfig): Promise<void>`

Initialize the notification kit with configuration.

```typescript
await NotificationKit.init({
  provider: 'firebase', // or 'onesignal'
  config: {
    // Provider-specific configuration
  },
  inApp: {
    // Optional in-app notification configuration
  },
  styles: {
    // Optional custom styles
  }
});
```

#### `destroy(): Promise<void>`

Destroy the notification kit instance and clean up resources.

```typescript
await NotificationKit.getInstance().destroy();
```

#### `isInitialized(): boolean`

Check if notification kit is initialized.

```typescript
const initialized = NotificationKit.getInstance().isInitialized();
```

#### `getPlatform(): Platform`

Get the current platform.

```typescript
const platform = NotificationKit.getInstance().getPlatform();
// Returns: 'web' | 'ios' | 'android' | 'electron' | 'unknown'
```

#### `getCapabilities(): PlatformCapabilities | null`

Get platform capabilities.

```typescript
const capabilities = NotificationKit.getInstance().getCapabilities();
```

#### `getProvider(): NotificationProvider | null`

Get the current notification provider instance.

```typescript
const provider = NotificationKit.getInstance().getProvider();
```

## notifications Object

The main API for all notification operations.

### Permission Methods

#### `requestPermission(): Promise<boolean>`

Request notification permissions from the user.

```typescript
const granted = await notifications.requestPermission();
```

#### `checkPermission(): Promise<PermissionStatus>`

Check current permission status.

```typescript
const status = await notifications.checkPermission();
// Returns: 'granted' | 'denied' | 'prompt'
```

#### `isPermissionGranted(): Promise<boolean>`

Check if permissions are granted.

```typescript
const isGranted = await notifications.isPermissionGranted();
```

### Token Management

#### `getToken(): Promise<string>`

Get the device notification token.

```typescript
const token = await notifications.getToken();
```

#### `refreshToken(): Promise<string>`

Refresh the device token.

```typescript
const newToken = await notifications.refreshToken();
```

#### `deleteToken(): Promise<void>`

Delete the current token.

```typescript
await notifications.deleteToken();
```

### Push Notifications

#### `subscribe(topic: string): Promise<void>`

Subscribe to a notification topic.

```typescript
await notifications.subscribe('news');
await notifications.subscribe('sports');
```

#### `unsubscribe(topic: string): Promise<void>`

Unsubscribe from a topic.

```typescript
await notifications.unsubscribe('news');
```

#### `onPush(callback: (payload: PushNotificationPayload) => void): () => void`

Listen for incoming push notifications.

```typescript
const unsubscribe = notifications.onPush((notification) => {
  console.log('Push received:', notification);
});

// Later: unsubscribe();
```

#### `onPushOpened(callback: (payload: PushNotificationPayload) => void): () => void`

Listen for notification tap events.

```typescript
const unsubscribe = notifications.onPushOpened((notification) => {
  // Handle navigation
});
```

### Local Notifications

#### `schedule(options: ScheduleOptions): Promise<string>`

Schedule a local notification.

```typescript
const id = await notifications.schedule({
  title: 'Reminder',
  body: 'Meeting in 5 minutes',
  in: { minutes: 5 }
});
```

#### `cancel(id: string): Promise<void>`

Cancel a scheduled notification.

```typescript
await notifications.cancel('notification-id');
```

#### `cancelAll(): Promise<void>`

Cancel all scheduled notifications.

```typescript
await notifications.cancelAll();
```

#### `getPending(): Promise<Notification[]>`

Get all pending scheduled notifications.

```typescript
const pending = await notifications.getPending();
```

### In-App Notifications

#### `success(title: string, message?: string): Promise<void>`

Show a success notification.

```typescript
await notifications.success('Saved successfully!');
await notifications.success('Success', 'Your changes have been saved');
```

#### `error(title: string, message?: string): Promise<void>`

Show an error notification.

```typescript
await notifications.error('Something went wrong');
await notifications.error('Error', 'Failed to save changes');
```

#### `warning(title: string, message?: string): Promise<void>`

Show a warning notification.

```typescript
await notifications.warning('Low battery');
await notifications.warning('Warning', 'Storage space is running low');
```

#### `info(title: string, message?: string): Promise<void>`

Show an info notification.

```typescript
await notifications.info('New update available');
await notifications.info('Information', 'Click here to learn more');
```

#### `showInApp(options: InAppOptions): Promise<void>`

Show a custom in-app notification.

```typescript
await notifications.showInApp({
  title: 'Custom Notification',
  message: 'With custom options',
  type: 'info',
  duration: 5000,
  position: 'top-right',
  action: {
    label: 'View',
    onClick: () => console.log('Clicked!')
  }
});
```

### Channel Management (Android)

#### `createChannel(channel: NotificationChannel): Promise<void>`

Create a notification channel for Android.

```typescript
await notifications.createChannel({
  id: 'important',
  name: 'Important Notifications',
  description: 'Critical app notifications',
  importance: 'high',
  sound: 'notification.wav',
  vibration: true
});
```

#### `deleteChannel(id: string): Promise<void>`

Delete a notification channel.

```typescript
await notifications.deleteChannel('channel-id');
```

#### `listChannels(): Promise<NotificationChannel[]>`

List all notification channels.

```typescript
const channels = await notifications.listChannels();
```

### Event Handling

#### `on<T>(event: T, callback: NotificationEventCallback): () => void`

Subscribe to notification events.

```typescript
const unsubscribe = notifications.on('notificationReceived', (event) => {
  console.log('Notification received:', event);
});
```

Available events:
- `notificationReceived`
- `notificationActionPerformed`
- `notificationSent`
- `notificationScheduled`
- `notificationCancelled`
- `channelCreated`
- `channelDeleted`
- `tokenReceived`
- `tokenRefreshed`
- `permissionChanged`
- `subscribed`
- `unsubscribed`
- `ready`
- `error`

#### `off<T>(event: T, callback?: NotificationEventCallback): void`

Unsubscribe from events.

```typescript
notifications.off('notificationReceived', callback);
// Or remove all listeners for an event:
notifications.off('notificationReceived');
```

## Type Definitions

### NotificationConfig

```typescript
interface NotificationConfig {
  provider: 'firebase' | 'onesignal';
  config: FirebaseConfig | OneSignalConfig;
  inApp?: InAppConfig;
  styles?: StyleConfig;
}
```

### FirebaseConfig

```typescript
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  vapidKey?: string; // Required for web push
}
```

### OneSignalConfig

```typescript
interface OneSignalConfig {
  appId: string;
  restApiKey?: string;
  safariWebId?: string;
}
```

### ScheduleOptions

```typescript
interface ScheduleOptions {
  id?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  
  // Timing options (use one):
  at?: Date;
  in?: {
    years?: number;
    months?: number;
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
  };
  every?: 'year' | 'month' | 'two-weeks' | 'week' | 'day' | 'hour' | 'minute';
  on?: {
    year?: number;
    month?: number;
    day?: number;
    weekday?: WeekDay;
    hour?: number;
    minute?: number;
    second?: number;
  };
  
  // Additional options:
  channelId?: string; // Android
  smallIcon?: string;
  largeIcon?: string;
  sound?: string;
  actionTypeId?: string;
  extra?: any;
  attachments?: string[];
  threadIdentifier?: string; // iOS
  summaryArgument?: string; // iOS
  group?: string; // Android
  groupSummary?: boolean; // Android
  ongoing?: boolean; // Android
  autoCancel?: boolean; // Android
}
```

### InAppOptions

```typescript
interface InAppOptions {
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number; // milliseconds
  position?: 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right' | 'center';
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: string;
  className?: string;
  style?: React.CSSProperties;
  onDismiss?: () => void;
  onAction?: (action: string) => void;
}
```

## Examples

### Complete initialization example

```typescript
import { NotificationKit, notifications } from 'notification-kit';

// Initialize
await NotificationKit.init({
  provider: 'firebase',
  config: {
    apiKey: 'your-api-key',
    authDomain: 'your-auth-domain',
    projectId: 'your-project-id',
    storageBucket: 'your-storage-bucket',
    messagingSenderId: 'your-sender-id',
    appId: 'your-app-id',
    vapidKey: 'your-vapid-key'
  },
  inApp: {
    position: 'top-right',
    duration: 4000
  }
});

// Request permissions
const granted = await notifications.requestPermission();

if (granted) {
  // Get token
  const token = await notifications.getToken();
  
  // Subscribe to topic
  await notifications.subscribe('updates');
  
  // Listen for notifications
  notifications.onPush((notification) => {
    console.log('Received:', notification);
  });
}
```