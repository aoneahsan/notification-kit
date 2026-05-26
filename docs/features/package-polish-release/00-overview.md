# Package Polish & Release — Overview

> Feature slug: `package-polish-release` · Created: 2026-05-26 · Owner: Claude (for Ahsan)
> **Single resume point:** [`00-tracker.json`](./00-tracker.json). On any re-run, read the tracker first, find the first `pending`/`in_progress` sub-task, read that phase file, then continue. Never restart from scratch.

## Goal

Polish `notification-kit` to a release-ready state and ship it as a **minor** version bump (`2.0.6` → `2.1.0`) on npm:
1. Update all dependencies to **latest stable** (npm `latest` dist-tag, no pre-release/alpha).
2. Fix every deprecation/breakage introduced by the updates.
3. Resolve all issues found in the deep audit — security, functionality, incomplete-feature gaps, correctness, packaging — backward-compatibly.
4. Fully refresh documentation (README, AI-INTEGRATION-GUIDE, CHANGELOG, all nested `CLAUDE.md`/`AGENTS.md`, portfolio file, website docs) to match the shipped code.
5. Bump version, build, verify, and publish to npm.

## User decisions (captured 2026-05-26)

| Decision | Choice | Implication |
|---|---|---|
| NPM release | **Claude publishes directly** | At the end, Claude runs `npm publish` and reports. Phase 11 gate. |
| Peer dependency floors | **Raise to latest stable** | Capacitor `>=8.x`, firebase `>=12.13.0`, react `>=19.2.6`, react-onesignal `>=3.5.3`. ⚠️ Technically borders on breaking for consumers on old majors — **must be loudly documented in the changelog** (KR-1). |
| Feature-gap scope | **Harden + complete existing, backward-compatible only** | Fix bugs, close gaps, finish half-done features, small additive APIs. **No net-new large features.** Native OneSignal SDK integration and async Web-Crypto storage are explicitly OUT (made honest instead). |

## Scope boundaries

**In scope:** the published library (`src/`, `bin/`, `package.json`, build config, `Readme.md`, `AI-INTEGRATION-GUIDE.md`, `CHANGELOG.md`, nested docs, portfolio, `website/` docs content where it documents the API).
**Out of scope (this release):** building a real native OneSignal integration (CP-H8 → made honest); converting storage to async Web Crypto (CP-M3 → honest base64); the `examples/` app feature work (only touched if it breaks); deploying the Docusaurus website.

## Acceptance criteria (Definition of Done)

- [ ] `yarn install` clean; all deps at latest stable; `@testing-library/react-hooks` removed.
- [ ] `yarn type-check`, `yarn build`, `yarn lint` → **0 errors / 0 warnings**.
- [ ] `yarn test --run` → all green (existing suite; no new tests written unless user asks — workspace rule).
- [ ] All **Critical** + **High** findings: `fixed` or explicitly `wontfix`/`deferred` with reason in `findings.md`.
- [ ] Security items CP-S1, CP-S2 fixed.
- [ ] `isSupported()` returns correct per-platform truth (CP-M9); `onPush` fires (CP-H1/H2); native listeners cleaned up (CP-C3); React render-loop & listener-churn fixed (RU-C1/RU-C2).
- [ ] OneSignal provider works against react-onesignal v3 API (CP-M6).
- [ ] Packaging: realistic `engines.node`, CJS+ESM exports, `sideEffects:false`, SW templates shipped+wired or claim removed (PK-C1/C2/H1/L2).
- [ ] Logger meets workspace standard; `no-console:'error'` enforced (STD-1/STD-2).
- [ ] All docs match code (PK-H2/H3/H4, PK-M1/M2/M3/M4); version strings consistent at `2.1.0`; CHANGELOG has the `2.1.0` entry with the ⚠️ peer-dep note.
- [ ] All `CLAUDE.md`/`AGENTS.md` (root + nested) + portfolio refreshed with `Last Updated: 2026-05-26` and the new version.
- [ ] Published to npm as `2.1.0`; `npm view notification-kit version` confirms; report back to user.

## Phase index

| Phase | File | Title | Gate |
|---|---|---|---|
| 00 | (this + tracker) | Planning & setup | plan files written |
| 01 | [phase01](./phase01-dependency-updates.md) | Dependency updates to latest stable | install clean |
| 02 | [phase02](./phase02-toolchain-breakage-fixes.md) | Toolchain breakage/deprecation fixes (TS6, ESLint10, Vite8, jsdom29, lint-staged17) | type-check+build+lint+test green |
| 03 | [phase03](./phase03-security-fixes.md) | Security fixes (CP-S1, CP-S2, RU-S1, CP-S3) | — |
| 04 | [phase04](./phase04-core-correctness.md) | Core correctness (events, listeners, capabilities, storage, native token) | — |
| 05 | [phase05](./phase05-react-hooks-correctness.md) | React hooks correctness (render loop, listener churn, schedule shape) | — |
| 06 | [phase06](./phase06-utils-correctness.md) | Utils correctness (scheduling/cron/date, formatting, loader) | — |
| 07 | [phase07](./phase07-provider-honesty-onesignal-v3.md) | Provider honesty + OneSignal v3 API + completion | — |
| 08 | [phase08](./phase08-logger-standard.md) | Logger standard + ESLint no-console | grep zero direct console.* |
| 09 | [phase09](./phase09-packaging-build.md) | Packaging & build (engines, CJS/ESM, sideEffects, SW templates, setup.js) | build artifacts correct |
| 10 | [phase10](./phase10-documentation.md) | Documentation refresh (README, AI-GUIDE, CHANGELOG, CLAUDE/AGENTS, portfolio, website) | docs match code |
| 11 | [phase11](./phase11-release.md) | Final verification + version bump + npm publish | published + verified |

## Known risks

- **KR-1** — Raising peer-dep major floors on a *minor* version bump is non-standard semver. Mitigation: prominent ⚠️ changelog + README note; user explicitly chose this.
- **KR-2** — TypeScript 6.0 / ESLint 10 / Vite 8 are majors with possible breaking changes; budget Phase 02 for iteration; update in clusters with verification between.
- **KR-3** — CP-M6 OneSignal v3 rewrite is the riskiest code change (real API surface differs); base it on the installed `react-onesignal@3.5.3` types, not memory.
- **KR-4** — Adding a CJS build (PK-H1) changes the build pipeline; verify both `import` and `require` resolve before shipping.
- **KR-5** — Workspace rule: **do not write new automated tests** unless the user asks. Run existing tests as a gate; fix tests only if a legitimate code change breaks them.

## Working rules (this task)

- Read `00-tracker.json` before each work session; update it after each sub-task (status + runHistory).
- Invoke matching skills at each phase boundary (RULE #0): security-review (P03), capacitor-best-practices/capacitor-push-notifications (P04/P07), react-best-practices+react-19 (P05), vitest (P02), vite+eslint-prettier-config (P02/P09), simplify (P04-P08), documentation-writer (P10).
- One commit per session, tracker update included. Never start dev/preview servers.
- 3-strike rule on any error: diagnose → alternative → rethink → escalate. Log errors in the tracker/progress.
