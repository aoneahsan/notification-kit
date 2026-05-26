---
title: Architecture
sidebar_position: 1
---

# Architecture

`notification-kit` is built around a small, framework-independent core that delegates platform- and provider-specific work to optional adapters. Understanding the layers helps you reason about what runs where.

## Layers

```
┌─────────────────────────────────────────────┐
│  Your app                                     │
│   notifications.*   /   useNotifications()    │  ← public API + React hooks
├─────────────────────────────────────────────┤
│  NotificationKit core (zero deps)             │
│   permissions · platform detection · storage  │
│   event bus · in-app toast manager            │
├──────────────────────┬──────────────────────┤
│  FirebaseProvider     │  OneSignalProvider    │  ← optional provider adapters
├──────────────────────┴──────────────────────┤
│  Platform SDKs (optional peers, lazy-loaded)  │
│   firebase · react-onesignal · @capacitor/*   │
└─────────────────────────────────────────────┘
```

## The core is dependency-free

The core never imports React or any provider SDK. It works on its own for in-app notifications, permission checks, and platform detection. Provider and platform SDKs are loaded **dynamically** only when a feature that needs them is called. A missing optional peer therefore never breaks startup — it surfaces a clear error at the call site instead.

## Singleton + convenience proxy

There is one `NotificationKit` instance per app, reached two ways:

- `NotificationKit.init(config)` / `NotificationKit.getInstance()` — the class itself.
- `notifications` — a convenience object that forwards every call to the singleton (`notifications.schedule(...)` → `NotificationKit.getInstance().scheduleLocalNotification(...)`).

Because state lives in the singleton, there is **no React provider to mount**. Initialize once; call the API from anywhere.

## Three notification kinds, one API

| Kind | Where it runs | Needs a provider? |
|---|---|---|
| **Push** | Delivered by Firebase/OneSignal; received on device | Yes |
| **Local** | Scheduled and fired on-device by the OS | No (uses Capacitor) |
| **In-app** | Rendered in your own UI as a toast | No |

See [Notification Types](notification-types.md) for the details of each.

## Event flow

The core exposes a typed event bus. Provider adapters translate native/SDK callbacks into a uniform set of events (`notificationReceived`, `notificationActionPerformed`, `tokenReceived`, `tokenRefreshed`, `permissionChanged`). The `onPush` and `onPushOpened` helpers are thin wrappers over this bus. Every subscription returns an unsubscribe function for clean teardown.

## Platform detection

`platform.detect()` and `platform.getCapabilities()` report the current environment (`web` / `ios` / `android` / `electron`) and which features it supports. The core uses this to pick the correct code path — for example, routing local notifications to the Capacitor plugin on native and gracefully no-opping where unsupported on web.

## Source map

| Folder | Responsibility |
|---|---|
| `src/core/` | `NotificationKit` class, permissions, platform, storage, event bus |
| `src/providers/` | `FirebaseProvider`, `OneSignalProvider` + native bridges |
| `src/react/` | `useNotifications`, `useInAppNotification` hooks |
| `src/utils/` | Validation, scheduling, formatting, in-app toast manager |
| `src/templates/` | Web push service-worker templates |

## Next steps

- [Providers](providers.md)
- [Notification Types](notification-types.md)
- [Permissions](permissions.md)
