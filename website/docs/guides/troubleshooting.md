---
title: Troubleshooting
sidebar_position: 1
---

# Troubleshooting

Common issues and how to resolve them.

## Initialization

**Nothing happens / "not initialized" errors**

- Ensure `NotificationKit.init(...)` runs **before** any other notification call.
- `await` the `init` call — it is asynchronous.
- Double-check the provider `config`; a wrong `projectId` or missing `vapidKey` (web) silently breaks push.
- Enable `debug: true` in the config for verbose internal logs.

## Missing dependency errors

The core is dependency-free, so a feature that needs an optional peer throws a clear error if the peer isn't installed.

| Error mentions | Install |
|---|---|
| `firebase` | `yarn add firebase` |
| `react-onesignal` | `yarn add react-onesignal` |
| local notifications | `yarn add @capacitor/local-notifications && yarn cap sync` |
| push registration | `yarn add @capacitor/push-notifications && yarn cap sync` |

See [Installation](installation.md) for version floors.

## Push tokens

**`getToken()` returns null/empty**

- Permission must be granted first — call `requestPermission()` and confirm it resolved `true`.
- Web push requires HTTPS, a registered service worker, and a `vapidKey`.
- Native push requires a real device (not a simulator/emulator) and the platform setup from [Platform Setup](platform-setup.md).

## Topic subscription throws (Firebase)

`notifications.subscribe(topic)` / `unsubscribe(topic)` throw on the **client** with Firebase. FCM topic management is **server-side only** — subscribe devices from your backend with the Admin API. This is expected behavior, not a bug. See [Providers](providers.md#topics-on-firebase).

## Notifications don't appear

**iOS**

- Confirm the **Push Notifications** capability is enabled in Xcode.
- Test on a physical device — the Simulator does not receive push.
- Verify your APNs/Firebase certificates.

**Android**

- On Android 8+, deliver through a channel with sufficient `importance` (4 or 5). See [channels](notification-types.md#android-channels).
- On Android 13+, the `POST_NOTIFICATIONS` runtime permission must be granted.
- Foreground messages may need explicit handling — use `onPush(...)`.

**Web in-app toasts not showing**

- Check the browser console for errors.
- Make sure no global CSS overrides the notification container's `z-index` or visibility — raise it via `inApp.zIndex` in your config.
- Confirm `NotificationKit.init(...)` ran.

## Recurring schedule fired once / never repeats

Recurring notifications use **top-level** `every` + `on`, not a nested `schedule` object:

```tsx
// Correct
await notifications.schedule({ id: 'r', title: 'T', body: 'B', every: 'day', on: { hour: 9, minute: 0 } });
```

See [Notification Types](notification-types.md#recurring).

## Wrong event name

Only these `on(event, cb)` keys are valid: `notificationReceived`, `notificationActionPerformed`, `tokenReceived`, `tokenRefreshed`, `permissionChanged`. The names `'push'`, `'pushOpened'`, `'tokenRefresh'`, and `'permissionChange'` are **invalid** — use the `onPush` / `onPushOpened` helpers for the common push cases.

## Sending notifications from the app

You cannot send push notifications from client code, by design. Delivery requires your backend and the provider's REST/Admin API with a secret key that must never be bundled in the app. See [Providers](providers.md#sending-is-server-side).

## Still stuck?

Open an issue at [github.com/aoneahsan/notification-kit/issues](https://github.com/aoneahsan/notification-kit/issues) with your platform, provider, and a minimal reproduction.
