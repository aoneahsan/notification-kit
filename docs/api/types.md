# TypeScript Type Definitions

## Core Types

### NotificationConfig

```typescript
interface NotificationConfig {
  provider: 'firebase' | 'onesignal';
  config: FirebaseConfig | OneSignalConfig;
  inApp?: InAppConfig;
  styles?: StyleConfig;
  debug?: boolean;
  serviceWorkerPath?: string;
  autoInit?: boolean;
}
```

### Notification

```typescript
interface Notification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  icon?: string;
  image?: string;
  badge?: string;
  sound?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
  timestamp?: number;
}
```

### ScheduleOptions

```typescript
interface ScheduleOptions {
  id?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  
  // Timing (use one)
  at?: Date;
  in?: Duration;
  every?: RepeatInterval;
  on?: ScheduleOn;
  
  // Platform options
  channelId?: string;
  smallIcon?: string;
  largeIcon?: string;
  sound?: string;
  attachments?: string[];
  threadIdentifier?: string;
  summaryArgument?: string;
  group?: string;
  groupSummary?: boolean;
  ongoing?: boolean;
  autoCancel?: boolean;
}
```

### InAppOptions

```typescript
interface InAppOptions {
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: NotificationPosition;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: string;
  className?: string;
  style?: CSSProperties;
  onDismiss?: () => void;
}
```

## Provider Types

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
  vapidKey?: string;
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

## Event Types

### NotificationEvent

```typescript
type NotificationEvent = 
  | 'notificationReceived'
  | 'notificationActionPerformed'
  | 'notificationScheduled'
  | 'notificationCancelled'
  | 'permissionChanged'
  | 'tokenReceived'
  | 'tokenRefreshed'
  | 'error';
```

### NotificationEventPayload

```typescript
interface NotificationEventPayload {
  event: NotificationEvent;
  notification?: Notification;
  action?: string;
  error?: Error;
  token?: string;
  permission?: PermissionStatus;
}
```

## Platform Types

### Platform

```typescript
type Platform = 'web' | 'ios' | 'android' | 'electron' | 'unknown';
```

### PlatformCapabilities

```typescript
interface PlatformCapabilities {
  push: boolean;
  local: boolean;
  inApp: boolean;
  badge: boolean;
  sound: boolean;
  alert: boolean;
  channels: boolean;
  provisional: boolean;
  criticalAlert: boolean;
}
```

## Helper Types

### PermissionStatus

```typescript
type PermissionStatus = 'granted' | 'denied' | 'prompt';
```

### NotificationPosition

```typescript
type NotificationPosition = 
  | 'top'
  | 'top-left'
  | 'top-right'
  | 'bottom'
  | 'bottom-left'
  | 'bottom-right'
  | 'center';
```

### RepeatInterval

```typescript
type RepeatInterval = 
  | 'year'
  | 'month'
  | 'two-weeks'
  | 'week'
  | 'day'
  | 'hour'
  | 'minute';
```

### Duration

```typescript
interface Duration {
  years?: number;
  months?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}
```

### NotificationChannel

```typescript
interface NotificationChannel {
  id: string;
  name: string;
  description?: string;
  importance: 'none' | 'min' | 'low' | 'default' | 'high';
  sound?: string;
  vibration?: boolean;
  lights?: boolean;
  lightColor?: string;
  showBadge?: boolean;
}
```