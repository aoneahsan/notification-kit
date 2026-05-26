---
title: Permissions
sidebar_position: 4
---

# Permissions

Push and local notifications require the user's permission to display. In-app toasts do not.

## The API

```ts
notifications.requestPermission(): Promise<boolean>   // prompt the user
notifications.checkPermission(): Promise<PermissionStatus> // current status, no prompt
notifications.isPermissionGranted(): Promise<boolean> // convenience boolean
```

`PermissionStatus` is one of: `granted`, `denied`, `prompt`, `provisional`, `default`, `unknown`.

## Request at the right time

Request permission in response to a clear **user action**, not on app launch. Browsers and iOS penalize unprompted requests, and a denied prompt is hard to recover from.

```tsx
import { notifications } from 'notification-kit';

async function onEnableClicked() {
  const granted = await notifications.requestPermission();
  if (!granted) {
    notifications.warning('Notifications are off', 'Enable them in system settings.');
    return;
  }
  const token = await notifications.getToken();
  await sendTokenToBackend(token);
}
```

## Check before scheduling

Use `checkPermission()` / `isPermissionGranted()` to branch your UI without prompting:

```tsx
if (await notifications.isPermissionGranted()) {
  await notifications.schedule({ id: 'r1', title: 'Hi', body: 'Reminder', at: new Date(Date.now() + 60000) });
} else {
  // show your "enable notifications" call-to-action
}
```

## React to permission changes

```tsx
const off = notifications.on('permissionChanged', (event) => {
  console.log('Permission is now:', event.status, '(granted:', event.granted, ')');
});
// off(); to stop listening
```

## Platform notes

- **Android 13+** requires the `POST_NOTIFICATIONS` runtime permission — declare it in the manifest and request it via `requestPermission()`. See [Platform Setup](platform-setup.md#android).
- **iOS** may grant `provisional` permission (quiet delivery) depending on how you request — treat anything other than `granted`/`provisional` as not enabled. Test on a real device.
- **Web** permission is per-origin and requires HTTPS. Once a user picks "Block", you cannot re-prompt from JavaScript — they must change it in browser settings.

## When permission is denied

You cannot force a re-prompt. Guide the user to system/browser settings and provide a non-notification fallback (e.g. an in-app inbox using in-app toasts, which need no permission).

## Next steps

- [Core API](../api/core.md)
- [React Hooks](../api/react-hooks.md)
- [Troubleshooting](troubleshooting.md)
