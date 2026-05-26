# Phase 01 — Dependency updates to latest stable

**Goal:** All deps at latest stable (npm `latest`). No pre-release/alpha. Remove deprecated `@testing-library/react-hooks`. Raise peer floors.
**Skills:** none mandatory; consult `vite`, `vitest`, `eslint-prettier-config` if a tool needs config migration (that work is Phase 02).
**Reference:** `findings.md` §A + DEP-1.

## Strategy — update in clusters, verify between (KR-2)

Use yarn only. After each cluster, `yarn install` must succeed (build/lint/test verification is Phase 02's gate, but note obvious breakage here).

1. **phase01.1 — low-risk** (patch/minor): `@types/node@25.9.1 @types/react@19.2.15 @types/react-dom@19.2.3 @typescript-eslint/eslint-plugin@8.60.0 @typescript-eslint/parser@8.60.0 @vitest/coverage-v8@4.1.7 @vitest/ui@4.1.7 vitest@4.1.7 eslint-plugin-react-hooks@7.1.1 globals@17.6.0 prettier@3.8.3 terser@5.48.0 react@19.2.6 react-dom@19.2.6 @capacitor/core@8.3.4` (dev).
2. **phase01.2 — DEP-1:** `yarn remove @testing-library/react-hooks`. Grep `src/**/*.test.ts*` for `@testing-library/react-hooks`; migrate any `renderHook` import to `@testing-library/react`. Keep `@testing-library/react@16.3.2`, `@testing-library/dom@10.4.1`.
3. **phase01.3 — build majors:** `vite@8.0.14 @vitejs/plugin-react@6.0.2 vite-plugin-dts@5.0.1`.
4. **phase01.4 — lint/test majors:** `eslint@10.4.0 jsdom@29.1.1 lint-staged@17.0.5`.
5. **phase01.5 — TS major:** `typescript@6.0.3`.
6. **phase01.6 — peer floors (KR-1):** edit `package.json` peerDependencies → `@capacitor/core>=8.3.4`, `@capacitor/local-notifications>=8.2.0`, `@capacitor/preferences>=8.0.1`, `@capacitor/push-notifications>=8.1.1`, `firebase>=12.13.0`, `react>=19.2.6`, `react-dom>=19.2.6`, `react-onesignal>=3.5.3`. (Optional-peer meta unchanged.)
7. **phase01.7:** `yarn install`; ensure no `package-lock.json`/`pnpm-lock.yaml`; only `yarn.lock`.

## Files
- `package.json` (devDependencies, peerDependencies), `yarn.lock`, possibly `*.test.ts` (react-hooks migration).

## Verification (defer hard gate to Phase 02)
- `yarn install` exits 0; `git diff package.json` shows expected versions.

## Status log
| Date | Sub-task | Result |
|---|---|---|
| | | |
