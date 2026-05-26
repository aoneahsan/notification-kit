# Phase 02 — Toolchain breakage / deprecation fixes

**Goal:** With deps updated, get `type-check`, `build`, `lint`, `test` all green. Fix everything the major bumps broke.
**Skills:** `vite` (build config), `eslint-prettier-config` (flat-config), `vitest` (test runner). Invoke as each surfaces.
**Reference:** KR-2; depends on Phase 01.

## Work items (driven by actual error output — diagnose, don't guess)

- **phase02.1 — TypeScript 6.0:** run `yarn type-check`. Fix new errors / removed-deprecation flags. Watch for: stricter lib types, removed deprecated compiler options in `tsconfig*.json`, `moduleResolution` changes. Check `tsconfig.json` + `tsconfig.build.json` against TS6 (drop any options TS6 errors on).
- **phase02.2 — ESLint 10:** run `yarn lint`. ESLint 10 may drop deprecated context/formatter APIs and change flat-config defaults. Fix `eslint.config.js` (flat). Confirm `typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks@7`, `eslint-config-prettier`, `eslint-plugin-prettier` compose under v10. (no-console rule itself is Phase 08.)
- **phase02.3 — Vite 8 / plugin-react 6 / vite-plugin-dts 5:** run `yarn build`. Fix `vite.config.ts` for Vite 8 lib-mode API changes; confirm `vite-plugin-dts@5` option names (e.g. `rollupTypes`, `insertTypesEntry`) still valid; confirm dts output + `@/` alias rewriting still works. Verify `dist/` emits `index.esm.js`, `react.esm.js`, `*.d.ts`.
- **phase02.4 — jsdom 29 / lint-staged 17:** run `yarn test --run`. Fix jsdom env changes in `src/test/setup.ts`/`vitest.config.ts`. Confirm `lint-staged@17` config shape in `package.json` still valid.
- **phase02.5 — GATE:** all four commands clean (0 errors, 0 warnings on lint, 0 on build).

## 3-strike protocol
If a tool fights back twice, check that tool's migration guide / changelog for the major, try the documented migration, then escalate to user with the exact error if still stuck.

## Files
- `tsconfig.json`, `tsconfig.build.json`, `eslint.config.js`, `vite.config.ts`, `vitest.config.ts`, `src/test/setup.ts`, `package.json` (lint-staged).

## Verification
- `yarn type-check` ✅ · `yarn build` ✅ (artifacts present) · `yarn lint` ✅ 0 warnings · `yarn test --run` ✅ all pass.

## Status log
| Date | Sub-task | Result |
|---|---|---|
| | | |
