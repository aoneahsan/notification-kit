# Progress Log — package-polish-release

> Session log (planning-with-files). Append entries; never rewrite history. Tracker (`00-tracker.json`) is the authoritative phase state.

## Session 1 — 2026-05-26

### Environment
- Node `v26.1.0`, Yarn `4.14.1`.
- `engines.node >=24.13.0` (PK-C2) does not block here (Node 26), but confirms the floor is unrealistically high for consumers.

### Baseline (before any changes), at `v2.0.6`, with the pre-existing modified `yarn.lock`
| Gate | Result |
|---|---|
| `yarn install` | OK (warns: `@testing-library/react-hooks` peer-conflicts React 19 → DEP-1) |
| `yarn type-check` | ✅ exit 0 |
| `yarn build` | ✅ exit 0 |
| `yarn lint` | ✅ exit 0 |
| `yarn test --run` | ❌ **13 failed / 111 passed** (124) |

### Baseline test failures (pre-existing, NOT caused by my changes)
- All 13 failures in `src/react/hooks/useInAppNotification.test.ts > useInAppNotificationPersistence` (and related): `TypeError: Cannot read properties of undefined (reading 'clear')` at `localStorage.clear()`.
- Root cause: `localStorage` not exposed in the jsdom test env with the currently-installed jsdom/vitest (drift from the modified `yarn.lock`; CLAUDE.md recorded 124 passing on 2026-03-25).
- **Plan:** fix in Phase 02.4 (after jsdom→29 bump) by ensuring the test env provides `localStorage` (env fix, not new tests — allowed). The persistence hook itself is reworked in Phase 05 (RU-C1/RU-L6).

### Notes for later phases
- `src/test/setup.ts` has a **hybrid OneSignal mock** (v1 `getUserId`/`sendTag`/`on`/`isPushNotificationsEnabled` + v3 `Slidedown`/`Notifications`). When doing CP-M6 (Phase 07) rewrite to react-onesignal v3, update this mock to the v3 shape so provider tests stay meaningful.
- `setup.ts` mocks all Capacitor plugins + firebase + react-onesignal — good; reuse these shapes when validating provider changes.

### Decisions
- Update deps in clusters with verification between (KR-2). Do NOT chase a green test baseline before Phase 02 — the 13 reds are environmental and scheduled for 02.4.

### Errors encountered
| Error | Attempt | Resolution |
|---|---|---|
| 13 tests fail: `localStorage` undefined | baseline | Deferred to Phase 02.4 (test-env fix after jsdom 29) |
