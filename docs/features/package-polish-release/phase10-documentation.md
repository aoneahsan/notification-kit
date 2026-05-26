# Phase 10 — Documentation refresh

**Goal:** Every doc matches the shipped code and the new version. No stale claims, no broken examples.
**Skills:** `documentation-writer`, `technical-writing`, `copywriting` (for any marketing-flavored copy in README/portfolio — honest framing).
**Reference:** findings.md §E docs-vs-code + STD-4, STD-5.

## Work items

- **phase10.1 — API docs (PK-H2/H3/H4/M1/M2/M3):** Fix `Readme.md` + `AI-INTEGRATION-GUIDE.md`:
  - Event names → real keys (`notificationReceived`/`notificationActionPerformed`/`tokenReceived`/`tokenRefreshed`/`permissionChanged`) or `notifications.onPush(...)` helpers (PK-H2).
  - `useInAppNotification()` return → `{ show, success, error, warning, info }` (PK-H3).
  - `useNotifications()` → add/document `isPermissionGranted` (decide: add boolean to hook in P05 OR doc `permission==='granted'`) (PK-H4).
  - `cancel(id)` id type consistent with code (`string|number` after CP-M1) (PK-M1).
  - `success(title, message?)` signature corrected (PK-M2).
  - One canonical `schedule()` shape matching `ScheduleOptions`; make both docs agree (PK-M3).
  - SW template Firebase compat version aligned (PK-L5); note peer v12+.
- **phase10.2 — CHANGELOG (PK-M4):** Add a `2.1.0` entry: dependency updates (list majors), security fixes, correctness fixes, packaging (CJS, engines, SW templates), and a prominent **⚠️ Peer dependency requirements raised** section (Capacitor 8, firebase 12.13, react 19.2.6, react-onesignal 3.5.3 — see KR-1). Backfill brief 2.0.4–2.0.6 stubs if known, else note consolidation.
- **phase10.3 — CLAUDE/AGENTS (STD-4):** Refresh root `CLAUDE.md` + `AGENTS.md` and all nested (`src/`, `src/core/`, `src/providers/`, `src/react/`, `src/utils/`, `docs/`): bump `Last Updated: 2026-05-26`, version `2.1.0`, verified state, audit record row, and note the logger opt-in-console deviation in `src/utils/`. Keep both files in sync (IRON-SOLID).
- **phase10.4 — Portfolio + guides + website (STD-5):** Refresh `NOTIFICATION-KIT_portfolio-info_*.md` (rename to `_2026-05-26` if >7 days, keep ≤10 history rows) and `docs/README.md`, `docs/guides/*`, `docs/api/*` to match the API. Update `website/` docs content where it documents the API (do NOT deploy). Update `Readme.md` + `docs/README.md` in the same pass per project rule.

## Verification
- Re-grep docs for the fixed mismatches (event names, hook returns, `isPermissionGranted`, `cancel` id, `success` sig). Version strings = `2.1.0` everywhere (`grep -rn "2\\.0\\.[0-6]" docs Readme.md *.md src/index.ts`). All `Last Updated` = 2026-05-26.

## Status log
| Date | Sub-task | Result |
|---|---|---|
| | | |
