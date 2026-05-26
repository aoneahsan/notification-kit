---
title: Installation
sidebar_position: 2
---

# Installation

## Install the package

```bash
yarn add notification-kit
```

That is the only required install. `notification-kit` has **zero required runtime dependencies** — the core (including in-app toast notifications) works immediately.

## Requirements

- **Node** `>=20`
- A bundler/runtime that supports ESM or CommonJS. The package ships **both** formats, so `import` and `require` both resolve:

  ```js
  import { NotificationKit, notifications } from 'notification-kit'; // ESM
  const { NotificationKit, notifications } = require('notification-kit'); // CJS
  ```

## Entry points

| Import path | Contents |
|---|---|
| `notification-kit` | Core API — `NotificationKit`, `notifications`, providers, utilities, all types |
| `notification-kit/react` | React hooks — `useNotifications`, `useInAppNotification` |

```ts
import { NotificationKit, notifications } from 'notification-kit';
import { useNotifications, useInAppNotification } from 'notification-kit/react';
```

## Optional peer dependencies

Every peer dependency is **optional** (declared via `peerDependenciesMeta`). Install only what a given feature needs. If a dependency is missing, the library degrades gracefully and throws a clear error only when you call the feature that requires it.

| Feature | Install | Minimum version |
|---|---|---|
| Capacitor native (iOS/Android) | `@capacitor/core` | `>=8.3.4` |
| Local notifications | `@capacitor/local-notifications` | `>=8.2.0` |
| Token/preferences storage | `@capacitor/preferences` | `>=8.0.1` |
| Native push registration | `@capacitor/push-notifications` | `>=8.1.1` |
| Firebase push | `firebase` | `>=12.13.0` |
| React hooks | `react`, `react-dom` | `>=19.2.6` |
| OneSignal push | `react-onesignal` | `>=3.5.3` |

### Recommended setups

**Firebase (recommended for native push):**

```bash
yarn add notification-kit firebase \
  @capacitor/core @capacitor/push-notifications \
  @capacitor/local-notifications @capacitor/preferences
yarn cap sync
```

**OneSignal (web focus):**

```bash
yarn add notification-kit react-onesignal \
  @capacitor/core @capacitor/push-notifications \
  @capacitor/local-notifications @capacitor/preferences
yarn cap sync
```

**React hooks (any of the above):**

```bash
yarn add react react-dom
```

**In-app toasts only** (no provider, no Capacitor): nothing beyond `notification-kit`.

## What you can skip

- Don't use push? Skip `firebase` / `react-onesignal`.
- Web-only app? Skip the `@capacitor/*` plugins.
- Not using hooks? Skip `react` / `react-dom`.

This keeps your bundle minimal — the package is tree-shakeable, so unused exports are dropped.

## Next steps

- [Configuration](configuration.md) — wire up your provider.
- [Platform Setup](platform-setup.md) — iOS, Android, web service worker.
- [Quick Start](quick-start.md) — first working example.
