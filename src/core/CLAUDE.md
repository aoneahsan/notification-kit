# CLAUDE.md — src/core/

> Last Updated: 2026-05-26

## Core Module Rules

This is the heart of the library. All other modules depend on core — core depends on nothing external.

### Files

| File | Purpose |
|------|---------|
| `NotificationKit.ts` | Main class — unified API for all notification types |
| `permissions.ts` | Permission request/check logic across platforms |
| `platform.ts` | Platform detection (web, iOS, Android, Capacitor) |
| `storage.ts` | Notification storage abstraction |

### Design Rules

1. **No framework imports** — core must NEVER import React, Firebase, OneSignal, or any provider SDK
2. **Provider-agnostic** — NotificationKit delegates to providers via interface, not direct imports
3. **Platform-safe** — all platform-specific code must be behind detection guards (`platform.ts`)
4. **Permission-first** — never send notifications without explicit permission check
5. **Storage abstraction** — storage module must work with or without `@capacitor/preferences`

### NotificationKit Class

- Single entry point for consumers
- Configuration via constructor options (all optional with sensible defaults)
- Methods: `initialize()`, `requestPermission()`, `send()`, `schedule()`, `cancel()`, `getToken()`
- Must handle provider not being configured gracefully (throw descriptive error, not crash)

### CLAUDE.md + AGENTS.md Rules

- Keep both files in sync — update both when changing rules
- Update at least every 3 days


## Sub-agents & Skills — Main-Context-First (IRON-SOLID)
Default/built-in sub-agents (`general-purpose`, `Explore`, `Plan`, `claude`, `fork`, …) do NOT have
access to `/skills`, so delegating to them silently SKIPS the skills RULE #0 requires. Do all
skill-relevant work in the **MAIN context**; use a sub-agent ONLY when a **custom** agent exists in
`.claude/agents/` for that job; a default `Explore`/`Plan` agent is allowed ONLY for read-only,
no-skill search/exploration. When a relevant skill is missing, **install/enable it** rather than
proceeding skill-less. (Owner directive 2026-07-11; full text in `~/.claude/CLAUDE.md`.)
