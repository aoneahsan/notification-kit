# Phase 04 — Core correctness

**Goal:** Restore core functional truths: events fire, listeners clean up, capabilities report correctly, storage works, native token surfaces.
**Skills:** `capacitor-best-practices`, `capacitor-push-notifications`, `simplify`.
**Reference:** findings.md §C.

## Work items

- **phase04.1 — CP-H2 + CP-H1:** Fix `NotificationKit.ts:433-441` `emit()` so the `data` spread can't clobber the `id`/`type`/`timestamp` envelope (keep payload under `.data`, set canonical fields last). Then fix `onPush`/`onPushOpened` (`:717-734`) to filter on the real payload type (`event.data?.type === 'push'`) and emit a real push-opened/action signal. Verify the event-map types in `types.ts` stay correct.
- **phase04.2 — CP-C3 + CP-H3:** `NotificationKit.ts:516-548`. `await` each `LocalNotifications.addListener`, store the resolved `PluginListenerHandle`s on the instance, and `.remove()` them all in `destroy()` (`:87-96`). No fire-and-forget.
- **phase04.3 — CP-M8 + CP-M9:** Rewrite `platform.ts:147-188` `buildCapabilities` with a real per-platform boolean matrix (web: push+SW+inApp; android: local+push+channels; ios: local+push+badge; electron/desktop sensible). Stop spreading `PlatformDefaults`. Confirm `NotificationKit.isSupported()` (`:306-319`) now returns true on supported platforms. Fix `getSupportedFeatures` pollution.
- **phase04.4 — CP-H6 + CP-M1:** `getDelivered()` (`:645-657`) map to public `Notification` type like `getPending`. Normalize notification ids to accept `string|number`: add a numeric-coercion helper that validates and throws on truly invalid ids (no silent `NaN`/`Date.now()` remap) — fixes `cancel` (`:249`), `removeDelivered` (`:673`), and `capacitor-types.ts:119-122`.
- **phase04.5 — CP-M3 + CP-M4 + CP-M5:** `storage.ts`. (M4) `clearWebStorage` (`:176-181`) must re-add `this.prefix` when removing. (M5) `get` (`:303-309`) must read per-record stored `ttl`, not `config.ttl`. (M3) make `encrypt/decrypt` (`:322-333`) Unicode-safe (encodeURIComponent/escape or TextEncoder→base64) and rename in code+docs to "obfuscation" (NOT encryption); wire or remove the unused `secure` field. Keep storage API synchronous (backward-compatible).
- **phase04.6 — CP-H4 + CP-M10 + CP-M11:** `FirebaseProvider.ts`. (H4) `onMessage` (`:418-439`) copy nested `notification.title/body` to top-level. (M10) on native, call `PushNotifications.register()` + add a `registration` listener to surface the FCM token. (M11) `refreshToken` (`:191-213`) get-new-before-delete or restore `currentToken` on failure.
- **phase04.7 — polish:** CP-M2 (route kit permission flow through `PermissionManager` or document divergence), CP-L1 (`openSettings` throw "not implemented" or implement), CP-L3/L4 (platform version/tablet honesty), CP-L5/L6 (Logger in swallowing catches), CP-L7 (`generateId`/event-id → `crypto.randomUUID()` fallback), CP-L8 (env-var validator align or remove dead code).

## Verification
- `yarn type-check` + `yarn build` clean. Re-read `isSupported`, `emit`, `destroy`, storage paths. `grep -n "parseInt" src/core src/utils/capacitor-types.ts` → all guarded.

## Status log
| Date | Sub-task | Result |
|---|---|---|
| | | |
