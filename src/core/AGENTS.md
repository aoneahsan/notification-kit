# AGENTS.md — src/core/

> Last Updated: 2026-04-03

## Core Module Rules

Heart of the library. All modules depend on core — core depends on nothing external.

### Files

| File | Purpose |
|------|---------|
| `NotificationKit.ts` | Main class — unified API for all notification types |
| `permissions.ts` | Permission request/check logic across platforms |
| `platform.ts` | Platform detection (web, iOS, Android, Capacitor) |
| `storage.ts` | Notification storage abstraction |
| `NotificationKit.test.ts` | Core test suite |

### Design Rules

1. **No framework imports** — NEVER import React, Firebase, OneSignal, or any provider SDK
2. **Provider-agnostic** — delegates to providers via interface, not direct imports
3. **Platform-safe** — platform-specific code behind detection guards
4. **Permission-first** — never send notifications without permission check
5. **Storage abstraction** — must work with or without `@capacitor/preferences`

### NotificationKit Class

- Single entry point for consumers
- Config via constructor options (all optional with sensible defaults)
- Handle missing provider gracefully (descriptive error, not crash)

### Testing

- Mock providers — never call real Firebase/OneSignal in tests
- Test both "provider configured" and "no provider" paths

### CLAUDE.md + AGENTS.md Rules

- Keep both files in sync — update both when changing rules
- Update at least every 3 days
