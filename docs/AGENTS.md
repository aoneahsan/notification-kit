# AGENTS.md — docs/

> Last Updated: 2026-05-26

## Documentation Rules

### Structure

| Folder | Content |
|--------|---------|
| `api/` | API reference (core, notifications, react-hooks, types) |
| `guides/` | Implementation guides |
| `helpers/` | Platform setup guides |
| `examples/` | Code examples |
| `tracking/` | Rollout and capability tracking |
| `README.md` | Documentation index |

### Maintenance Rules

1. **Docs must match code** — never describe unimplemented features as available
2. **Update with code changes** — update affected docs when source changes
3. **Three-file sync** — `Readme.md` (root) + `docs/README.md` + portfolio file together
4. **No "coming soon"** — don't mention unimplemented features
5. **Accurate examples** — code examples must work with current API

### When to Update

- Public API changes, new providers, new hooks, version bumps
- Platform setup changes, security guidance changes

### CLAUDE.md + AGENTS.md Rules

- Keep both files in sync — update both when changing rules
- Update at least every 3 days
