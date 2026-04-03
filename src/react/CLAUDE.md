# CLAUDE.md — src/react/

> Last Updated: 2026-04-03

## React Hooks Rules

React integration for notification-kit. This module is the `notification-kit/react` entry point.

### Files

| File | Purpose |
|------|---------|
| `index.ts` | Re-exports all hooks for the `/react` entry point |
| `hooks/useNotifications.ts` | Main hook — init, permissions, send, receive |
| `hooks/useNotifications.test.ts` | Hook tests |
| `hooks/useInAppNotification.ts` | In-app notification display hook |
| `hooks/useInAppNotification.test.ts` | In-app hook tests |

### Hook Design Rules

1. **React is a peer dep** — this module is only loaded when consumer imports `notification-kit/react`
2. **No side effects at import** — hooks must not execute anything on module load
3. **Cleanup on unmount** — all listeners/subscriptions cleaned up in useEffect return
4. **Stable references** — use `useCallback`/`useMemo` for returned functions and objects
5. **Error boundaries** — hooks must not throw — return error state instead
6. **TypeScript generics** — hooks should accept notification payload type generic where applicable

### Testing

- Use `@testing-library/react` and `@testing-library/react-hooks`
- Test: mount/unmount lifecycle, permission states, notification dispatch, error states
- Mock `NotificationKit` core — never test real provider in hook tests

### Export Conventions

- All hooks exported from `src/react/index.ts`
- Named exports only — no default exports
- Types exported alongside hooks

### CLAUDE.md + AGENTS.md Rules

- Keep both files in sync — update both when changing rules
- Update at least every 3 days
