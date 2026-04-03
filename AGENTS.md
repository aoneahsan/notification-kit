# AGENTS.md — notification-kit

> Last Updated: 2026-04-03

## Project Overview

Unified notification library for React + Capacitor apps. Single API for push, local, and in-app notifications across Web, iOS, and Android. Zero required dependencies — all peer deps optional.

| Property | Value |
|----------|-------|
| Package Name | `notification-kit` |
| Version | 2.0.6 |
| License | MIT |
| Node.js | >= 24.13.0 |
| Package Manager | yarn (ONLY) |

## Agent Responsibilities

| Agent | Role |
|-------|------|
| **Claude Code** | Primary implementation. Writes code, runs tests, publishes. |
| **Codex** | Reviews, provides specs. Does NOT implement unless explicitly requested. |

## Commands

| Command | Purpose |
|---------|---------|
| `yarn install` | Install dependencies |
| `yarn build` | Build (tsc + vite) |
| `yarn test --run` | Run all tests once |
| `yarn test` | Vitest watch mode |
| `yarn test:coverage` | Coverage report |
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

### 4. Yarn Only (IRON-SOLID)

- Use `yarn` exclusively — no `npm`, `pnpm`, `package-lock.json`, or `pnpm-lock.yaml`

### 5. Zero-Dependency Philosophy

- All peer dependencies MUST remain optional
- NEVER add required dependencies
- Core must work without any framework or provider
- Graceful degradation when deps unavailable

### 6. API Stability

- NEVER break public API compatibility without major version bump
- NEVER remove or rename exported types/functions without migration path

### 7. Documentation Alignment

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
2. **DO** test all notification types
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

## Nested AGENTS.md Index

| Path | Covers |
|------|--------|
| `src/AGENTS.md` | Source code conventions, testing, module patterns |
| `src/core/AGENTS.md` | Core module rules |
| `src/providers/AGENTS.md` | Provider implementation patterns |
| `src/react/AGENTS.md` | React hooks conventions |
| `src/utils/AGENTS.md` | Utility module guidelines |
| `docs/AGENTS.md` | Documentation structure and maintenance |
