# CLAUDE.md — src/

> Last Updated: 2026-04-03

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
| `test/` | Vitest setup and integration tests |
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

### Testing

- **Vitest** (NEVER Jest) — config in `vitest.config.ts`
- Test files co-located: `ModuleName.test.ts` next to `ModuleName.ts`
- All tests must pass before publishing: `yarn test --run`
- Current baseline: 124 tests passing

### API Compatibility

- NEVER break public API within the same major version
- NEVER remove or rename exported types/functions
- New features = additive only (new optional params, new exports)
- Deprecate first → remove in next major

### CLAUDE.md + AGENTS.md Rules

- Every important rule MUST exist in both `CLAUDE.md` and `AGENTS.md` at each level
- Update frequency: at least once every 3 days
- Use Claude Code agents for every prompt/task
