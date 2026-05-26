---
title: React Hooks
sidebar_position: 4
---

# React Hooks

React bindings live in the `notification-kit/react` entry point. They are loaded only when you import from it, so the `react` peer dependency stays optional.

```ts
import { useNotifications, useInAppNotification } from 'notification-kit/react';
```

There is **no provider component to mount** — the hooks talk to the same singleton as the `notifications` object.

## `useNotifications()`

Manages permissions, tokens, subscriptions, scheduling, and events from a component.

```tsx
import { useNotifications } from 'notification-kit/react';

function NotificationSettings() {
  const {
    permission,
    isPermissionGranted,
    token,
    requestPermission,
    checkPermission,
    subscribe,
    unsubscribe,
    scheduleNotification,
    cancelNotification,
    showInApp,
    isSupported,
  } = useNotifications();

  const enable = async () => {
    const granted = await requestPermission();
    if (granted) await subscribe('news');
  };

  return (
    <button onClick={enable} disabled={!isSupported}>
      {isPermissionGranted ? 'Notifications on' : 'Enable notifications'}
    </button>
  );
}
```

### Returned values

| Member | Type | Description |
|---|---|---|
| `permission` | `PermissionStatus` | Current permission status (state) |
| `isPermissionGranted` | `boolean` | Convenience flag: `permission === 'granted'` |
| `token` | `string \| null` | Current push token (state) |
| `isSupported` | `boolean` | Whether notifications are supported here |
| `requestPermission()` | `() => Promise<boolean>` | Prompt for permission |
| `checkPermission()` | `() => Promise<PermissionStatus>` | Read status without prompting |
| `getToken()` | `() => Promise<string>` | Fetch the push token |
| `refreshToken()` | `() => Promise<string>` | Force a token refresh |
| `subscribe(topic)` | `(topic: string) => Promise<void>` | Subscribe to a topic/tag |
| `unsubscribe(topic)` | `(topic: string) => Promise<void>` | Unsubscribe |
| `scheduleNotification(options)` | `(options) => Promise<void>` | Schedule a local notification |
| `cancelNotification(id)` | `(id: number) => Promise<void>` | Cancel a scheduled notification |
| `getPendingNotifications()` | `() => Promise<Notification[]>` | List pending notifications |
| `createChannel(channel)` | `(channel) => Promise<void>` | Create an Android channel |
| `deleteChannel(id)` | `(id: string) => Promise<void>` | Delete a channel |
| `listChannels()` | `() => Promise<NotificationChannel[]>` | List channels |
| `addEventListener(event, cb)` | `(event, cb) => () => void` | Subscribe to a typed event; returns unsubscribe |
| `showInApp` | object | In-app helpers: `show`, `success`, `error`, `warning`, `info` |
| `init(config)` | `(config) => Promise<void>` | Initialize (if not done globally) |
| `destroy()` | `() => Promise<void>` | Tear down the instance |

Listeners registered via `addEventListener` are cleaned up automatically on unmount.

## `useInAppNotification()`

Focused hook for in-app toast notifications.

```tsx
import { useInAppNotification } from 'notification-kit/react';

function SaveButton() {
  const { success, error } = useInAppNotification();

  const onSave = async () => {
    try {
      await save();
      success('Saved!', 'Your changes were stored.');
    } catch {
      error('Save failed', 'Please try again.');
    }
  };

  return <button onClick={onSave}>Save</button>;
}
```

### Returned values

| Member | Signature | Description |
|---|---|---|
| `success` | `(title, message?, options?) => Promise<string>` | Success toast |
| `error` | `(title, message?, options?) => Promise<string>` | Error toast |
| `warning` | `(title, message?, options?) => Promise<string>` | Warning toast |
| `info` | `(title, message?, options?) => Promise<string>` | Info toast |
| `show` | `(options: InAppOptions) => Promise<string>` | Full-control toast |
| `configure` | `(config: InAppConfig) => void` | Set defaults (position, duration, etc.) |
| `dismiss` | `(id: string) => void` | Dismiss one toast |
| `dismissAll` | `() => void` | Dismiss all toasts |

The optional third `options` argument on `success`/`error`/`warning`/`info` accepts a `Partial<InAppOptions>` (e.g. `{ duration, position, action }`). Each returns the notification id.

## Other hooks

The `/react` entry also exports specialized variants:

```ts
import {
  useInAppNotificationSimple,
  useInAppNotificationQueue,
  useInAppNotificationPersistence,
} from 'notification-kit/react';
```

These cover simplified, queued, and persisted in-app notification scenarios respectively.

## Next steps

- [Core API](core.md)
- [Notifications API](notifications.md)
- [Examples](../examples/basic.md)
