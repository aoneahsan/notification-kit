# AGENTS.md — notification-kit

> Last Updated: 2026-06-23

## Task Speed Over Docs (IRON-SOLID — BEHAVIORAL)

Finish the real task fast + correctly FIRST; docs/trackers/sync are a footnote (≤~20% of effort) — never let recording outpace the fix. HARD STOP when doc work outpaces the change → ship, then ONE line if anything. No new summary/status/completion files unless asked; edit/delete over add; delete stale docs. Full rule: `~/.claude/CLAUDE.md`. (Est. 2026-06-19)

## Gitignore Hygiene (IRON-SOLID)
`.gitignore` stays current with the project structure — ignore only recoverable artifacts (build/`dist`/`www`/`node_modules`/logs/caches/IDE), never lose source. Custom rules always present: `*.ignore.*`, `project-record-ignore/`. This is a **PRIVATE** repo -> `.env`/secrets/keystores ARE tracked in git.
Full rule + private/public protocol: `~/.claude/rules/project-config.md`.
Gitignore Last Verified: 2026-06-24

## Project Overview

Unified notification library for React + Capacitor apps. Single API for push, local, and in-app notifications across Web, iOS, and Android. Zero required dependencies — all peer deps optional. Ships dual ESM + CJS.

| Property | Value |
|----------|-------|
| Package Name | `notification-kit` |
| Version | 2.1.1 (published on npm) |
| License | MIT (LICENSE file at repo root, added 2026-06-23) |
| Node.js | >= 20 |
| Package Manager | yarn 4.14.1 (ONLY) |
| Docs site | https://notification-kit-docs.aoneahsan.com (source: separate PUBLIC repo `notification-kit-docs`) |
| Manual/user-only tasks | `docs/MANUAL-TASKS.md` (npm publish + docs deploy are USER-ONLY) |

State (2026-06-23, production finalization): v2.1.1 published; `yarn type-check` + `yarn lint` + `yarn build` (dual ESM/CJS, fresh dist, `index` + `react` entries each with `.d.ts`) all green. This pass: added the missing root LICENSE (GAP-01), corrected misleading FirebaseProvider topic-API comments (GAP-02 — behavior was already correct), refreshed README drift (GAP-03), and created the new PUBLIC `notification-kit-docs` Docusaurus site (GAP-04). Repo confirmed PRIVATE. Finalization tracker: `docs/project-finalization/00-tracker.json`. **Automated test suite removed (2026-06-03)** — no `test` script / Vitest / test files; quality gates are type-check + build + lint + manual verification (do NOT re-add tests unless asked). Resumable polish plan: `docs/features/package-polish-release/`.

## Agent Responsibilities

| Agent | Role |
|-------|------|
| **Claude Code** | Primary implementation. Writes code, runs build/type-check/lint gates, publishes. |
| **Codex** | Reviews, provides specs. Does NOT implement unless explicitly requested. |

## Commands

| Command | Purpose |
|---------|---------|
| `yarn install` | Install dependencies |
| `yarn build` | Build (tsc + vite) |
| `yarn type-check` | TypeScript noEmit check |
| `yarn lint` / `yarn lint:fix` | ESLint |
| `yarn format` / `yarn format:check` | Prettier |

## Module Exports

```typescript
// Main
import { NotificationKit } from 'notification-kit';
// React hooks
import { useNotifications } from 'notification-kit/react';
```

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
- On every session start, check `Last Updated` dates across all files
- If any file is >3 days stale, update it BEFORE proceeding with other work
- Every file must have a `Last Updated` date field

### 3. Claude Code Agents (MANDATORY)

**For EVERY prompt and task, Claude Code MUST use agents (Agent tool) to deliver best results.**
- Use Explore agent before making changes to unfamiliar code
- Use Plan agent before implementing non-trivial features
- Use general-purpose agents for complex multi-step tasks
- Launch multiple agents in parallel when tasks are independent

### 4. Zero-Dependency Philosophy

- All peer dependencies MUST remain optional
- NEVER add required dependencies
- Core must work without any framework or provider
- Graceful degradation when deps unavailable

### 5. API Stability

- NEVER break public API compatibility without major version bump
- NEVER remove or rename exported types/functions without migration path

### 6. Documentation Alignment

- Keep docs aligned with actual package state
- Update `Readme.md`, `docs/README.md`, and portfolio file together
- Be explicit about verification state; never overclaim readiness

---

## Project-Specific DO NOTs

1. **NEVER** add required dependencies
2. **NEVER** break API compatibility
3. **NEVER** require a specific notification provider
4. **NEVER** use `npm` or `pnpm` for local project work

## Project-Specific DOs

1. **DO** maintain zero-dependency philosophy
2. **DO** verify all notification types manually (no automated test suite — removed 2026-06-03)
3. **DO** handle permissions gracefully
4. **DO** use agents for every task

## Security Notes

- Request permissions responsibly — never auto-request without user intent
- Handle notification tokens securely
- Follow platform notification guidelines (FCM, APNs, OneSignal)

## Publishing

```bash
yarn build        # Must pass
yarn lint         # Must pass
yarn type-check   # Must pass
npm publish       # Publish to NPM
```

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

## Nested AGENTS.md Index

| Path | Covers |
|------|--------|
| `src/AGENTS.md` | Source code conventions, module patterns |
| `src/core/AGENTS.md` | Core module rules |
| `src/providers/AGENTS.md` | Provider implementation patterns |
| `src/react/AGENTS.md` | React hooks conventions |
| `src/utils/AGENTS.md` | Utility module guidelines |
| `docs/AGENTS.md` | Documentation structure and maintenance |

<!-- project-links:start -->
## Links

- Live: https://www.npmjs.com/package/notification-kit
- NPM: https://www.npmjs.com/package/notification-kit

_URL source of truth: `01-code/projects/project-live-urls.json` (auto-generated — do not hand-edit between these markers)._
<!-- project-links:end -->
