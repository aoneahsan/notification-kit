# AGENTS.md — src/react/

> Last Updated: 2026-05-26

## React Hooks Rules

React integration — the `notification-kit/react` entry point.

### Files

| File | Purpose |
|------|---------|
| `index.ts` | Re-exports all hooks |
| `hooks/useNotifications.ts` | Main hook — init, permissions, send, receive |
| `hooks/useInAppNotification.ts` | In-app notification display hook |
| `hooks/*.test.ts` | Hook tests |

### Hook Design Rules

1. **React is peer dep** — only loaded when consumer imports `/react`
2. **No side effects at import** — no execution on module load
3. **Cleanup on unmount** — all listeners cleaned up in useEffect return
4. **Stable references** — `useCallback`/`useMemo` for returned functions
5. **No throws** — return error state instead
6. **TypeScript generics** — accept notification payload type where applicable

### Testing

- Use `@testing-library/react` (its built-in `renderHook`); the legacy `@testing-library/react-hooks` is removed (deprecated for React 18+)
- Mock `NotificationKit` core — never test real provider in hook tests

### Export Conventions

- Named exports only from `src/react/index.ts` — no default exports

### CLAUDE.md + AGENTS.md Rules

- Keep both files in sync — update both when changing rules
- Update at least every 3 days
