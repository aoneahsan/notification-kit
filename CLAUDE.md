# CLAUDE.md — notification-kit

> Last Updated: 2026-06-23

## Task Speed Over Docs (IRON-SOLID — BEHAVIORAL)

Finish the real task fast + correctly FIRST; docs/trackers/sync are a footnote (≤~20% of effort) — never let recording outpace the fix. HARD STOP when doc work outpaces the change → ship, then ONE line if anything. No new summary/status/completion files unless asked; edit/delete over add; delete stale docs. Full rule: `~/.claude/CLAUDE.md`. (Est. 2026-06-19)

## Gitignore Hygiene (IRON-SOLID)
`.gitignore` stays current with the project structure — ignore only recoverable artifacts (build/`dist`/`www`/`node_modules`/logs/caches/IDE), never lose source. Custom rules always present: `*.ignore.*`, `project-record-ignore/`. This is a **PRIVATE** repo -> `.env`/secrets/keystores ARE tracked in git.
Full rule + private/public protocol: `~/.claude/rules/project-config.md`.
Gitignore Last Verified: 2026-06-24

## Project Overview

`notification-kit` is a unified notification library for React + Capacitor applications. Single API for push, local, and in-app notifications across web, iOS, and Android, with optional React hooks and provider integrations.

## Current Verified State

- Reviewed on: `2026-06-23` (production finalization pass)
- Package version: `2.1.1` (published on npm)
- Docs site: **https://notification-kit-docs.aoneahsan.com** — separate PUBLIC repo `notification-kit-docs` (Docusaurus; full API reference). Source-of-truth for API facts is THIS repo's `src/`.
- Manual / user-only tasks: **`docs/MANUAL-TASKS.md`** (npm publish + docs deploy + DNS are USER-ONLY)
- Finalization tracker: `docs/project-finalization/00-tracker.json`
- Install: `yarn install` passed (Yarn 4.14.1)
- Build: `yarn build` passed (dual ESM + CJS, fresh dist regenerated — `index` + `react` entries, `.esm.js` / `.cjs` / `.d.ts` each)
- Type-check: `yarn type-check` passed; `yarn lint` passed
- **Automated test suite removed** (2026-06-03, workspace-wide testing-infrastructure removal): no `test` script, no Vitest/jsdom/testing-library deps, no test files. Quality gates are now `yarn type-check` + `yarn build` + `yarn lint` (ESLint `no-console`) + manual verification. Do NOT re-add a test framework unless explicitly requested.
- Dependencies: at latest stable (TypeScript 6, ESLint 10, Vite 8, …). 2026-06-05 ncu pass bumped only `@types/react` 19.2.16 → 19.2.17 (devDep, patch). No risky majors held back; published `engines.node` unchanged (`>=20`).
- Known dev-only peer warning: `eslint-plugin-react` requests eslint `^8.57 || ^9.7` while repo runs eslint 10 — devDependency-only, does not affect the published package.
- Peer floors: Capacitor `>=8.3.4`, firebase `>=12.13.0`, react `>=19.2.6`, react-onesignal `>=3.5.3`; engines node `>=20`
- Polish/release work tracked in `docs/features/package-polish-release/` (resumable `00-tracker.json`)
- Logger deviation: leveled logger does NOT auto-patch the host console (library-appropriate; see `src/utils/CLAUDE.md`)
- Packaging note: root `LICENSE` (MIT) file added 2026-06-23 — `package.json` `files` entry now resolves; `npm pack` LICENSE warning gone. README is `Readme.md`.

## Commands

