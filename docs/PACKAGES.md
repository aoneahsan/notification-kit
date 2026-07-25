# notification-kit — package inventory

Every `package.json` unit in this repository, what each dependency is for, and every intentional pin.
Keep this accurate on **every** add, remove, or upgrade. Fleet rule: `~/.claude/rules/fleet-tasks.md`.

**Last Updated:** 2026-07-25

---

## Units

| Unit | Manifest name | Published? | Purpose |
|---|---|---|---|
| repository root | `notification-kit` | ✅ npm | the library itself — the only publishable unit |
| `examples/react-capacitor-example/` | `react-capacitor-example` | ❌ | runnable demo app, never published |
| `website/` | `notification-kit-docs` | ❌ | **vestigial** — see the note below |

> ⚠️ `website/` duplicates the separate `notification-kit-docs` repository that actually builds and deploys
> [notification-kit-docs.aoneahsan.com](https://notification-kit-docs.aoneahsan.com). Two manifests now share
> the name `notification-kit-docs` (this one at `0.0.0`, the live repo at `0.1.0`). Neither is published to
> npm, so there is no publish hazard — but editing `website/docs/**` here changes nothing on the live site.
> Removal is an open owner decision (`docs/REPORTED-ISSUES.md` → ISSUE-03).

## Runtime dependencies

**None.** `dependencies` is absent from `package.json` by design. Every integration is an optional peer
loaded through a dynamic `import()` at the moment the feature runs.

## Peer dependencies — all optional

Each is declared `optional: true` in `peerDependenciesMeta`, so a consumer installs only what they use. Each
also has a matching `devDependency` at the same range so `tsc` can resolve its types during a build — the
absence of those five devDependencies is what broke the build (`docs/RESOLVED-ISSUES.md` → ISSUE-01).

| Package | Range | Used by | Where |
|---|---|---|---|
| `@capacitor/core` | `>=8.3.4` | platform detection, native bridge | `src/core/platform.ts`, `src/utils/capacitor-types.ts` |
| `@capacitor/push-notifications` | `>=8.1.1` | native push registration and listeners | `src/providers/FirebaseNativeBridge.ts`, `OneSignalNativeBridge.ts` |
| `@capacitor/local-notifications` | `>=8.2.0` | native scheduling and channels | `src/core/NotificationKit.ts` |
| `@capacitor/preferences` | `>=8.0.1` | native persistent storage | `src/core/storage.ts` |
| `firebase` | `>=12.13.0` | the FCM provider | `src/providers/FirebaseProvider.ts` |
| `react`, `react-dom` | `>=19.2.6` | the hooks entry point | `src/react/**` |
| `react-onesignal` | `>=3.5.3` | the OneSignal provider (v3 namespaced API) | `src/providers/OneSignalProvider.ts` |

## Dev dependencies

| Package | Purpose |
|---|---|
| `typescript` | type checking and `.d.ts` emit |
| `vite`, `vite-plugin-dts`, `@vitejs/plugin-react`, `terser` | the dual ESM + CJS build and declaration bundling |
| `eslint`, `@typescript-eslint/*`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-config-prettier`, `eslint-plugin-prettier`, `globals` | linting |
| `prettier` | formatting |
| `husky`, `lint-staged` | pre-commit hooks |
| `@types/node`, `@types/react`, `@types/react-dom` | ambient types |
| the seven peer packages listed above | type resolution during build — **do not remove** |

## Intentional pins and version notes

| Constraint | Reason |
|---|---|
| `typescript ^6.0.3` | Fleet blocker: TypeScript 7 is the native port and ships no JS compiler API, which breaks `typescript-eslint` and the Capacitor CLI. See `~/.claude/rules/package-version-known-issues.md`. |
| `engines.node >= 20` | The lowest Node the package is supported on. Development and CI run Node 24 (`.nvmrc` pins `24.13.0`). Raising this floor is a **major** version change. |
| Peer ranges use `>=`, not `^` | Consumers own these packages; a narrow range would force needless upgrades on them. |
| No `dependencies` | Deliberate. Adding one is a design decision, not a routine change. |

## Published surface

`files` is an allowlist (never `.npmignore`): `dist`, `bin`, `README.md`, `CHANGELOG.md`, `LICENSE`,
`AI-INTEGRATION-GUIDE.md`, with `!**/CLAUDE.md` and `!**/AGENTS.md` as a standing guard. Source maps are not
emitted. Verify with `npm pack --dry-run`, then against the **extracted** tarball.

## Packages removed

None removed to date. Five devDependencies were **added** on 2026-07-25 to repair the build
(`docs/RESOLVED-ISSUES.md` → ISSUE-01).
