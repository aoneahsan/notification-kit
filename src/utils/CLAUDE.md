# CLAUDE.md — src/utils/

> Last Updated: 2026-05-26

## Utility Module Rules

Shared utilities used across core, providers, and react modules.

### Files

| File | Purpose |
|------|---------|
| `validation.ts` | Input validation for notification configs and payloads |
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
