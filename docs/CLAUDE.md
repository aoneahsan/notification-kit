# CLAUDE.md — docs/

> Last Updated: 2026-05-26

## Documentation Rules

### Structure

| Folder | Content |
|--------|---------|
| `api/` | API reference (core, notifications, react-hooks, types) |
| `guides/` | Implementation guides (architecture, config, install, providers, security, etc.) |
| `helpers/` | Platform setup guides (Android FCM, iOS push, VAPID keys, OneSignal) |
| `examples/` | Code examples |
| `tracking/` | Rollout and capability tracking notes |
| `README.md` | Documentation index |

### Maintenance Rules

1. **Docs must match code** — never describe unimplemented features as available
2. **Update with code changes** — when source code changes, update affected docs in the same pass
3. **Three-file sync** — when refreshing project info, update `Readme.md` (root), `docs/README.md`, and portfolio file together
4. **No "coming soon"** — if a feature isn't implemented, don't mention it in docs
5. **Accurate examples** — code examples must compile and work with current API

### When to Update Docs

- Any public API change (new method, new option, changed behavior)
- New provider added
- New hook added
- Platform-specific setup changes
- Security guidance changes
- Version bump

### Writing Style

- Direct and concise
- Code examples for every public API
- Platform-specific callouts clearly labeled (Web / iOS / Android)
- Link to relevant source files

### CLAUDE.md + AGENTS.md Rules

- Keep both files in sync — update both when changing rules
- Update at least every 3 days
