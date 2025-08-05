# React Hooks API Reference

## Import

```typescript
import { useNotifications, useInAppNotification } from 'notification-kit/react';
```

## useNotifications Hook

The main hook for all notification operations.

### Basic Usage

```typescript
function MyComponent() {
  const {
    permission,
    token,
    isSupported,
    requestPermission,
    subscribe,
    unsubscribe,
    schedule,
    showInApp
  } = useNotifications();
  
  return (
    <button onClick={requestPermission}>
      Enable Notifications
    </button>
  );
}
```

### Return Value

```typescript
interface UseNotificationsReturn {
  // State
  permission: PermissionStatus;
  token: string | null;
  isSupported: boolean;
  isInitialized: boolean;
  error: Error | null;
  
  // Methods
  requestPermission: (options?: PermissionOptions) => Promise<boolean>;
  checkPermission: () => Promise<PermissionStatus>;
  getToken: () => Promise<string>;
  refreshToken: () => Promise<string>;
  deleteToken: () => Promise<void>;
  
  // Push notifications
  subscribe: (topic: string) => Promise<void>;
  unsubscribe: (topic: string) => Promise<void>;
  
  // Local notifications
  schedule: (options: ScheduleOptions) => Promise<string>;
  cancel: (id: string) => Promise<void>;
  cancelAll: () => Promise<void>;
  getPending: () => Promise<Notification[]>;
  
  // In-app notifications
  showInApp: (options: InAppOptions) => Promise<void>;
  success: (title: string, message?: string) => Promise<void>;
  error: (title: string, message?: string) => Promise<void>;
  warning: (title: string, message?: string) => Promise<void>;
  info: (title: string, message?: string) => Promise<void>;
  
  // Utilities
  setBadge: (count: number) => Promise<void>;
  clear: (id?: string) => Promise<void>;
  getDelivered: () => Promise<Notification[]>;
}
```

### Options

```typescript
interface UseNotificationsOptions {
  onPush?: (payload: PushNotificationPayload) => void;
  onPushOpened?: (payload: PushNotificationPayload) => void;
  onPermissionChange?: (status: PermissionStatus) => void;
  onTokenRefresh?: (token: string) => void;
  onError?: (error: Error) => void;
}
```

### Example with Event Handlers

```typescript
function App() {
  const { permission, requestPermission } = useNotifications({
    onPush: (payload) => {
      console.log('Notification received:', payload);
    },
    onPushOpened: (payload) => {
      // Navigate to relevant screen
      navigate(`/notifications/${payload.id}`);
    },
    onPermissionChange: (status) => {
      console.log('Permission changed:', status);
    }
  });
  
  return <NotificationUI permission={permission} />;
}
```

## useInAppNotification Hook

Simplified hook for in-app notifications only.

### Basic Usage

```typescript
function MyComponent() {
  const notify = useInAppNotification();
  
  const handleSave = async () => {
    try {
      await saveData();
      notify.success('Saved successfully!');
    } catch (error) {
      notify.error('Failed to save');
    }
  };
  
  return <button onClick={handleSave}>Save</button>;
}
```

### Return Value

```typescript
interface UseInAppNotificationReturn {
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  show: (options: InAppOptions) => void;
}
```

### Custom Configuration

```typescript
const notify = useInAppNotification({
  position: 'bottom-right',
  duration: 3000,
  className: 'custom-notification'
});
```

## Advanced Patterns

### Notification Queue

```typescript
function NotificationManager() {
  const [queue, setQueue] = useState<Notification[]>([]);
  const { showInApp } = useNotifications();
  
  useEffect(() => {
    if (queue.length > 0) {
      const [first, ...rest] = queue;
      showInApp(first);
      setQueue(rest);
    }
  }, [queue]);
  
  return null;
}
```

### Permission Gate

```typescript
function PermissionGate({ children }) {
  const { permission, requestPermission } = useNotifications();
  
  if (permission === 'prompt') {
    return (
      <PermissionPrompt onAllow={requestPermission} />
    );
  }
  
  if (permission === 'denied') {
    return <PermissionDenied />;
  }
  
  return children;
}
```

### Auto-Subscribe

```typescript
function AutoSubscribe({ topics }) {
  const { subscribe, isInitialized } = useNotifications();
  
  useEffect(() => {
    if (isInitialized) {
      topics.forEach(topic => subscribe(topic));
    }
  }, [isInitialized, topics]);
  
  return null;
}
```

## SSR Compatibility

The hooks are SSR-safe and can be used with Next.js:

```typescript
function MyPage() {
  const { isSupported } = useNotifications();
  
  if (!isSupported) {
    return <div>Notifications not supported</div>;
  }
  
  return <NotificationUI />;
}
```