# CLAUDE.md — notification-kit

> Last Updated: 2026-05-26

## Project Overview

`notification-kit` is a unified notification library for React + Capacitor applications. Single API for push, local, and in-app notifications across web, iOS, and Android, with optional React hooks and provider integrations.

## Current Verified State

- Reviewed on: `2026-05-26`
- Package version: `2.1.0` (release in progress)
- Install: `yarn install` passed
- Build: `yarn build` passed (dual ESM + CJS)
- Type-check / Lint: passed (ESLint `no-console` enforced)
- Tests: `yarn test --run` — 124 passed, 0 failed
- Dependencies: all at latest stable (TypeScript 6, ESLint 10, Vite 8, Vitest 4, jsdom 29, …); `@testing-library/react-hooks` removed
- Peer floors raised: Capacitor `>=8`, firebase `>=12.13.0`, react `>=19.2.6`, react-onesignal `>=3.5.3`
- Polish/release work tracked in `docs/features/package-polish-release/` (resumable `00-tracker.json`)
- Logger deviation: leveled logger does NOT auto-patch the host console (library-appropriate; see `src/utils/CLAUDE.md`)

## Commands

```bash
yarn dev          # Development server
yarn build        # tsc + vite build
yarn test --run   # Run all tests once
yarn test         # Watch mode
yarn test:coverage
yarn type-check   # TypeScript noEmit check
yarn lint         # ESLint
yarn lint:fix
yarn format       # Prettier
yarn format:check
```

## Architecture Map

| Folder | Purpose | Details |
|--------|---------|---------|
| `src/core/` | NotificationKit class, permissions, platform, storage | See `src/core/CLAUDE.md` |
| `src/providers/` | Firebase & OneSignal provider implementations | See `src/providers/CLAUDE.md` |
| `src/react/` | React hooks (useNotifications, useInAppNotification) | See `src/react/CLAUDE.md` |
| `src/utils/` | Validation, scheduling, formatting, logging, etc. | See `src/utils/CLAUDE.md` |
| `src/templates/` | Service worker templates for Firebase & OneSignal | — |
| `src/test/` | Test setup and integration tests | — |
| `docs/` | API docs, guides, helpers, examples | See `docs/CLAUDE.md` |
| `examples/` | Working example apps (React + Capacitor) | — |
| `website/` | Docusaurus documentation site | — |

Source code conventions and rules are in `src/CLAUDE.md`.

---

## CRITICAL RULES

### 1. CLAUDE.md + AGENTS.md Sync Rule (IRON-SOLID)

**Every important rule MUST exist in BOTH `CLAUDE.md` AND `AGENTS.md` at each level.**
- When adding or updating a rule in one file, ALWAYS update the other
- This applies to root and ALL nested files
- Never add a rule to just one file — always both
- Create reasonable nested `CLAUDE.md` and `AGENTS.md` files in all important folders where rules improve development results

### 2. CLAUDE.md + AGENTS.md Update Frequency (IRON-SOLID)

**ALL `CLAUDE.md` and `AGENTS.md` files MUST be reviewed and updated at least once every 3 days.**
- On every session start, check `Last Updated` dates across all project files
- If any file is >3 days stale, update it BEFORE proceeding with other work
- Stale instruction files directly degrade development quality
- Every file must have a `Last Updated` date field

### 3. Claude Code Agents (MANDATORY)

**For EVERY prompt and task, Claude Code MUST use agents (Agent tool) to deliver the best possible experience.**
- Use Explore agent before making changes to unfamiliar code
- Use Plan agent before implementing non-trivial features
- Use general-purpose agents for complex multi-step tasks
- Launch multiple agents in parallel when tasks are independent

### 4. Yarn Only (IRON-SOLID)

- Use `yarn` exclusively for all package operations in this repository
- Do NOT use `npm`, `pnpm`, or generate `package-lock.json` / `pnpm-lock.yaml`

### 5. Zero-Dependency Philosophy

- All peer dependencies MUST remain optional
- NEVER add required dependencies to the package
- Core must work without any framework or provider installed
- See `src/CLAUDE.md` for full source code rules

### 6. API Stability

- NEVER break public API compatibility without a major version bump
- NEVER remove or rename exported types/functions without migration path
- All changes must be backward-compatible within the same major version

### 7. Documentation Alignment

- Keep docs aligned with actual package state — never describe features as "pending"
- When refreshing project info, update `Readme.md`, `docs/README.md`, and the root portfolio file in the same pass
- Be explicit when verification is partial or failing; do not overclaim readiness

---

## Portfolio File Maintenance

- Maintain exactly one root portfolio info file: `NOTIFICATION-KIT_portfolio-info_YYYY-MM-DD.md`
- Refresh only after 7+ days unless major release or material capability change
- Keep at most 10 update-history records inside the portfolio file
- When the portfolio file changes, update `Readme.md` and `docs/README.md` in the same pass

## Package Update History

| Date | Updated By | Notes |
|---|---|---|
| 2026-05-26 | Claude | Polish + 2.1.0: deps→latest, full audit remediation (security/core/react/utils/providers), OneSignal v3 rewrite, leveled logger, dual ESM/CJS packaging, docs refresh |
| 2026-04-03 | Claude | Split CLAUDE.md/AGENTS.md into nested structure for context optimization |
| 2026-03-25 | Codex | Fixed failing tests, re-verified install/build/test |
| 2026-03-24 | Codex | Refreshed docs, recorded verification status |
| 2026-02-02 | Claude | Full update to latest versions |

## Audit Record

| Date | Audit Type | Status | Issues Found | Resolved |
|---|---|---|---|---|
| 2026-05-26 | Deep audit + remediation (3-agent) | Passed | ~70 (8 critical, ~19 high, ~25 med, ~20 low) | All critical + high; minors deferred (see findings.md) |
| 2026-03-25 | Issue Remediation | Passed (minor warning) | 39 | 38 |
| 2026-03-24 | Portfolio + Docs Refresh | Passed with issues | 38 | 0 |
| 2026-02-02 | Package Update | Passed | 0 | 0 |
| 2026-01-23 | Full Audit | Passed with issues | 1 | 0 |

### Last Audit Details (2026-05-26)

- Package Manager: yarn confirmed; all deps at latest stable
- Build: passes (dual ESM + CJS); type-check + lint clean (`no-console` enforced)
- Tests: 124 passing
- Security: OneSignal client REST-key leak + in-app icon XSS fixed
- Findings + resumable plan: `docs/features/package-polish-release/`

### Next Audit Due: 2026-06-26

## Nested CLAUDE.md / AGENTS.md Index

| Path | Covers |
|------|--------|
| `src/CLAUDE.md` | Source code conventions, zero-dep philosophy, testing |
| `src/core/CLAUDE.md` | Core module: NotificationKit, permissions, platform, storage |
| `src/providers/CLAUDE.md` | Provider implementation patterns |
| `src/react/CLAUDE.md` | React hooks conventions |
| `src/utils/CLAUDE.md` | Utility module guidelines |
| `docs/CLAUDE.md` | Documentation structure and maintenance |

Each folder also has a matching `AGENTS.md` with the same rules.
