# notification-kit — Audit Findings (single source of issue truth)

> Created: 2026-05-26 · Package baseline: `v2.0.6`
> Produced by three parallel read-only deep-audit passes (core+providers, react+utils, packaging+tooling+docs) plus a latest-stable dependency sweep.
> Every fix phase references the issue IDs below. Update the **Status** column as issues are resolved (`open` → `fixed` / `wontfix` / `deferred`).

ID scheme: `CP-*` = core/providers · `RU-*` = react/utils · `PK-*` = packaging/tooling/docs · `DEP-*` = dependency · `STD-*` = workspace-standard compliance.

---

## A. Dependency sweep (latest stable = npm `latest` dist-tag)

| Package | Current (dev) | Current (peer) | Latest stable | Bump |
|---|---|---|---|---|
| @capacitor/core | ^8.0.2 | >=7.4.3 | **8.3.4** | minor (peer floor → major raise) |
| @capacitor/local-notifications | — | >=7.0.3 | **8.2.0** | peer floor → 8 |
| @capacitor/preferences | — | >=7.0.2 | **8.0.1** | peer floor → 8 |
| @capacitor/push-notifications | — | >=7.0.3 | **8.1.1** | peer floor → 8 |
| firebase | — | >=12.2.1 | **12.13.0** | peer floor minor |
| react | ^19.2.4 | >=19.1.1 | **19.2.6** | patch |
| react-dom | ^19.2.4 | >=19.1.1 | **19.2.6** | patch |
| react-onesignal | — | >=3.3.0 | **3.5.3** | peer floor minor ⚠️ see CP-M6 |
| @testing-library/dom | ^10.4.1 | — | 10.4.1 | none |
| @testing-library/react | ^16.3.2 | — | 16.3.2 | none |
| @testing-library/react-hooks | ^8.0.1 | — | 8.0.1 | **REMOVE** (DEP-1, deprecated for React 18+) |
| @types/node | ^25.2.0 | — | 25.9.1 | minor |
| @types/react | ^19.2.10 | — | 19.2.15 | patch |
| @types/react-dom | ^19.1.9 | — | 19.2.3 | minor |
| @typescript-eslint/eslint-plugin | ^8.54.0 | — | 8.60.0 | minor |
| @typescript-eslint/parser | ^8.54.0 | — | 8.60.0 | minor |
| @vitejs/plugin-react | ^5.1.3 | — | **6.0.2** | MAJOR |
| @vitest/coverage-v8 | ^4.0.18 | — | 4.1.7 | minor |
| @vitest/ui | ^4.0.18 | — | 4.1.7 | minor |
| eslint | ^9.35.0 | — | **10.4.0** | MAJOR |
| eslint-config-prettier | ^10.1.8 | — | 10.1.8 | none |
| eslint-plugin-prettier | ^5.5.5 | — | 5.5.5 | none |
| eslint-plugin-react | ^7.37.5 | — | 7.37.5 | none |
| eslint-plugin-react-hooks | ^7.0.1 | — | 7.1.1 | minor |
| globals | ^17.3.0 | — | 17.6.0 | minor |
| husky | ^9.1.7 | — | 9.1.7 | none |
| jsdom | ^28.0.0 | — | **29.1.1** | MAJOR |
| lint-staged | ^16.1.6 | — | **17.0.5** | MAJOR |
| prettier | ^3.8.1 | — | 3.8.3 | patch |
| terser | ^5.46.0 | — | 5.48.0 | patch |
| typescript | ^5.9.2 | — | **6.0.3** | MAJOR |
| vite | ^7.1.5 | — | **8.0.14** | MAJOR |
| vite-plugin-dts | ^4.5.4 | — | **5.0.1** | MAJOR |
| vitest | ^4.0.18 | — | 4.1.7 | minor |

