---
title: Introduction
sidebar_position: 1
---

# notification-kit

**One API for push, local, and in-app notifications across Web, iOS, and Android.**

`notification-kit` is a unified notification library for React + Capacitor apps. Instead of wiring up Firebase Cloud Messaging, OneSignal, the Capacitor local-notifications plugin, and a toast component separately, you call a single, consistent API and the library routes the work to the right place for the current platform and provider.

## Why notification-kit

- **Unified API** — the same `notifications.schedule(...)`, `notifications.success(...)`, and `notifications.onPush(...)` calls work on web and native.
- **Zero required dependencies** — the core ships with no runtime dependencies. Every provider and platform SDK (`firebase`, `react-onesignal`, the `@capacitor/*` plugins, `react`) is an **optional** peer dependency. In-app toasts work with nothing else installed.
- **Provider-less design** — no React context providers or wrappers to mount. Initialize once, then call the API from anywhere.
- **Dual module formats** — ships both ESM and CommonJS, so `import` and `require` both work.
- **Full TypeScript support** — complete type definitions for every option and event.
- **Graceful degradation** — missing optional dependencies don't crash your app; you get a clear error only when you call a feature that needs one.

## 30-second example

```bash
yarn add notification-kit
```

```tsx
import { NotificationKit, notifications } from 'notification-kit';

// 1. Initialize once at app startup
await NotificationKit.init({
  provider: 'firebase',
  config: {
    apiKey: '...',
    authDomain: '...',
    projectId: '...',
    storageBucket: '...',
    messagingSenderId: '...',
    appId: '...',
    vapidKey: '...', // web push only
  },
});

// 2. Ask for permission (after a user action)
await notifications.requestPermission();

// 3. Show an in-app toast — no provider required
notifications.success('Saved!', 'Your changes were stored.');

// 4. Schedule a local notification
await notifications.schedule({
  id: 'reminder-1',
  title: 'Reminder',
  body: 'Meeting in 5 minutes',
  at: new Date(Date.now() + 5 * 60 * 1000),
});

// 5. React to incoming push
notifications.onPush((payload) => {
  console.log('Push received:', payload);
});
```

## What it does not do

`notification-kit` is a **client** library. It does **not** send push notifications. Delivering a push to a device requires a server using the provider's REST/Admin API and a secret key that must never ship in client code. Use the kit on the device to register tokens, manage permissions, schedule local notifications, and display in-app toasts; send the actual pushes from your backend.

## Where to go next

- New here? Start with the **[Quick Start](guides/quick-start.md)**.
- Setting up a project? See **[Installation](guides/installation.md)** and **[Configuration](guides/configuration.md)**.
- Want the full method list? Jump to the **[API Reference](api/core.md)**.
- Using React? See **[React Hooks](api/react-hooks.md)**.

## Requirements

- **Node** `>=20`
- A bundler that understands ESM or CommonJS (Vite, Next.js, Webpack, etc.)
- Optional peers, installed only as needed — see [Installation](guides/installation.md).

## License

MIT — by [Ahsan Mahmood](https://aoneahsan.com).
