# AGENTS.md — src/react/

**Last optimized:** 2026-10-20
**Next routine optimization:** 2026-11-19

## Scope

Optional React hooks exported from `notification-kit/react`.

## Rules

- React remains an optional peer and no hook performs work at module import time.
- Clean up every listener and subscription on unmount.
- Keep returned callbacks and objects stable where identity affects consumers.
- Surface asynchronous failures through hook state or documented rejected promises.
- Export named hooks and their public types from `src/react/index.ts`.

## Context record

Reviewed against the active tree on 2026-10-20. Inherits the repository root guide.