- **DEP-1** — `@testing-library/react-hooks` is deprecated/abandoned (intended for React <18). Project is React 19. Remove it; use `renderHook` from `@testing-library/react`. Update any test importing it.
- **Major-bump risk clusters** (verify build/lint/test after each): TS 6.0, ESLint 10, Vite 8 + plugin-react 6 + vite-plugin-dts 5, jsdom 29, lint-staged 17.

---

## B. Security (highest priority)

| ID | Sev | Location | Issue | Fix |
|---|---|---|---|---|
| CP-S1 | **Critical** | `src/providers/OneSignalProvider.ts:279-310` | `sendNotification` sends the OneSignal **REST API key** (account-level secret) from client code as `Authorization: Basic ${restApiKey}`. Following the typed API leaks the key into the bundle + network. | Make client-side `sendNotification` throw "server-side only" (mirror FirebaseProvider). Never accept `restApiKey` in a web init path; document server-only usage. |
| CP-S2 | **Critical** | `src/utils/inApp.ts:189-190` | `icon.innerHTML = options.icon` — unsanitized HTML sink → XSS if any consumer pipes remote/user content into `icon`. | Stop using `innerHTML`; use `textContent` or a vetted inline-SVG/known-glyph allowlist, or accept a pre-built `HTMLElement`. Document `icon` trust model. |
| RU-S1 | Medium | `src/utils/formatting.ts:356-362` | `stripHtml` is a naive regex strip presented as if safe; not a sanitizer. Feeds false sense of safety near CP-S2. | Keep as formatter but rename/doc clearly as "NOT sanitization"; ensure its output is never assigned via `innerHTML`. |
| CP-S3 | Low | `src/utils/config-validator.ts:114-137` | Hardcoded-secret heuristic iterates `process.env` doing equality vs the raw key; brittle, incomplete env-name allowlist, prod-only warning could surface key shape. | Make best-effort without scanning all env, or drop heuristic; never log values (already not logging values — good). |

---

## C. Core + Providers (`CP-*`)

