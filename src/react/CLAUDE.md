# CLAUDE.md — src/react/

> Last Updated: 2026-05-26

## React Hooks Rules

React integration for notification-kit. This module is the `notification-kit/react` entry point.

### Files

| File | Purpose |
|------|---------|
| `index.ts` | Re-exports all hooks for the `/react` entry point |
| `hooks/useNotifications.ts` | Main hook — init, permissions, send, receive |
| `hooks/useInAppNotification.ts` | In-app notification display hook |

### Hook Design Rules

1. **React is a peer dep** — this module is only loaded when consumer imports `notification-kit/react`
2. **No side effects at import** — hooks must not execute anything on module load
3. **Cleanup on unmount** — all listeners/subscriptions cleaned up in useEffect return
4. **Stable references** — use `useCallback`/`useMemo` for returned functions and objects
5. **Error boundaries** — hooks must not throw — return error state instead
6. **TypeScript generics** — hooks should accept notification payload type generic where applicable

### Export Conventions

- All hooks exported from `src/react/index.ts`
- Named exports only — no default exports
- Types exported alongside hooks

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