```bash
yarn dev          # Development server
yarn build        # tsc + vite build
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

### 4. Zero-Dependency Philosophy

- All peer dependencies MUST remain optional
- NEVER add required dependencies to the package
- Core must work without any framework or provider installed
- See `src/CLAUDE.md` for full source code rules

### 5. API Stability

- NEVER break public API compatibility without a major version bump
- NEVER remove or rename exported types/functions without migration path
- All changes must be backward-compatible within the same major version

### 6. Documentation Alignment

- Keep docs aligned with actual package state — never describe features as "pending"
- When refreshing project info, update `Readme.md`, `docs/README.md`, and the root portfolio file in the same pass
- Be explicit when verification is partial or failing; do not overclaim readiness

---

## Portfolio Info File — Weekly Update Rule

- Canonical portfolio info file: `/home/ahsan/Documents/ahsan-notebook/static/assets/personal/projects-info-as-portfolio-item/packages/NOTIFICATION-KIT_portfolio-info_<YYYY-MM-DD>.md`
- Update at least once per week (and on any material change). Keep the last-updated date in the filename.
- Keep a max-10-entry update history inside the file. On each refresh: prepend today's row, delete the previous dated file, write the new one.
- Tracker: `/home/ahsan/Documents/01-code/docs/tracking/portfolio-info-files-update-tracker.json`
- Last applied: 2026-06-05

## Package Manager Hierarchy: nvm → npm (global) → yarn (local) (IRON-SOLID)

Three tiers, each tool ONLY for its tier — for the best, most reproducible dev results:
- **`nvm`** → install/update Node.js (which bundles `npm`): `nvm install --lts`. Use nvm to get/update `npm` itself.
- **`npm`** → ALL global packages: `npm install -g yarn` (install yarn globally if missing) + `npm install -g <pkg>` (every other global CLI).
- **`yarn`** → ALL local project work: `yarn`, `yarn add <pkg>`, `yarn add -D <pkg>` inside the project.

❌ NEVER use `npm`/`pnpm` for LOCAL installs. NEVER use `pnpm` at all. ✅ Only `yarn.lock` in the project — delete `package-lock.json` and `pnpm-lock.yaml`.

## Package Upgrades: Use `npm-check-updates`

For dependency upgrades use `npx -y npm-check-updates -u && yarn install` (latest STABLE), NOT `yarn upgrade --latest`. Published-package caution: hold back any major that raises `engines.node` or breaks peer compatibility. Full rule in global `~/.claude/CLAUDE.md`. Last applied: 2026-06-05

## Portfolio File Maintenance

- The canonical portfolio info file lives in ahsan-notebook (see "Weekly Update Rule" block above) — NOT in this repo. The legacy root copy was removed on 2026-06-05 to prevent drift; do not re-create a local copy.
- When the portfolio file changes, optionally update `Readme.md` and `docs/README.md` in the same pass

## Package Update History

| Date | Updated By | Notes |
|---|---|---|
| 2026-06-05 | Claude | Portfolio refresh pass: verified v2.1.1 (published); ncu bumped only `@types/react` 19.2.17 (devDep patch); `yarn type-check` + `yarn build` (dual ESM/CJS) + `yarn lint` all green. Confirmed the automated test suite was removed (2026-06-03 testing-infra removal) — quality gates now type-check + build + lint. Removed the legacy root portfolio copy to prevent drift; refreshed CLAUDE.md/AGENTS.md (Last Updated 2026-06-05) + canonical ahsan-notebook portfolio file. |
| 2026-05-29 | Claude | Portfolio refresh pass: verified v2.1.1 (published); ncu bumped only eslint-plugin-prettier 5.5.6 (patch); type-check + build (dual ESM/CJS) + 124 tests all pass; refreshed CLAUDE.md/AGENTS.md; canonical portfolio file moved to ahsan-notebook/packages |
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
| `src/CLAUDE.md` | Source code conventions, zero-dep philosophy |
| `src/core/CLAUDE.md` | Core module: NotificationKit, permissions, platform, storage |
| `src/providers/CLAUDE.md` | Provider implementation patterns |
| `src/react/CLAUDE.md` | React hooks conventions |
| `src/utils/CLAUDE.md` | Utility module guidelines |
| `docs/CLAUDE.md` | Documentation structure and maintenance |

Each folder also has a matching `AGENTS.md` with the same rules.

<!-- project-links:start -->
## Links

- Live: https://www.npmjs.com/package/notification-kit
- NPM: https://www.npmjs.com/package/notification-kit

_URL source of truth: `01-code/projects/project-live-urls.json` (auto-generated — do not hand-edit between these markers)._
<!-- project-links:end -->

## Source maps — disabled by default — RULE
Never generate source maps for this project unless the owner (aoneahsan) explicitly requests them.
Production / build / published output must ship WITHOUT source maps — no `.map` files and no
`//# sourceMappingURL` in shipped assets.

- **Vite**: `build.sourcemap: false` in `vite.config.*`.
- **Rollup**: `output.sourcemap: false` on every output.
- **Webpack**: production `devtool: false` (dev-only inline maps for local debugging are allowed).
- **tsup**: `sourcemap: false`.
- **tsconfig** (library / `tsc` builds): `"sourceMap": false`, `"inlineSourceMap": false`, `"declarationMap": false`.

Dev-only inline source maps for local debugging are fine; never emit source maps in production / published
output. Do NOT re-enable production source maps or delete these settings. Only the owner, by an explicit
request, may turn production source maps on (e.g. a one-off Sentry upload).
