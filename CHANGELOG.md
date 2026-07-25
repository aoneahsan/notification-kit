# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.2] - 2026-07-25

No change to the published runtime. Repository, metadata, and documentation only.

### Fixed

- **The package could not be rebuilt from a clean checkout.** `yarn build` failed with 22 TypeScript
  errors and emitted no `dist/`, because five optional peer dependencies
  (`@capacitor/local-notifications`, `@capacitor/push-notifications`, `@capacitor/preferences`,
  `firebase`, `react-onesignal`) had no matching `devDependency` for `tsc` to resolve types from, and
  the Vite-injected `__NOTIFICATION_KIT_VERSION__` constant had no type declaration. Added the missing
  devDependencies and `src/globals.d.ts`. The published `2.1.1` artifact was never affected.
- `fromCapacitorImportance` was missing the mapping for Capacitor importance `0`
  (`IMPORTANCE_NONE`); its type claimed `1..5` while the runtime accepts `0..5`. The existing fallback
  already resolved `0` to the default, so behaviour is unchanged — the type now matches it.

### Changed

- `description` shortened to match the README tagline; `homepage` now points at the documentation site;
  `keywords` trimmed to twelve genuine search terms.
- Added `funding`, and added `CHANGELOG.md` to the published `files` allowlist — until now the changelog
  was **not** included in the tarball, so installed copies carried no history.
- `Readme.md` renamed to `README.md`, and rewritten to the canonical package-README pattern.

### Removed from documentation

Four README feature claims had no implementation behind them and have been withdrawn: offline queueing,
built-in internationalisation, WCAG 2.1 compliance, and built-in analytics. The `Limitations` section now
states each of these plainly. Several API examples were also corrected — `schedule()` requires an `id`
and returns `void`, channel management lives on `NotificationKit.getInstance()` rather than on
`notifications`, and `ChannelImportance` is numeric. The Configuration example also had the wrong shape:
in-app colours belong at `styles.colors`, not `inApp.theme`, and `styles` takes no `container` object.
Every TypeScript example in the new README now compiles under `tsc --strict` against the packed tarball.

## [2.1.1] - 2026-05-27

Post-release polish. No breaking changes — a safe upgrade from 2.1.0.

### Fixed & improved

- **Platform detection:** `version` now reports a parsed browser/OS version
  instead of echoing the full user-agent, and tablets are detected (iPad,
  Android tablets, and iPadOS that masquerades as macOS) so `isDesktop` no
  longer misclassifies them.
- **Scheduling:** the relative-delay `in` option now works — it accepts a
  `Duration` object (e.g. `{ minutes: 5 }`) or a millisecond number and resolves
  to an absolute time. The README's recurring examples use the canonical
  top-level `every` + `on` shape.
- Documented the distinction between the kit's provider-backed permission flow
  and the standalone `permissions` helper; documented schedule day-rollover.
- Removed dead internal code (`FirebaseNativeBridge.validateEnvironmentVariables`).

### Docs

- Authored the full Docusaurus documentation site under `website/` (introduction,
  guides, API reference, examples) matching the 2.1.x API.

## [2.1.0] - 2026-05-26

A polish-and-hardening release: all dependencies updated to latest stable, a
full security/correctness audit remediated, and packaging modernized.

### ⚠️ Peer dependency requirements raised

The minimum peer dependency versions were raised to current stable. If you are
on an older major you will need to upgrade alongside this release:

- `@capacitor/core` `>=8.3.4`, `@capacitor/local-notifications` `>=8.2.0`,
  `@capacitor/preferences` `>=8.0.1`, `@capacitor/push-notifications` `>=8.1.1`
- `firebase` `>=12.13.0`
- `react` / `react-dom` `>=19.2.6`
- `react-onesignal` `>=3.5.3` (the OneSignal provider was rewritten to the v3 API)

### 🔒 Security

- OneSignal `sendNotification()` no longer sends the REST API key from client
  code — sending must be done from a trusted server (the key is account-level).
- In-app notification icons are rendered safely (sandboxed `<img>` for image
  URLs, `textContent` otherwise); no `innerHTML` sink remains.
- `config-validator` no longer scans `process.env`; production checks are
  browser-safe.

### ✨ Fixes & improvements

- `isSupported()` now reports real per-platform capabilities (was always false).
- Push events reach `notifications.onPush` / `onPushOpened`; the event envelope
  no longer corrupts `event.type`.
- Native local-notification listeners are cleaned up on `destroy()`.
- Firebase: foreground messages populate top-level `title`/`body`; native FCM
  works via `PushNotifications.register()`; safer token refresh.
- OneSignal provider rewritten to the react-onesignal **v3** namespaced API.
- Storage: Unicode-safe value encoding, working `clear()`, per-record TTL.
- React hooks: removed a 1 Hz render loop (subscription-based now), fixed
  listener churn that dropped notifications, added `isPermissionGranted`.
- Scheduling/date/cron math hardened; formatting edge cases guarded.
- Leveled logger (default `warn`) with a `localStorage` switch and `setLevel`.

### 📦 Packaging

- Ships **both ESM and CommonJS** (`import` and `require` both work).
- `engines.node` lowered to `>=20`; added `"sideEffects": false`.
- Service-worker templates now ship in the package and are deployed by
  `notification-kit-setup`.
