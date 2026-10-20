# AGENTS.md — notification-kit

**Last Updated:** 2026-10-20

**Last optimized:** 2026-10-20
**Next routine optimization:** 2026-11-19

## Scope

Public TypeScript library that exposes one notification API for web and Capacitor applications. The separate
public docs repository is `/home/ahsan/Documents/01-code/projects/notification-kit-docs` and is the only
source for the deployed documentation site.

| Item | Current value |
|---|---|
| Package | `notification-kit` |
| Published version | `2.1.3` |
| Node | `>=20`; development pin `.nvmrc` |
| Package manager | Yarn only |
| Build output | `dist/`, dual ESM and CJS plus declarations |
| Public entries | `notification-kit`, `notification-kit/react` |
| Runtime dependencies | None; every peer is optional |

## Start here

1. Read the nearest nested `AGENTS.md` and `CLAUDE.md` before editing that tree.
2. Read `package.json`, the affected source, and its public docs. Do not load historical feature trackers
   unless the task concerns that work.
3. Preserve API compatibility inside major version 2 and verify every public claim against `src/`.

## Commands

```bash
yarn install --immutable
yarn type-check
yarn lint
yarn format:check
yarn build
```

The repository intentionally has no automated test suite. For CLI changes, also exercise the affected
interactive or noninteractive path. Inspect the packed file list before publishing.

## Architecture

| Path | Responsibility |
|---|---|
| `src/core/` | Main API, permissions, platform detection, storage |
| `src/providers/` | Firebase and OneSignal adapters and native bridges |
| `src/react/` | Optional React hooks entry |
| `src/utils/` | Validation, scheduling, formatting, loading and logging |
| `src/templates/` | Service worker templates copied into the package build |
| `bin/setup.js` | Interactive setup CLI |
| `docs/` | Package reference, decisions, maintenance and historical records |
| `examples/` | Consumer examples; not published |

## Invariants

- Keep the core framework independent and keep every peer dependency optional.
- Load provider and framework packages only when their feature is used; missing peers must fail clearly.
- Keep Firebase and OneSignal isolated from one another.
- Add public behavior without breaking existing exports or signatures inside the current major version.
- Route library diagnostics through `src/utils/logger.ts`; do not write directly to the host console.
- Production output must not contain source maps.
- Never install, import, vendor, or copy an owner-created client package, including `@perkforce/tool-kit`.
- Never commit environment values, service-account files, private keys, tokens, or credentials. Tracked
  examples contain placeholders only.

## Documentation and release

The source tree is authoritative for API facts. Update the package README, relevant `docs/` page, changelog,
and the separate docs repository together when public behavior changes. Use semantic versioning. Run all
verification gates before publishing, then verify the registry artifact and documentation URL.

## Context record

This guide pair and every active nested pair were reviewed on 2026-10-20. The duplicate undeployed
`website/` tree was removed; `notification-kit-docs` is canonical. Routine context work is ineligible before
2026-11-19 unless the tree changes materially or an instruction is proven stale.

## Stop-work Git gate

<!-- RULE:stop-work-git-gate v2026-10-20 -->

Before stopping, commit every legitimate change and work-progress checkpoint in this repository and each independent nested repository, fetch and merge the designated upstream, push the documented working branch, then verify an empty worktree and `0 0` ahead/behind. Never stash, discard, reset, rebase, or force-push. If synchronization is blocked, report the exact repository, branch, blocker, and next action instead of calling the work complete. The full workflow remains authoritative in `~/.claude/rules/git-workflow.md`.
