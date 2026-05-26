# AGENTS.md — src/utils/

> Last Updated: 2026-05-26

## Utility Module Rules

Shared utilities used across core, providers, and react modules.

### Files

| File | Purpose |
|------|---------|
| `validation.ts` | Input validation for configs and payloads |
| `config-validator.ts` | Full configuration validation |
| `formatting.ts` | Notification content formatting helpers |
| `scheduling.ts` | Scheduling logic for local notifications |
| `logger.ts` | Internal logger (replaces console.log) |
| `inApp.ts` | In-app notification display/queue utilities |
| `dynamic-loader.ts` | Dynamic module loading for optional peer deps |
| `capacitor-types.ts` | Capacitor type re-exports |

### Design Rules

1. **Pure functions preferred** — stateless where possible
2. **No external deps** — no provider SDKs or React imports
3. **Thorough validation** — validate all user inputs, descriptive errors
4. **Logger only** — ALL logging through `logger.ts`, NEVER `console.log`
5. **Dynamic loader** — `dynamic-loader.ts` is the ONLY place resolving optional peer deps

### Testing

- Cover all validation paths including edge cases
- Test invalid inputs, boundary values, missing fields

### CLAUDE.md + AGENTS.md Rules

- Keep both files in sync — update both when changing rules
- Update at least every 3 days