| ID | Sev | Location | Issue | Fix |
|---|---|---|---|---|
| CP-C3 | **Critical** | `NotificationKit.ts:516-548`, `destroy()` :87-96 | Native `LocalNotifications.addListener` registrations never captured/removed; after destroy+re-init duplicate emits + leak + callbacks into torn-down kit. | Store `PluginListenerHandle`s, `await` them, `.remove()` in `destroy()`. |
| CP-H1 | High | `NotificationKit.ts:717-734` | `onPush`/`onPushOpened` filter on `event.type.startsWith('push.')` / `'push.opened'` which are **never emitted** → callbacks never fire. | Filter on payload `type === 'push'`; emit dedicated push-opened/action events; align type strings. |
| CP-H2 | High | `NotificationKit.ts:433-441` | `emit()` builds `{id,type,timestamp,data,...data}` — spreading `data` last clobbers `type`/`id`/`timestamp` envelope, corrupting typed events + `switch(event.type)`. | Don't spread `data` into envelope (keep it under `.data`), or set canonical `id`/`type`/`timestamp` last. |
| CP-H3 | High | `NotificationKit.ts:523-544` | `addListener` promises not awaited → lost handles (CP-C3) + unhandled rejection bypasses local catch. | `await` + store handle. |
| CP-H4 | High | `FirebaseProvider.ts:418-439` | `onMessage` emits top-level `title:''`,`body:''`; real values only in nested `notification`. Consumers reading `payload.title/body` (the required fields) get empty strings. | Copy `notification.title/body` into top-level. |
| CP-H5 | High | `OneSignalProvider.ts:459-463` | Native action handler reads `notificationAction.notification.data`/`.title` without `?.` (line 457 used `?.`) → crash if `notification` undefined. | Consistent optional chaining. |
| CP-H6 | High | `NotificationKit.ts:645-657` | `getDelivered()` returns raw Capacitor objects, not public `Notification` type (unlike `getPending`). Type leakage + inconsistency. | Map to public type. |
| CP-H7 | High | `FirebaseProvider.ts:239-273,530-538` | `getCapabilities()` reports `topics:true` but `subscribe/unsubscribe/callTopicAPI` always throw; `getSubscriptions` silently `[]`. | Report `topics:false` for client-side Firebase, or add optional `topicsEndpoint` config hook + honest errors. |
| CP-H8 | High | `OneSignalProvider.ts:57-66,588-609` + `OneSignalNativeBridge.ts:53-106` | Native OneSignal effectively non-functional: native bridge is a doc-only stub, `this.OneSignal` stays null, so `getToken`/`subscribe`/permission throw on native. | Per "harden+complete": make native OneSignal **honest** — correct capability reporting + descriptive "not supported on native (use FCM)" errors + docs. (Full native SDK = out of scope net-new.) |
| CP-M1 | Med | `NotificationKit.ts:249,673`, `capacitor-types.ts:119-122` | `parseInt(id,10)` → `NaN` for non-numeric ids: cancel/removeDelivered silently no-op; scheduling silently remaps to `Date.now()` breaking later cancel-by-id. | Validate/normalize ids; accept `string|number`; throw on invalid; stable hash for non-numeric if needed. |
| CP-M3 | Med | `storage.ts:322-333` | "encryption" is `btoa`/`atob` (reversible, throws on non-Latin1/Unicode → data loss). `secure` config never read. | Unicode-safe base64 + honest rename to "obfuscation" (not encryption) in code+docs; OR real Web Crypto (async → breaking, so prefer honest base64). Keep API sync/backward-compatible. |
| CP-M4 | Med | `storage.ts:176-181` | `clearWebStorage` removes bare keys (prefix already stripped) without re-adding prefix → `clear()` is a no-op on web. | `removeWebStorage(this.prefix + key)`. |
| CP-M5 | Med | `storage.ts:303-309` | `get` TTL checks current `config.ttl` not the per-record stored `ttl` → retroactive expiry/extension. | Read `parsed.ttl` from record. |
| CP-M8 | Med | `platform.ts:147-187` | `buildCapabilities` spreads `PlatformDefaults` (string sound/badge) into a boolean capability map → pollutes `getSupportedFeatures`. | Don't spread defaults; build real boolean matrix. |
| CP-M9 | **High-impact** | `platform.ts:147-188`, `NotificationKit.ts:306-319` | No per-platform capability truth table → all flags false → `isSupported()` returns **false on every platform** (web/iOS/Android). Kit reports itself unusable. | Implement per-platform capability matrix (web: push+SW; android: channels; ios: badge; etc.). |
| CP-M10 | Med | `FirebaseProvider.ts:452-464,167` | Native Firebase requests OS permission but never calls `PushNotifications.register()` / listens for `registration` → no FCM token on native; `getToken` uses web messaging only. | Wire native register + registration listener to surface token (completing existing feature). |
| CP-M11 | Med | `FirebaseProvider.ts:191-213` | `refreshToken` deletes then re-gets; if get fails after delete, device left tokenless + stale `currentToken`. | Get-new-before-delete or restore on failure. |
| CP-M2 | Med | `NotificationKit.ts:129-155` | Kit permission flow calls `provider.requestPermission()` and bypasses the well-built `PermissionManager` → two divergent code paths. | Route kit through `PermissionManager` or document divergence. |
| CP-M6 | **High** | `OneSignalProvider.ts:173,212,232,248,496,522,548,619,643` | Uses **react-onesignal v1 API** (`OneSignal.on`, `getUserId`, `logoutUser`, `sendTag`, `isPushNotificationsEnabled`, `showSlidedownPrompt`) which **does not exist in v3** (the floor we're raising to 3.5.3). Hidden by `as unknown as {...}` casts → compiles, breaks at runtime. | Rewrite to react-onesignal v3 namespaced API (`OneSignal.Notifications.addEventListener`, `OneSignal.User.PushSubscription.id`, `OneSignal.login/logout`, `OneSignal.User.addTag`, `OneSignal.Notifications.permission`, `OneSignal.Slidedown.promptPush`). Remove the casts so compiler catches drift. |
| CP-M7 | Med | `OneSignalProvider.ts:548-562` | `subscriptionChanged` fires `getToken()` unawaited, only on `isSubscribed` truthy → unsubscribe never notified. | Await/dedupe; notify on both states. |
| CP-L1 | Low | `permissions.ts:67-85` | `openSettings()` body fully commented out → resolves success doing nothing. | Throw "not implemented" until wired, or implement via native plugin. |
| CP-L2 | Low | `permissions.ts:59-62` | `'provisional'` treated as not-requestable (iOS). | Verify iOS provisional semantics. |
| CP-L3 | Low | `platform.ts:137-142` | `getVersion()` returns full userAgent as "version". | Parse or rename field. |
| CP-L4 | Low | `platform.ts:31-32` | `isDesktop` flags tablets as desktop; `isTablet` hardcoded `false` (TODO). | Improve detection or document. |
| CP-L5 | Low | `NotificationKit.ts:445-447`, `FirebaseProvider.ts:573-575`, `OneSignalProvider.ts:693-695` | `emit`/`handleError` swallow listener errors with empty catch, no `Logger`. | `Logger.error(...)` in catches. |
| CP-L6 | Low | `storage.ts` / `permissions.ts` get/keys paths | Swallow to `null`/`[]` with no log → invisible failures. | `Logger.debug/warn` before swallowing. |
| CP-L7 | Low | `inApp.ts:460-462`, `NotificationKit.ts:436` | `generateId` uses `Math.random().substr(2,9)` (deprecated `substr`, collision-prone); event ids use `Date.now()` (ms collisions). | `crypto.randomUUID()` w/ fallback. |
| CP-L8 | Low | `FirebaseNativeBridge.ts:174-192` | `validateEnvironmentVariables` only checks bare `FIREBASE_*`, misses `VITE_`/`NEXT_PUBLIC_`/`REACT_APP_`; also dead code (never called). | Align with `ConfigValidator` or remove. |

**Incomplete features / stubs (core/providers):** `permissions.openSettings` (commented out), `platform.isTablet` (TODO), `storage.encrypt/decrypt` (btoa stub), `FirebaseNativeBridge.configureIOS/Android/initializeNative` (doc-only), `OneSignalNativeBridge.configure*` (doc-only), Firebase `subscribe/unsubscribe/getSubscriptions/sendNotification/callTopicAPI` (throw/`[]`), `capacitor-types.toPlatformCapabilities` (placeholder), `FirebaseProvider`/`OneSignalProvider` `@ts-ignore` + dead `const _ =` import workaround.

---

## D. React hooks + Utils (`RU-*`)

| ID | Sev | Location | Issue | Fix |
|---|---|---|---|---|
| RU-C1 | **Critical** | `useInAppNotification.ts:313-324` | 1 s `setInterval` calls `setState` forever on every consumer (and 3 derived hooks each spin a timer) → forced 1 Hz re-render loop + setState-after-unmount risk. | Replace polling with observer/callback subscription on `InAppNotificationManager` (emit on show/dismiss); or `mountedRef` guard + shallow-id diff. |
| RU-C2 | **Critical** | `useNotifications.ts:604-655` | Setup effect depends on `state.notifications`; handler appends → state changes → effect tears down + re-registers all 4 listeners; events during the window dropped. | Functional updater `setState(prev=>...)`; drop `state.notifications` from deps (`[state.isInitialized, updateState]`). |
| RU-C3 | High | `useNotifications.ts:506` | `listenerId = \`${event}-${Date.now()}\`` collides within same ms → Map overwrite → lost cleanup/ghost listener. | Monotonic counter or `crypto.randomUUID()`. |
| RU-H1 | High | `useNotifications.ts:159-161` + core `destroy()` | `destroy()` nulls global singleton → one component's unmount kills notifications for all consumers; no ref-count. | Document process-global semantics or add init ref-count. |
| RU-H2 | High | `useNotifications.ts:350-380` | `scheduleNotification` builds `scheduleOptions` with `title:''`,`body:''` forced through `as any` → dead/confusing data in nested `schedule`. | Build a proper `NotificationSchedule` (no title/body); drop empties. |
| RU-H3 | High | `scheduling.ts:60-83` | `calculateOnTime` mixes explicit Y/M/D with weekday "next occurrence" inconsistently → resolves to weekday silently contradicting `on.day`. | Define precedence (weekday-only vs date-only); document. |
| RU-H4 | High | `scheduling.ts:46-54` | `calculateAtTime` for past `at` adds one day only → can still be in the past. | Loop/advance to strictly future, or reject past `at`. |
| RU-H5 | High | `scheduling.ts` (all calc) | Local-time `setDate/Month/FullYear` → DST drift, Jan-31+1mo→Mar rollover; `timezone` option never consumed. | Clamp month overflow, document local-time semantics, honor or remove `timezone`. |
| RU-H6 | High | `scheduling.ts:368-413,424,452` | `parseCronExpression` destructures `_dayOfWeek` but ignores it (`0 9 * * 1` loses Monday); ranges/steps/lists dropped; cron output always `* ` for DOW. | Map DOW → `on.weekday`; or document "minute/hour/day/month only". |
| RU-M1 | Med | `logger.ts:15-37` | `info()` fires unconditionally; no level gating beyond `debug` bool. (See STD-1.) | Gate `info`; add settable level. |
| RU-M3 | Med | `formatting.ts:255-265` | `truncateText` for `maxLength<3` returns `'...'` (len 3 > max). | Guard `maxLength<=3`. |
| RU-M4 | Med | `formatting.ts:295-314` | `formatRelativeTime` returns "Just now" for future dates (negative diff). | `Math.abs` + future branch. |
| RU-M5 | Med | `formatting.ts:208-216` | `formatFileSize` `NaN`/negative/sub-1-byte → "undefined". | Guard `bytes<1` + negatives. |
| RU-M6 | Med | `useInAppNotification.ts:116-126` | `configure` depends on `state.config` (identity churn) + double-merges with manager. | Functional `setState`; drop dep; single merge. |
| RU-M7 | Med | `useInAppNotification.ts:417-458` | Queue `processQueue` guards on polled `hasActive` (lags ≤1 s) → double-fire; extra effect runs. | Drive off manager show/dismiss events. |
| RU-M8 | Med | `capacitor-types.ts:118-122` | `parseInt` id NaN/truncation (ties to CP-M1). | Validate numeric ids / stable hash. |
| RU-M9 | Med | `useNotifications.ts:127-129,196-198,549-551`; `useInAppNotification.ts:144-149,245-250,432-438` | Many empty `catch {}` discard errors → invisible token/permission/callback failures. | Route through `Logger.warn/debug`. |
| RU-L1 | Low | `inApp.ts:461` | `generateId` deprecated `substr` + collision (ties CP-L7). | `crypto.randomUUID()`. |
| RU-L2 | Low | `formatting.ts:288` | `toTitleCase` uses deprecated `substr`. | `.slice(1)`. |
| RU-L3 | Low | `config-validator.ts:114-137` | env-equality heuristic incomplete (no `GATSBY_`/`EXPO_PUBLIC_`). (ties CP-S3) | Best-effort or drop. |
| RU-L4 | Low | `dynamic-loader.ts:73-78,104-109,164-169` | Runtime error inside imported module re-thrown as "please install" → masks real error. | Check `error.code` MODULE_NOT_FOUND before claiming missing. |
| RU-L6 | Low | `useInAppNotification.ts:491-527` | `useInAppNotificationPersistence` uses raw `localStorage` (workspace prefers `@capacitor/preferences`); persisted notifications lose function callbacks. | Document display-only persistence; optional Preferences adapter. |
| RU-L7 | Low | `useNotifications.ts:583-599` | `showInApp` object literal new identity each render. | `useMemo`. |
| RU-L8 | Low | `useNotifications.ts:657-679`, `useInAppNotification.ts:347-362` | Returned hook object new identity each render. | optional `useMemo`. |
| RU-L9 | Low | `scheduling.ts:230-239` | `validateOnSchedule` allows day=31 any month → silent rollover. | Validate per-month or document. |

**Incomplete (utils):** `scheduling.ts:424,452,518-522` cron simplifications + dead `numberToWeekday`; `capacitor-types.toPlatformCapabilities` placeholder; `types.ts:6` `FirebaseApp = any`.

---

## E. Packaging / Tooling / Docs (`PK-*`)

| ID | Sev | Location | Issue | Fix |
|---|---|---|---|---|
| PK-C1 | **Critical** | `package.json:18-24`, `bin/setup.js`, `src/templates/*` | SW templates not in `files`, not copied to `dist`, and `setup.js` never deploys them → advertised "service worker templates" ships nothing usable. | Ship `dist/templates` (copy in build) + add to `files` + have `setup.js` copy template into user `public/`; or drop the claim. |
| PK-C2 | **Critical** | `package.json:76-78` | `engines.node >=24.13.0` blocks/strict-fails install for Node 18/20/22 LTS consumers — a runtime lib does not need Node 24. | Lower to realistic floor (`>=20`). |
| PK-H1 | High | `package.json:8-17`, `dist/` | ESM-only, no CJS build, no `require`/`default` condition → `require('notification-kit')` throws `ERR_PACKAGE_PATH_NOT_EXPORTED`. | Add CJS build + `require` condition (and `default` fallback). (Backward-compatible enhancement.) |
| PK-H2 | High | `AI-INTEGRATION-GUIDE.md:284-301` | Documents `kit.on('push'/'pushOpened'/'tokenRefresh'/'permissionChange')` — none are valid event keys (real: `notificationReceived`/`notificationActionPerformed`/`tokenReceived`/`tokenRefreshed`/`permissionChanged`); won't compile. | Fix docs to real keys / `notifications.onPush` helpers. |
| PK-H3 | High | `AI-INTEGRATION-GUIDE.md:246-251` | `useInAppNotification()` documented as `{showSuccess,showError,showInfo,showWarning}`; real return `{show,success,error,warning,info}` → runtime undefined. | Fix docs. |
| PK-H4 | High | `Readme.md:195,638-642`, `AI-INTEGRATION-GUIDE.md:238-259` | Docs use `const { isPermissionGranted } = useNotifications()` — hook has no such key (only `permission`). | Add `isPermissionGranted` boolean to hook (backward-compatible) AND/or fix docs to `permission==='granted'`. |
| PK-H5 / STD-2 | High | `eslint.config.js:25-27` | No `no-console:'error'` rule (workspace IRON-SOLID standard). Currently compliant by luck. | Add `no-console:'error'` with `src/utils/logger.ts` exempted. |
| PK-M1 | Med | `NotificationKit.ts` proxy `cancel:(id:number)`, `Readme.md:290-291,611`, `AI-GUIDE:135` | `cancel` typed `number` but docs/examples pass string ids; `schedule({id:'reminder-1'})` uses strings. | Standardize on `string|number` with robust coercion; align docs. (ties CP-M1) |
| PK-M2 | Med | `Readme.md:303,616-619` vs impl | README documents `success(message, options?)`; impl is `success(title, message?)` (no options). | Correct API reference. |
| PK-M3 | Med | `Readme.md:175-287` vs `AI-GUIDE:126-204` | Two contradictory `schedule()` shapes (top-level `in/every/at/days` vs nested `schedule:{...}`). | Pick one canonical shape matching `ScheduleOptions`; make both docs consistent. |
| PK-M4 | Med | `package.json:3`, `src/index.ts:8,161,168`, `CHANGELOG.md` | Exported `version`/`metadata.version` = `2.0.0` while package = `2.0.6`; CHANGELOG missing 2.0.4–2.0.6. | Drive version from package.json (or bump constant); add CHANGELOG entries. |
| PK-M5 | Med | `vite.config.ts:69-73` + `vitest.config.ts` | Stray `test` block in `vite.config.ts` (dead, can drift). | Remove from vite.config.ts. |
| PK-M6 | Med | `bin/setup.js:34-42,101-103,175,338` | No `red` in COLORS → error lines print escape garbage; placeholder URL `github.com/your-username/...`. | Add `red`; replace placeholder with real repo URL. |
| PK-L1 | Low | `.npmignore` + `package.json:18-24` | `.npmignore` redundant/misleading when `files` is set. | Delete `.npmignore` or document `files` authoritative. |
| PK-L2 | Low | `package.json` | No `"sideEffects": false` though README claims tree-shaking. | Add `sideEffects:false` (verify no import-time side effects). |
| PK-L3 | Low | `eslint.config.js:8,43` | `*.config.ts` unlinted; `ecmaVersion:2020` < ES2022 target. | Bump ecmaVersion; optionally lint config files. |
| PK-L5 | Low | `firebase-messaging-sw.template.js:13-14`, `Readme.md:439-444`, `AI-GUIDE:327-328` | Three different/old pinned Firebase compat CDN versions (9.0.0/9.0.0/10.7.0) vs peer `>=12`. | Align to one current compat version; note peer v12+. |
| PK-L6 | Low | `package.json:40,134` | `"prepare":""` so husky never installs hooks though husky is a dep. | `"prepare":"husky"` (CI-guarded) or drop husky. |

**Docs-vs-code mismatches:** consolidated in PK-H2/H3/H4, PK-M1/M2/M3/M4, PK-C1, PK-L5. "Documentation Website Coming Soon" (`Readme.md:35`) — website scaffold exists (v0.0.0, not deployed). "Zero Dependencies" claim — **accurate** (no `dependencies` block; all optional peers + dynamic import). Exports/types ESM happy-path resolution — **correct**; all peers externalized in lib build — **correct**; SW templates avoid hardcoded secrets — **correct** (only versions dated).

---

## F. Workspace-standard compliance (`STD-*`)

| ID | Standard | Status | Fix |
|---|---|---|---|
| STD-1 | Centralized logger (level gating, default `warn`, `localStorage['notification-kit:logLevel']`, `setLevel`, `window.__setLogLevel/__getLogLevel`, console patching) | Partial — only a `debug` bool; `info` always on | Bring `logger.ts` to the standard (library-appropriate). (ties RU-M1) |
| STD-2 | `no-console:'error'` ESLint rule | Missing | Add (ties PK-H5). |
| STD-3 | Play-console rules file must not live in project | `examples/.../play-console-rejection-rules.json` already deleted (git status `D`) — keep deletion in the release commit. | Stage the deletion. |
| STD-4 | CLAUDE.md/AGENTS.md freshness + accuracy (root + nested) | Stale "Last Updated 2026-04-03"; will be inaccurate post-changes | Refresh all in Phase 10. |
| STD-5 | Portfolio file refresh on material capability change | Will be material change | Refresh `NOTIFICATION-KIT_portfolio-info_*.md` in Phase 10. |

---

## Severity rollup

- **Critical (8):** CP-S1, CP-S2, CP-C3, RU-C1, RU-C2, PK-C1, PK-C2 (+ DEP majors as a risk cluster).
- **High (≈19):** CP-H1..H8, CP-M6, CP-M9, RU-C3, RU-H1..H6, PK-H1..H5.
- **Medium (≈25)** and **Low (≈20)** as tabled.

Most urgent functional truths to restore: `isSupported()` returns false everywhere (CP-M9), push events never reach `onPush` (CP-H1/H2), OneSignal web broken against the v3 floor we're adopting (CP-M6), native listeners leak (CP-C3), and the two React render/listener bugs every consumer hits (RU-C1/RU-C2).