- `version` is single-sourced from `package.json`.

### 🔧 Toolchain

- Updated all dev dependencies to latest stable (TypeScript 6, ESLint 10,
  Vite 8, Vitest 4, jsdom 29, and more). Removed the deprecated
  `@testing-library/react-hooks`.

> Note: `2.0.4`–`2.0.6` were maintenance releases without changelog entries;
> their changes are consolidated into this `2.1.0` entry.

## [2.0.3] - 2025-08-06

### 🐛 Bug Fixes

#### Fixed Static Init Method Access
- **FIX**: Added static `NotificationKit.init()` method for easier initialization
- Users can now use `NotificationKit.init(config)` directly without calling `getInstance()` first
- Both patterns are now supported:
  - `NotificationKit.init(config)` (recommended)
  - `NotificationKit.getInstance().init(config)` (alternative)

### 📚 Documentation
- Added React + Capacitor example app in `examples/react-capacitor-example`
- Updated API documentation to reflect static init method
- Added example app reference in main README

## [2.0.0] - 2024-08-02

### 🚀 Major Release - Zero Dependencies Architecture

This is a major release that introduces a revolutionary zero-dependency architecture, making notification-kit the most lightweight notification library for React and Capacitor apps.

### 💥 Breaking Changes

#### Zero Runtime Dependencies
- **BREAKING**: All dependencies moved to optional peer dependencies
- **BREAKING**: Dependencies are now dynamically imported only when needed
- Users must install provider SDKs separately when using specific features:
  - Firebase: `npm install firebase`
  - OneSignal: `npm install react-onesignal`
  - Capacitor: `npm install @capacitor/core @capacitor/push-notifications @capacitor/local-notifications`
  - React Hooks: `npm install react react-dom`

#### API Changes
- **BREAKING**: React exports removed from main entry point to prevent circular dependencies
- React hooks now imported from `notification-kit/react` instead of `notification-kit`
- All Capacitor and provider imports are now dynamic and lazy-loaded

### ✨ New Features

#### Zero-Dependency Architecture
- Core library has **zero runtime dependencies**
- In-app notifications work immediately without any dependencies
- Graceful degradation when optional dependencies are missing
- Clear, helpful error messages guide users to install only what they need

#### Provider-less Design
- No React providers or wrappers required
- Works in dynamically injected components
- Singleton pattern for global state management
- Direct API usage without context providers

#### Dynamic Loading
- All dependencies loaded on-demand using dynamic imports
- Automatic platform detection without importing Capacitor
- Reduced initial bundle size
- Tree-shaking friendly architecture

### 🔧 Improvements

#### Developer Experience
- Clearer installation instructions with optional dependencies
- Better error messages with installation guidance
- Simplified API without provider requirements
- TypeScript types still fully supported

#### Performance
- Smaller initial bundle size
- Faster load times with lazy loading
- Only loads code for features actually used
- Optimized build outputs

#### Documentation
- Updated README with zero-dependency approach
- Clear separation of core vs optional features
- Migration guide for v1.x users
- Examples for progressive enhancement

### 🔄 Migration Guide

#### From v1.x to v2.0.0

1. **Update imports for React hooks:**
   ```typescript
   // Before (v1.x)
   import { useNotifications } from 'notification-kit'
   
   // After (v2.0.0)
   import { useNotifications } from 'notification-kit/react'
   ```

2. **Install dependencies as needed:**
   ```bash
   # Basic installation (zero dependencies)
   npm install notification-kit
   
   # Add dependencies only for features you use:
   npm install firebase              # For Firebase provider
   npm install react-onesignal       # For OneSignal provider
   npm install @capacitor/core       # For Capacitor features
   npm install react react-dom       # For React hooks
   ```

3. **No provider setup required:**
   ```typescript
   // Before (v1.x) - Provider required
   <NotificationProvider>
     <App />
   </NotificationProvider>
   
   // After (v2.0.0) - No provider needed!
   // Just initialize once:
   NotificationKit.init({ provider: 'firebase', config: {...} })
   // Then use anywhere:
   notifications.show({ title: 'Hello!' })
   ```

### 📦 Bundle Size Improvements

- Core library: ~6KB (gzipped)
- With Firebase: +12KB only when used
- With OneSignal: +14KB only when used
- In-app notifications: Works with 0 additional dependencies

### 🐛 Bug Fixes

- Fixed circular dependency issues between main and React exports
- Resolved TypeScript declaration conflicts
- Fixed console warnings replaced with proper logger
- Corrected platform detection without Capacitor dependency

### 📝 Notes

- This is a breaking change that requires updating import paths
- Existing v1.x apps will need to install peer dependencies
- In-app notifications now work without any setup
- Better suited for modern, performance-focused applications

## [1.0.0] - 2024-03-01

### Initial Release

- Unified notification API for Web, iOS, and Android
- Support for Firebase and OneSignal providers
- Push notifications, local notifications, and in-app notifications
- React hooks for easy integration
- Full TypeScript support
- Comprehensive documentation

---

For more details, see the [documentation](https://notification-kit-docs.aoneahsan.com).