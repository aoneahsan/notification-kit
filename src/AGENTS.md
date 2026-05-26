# AGENTS.md — src/

> Last Updated: 2026-05-26

## Source Code Conventions

### Zero-Dependency Philosophy (IRON-SOLID)

- ALL peer dependencies are optional — NEVER add a required dependency
- Use dynamic imports and graceful degradation when deps unavailable
- Framework-independent core: `src/core/` must never import React or provider SDKs

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

Two entry points only: `notification-kit` (main) and `notification-kit/react`.

```typescript
// Main: src/index.ts
export { NotificationKit } from './core/NotificationKit';
// React: src/react/index.ts
export { useNotifications } from './hooks/useNotifications';
```

### Code Style

- TypeScript strict mode — must pass `yarn type-check`
- JSDoc on all public-facing functions and types
- No `console.log` — use internal logger (`src/utils/logger.ts`)
- Max 500 lines per file
- Test files co-located: `ModuleName.test.ts` beside `ModuleName.ts`

### Testing

- **Vitest** only (NEVER Jest) — `yarn test --run` must pass before publishing
- Current baseline: 124 tests passing

### API Compatibility

- NEVER break public API within same major version
- New features additive only — new optional params, new exports
- Deprecate first → remove in next major

### CLAUDE.md + AGENTS.md Rules

- Every important rule MUST exist in both `CLAUDE.md` and `AGENTS.md`
- Update frequency: at least once every 3 days
- Use Claude Code agents for every prompt/task
