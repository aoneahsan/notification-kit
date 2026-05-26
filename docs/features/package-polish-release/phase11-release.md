# Phase 11 — Release: verify + bump + publish

**Goal:** Ship `2.1.0` to npm cleanly and verify it. **Only irreversible step in the whole task.**
**Skills:** `release` (if helpful), `git-commit`.
**Reference:** acceptance criteria in `00-overview.md`. User pre-authorized direct publish.

## Work items

- **phase11.1 — Full gate:** From a clean tree: `yarn install` → `yarn type-check` → `yarn build` → `yarn lint` → `yarn test --run`. ALL must be 0-error/0-warning/all-pass. Then verify the artifact: `npm pack --dry-run` contents correct; ESM `import` and (if built) CJS `require` both resolve; `dist/templates/*` present; types resolve. Re-confirm every Critical + High finding is `fixed`/`wontfix` in `findings.md`.
- **phase11.2 — Version bump:** `2.0.6` → `2.1.0` in `package.json`, the exported `version`/`metadata.version` (now single-sourced from P09.5), and any doc/version constant. Confirm CHANGELOG `2.1.0` entry is present (P10.2).
- **phase11.3 — Commit + sync:** Stage the deletion of `examples/.../play-console-rejection-rules.json` (STD-3) and `yarn.lock`. ONE commit for the session's work + tracker update. `git pull --rebase origin main` → resolve → `git push origin main`. Confirm local/remote in sync.
- **phase11.4 — Publish:** `npm whoami` → must be `aoneahsan` (token in `~/.npmrc` per publishing-compliance; if `ENEEDAUTH`, set token + publish in the SAME shell invocation). `npm publish`. Then `npm view notification-kit version` must report `2.1.0`. Optionally `npm view notification-kit dist-tags`. Report the published version, the npm URL, and a summary of what shipped to the user.

## Pre-publish checklist (do not skip)
- [ ] All gates green (11.1).
- [ ] `prepublishOnly` (`yarn build && yarn lint`) passes — it runs automatically on publish.
- [ ] `files` ships exactly what's intended (no source, no docs bloat, templates included).
- [ ] Version `2.1.0` consistent across package.json + runtime constant + CHANGELOG + README.
- [ ] Peer-dep raise documented (KR-1).
- [ ] Committed + pushed BEFORE publishing (so the published commit is in git).

## Verification
- `npm view notification-kit version` == `2.1.0`. Tracker `phase11` → complete; final runHistory row with the publish commit sha.

## Status log
| Date | Sub-task | Result |
|---|---|---|
| | | |
