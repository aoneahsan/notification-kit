# Notifications API Reference

The `notifications` object provides all notification operations.

## Import

```typescript
import { notifications } from 'notification-kit';
```

## Permission Methods

### requestPermission(options?)
Request notification permissions.

```typescript
const granted = await notifications.requestPermission({
  provisional: true // iOS only
});
```

### checkPermission()
Check current permission status.

```typescript
const status = await notifications.checkPermission();
// Returns: 'granted' | 'denied' | 'prompt'
```

### isPermissionGranted()
Quick check if permissions are granted.

```typescript
const hasPermission = await notifications.isPermissionGranted();
```

## Token Methods

### getToken()
Get device push token.

```typescript
const token = await notifications.getToken();
```

### refreshToken()
Force token refresh.

```typescript
const newToken = await notifications.refreshToken();
```

### deleteToken()
Delete current token.

```typescript
await notifications.deleteToken();
```

## Push Notification Methods

### subscribe(topic)
Subscribe to a topic.

```typescript
await notifications.subscribe('news');
```

### unsubscribe(topic)
Unsubscribe from a topic.

```typescript
await notifications.unsubscribe('news');
```

### onPush(callback)
Listen for incoming notifications.

```typescript
const unsubscribe = notifications.onPush((payload) => {
  console.log('Notification:', payload);
});
```

### onPushOpened(callback)
Handle notification taps.

```typescript
const unsubscribe = notifications.onPushOpened((payload) => {
  // Navigate based on payload
});
```

## Local Notification Methods

### schedule(options)
Schedule a local notification.

```typescript
const id = await notifications.schedule({
  title: 'Reminder',
  body: 'Meeting in 5 minutes',
  at: new Date(Date.now() + 300000)
});
```

### cancel(id)
Cancel scheduled notification.

```typescript
await notifications.cancel('notification-id');
```

### cancelAll()
Cancel all scheduled notifications.

```typescript
await notifications.cancelAll();
```

### getPending()
Get pending notifications.

```typescript
const pending = await notifications.getPending();
```

## In-App Notification Methods

### success(title, message?)
Show success notification.

```typescript
await notifications.success('Saved!');
await notifications.success('Success', 'Changes saved');
```

### error(title, message?)
Show error notification.

```typescript
await notifications.error('Error', 'Failed to save');
```

### warning(title, message?)
Show warning notification.

```typescript
await notifications.warning('Warning', 'Low storage');
```

### info(title, message?)
Show info notification.

```typescript
await notifications.info('Update available');
```

### showInApp(options)
Show custom in-app notification.

```typescript
await notifications.showInApp({
  title: 'Custom',
  message: 'With options',
  type: 'info',
  duration: 5000,
  position: 'top-right'
});
```

## Channel Methods (Android)

### createChannel(channel)
Create notification channel.

```typescript
await notifications.createChannel({
  id: 'important',
  name: 'Important',
  importance: 'high'
});
```

### deleteChannel(id)
Delete notification channel.

```typescript
await notifications.deleteChannel('channel-id');
```

### listChannels()
List all channels.

```typescript
const channels = await notifications.listChannels();
```

## Event Methods

### on(event, callback)
Subscribe to events.

```typescript
const unsubscribe = notifications.on('notificationReceived', (event) => {
  console.log('Received:', event);
});
```

### off(event, callback?)
Unsubscribe from events.

```typescript
notifications.off('notificationReceived', callback);
```

## Utility Methods

### clear(id?)
Clear displayed notification.

```typescript
await notifications.clear('notification-id');
await notifications.clear(); // Clear all
```

### setBadge(count)
Set app badge number.

```typescript
await notifications.setBadge(5);
await notifications.setBadge(0); // Clear badge
```

### getDelivered()
Get delivered notifications.

```typescript
const delivered = await notifications.getDelivered();
```