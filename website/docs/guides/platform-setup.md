---
title: Platform Setup
sidebar_position: 4
---

# Platform Setup

Notifications need platform-specific configuration beyond the JavaScript API. Set up each target you ship to.

## iOS

1. Add the background modes to `ios/App/App/Info.plist`:

   ```xml
   <key>UIBackgroundModes</key>
   <array>
     <string>remote-notification</string>
   </array>
   ```

2. In Xcode:
   - Enable the **Push Notifications** capability.
   - For Firebase, add `GoogleService-Info.plist` to the project.

3. Push notifications do **not** work in the iOS Simulator — test on a real device.

## Android

1. For **Firebase**:
   - Add `google-services.json` to `android/app/`.
   - In `android/app/build.gradle`:

     ```gradle
     apply plugin: 'com.google.gms.google-services'
     ```

   - In `android/build.gradle`:

     ```gradle
     dependencies {
       classpath 'com.google.gms:google-services:4.4.0'
     }
     ```

2. Declare the runtime permissions in `android/app/src/main/AndroidManifest.xml`:

   ```xml
   <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
   <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
   ```

   `POST_NOTIFICATIONS` is required on Android 13+ and must be requested at runtime via `notifications.requestPermission()`.

3. For **OneSignal**: no extra Gradle setup is required.

4. On Android 8+, deliver notifications through a [channel](notification-types.md#android-channels).

## Web (browser push)

Browser push requires **HTTPS** (localhost is exempt) and a **service worker**.

### Firebase

1. Create `public/firebase-messaging-sw.js`. The shipped template loads the Firebase compat SDK from the CDN at version `12.13.0`:

   ```js
   importScripts('https://www.gstatic.com/firebasejs/12.13.0/firebase-app-compat.js');
   importScripts('https://www.gstatic.com/firebasejs/12.13.0/firebase-messaging-compat.js');

   firebase.initializeApp({
     // Same config you pass to NotificationKit.init()
   });

   const messaging = firebase.messaging();
   ```

2. Provide the **VAPID key** in your `init` config (`config.vapidKey`) for web push to work.

3. The package ships this template under `src/templates/`. You can copy it manually, or let the bundled `notification-kit-setup` CLI deploy it for you:

   ```bash
   npx notification-kit-setup
   ```

   If you serve the service worker from a non-default path, set `serviceWorkerPath` in your `init` config.

### OneSignal

OneSignal manages its own service worker on the web — no manual `firebase-messaging-sw.js` is needed. Configure paths through the OneSignal `config` if you customize them.

## Capacitor sync

After installing the `@capacitor/*` plugins, sync native projects:

```bash
yarn cap sync
```

## Verifying setup

- **iOS / Android:** run on a real device, call `requestPermission()` from a button, then `getToken()` — a non-empty token means registration succeeded.
- **Web:** open DevTools → Application → Service Workers and confirm the worker is registered and active.

See [Troubleshooting](troubleshooting.md) if tokens are null or notifications don't appear.

## Next steps

- [Notification Types](notification-types.md)
- [Permissions](permissions.md)
- [Providers](providers.md)
