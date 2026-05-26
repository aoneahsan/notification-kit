# Phase 07 — Provider honesty + OneSignal v3 + completion

**Goal:** Make OneSignal work against the v3 API floor we now require; make Firebase topics + native OneSignal honest.
**Skills:** `capacitor-push-notifications`, `capacitor-best-practices`, `security-review` (re-check CP-S1 stays fixed). **KR-3: riskiest phase.**
**Reference:** findings.md §C — CP-M6 (primary), CP-H5, CP-M7, CP-H7, CP-H8.

## Work items

- **phase07.1 — CP-M6 (High, primary):** Rewrite `OneSignalProvider.ts` web paths to the **react-onesignal v3** API. **Base it on the installed types**, not memory: read `node_modules/react-onesignal/dist/index.d.ts` (and `onesignal` types it re-exports) FIRST. Likely mappings:
  - `OneSignal.on('notificationReceived'|'notificationDisplay', cb)` → `OneSignal.Notifications.addEventListener('foregroundWillDisplay'|'click', cb)`
  - `OneSignal.getUserId()` → `OneSignal.User.PushSubscription.id` (+ `.token`)
  - `OneSignal.isPushNotificationsEnabled()` → `OneSignal.Notifications.permission` / `OneSignal.User.PushSubscription.optedIn`
  - `OneSignal.sendTag/deleteTag` → `OneSignal.User.addTag/removeTag`
  - `OneSignal.setExternalUserId/logoutUser` → `OneSignal.login(id)/logout()`
  - `OneSignal.showSlidedownPrompt()` → `OneSignal.Slidedown.promptPush()`
  - permission request → `OneSignal.Notifications.requestPermission()`
  - **Remove the `as unknown as {...}` casts** so the compiler validates against real types.
- **phase07.2 — CP-H5 + CP-M7:** Native action handler (`:459-463`) consistent `?.`. `subscriptionChanged` (`:548-562`) await/dedupe; notify token listeners on subscribe AND unsubscribe.
- **phase07.3 — CP-H7:** Firebase topics (`FirebaseProvider.ts:239-273,530-538`). Report `topics:false` for pure client-side Firebase in `getCapabilities`, OR add an optional `topicsEndpoint`/`topicsHandler` config hook so consumers can wire their own backend; until configured, `subscribe`/`unsubscribe` throw a descriptive "configure topicsEndpoint or do this server-side" error. `getSubscriptions` should reflect reality, not silent `[]`.
- **phase07.4 — CP-H8:** Native OneSignal (`OneSignalProvider.ts:57-66,588-609`, `OneSignalNativeBridge.ts`). Since full native SDK integration is out of scope, make it **honest**: report correct capabilities for native OneSignal, and have `getToken`/`subscribe`/permission throw a clear "native OneSignal requires the OneSignal native SDK; not bundled — use FCM (FirebaseProvider) for native push" rather than the misleading "not initialized". Document in provider docs.

## Verification
- Read installed `react-onesignal` d.ts to confirm the real API before editing. `yarn type-check` (no casts hiding drift) + `yarn build` + `yarn test --run` clean. `grep -n "as unknown as" src/providers/OneSignalProvider.ts` → minimized/zero.

## Status log
| Date | Sub-task | Result |
|---|---|---|
| | | |
