# CLAUDE.md

This file provides guidance for working in the `notification-kit` repository.

## Project Overview

`notification-kit` is a unified notification library for React + Capacitor applications. It exposes a single API for push notifications, local notifications, and in-app notifications across web, iOS, and Android usage patterns, with optional React hooks and provider integrations.

## Current Verified State

- Reviewed on: `2026-03-25`
- Package version: `2.0.6`
- Install: `yarn install` passed
- Build: `yarn build` passed
- Tests: `yarn test --run` passed
- Current test snapshot:
  - 124 tests passed
  - 0 tests failed
- Known warning in verification pass:
  - Node `DEP0169` deprecation warnings surfaced during Yarn execution

## Commands

```bash
yarn dev
yarn build
yarn test
yarn test --run
yarn test:coverage
yarn type-check
yarn lint
yarn lint:fix
yarn format
yarn format:check
```

## Architecture

- `src/core/`: `NotificationKit`, permissions, platform, and storage logic
- `src/providers/`: Firebase and OneSignal provider implementations and tests
- `src/react/`: React hooks and exports
- `src/utils/`: validation, scheduling, formatting, dynamic loading, logging, and in-app helpers
- `src/templates/`: service worker templates
- `src/test/`: test setup and existing-app tests

## Working Rules

- Keep docs aligned with the actual package state. Do not describe the project as “implementation pending”.
- Use `yarn` as the only documented package manager workflow for this package.
- Do not use `npm`, `pnpm`, or `package-lock.json` in this repository. Use `yarn install` for dependency installation.
- When refreshing project info, update `Readme.md`, `docs/README.md`, and the root portfolio file in the same pass.
- Be explicit when verification is partial or failing; do not overclaim readiness.

## Root Portfolio File Maintenance Rule

- Maintain exactly one current root portfolio info file for this package.
- File naming format: `NOTIFICATION-KIT_portfolio-info_YYYY-MM-DD.md`
- Refresh the portfolio file only after at least 7 days have passed unless a major release or material capability change happens sooner.
- Keep at most 10 update-history records inside the portfolio file.
- When the portfolio file changes, update `Readme.md` and `docs/README.md` in the same pass.

## Package Update History

| Date | Updated By | Notes |
| --- | --- | --- |
| 2026-03-25 | Codex | Fixed failing tests, re-verified install/build/test, and enforced yarn-only documentation wording |
| 2026-03-24 | Codex | Refreshed docs, recorded current verification status, added portfolio maintenance rule |
| 2026-02-02 | Claude | Full update to latest versions, all checks passing |

## Comprehensive Audit Record

| Date | Audit Type | Status | Issues Found | Issues Resolved |
| --- | --- | --- | --- | --- |
| 2026-03-25 | Issue Remediation | Passed with minor warning | 39 | 38 |
| 2026-03-24 | Portfolio + Docs Refresh | Passed with issues | 38 | 0 |
| 2026-02-02 | Package Update | Passed | 0 | 0 |
| 2026-01-23 | Full Audit | Passed with issues | 1 | 0 |

### Last Audit Details

- Package Manager: yarn confirmed, `yarn install` used for verification
- Dependencies: no dependency audit performed in this pass
- Build: passes
- Lint: not run in this pass
- TypeScript: not run separately in this pass
- Tests: passing in current pass
- Features: implementation exists across core, providers, hooks, and utilities

### Next Audit Due: 2026-04-01
