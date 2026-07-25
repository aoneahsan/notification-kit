<div align="center">

<img src="https://raw.githubusercontent.com/aoneahsan/notification-kit-docs/main/static/img/logo.svg" width="120" alt="notification-kit logo" />

# notification-kit

**One API for push, in-app, and local notifications across Web, iOS, and Android.**

[![npm version](https://img.shields.io/npm/v/notification-kit.svg)](https://www.npmjs.com/package/notification-kit)
[![downloads](https://img.shields.io/npm/dm/notification-kit.svg)](https://www.npmjs.com/package/notification-kit)
[![license](https://img.shields.io/npm/l/notification-kit.svg)](https://github.com/aoneahsan/notification-kit/blob/main/LICENSE)
[![types](https://img.shields.io/npm/types/notification-kit.svg)](https://www.npmjs.com/package/notification-kit)
[![unpacked size](https://img.shields.io/npm/unpacked-size/notification-kit)](https://www.npmjs.com/package/notification-kit)
[![node](https://img.shields.io/node/v/notification-kit.svg)](https://nodejs.org)

[Docs](https://notification-kit-docs.aoneahsan.com) ·
[npm](https://www.npmjs.com/package/notification-kit) ·
[GitHub](https://github.com/aoneahsan/notification-kit) ·
[Changelog](https://github.com/aoneahsan/notification-kit/blob/main/CHANGELOG.md) ·
[AI Guide](https://github.com/aoneahsan/notification-kit/blob/main/AI-INTEGRATION-GUIDE.md) ·
[Support](https://aoneahsan.com/payment?project-id=notification-kit&project-identifier=notification-kit)

</div>

> [!IMPORTANT]
> notification-kit has **zero runtime dependencies**. Provider SDKs (`firebase`, `react-onesignal`) and
> Capacitor plugins are **not** installed for you — you add only the ones you use. In-app notifications
> work with nothing else installed. See [Requirements](#requirements).

notification-kit gives React and Capacitor apps a single notification API instead of three. Push
notifications (Firebase Cloud Messaging or OneSignal), local scheduled notifications, and in-app toasts all
share one call surface, one permission model, and one event stream, so the same code runs on Web, iOS, and
Android. It is provider-less by design: no React context, no wrapper component — initialise once, then call
from anywhere, including code outside the React tree.

| | |
|---|---|
| **Version** | 2.1.3 |
| **License** | MIT |
| **Node** | ≥ 20 (developed and built on 24) |
| **Platforms** | Web · iOS · Android (iOS/Android via Capacitor) |
| **Install size** | ≈ 93 KB packed · ≈ 430 KB unpacked |
| **Types** | Bundled — `.d.ts` for both ESM and CJS |
| **Runtime dependencies** | None |
| **Status** | Stable, actively maintained |

<a id="table-of-contents"></a>
## 🧭 Table of Contents&nbsp;[#](#table-of-contents)

- [💡 Why notification-kit](#why-notification-kit)
- [✨ Features](#features)
- [📱 Platform Support](#platform-support)
- [📋 Requirements](#requirements)
- [📦 Installation](#installation)
- [🚀 Quick Start](#quick-start)
- [🛠️ Usage](#usage)
- [⚙️ Configuration](#configuration)
- [🔧 API Reference](#api-reference)
- [🧩 Types](#types)
- [💻 Command Line](#command-line)
- [🧪 Examples](#examples)
- [🎛️ Advanced Features](#advanced-features)
- [🚑 Recovery & Troubleshooting](#recovery-troubleshooting)
- [🚧 Limitations](#limitations)
- [❓ FAQ](#faq)
- [📚 Documentation](#documentation)
- [🔄 Changelog](#changelog)
- [🤝 Contributing](#contributing)
- [💬 Support](#support)
- [📄 License](#license)
- [👤 Author](#author)
- [🔗 Links](#links)
- [🏷️ Keywords](#keywords)

<a id="why-notification-kit"></a>
## 💡 Why notification-kit&nbsp;[#](#why-notification-kit)

A cross-platform app usually ends up with three separate notification stacks: an FCM or OneSignal web SDK, a
Capacitor plugin pair for native, and a toast library for in-app messages. Each has its own permission call,
its own event names, and its own idea of what a notification looks like. Feature code ends up branching on
platform.

notification-kit collapses that into one module:

- **One call surface.** `notifications.schedule(...)` behaves the same on Web, iOS, and Android.
- **One permission model.** `requestPermission()` maps to the right native or browser prompt.
- **Swappable provider.** Firebase and OneSignal sit behind the same interface, so changing provider is a
  change to `init()`, not to your feature code.
- **No provider component.** Nothing to mount, so notifications work in modals, route loaders, service
  layers, and dynamically injected components alike.
- **Pay only for what you use.** Provider SDKs load through dynamic `import()`, so an app that only shows
  in-app toasts never pulls Firebase into its bundle.

<a id="features"></a>
## ✨ Features&nbsp;[#](#features)

| Feature | Detail |
|---|---|
| **Push notifications** | Firebase Cloud Messaging or OneSignal, with token retrieval, refresh, and topic subscription |
| **Local notifications** | Scheduling by absolute time, relative delay, or repeat interval |
| **In-app notifications** | Toast-style messages rendered by the library — no extra dependency, no provider |
| **Unified permissions** | One `requestPermission()` across the browser Notification API and native prompts |
| **Android channels** | Create, list, and delete notification channels with importance and visibility |
| **Event stream** | Typed `on()` / `off()` for received, opened, action, token, and permission events |
| **Platform detection** | Reports the running platform and its real notification capabilities |
| **Zero runtime dependencies** | Nothing is installed on your behalf; optional SDKs load dynamically |
| **Dual ESM + CJS** | `import` and `require` both work, each with its own type declarations |
| **TypeScript-first** | Written in TypeScript; every public type is exported |
| **Setup CLI** | `notification-kit-setup` scaffolds provider config and service workers |

<a id="platform-support"></a>
## 📱 Platform Support&nbsp;[#](#platform-support)

| Platform | Push | Local | In-app | Notes |
|---|:---:|:---:|:---:|---|
| **Web** | ✅ | ✅ | ✅ | Push needs a service worker and HTTPS. Safari needs 16.4+, and on iOS the site must be installed to the Home Screen. |
| **iOS** (Capacitor) | ✅ | ✅ | ✅ | Push requires a physical device, an APNs key, and the Push Notifications capability. Simulators cannot receive push. |
| **Android** (Capacitor) | ✅ | ✅ | ✅ | Android 13+ requires the runtime `POST_NOTIFICATIONS` permission. Channels are required from Android 8. |

In-app notifications need only a DOM, so they work in any browser context — including a plain React app with
no Capacitor installed.

<a id="requirements"></a>
## 📋 Requirements&nbsp;[#](#requirements)

Node ≥ 20 to build. At runtime the library itself needs nothing — every integration below is an **optional
peer dependency** you install only if you use it.

| Peer | Minimum | Needed for |
|---|---|---|
| `react`, `react-dom` | 19.2.6 | the `notification-kit/react` hooks |
| `@capacitor/core` | 8.3.4 | any native (iOS/Android) behaviour |
| `@capacitor/push-notifications` | 8.1.1 | native push |
| `@capacitor/local-notifications` | 8.2.0 | native local notifications |
| `@capacitor/preferences` | 8.0.1 | native persistent storage |
| `firebase` | 12.13.0 | the Firebase Cloud Messaging provider |
| `react-onesignal` | 3.5.3 | the OneSignal provider |

A missing optional peer is not a crash: the feature that needs it throws a message naming the package to
install, and everything else keeps working.

<a id="installation"></a>
## 📦 Installation&nbsp;[#](#installation)

```bash
yarn add notification-kit
```

Then add only what your app actually uses:

```bash
# Native (iOS/Android) support
yarn add @capacitor/core @capacitor/push-notifications @capacitor/local-notifications @capacitor/preferences
npx cap sync

# Firebase Cloud Messaging provider
yarn add firebase

# OneSignal provider
yarn add react-onesignal

# React hooks
yarn add react react-dom
```

Optionally scaffold provider config and service workers:

```bash
npx notification-kit-setup
```

<a id="quick-start"></a>
## 🚀 Quick Start&nbsp;[#](#quick-start)

**1. Initialise once**, as early as your app boots:

```tsx
import { NotificationKit } from 'notification-kit';

await NotificationKit.init({
  provider: 'firebase', // or 'onesignal'
  config: {
    // Firebase: the six web-app values plus vapidKey for web push.
    // OneSignal: just { appId }.
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
  },
});
```

**2. Use it anywhere** — no provider component, no context:

```tsx
import { notifications } from 'notification-kit';

await notifications.requestPermission();

await notifications.schedule({
  id: 'standup-reminder',
  title: 'Standup',
  body: 'Starting in 5 minutes',
  in: { minutes: 5 },
});

await notifications.success('Saved', 'Your changes are stored.');
```

**3. Or use the React hooks:**

```tsx
import { useNotifications, useInAppNotification } from 'notification-kit/react';

function SaveButton() {
  const { isPermissionGranted, requestPermission } = useNotifications();
  const notify = useInAppNotification();

  const save = async () => {
    if (!isPermissionGranted) await requestPermission();
    await notify.success('Saved');
  };

  return <button onClick={save}>Save</button>;
}
```

<a id="usage"></a>
## 🛠️ Usage&nbsp;[#](#usage)

### Push notifications

```tsx
import { notifications } from 'notification-kit';

const token = await notifications.getToken(); // register this with your server
await notifications.subscribe('news');

// onPush fires in the foreground; onPushOpened fires when the user taps.
// Both return their own unsubscribe function.
const stopListening = notifications.onPush((notification) => { /* … */ });

notifications.onPushOpened((notification) => {
  if (notification.data?.screen) router.push(notification.data.screen);
});

stopListening();
```

### Local notifications

`id`, `title`, and `body` are required. Choose one timing option — `in` (relative), `at` (absolute), or
`every` (repeating, optionally pinned to a time with `on`).

```tsx
import { notifications } from 'notification-kit';

await notifications.schedule({
  id: 'meeting-5m',
  title: 'Reminder',
  body: 'Meeting in 5 minutes',
  in: { minutes: 5 },
});

await notifications.schedule({
  id: 'standup',
  title: 'Daily standup',
  body: 'Team meeting starting',
  at: new Date('2026-08-20T09:00:00'),
});

await notifications.schedule({
  id: 'morning-routine',
  title: 'Morning routine',
  body: 'Start your day right',
  every: 'day',
  on: { hour: 7, minute: 30 },
});

// Cancel by the id you supplied
await notifications.cancel('meeting-5m');
```

For a weekly notification use `every: 'week'` with `on: { weekday, hour, minute }`, where `weekday` is `1`
(Monday) through `7` — one schedule per day you want. Full options:
[local notifications guide](https://notification-kit-docs.aoneahsan.com/guides/local-notifications).

### In-app notifications

These need no provider and no permission — they render into the DOM.

```tsx
import { notifications, dismissInAppNotification } from 'notification-kit';

// Four shorthands: success, error, warning, info
await notifications.success('Saved successfully');
await notifications.error('Something went wrong');

// Or the full form, which resolves to the notification's id
const id = await notifications.showInApp({
  title: 'New message',
  message: 'John sent you a message',
  type: 'info',
  duration: 5000,
  position: 'top-right',
  action: { label: 'View', onClick: () => router.push('/messages') },
});

await dismissInAppNotification(id);
```

<a id="configuration"></a>
## ⚙️ Configuration&nbsp;[#](#configuration)

Everything is configured in the same `init()` call shown in [Quick Start](#quick-start). Beyond `provider`
and `config`, two optional blocks tune in-app notifications — `inApp` controls **where and how long** one
appears, `styles` controls **how it looks**. Colours live under `styles.colors`, not under `inApp`.

```tsx
await NotificationKit.init({
  provider: 'firebase',
  config: { /* provider credentials */ },

  inApp: {
    position: 'top-right', // 7 positions, from 'top-left' to 'center'
    duration: 4000,
    maxStack: 3,
    zIndex: 9999,
  },

  styles: {
    theme: 'auto', // 'light' | 'dark' | 'auto'
    colors: { success: '#10B981', error: '#EF4444', warning: '#F59E0B', info: '#3B82F6' },
    fontFamily: 'system-ui',
    borderRadius: '8px',
  },

  debug: false,
});
```

`NotificationConfig` also accepts `serviceWorkerPath`, `storage`, `environment`, and `features` — see
[configuration](https://notification-kit-docs.aoneahsan.com/getting-started/configuration).

Per-platform setup — `Info.plist` keys, `google-services.json`, the web service worker — is covered in the
docs: [iOS](https://notification-kit-docs.aoneahsan.com/platforms/ios) ·
[Android](https://notification-kit-docs.aoneahsan.com/platforms/android) ·
[Web](https://notification-kit-docs.aoneahsan.com/platforms/web).

<a id="api-reference"></a>
## 🔧 API Reference&nbsp;[#](#api-reference)

Full reference: [notification-kit-docs.aoneahsan.com/reference/api-overview](https://notification-kit-docs.aoneahsan.com/reference/api-overview).

### `notifications` — the everyday surface

```ts
// Permissions and tokens
requestPermission(): Promise<boolean>
checkPermission(): Promise<PermissionStatus>
isPermissionGranted(): Promise<boolean>
getToken(): Promise<string>
deleteToken(): Promise<void>

// Topics and push listeners — each listener returns its own unsubscribe
subscribe(topic: string): Promise<void>
unsubscribe(topic: string): Promise<void>
onPush(cb): () => void
onPushOpened(cb): () => void

// Local notifications
schedule(options: ScheduleOptions & LocalNotificationPayload): Promise<void>
cancel(id: string | number): Promise<void>
cancelAll(): Promise<void>
getPending(): Promise<Notification[]>

// In-app notifications — resolve to the new notification's id
showInApp(options: InAppOptions): Promise<string>
success | error | warning | info (title: string, message?: string): Promise<string>

// Events
on(event, callback): () => void
off(event, callback?): void
```

Also available for managing already-delivered notifications: `getDelivered()`, `removeDelivered(id)`, and
`removeAllDelivered()`.

### `NotificationKit` — the instance surface

Channel management, teardown, and capability checks live on the singleton rather than on `notifications`:

```ts
NotificationKit.init(config): Promise<void>          // static
const kit = NotificationKit.getInstance();

kit.createChannel(channel) · kit.deleteChannel(id) · kit.listChannels()
kit.isSupported() · kit.getPlatform() · kit.getCapabilities()
kit.isInitialized() · kit.destroy()
```

### React hooks — `notification-kit/react`

`useNotifications()` returns the permission state (`isPermissionGranted` is a **boolean**, not a function),
token helpers, topic subscription, scheduling, channel management, and an `showInApp` group.
`useInAppNotification()` returns `success` / `error` / `warning` / `info` / `show` / `dismiss` / `dismissAll`
plus `hasActive`, `activeCount`, and the `onShow` / `onDismiss` subscriptions.
`useInAppNotificationSimple`, `useInAppNotificationQueue` (sequential toast display), and
`useInAppNotificationPersistence` are also exported. Signatures:
[React hooks reference](https://notification-kit-docs.aoneahsan.com/reference/react-hooks).

<a id="types"></a>
## 🧩 Types&nbsp;[#](#types)

Written in TypeScript; every public type is exported from the package root and re-exported from
`notification-kit/react`. Both the ESM and CJS builds ship their own declarations, so `import` and `require`
consumers get identical types.

```ts
import {
  type NotificationConfig,
  type ScheduleOptions,
  type LocalNotificationPayload,
  type InAppOptions,
  type NotificationChannel,
  type PermissionStatus,
  type Platform,
} from 'notification-kit';

const reminder: ScheduleOptions & LocalNotificationPayload = {
  id: 'meeting',
  title: 'Meeting',
  body: 'Starting in 10 minutes',
  in: { minutes: 10 },
  data: { meetingId: '123' },
};
```

Worth knowing when reading the types:

- `schedule()` takes `ScheduleOptions & LocalNotificationPayload`, so **`id` is required** — that id is the
  handle you later pass to `cancel()`.
- `ChannelImportance` is numeric (`1`–`5`), not a string.
- `Weekday` is `1`–`7`, Monday through Sunday.

Full type reference: [config types](https://notification-kit-docs.aoneahsan.com/reference/config-types).

<a id="command-line"></a>
## 💻 Command Line&nbsp;[#](#command-line)

```bash
npx notification-kit-setup
```

An interactive scaffolder. It detects your framework and whether Capacitor is present, asks which provider
you want, then writes the provider config and the matching service worker into your project. It needs an
interactive terminal and is not designed for CI.

<a id="examples"></a>
## 🧪 Examples&nbsp;[#](#examples)

A runnable React + Capacitor app lives in the repository at
[`examples/react-capacitor-example`](https://github.com/aoneahsan/notification-kit/tree/main/examples/react-capacitor-example).
It covers initialisation, the React hooks, all three notification kinds, permissions, and token handling.

More worked examples: [docs quick start](https://notification-kit-docs.aoneahsan.com/getting-started/quick-start).

<a id="advanced-features"></a>
## 🎛️ Advanced Features&nbsp;[#](#advanced-features)

### Android notification channels

Required from Android 8. Importance is numeric — `5` is highest.

```tsx
import { NotificationKit } from 'notification-kit';

const kit = NotificationKit.getInstance();

await kit.createChannel({
  id: 'important',
  name: 'Important notifications',
  description: 'Critical app notifications',
  importance: 5,
  sound: 'notification.wav',
  vibration: true,
  lights: true,
  lightColor: '#FF0000',
});
```

Then pass `channelId: 'important'` when scheduling. Details:
[channels guide](https://notification-kit-docs.aoneahsan.com/guides/channels).

### Grouping and presentation

Notifications sharing a `group` collapse together on Android; mark one of them `groupSummary: true` as the
header. `largeIcon`, `color`, `autoCancel`, `ongoing`, and `badge` are also accepted per notification.

```tsx
await notifications.schedule({
  id: 'msg-summary',
  title: 'New messages',
  body: 'You have 3 new messages',
  group: 'messages',
  groupSummary: true,
  in: { seconds: 5 },
});
```

### Reacting to actions

```tsx
notifications.on('notificationActionPerformed', (event) => {
  switch (event.actionId) {
    case 'complete':
      return markTaskComplete(event.notification.id);
    case 'snooze':
      return snoozeNotification(event.notification.id);
  }
});
```

The full event list — received, opened, action, token, permission, subscribe — is in the
[events guide](https://notification-kit-docs.aoneahsan.com/guides/events).

### Platform capabilities

`platform.detect()` reports the running platform; `await platform.getCapabilities()` reports what
notification features it actually supports, so you can hide UI a platform cannot honour.

<a id="recovery-troubleshooting"></a>
## 🚑 Recovery & Troubleshooting&nbsp;[#](#recovery-troubleshooting)

| Symptom | Likely cause | Fix |
|---|---|---|
| `Cannot find module 'firebase'` at runtime | the optional peer is not installed | `yarn add firebase` (or `react-onesignal` for OneSignal) |
| A call throws "not initialized" | it ran before `init()` resolved | `await NotificationKit.init(...)` at boot, before first use |
| Nothing arrives on iOS | running on a simulator, or the capability is missing | test on a physical device, enable Push Notifications in Xcode, configure the APNs key |
| Push silently absent on Android 13+ | `POST_NOTIFICATIONS` was never granted | call `requestPermission()` from a user action, then re-check |
| Local notifications never fire on Android | no channel, or a channel with importance below `3` | create a channel and pass its `channelId` |
| Web push does nothing | no service worker, or the page is not HTTPS | serve over HTTPS and register the worker `notification-kit-setup` generates |
| `schedule()` fails to typecheck | `id` was omitted | `id` is required — it is also the handle `cancel()` needs |
| In-app toast does not appear | `init()` never ran, or app CSS overrides the container | check `isInitialized()`, then check `z-index` on the injected container |

Longer guide: [help/troubleshooting](https://notification-kit-docs.aoneahsan.com/help/troubleshooting).

<a id="limitations"></a>
## 🚧 Limitations&nbsp;[#](#limitations)

Stated plainly, so nothing surprises you after you adopt it:

- **Two providers only** — Firebase Cloud Messaging and OneSignal. There is no public adapter interface for
  registering a third provider from outside the package.
- **Sending is not included.** The library receives and schedules. Sending push to your users is a server
  job; OneSignal's REST key is deliberately never used from client code.
- **No offline queue.** Local notifications are handed to the OS immediately; there is no store-and-forward
  buffer for actions taken while offline.
- **No built-in localisation.** Notification text is whatever you pass in, so it localises with your app —
  the library ships no translation layer.
- **In-app notifications carry no ARIA wiring.** They render plain DOM without live-region announcements, so
  if you need screen-reader support today you must announce the message yourself.
- **Native behaviour needs a real device.** Push cannot be verified on an iOS simulator, and exact-time
  Android scheduling is subject to Doze and per-OEM battery optimisation.
- **Web push on Safari** requires 16.4+, and on iOS the site must be installed to the Home Screen.

<a id="faq"></a>
## ❓ FAQ&nbsp;[#](#faq)

**Do I need Capacitor?**
No. Without Capacitor you get web push, web local notifications, and in-app notifications. Capacitor only
adds the native iOS and Android paths.

**Do I have to wrap my app in a provider component?**
No. `init()` configures a singleton, so any module can import `notifications` and call it — including code
that never renders.

**Can I switch from Firebase to OneSignal later?**
Yes. Change `provider` and `config` in `init()`. The call surface your features use does not change.

**Does it really have zero dependencies?**
The published package declares no `dependencies`. Provider SDKs and Capacitor plugins are optional peers you
install yourself, loaded through dynamic `import()` only when the feature runs.

**Why does `schedule()` not return an id?**
Because you supply it. `id` is required in the options and is the same handle you pass to `cancel()`.

**Does it work with Next.js or plain React?**
Yes, for the web paths. Guard `init()` so it only runs in the browser, since notification APIs do not exist
during server rendering.

**Is it tree-shakeable?**
The ESM build is marked side-effect-free, so a bundler can drop exports you never import. Provider code sits
behind dynamic imports, so an app using only in-app notifications does not bundle Firebase or OneSignal.

<a id="documentation"></a>
## 📚 Documentation&nbsp;[#](#documentation)

The full documentation site is [notification-kit-docs.aoneahsan.com](https://notification-kit-docs.aoneahsan.com).

| Question | Page |
|---|---|
| What is this and how does it fit together? | [Introduction](https://notification-kit-docs.aoneahsan.com/intro) |
| How do I install it? | [Installation](https://notification-kit-docs.aoneahsan.com/getting-started/installation) |
| How do I get something working fast? | [Quick start](https://notification-kit-docs.aoneahsan.com/getting-started/quick-start) |
| What can I configure? | [Configuration](https://notification-kit-docs.aoneahsan.com/getting-started/configuration) |
| How do push notifications work end to end? | [Push notifications](https://notification-kit-docs.aoneahsan.com/guides/push-notifications) |
| How do I schedule local notifications? | [Local notifications](https://notification-kit-docs.aoneahsan.com/guides/local-notifications) |
| How do I show in-app toasts? | [In-app notifications](https://notification-kit-docs.aoneahsan.com/guides/in-app-notifications) |
| What do the React hooks give me? | [React hooks](https://notification-kit-docs.aoneahsan.com/guides/react-hooks) |
| How do Android channels work? | [Channels](https://notification-kit-docs.aoneahsan.com/guides/channels) |
| How do I handle permissions properly? | [Permissions](https://notification-kit-docs.aoneahsan.com/guides/permissions) |
| Which events can I listen to? | [Events](https://notification-kit-docs.aoneahsan.com/guides/events) |
| What native setup does each platform need? | [iOS](https://notification-kit-docs.aoneahsan.com/platforms/ios) · [Android](https://notification-kit-docs.aoneahsan.com/platforms/android) · [Web](https://notification-kit-docs.aoneahsan.com/platforms/web) |
| How do I set up my provider? | [Firebase](https://notification-kit-docs.aoneahsan.com/providers/firebase) · [OneSignal](https://notification-kit-docs.aoneahsan.com/providers/onesignal) |
| What is the exact API? | [API overview](https://notification-kit-docs.aoneahsan.com/reference/api-overview) · [NotificationKit](https://notification-kit-docs.aoneahsan.com/reference/notification-kit) · [notifications](https://notification-kit-docs.aoneahsan.com/reference/notifications) · [React hooks](https://notification-kit-docs.aoneahsan.com/reference/react-hooks) |
| What do the types mean? | [Config types](https://notification-kit-docs.aoneahsan.com/reference/config-types) |
| Something is broken | [Troubleshooting](https://notification-kit-docs.aoneahsan.com/help/troubleshooting) · [FAQ](https://notification-kit-docs.aoneahsan.com/help/faq) |
| I am an AI coding agent | [AI Integration Guide](https://github.com/aoneahsan/notification-kit/blob/main/AI-INTEGRATION-GUIDE.md) |

<a id="changelog"></a>
## 🔄 Changelog&nbsp;[#](#changelog)

Every released version is documented in
[CHANGELOG.md](https://github.com/aoneahsan/notification-kit/blob/main/CHANGELOG.md), newest first, following
[Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and [semantic versioning](https://semver.org/). It
also renders on the docs site at
[/changelog](https://notification-kit-docs.aoneahsan.com/changelog).

<a id="contributing"></a>
## 🤝 Contributing&nbsp;[#](#contributing)

Contributions are welcome. `main` is protected, so changes land through a pull request with a review: fork
the repository, branch, and open a PR. Read
[CONTRIBUTING.md](https://github.com/aoneahsan/notification-kit/blob/main/CONTRIBUTING.md) first — it covers
the development setup, the quality gates a PR must pass, and how to request collaborator access.

<a id="support"></a>
## 💬 Support&nbsp;[#](#support)

Found a bug or want a feature? Open an issue at
[github.com/aoneahsan/notification-kit/issues](https://github.com/aoneahsan/notification-kit/issues) —
naming your platform, provider, and package version makes it far faster to diagnose.

If this package saves you time, you can
[support its development](https://aoneahsan.com/payment?project-id=notification-kit&project-identifier=notification-kit).

<a id="license"></a>
## 📄 License&nbsp;[#](#license)

MIT © Ahsan Mahmood — see
[LICENSE](https://github.com/aoneahsan/notification-kit/blob/main/LICENSE).

<a id="author"></a>
## 👤 Author&nbsp;[#](#author)

**Ahsan Mahmood**

- Website — [aoneahsan.com](https://aoneahsan.com)
- GitHub — [@aoneahsan](https://github.com/aoneahsan)
- LinkedIn — [in/aoneahsan](https://www.linkedin.com/in/aoneahsan)
- Email — [aoneahsan@gmail.com](mailto:aoneahsan@gmail.com)

<a id="links"></a>
## 🔗 Links&nbsp;[#](#links)

| Resource | URL |
|---|---|
| Documentation | https://notification-kit-docs.aoneahsan.com |
| npm | https://www.npmjs.com/package/notification-kit |
| Source | https://github.com/aoneahsan/notification-kit |
| Issues | https://github.com/aoneahsan/notification-kit/issues |
| Changelog | https://github.com/aoneahsan/notification-kit/blob/main/CHANGELOG.md |
| Contributing | https://github.com/aoneahsan/notification-kit/blob/main/CONTRIBUTING.md |
| AI Integration Guide | https://github.com/aoneahsan/notification-kit/blob/main/AI-INTEGRATION-GUIDE.md |
| Example app | https://github.com/aoneahsan/notification-kit/tree/main/examples/react-capacitor-example |
| Docs source | https://github.com/aoneahsan/notification-kit-docs |
| Support the project | https://aoneahsan.com/payment?project-id=notification-kit&project-identifier=notification-kit |

<a id="keywords"></a>
## 🏷️ Keywords&nbsp;[#](#keywords)

`capacitor` · `react` · `notifications` · `push-notifications` · `local-notifications` ·
`in-app-notifications` · `firebase` · `onesignal` · `typescript` · `ios` · `android` · `web`
