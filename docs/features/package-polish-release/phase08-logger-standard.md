# Phase 08 — Logger standard + ESLint no-console

**Goal:** Bring `logger.ts` to the workspace centralized-logger standard (library-appropriate) and enforce `no-console`.
**Skills:** `eslint-prettier-config`.
**Reference:** STD-1, STD-2, RU-M1, PK-H5.

## Work items

- **phase08.1 — STD-1 / RU-M1:** `src/utils/logger.ts`. Implement leveled logging:
  - Levels `debug < info < warn(default) < error < silent`. Default `warn` in dev AND prod.
  - Runtime switch: `localStorage['notification-kit:logLevel']` (guarded for non-browser), build-time `import.meta.env.VITE_LOG_LEVEL` if available, programmatic `logger.setLevel(level)` + `getLevel()`.
  - Devtools: expose `window.__setLogLevel`/`__getLogLevel` (guarded).
  - Console patching: patch `console.log/info/debug/trace` to no-op at boot, preserve `warn`/`error` — **library caveat:** make this OPT-IN (e.g. `logger.takeOverConsole()`), not automatic, so the library never hijacks a consumer's console without consent. Document the deviation from the app-standard (a library must not silently patch a host app's console).
  - Mirror `console.*` surface (variadic `log/info/debug/trace/warn/error`), level-gated. `info` must no longer fire unconditionally.
  - The `console.*` calls inside this file are the sanctioned exception.
- **phase08.2 — STD-2 / PK-H5:** `eslint.config.js` add `'no-console': 'error'` to the base rules with an override exempting `src/utils/logger.ts`. Also bump `ecmaVersion` (PK-L3). Run `yarn lint`; fix any newly-flagged callsites by routing through `logger`.
- **phase08.3 — GATE:** `grep -rEn "\\bconsole\\.(log|info|debug|trace|warn|error|table|time|timeEnd|group|groupCollapsed|groupEnd)\\(" src --include=*.ts --include=*.tsx | grep -v src/utils/logger.ts` → **zero** (SW templates under `src/templates/` are `.js` and excluded; they may keep `console` as they run in the SW context — confirm grep excludes them).

## Verification
- `yarn lint` 0 warnings · grep gate zero · `yarn build` + `yarn test --run` clean.

## Notes / library deviation
A published library MUST NOT auto-patch the host app's `console` or silently change global logging. Auto-patching from the workspace app-standard is therefore made **opt-in** here. Record this deviation in the logger JSDoc + nested `src/utils/CLAUDE.md`.

## Status log
| Date | Sub-task | Result |
|---|---|---|
| | | |
