---
title: Providers
sidebar_position: 2
---

# Providers

Push notifications are delivered through a **provider**. `notification-kit` supports two: **Firebase** and **OneSignal**. You choose one at `init` time. Local and in-app notifications work regardless of provider.

```ts
NotificationKit.init({ provider: 'firebase' | 'onesignal', config: { /* ... */ } });
```

## Firebase

Firebase Cloud Messaging (FCM) is the recommended provider, especially for **native** push.

- **Web:** uses `firebase/messaging` with a service worker and a VAPID key.
- **Native (iOS/Android):** registers via `@capacitor/push-notifications`, producing an FCM device token.

```tsx
await NotificationKit.init({
  provider: 'firebase',
  config: {
    apiKey: '...',
    authDomain: '...',
    projectId: '...',
    storageBucket: '...',
    messagingSenderId: '...',
    appId: '...',
    vapidKey: '...', // web push
  },
});
```

You can also pass an existing app instance: `config: { app, vapidKey }`.

### Topics on Firebase

FCM **topic** subscription and unsubscription are a **server-side** operation. Calling `notifications.subscribe(topic)` / `unsubscribe(topic)` on the client throws an explicit error — FCM does not expose client-side topic management or a device's topic list. Subscribe devices to topics from your backend using the FCM Admin API and the device token.

## OneSignal

OneSignal is well-suited to **web** push and rich segmentation.

- **Web:** uses `react-onesignal` (v3) and manages its own service worker.
- **Native:** the kit uses the **generic Capacitor device token**, not the OneSignal native SDK. For production native push, **Firebase is recommended**.

```tsx
await NotificationKit.init({
  provider: 'onesignal',
  config: { appId: 'your-onesignal-app-id' },
});
```

Or reuse an existing instance: `config: { instance: OneSignal }`.

### "Topics" on OneSignal

OneSignal has no FCM-style topics. The `subscribe` / `unsubscribe` calls map to **tags** via the OneSignal v3 User API, which you then target with segments.

## Choosing a provider

| | Firebase | OneSignal |
|---|---|---|
| Native push (iOS/Android) | **Recommended** | Generic Capacitor token only |
| Web push | Yes (VAPID + service worker) | Yes (managed service worker) |
| Audience targeting | Topics (server-side) | Tags + segments (v3 User API) |
| Web service worker | You provide `firebase-messaging-sw.js` | Managed automatically |

## Sending is server-side

Neither provider sends notifications from the client. Delivering a push requires your backend and the provider's REST/Admin API with a **secret key** that must never ship in client code. On the device, the kit registers tokens, manages permission, and handles incoming messages.

## Next steps

- [Configuration](configuration.md) — full provider config options.
- [Platform Setup](platform-setup.md) — service worker and native setup.
- [Notification Types](notification-types.md)
