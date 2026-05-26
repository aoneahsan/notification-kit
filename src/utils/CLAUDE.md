# CLAUDE.md — src/utils/

> Last Updated: 2026-05-26

## Utility Module Rules

Shared utilities used across core, providers, and react modules.

### Files

| File | Purpose |
|------|---------|
| `validation.ts` | Input validation for notification configs and payloads |
| `validation.test.ts` | Validation tests |
| `config-validator.ts` | Full configuration validation |
| `formatting.ts` | Notification content formatting helpers |
| `scheduling.ts` | Cron/interval scheduling logic for local notifications |
| `logger.ts` | Internal logger (replaces console.log across the library) |
| `inApp.ts` | In-app notification display and queue utilities |
| `dynamic-loader.ts` | Dynamic module loading for optional provider SDKs |
| `capacitor-types.ts` | Capacitor type re-exports for internal use |

### Design Rules

1. **Pure functions preferred** — utilities should be stateless where possible
2. **No external deps** — utility functions must not import provider SDKs or React
3. **Thorough validation** — validate all user-facing inputs, throw descriptive errors
4. **Logger only** — ALL internal logging goes through `logger.ts`, NEVER `console.log`
5. **Dynamic loader** — `dynamic-loader.ts` is the ONLY place that resolves optional peer deps at runtime

### Logger Usage

```typescript
import { logger } from './logger';
logger.warn('Permission denied');  // NOT console.warn
logger.error('Provider init failed', error);  // NOT console.error
```

### Testing

- `validation.test.ts` covers all validation paths including edge cases
- Test invalid inputs, boundary values, missing fields

### CLAUDE.md + AGENTS.md Rules

- Keep both files in sync — update both when changing rules
- Update at least every 3 days
