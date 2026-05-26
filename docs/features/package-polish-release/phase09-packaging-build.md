# Phase 09 — Packaging & build

**Goal:** Make the published package installable everywhere, dual-format (ESM+CJS), tree-shakeable, with SW templates actually shipped and the CLI working.
**Skills:** `vite` (lib build), `nodejs-best-practices` (bin/exports).
**Reference:** findings.md §E — PK-C1, PK-C2, PK-H1, PK-M4/M5/M6, PK-L1/L2/L3/L5/L6.

## Work items

- **phase09.1 — PK-C2 + PK-L2:** `package.json` `engines.node` → `>=20` (realistic). Add `"sideEffects": false` (verify no module relies on import-time side effects; `src/react` rules forbid them).
- **phase09.2 — PK-H1 (CJS build):** Configure `vite.config.ts` lib build to emit both `es` and `cjs` (`index.cjs.js`/`react.cjs.js` or `.cjs`). Update `package.json` `exports` for both subpaths with ordered conditions: `types` → `import` → `require` → `default`. Verify: a tiny `require('notification-kit')` and `import` both resolve against `dist/`. Keep `module`/`types` top-level fields consistent. (If CJS proves infeasible cleanly under Vite 8, fall back to documented ESM-only + add `"default"` condition and a clear error — log decision in tracker.)
- **phase09.3 — PK-C1 (SW templates):** Ship the service-worker templates. Copy `src/templates/*.template.js` → `dist/templates/` during build (vite `closeBundle`/`writeBundle` plugin hook or a `vite-plugin-static-copy`-style step using existing tooling — no new heavy dep; a small inline plugin in `vite.config.ts` is fine). Add `"dist/templates"` (covered by shipping `dist`) — confirm they land in the tarball (`npm pack --dry-run`). Wire `bin/setup.js` to copy the chosen template into the user's `public/` dir (with overwrite confirmation + error handling + path safety). OR, if templates stay source-only, remove the "service worker templates" claim from docs — but shipping them is preferred (PK-C1 marks the feature broken).
- **phase09.4 — PK-M6 + PK-M5 + PK-L1 + PK-L3 + PK-L6:** `bin/setup.js` add `red: '\x1b[31m'` to COLORS; replace placeholder `github.com/your-username/...` with the real repo URL. Remove the stray `test` block from `vite.config.ts`. Delete redundant `.npmignore` (rely on `files`) or document `files` authoritative. Bump eslint `ecmaVersion` (done P08) — confirm. `"prepare": "husky"` guarded, or drop husky if truly unused.
- **phase09.5 — PK-M4 + PK-L5:** Drive the exported runtime `version`/`metadata.version` in `src/index.ts` from a single source (read package.json version at build via Vite `define`, or a generated constant) so it can't drift. Align Firebase compat SDK version pin across `firebase-messaging-sw.template.js` + README + AI-GUIDE to one current version; note peer firebase v12+.

## Verification
- `yarn build` clean; `npm pack --dry-run` lists `dist/`, `dist/templates/*`, `bin/`, `README.md`, `LICENSE`, `AI-INTEGRATION-GUIDE.md`. Manually `node -e "require('./dist/index.cjs.js')"` and an ESM import smoke-check resolve. `bin/setup.js` runs without color/URL garbage (dry run, no server).

## Status log
| Date | Sub-task | Result |
|---|---|---|
| | | |
