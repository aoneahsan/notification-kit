# CLAUDE.md — src/

> Last Updated: 2026-05-26

## Source Code Conventions

### Zero-Dependency Philosophy (IRON-SOLID)

- ALL peer dependencies in `package.json` are optional (`peerDependenciesMeta`)
- NEVER add a required dependency — the library must work with zero installed deps
- Use dynamic imports and graceful degradation when a peer dep is unavailable
- Framework-independent core: `src/core/` must never import React or any provider SDK

### Module Structure

| Module | Responsibility |
|--------|---------------|
| `core/` | NotificationKit class, permissions, platform detection, storage |
| `providers/` | Firebase & OneSignal implementations + native bridges |
| `react/` | React hooks — useNotifications, useInAppNotification |
| `utils/` | Validation, scheduling, formatting, logging, in-app helpers |
| `templates/` | Service worker template files |
| `config/` | Support link configuration |
| `types/` | External type declarations |

### Export Pattern

```typescript
// Main entry: src/index.ts → dist/index.esm.js
export { NotificationKit } from './core/NotificationKit';
export type { ... } from './types';

// React entry: src/react/index.ts → dist/react.esm.js
export { useNotifications } from './hooks/useNotifications';
```

Two entry points only: `notification-kit` and `notification-kit/react`.

### Code Style

- TypeScript strict mode — all code must pass `yarn type-check`
- Absolute imports NOT used in this library (it's a package, not an app)
- JSDoc on all public-facing functions and types
- No `console.log` — use the internal logger (`src/utils/logger.ts`)
- Max 500 lines per file

### API Compatibility

- NEVER break public API within the same major version
- NEVER remove or rename exported types/functions
- New features = additive only (new optional params, new exports)
- Deprecate first → remove in next major

### CLAUDE.md + AGENTS.md Rules

- Every important rule MUST exist in both `CLAUDE.md` and `AGENTS.md` at each level
- Update frequency: at least once every 3 days
- Use Claude Code agents for every prompt/task


## Sub-agents & Skills — Main-Context-First (IRON-SOLID)
Default/built-in sub-agents (`general-purpose`, `Explore`, `Plan`, `claude`, `fork`, …) do NOT have
access to `/skills`, so delegating to them silently SKIPS the skills RULE #0 requires. Do all
skill-relevant work in the **MAIN context**; use a sub-agent ONLY when a **custom** agent exists in
`.claude/agents/` for that job; a default `Explore`/`Plan` agent is allowed ONLY for read-only,
no-skill search/exploration. When a relevant skill is missing, **install/enable it** rather than
proceeding skill-less. (Owner directive 2026-07-11; full text in `~/.claude/CLAUDE.md`.)
