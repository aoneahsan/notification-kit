# notification-kit — Resolved Issues (history)

Entries move here from `docs/REPORTED-ISSUES.md` when fixed — resolution date + fixing version added,
original detail kept, never deleted. Fleet rule: `~/.claude/rules/project-issue-reporting.md`.

---

### ISSUE-01 — the package could not be rebuilt from a clean checkout

**Status:** RESOLVED 2026-07-25 · **Reported:** 2026-07-25 during the npm-package standardisation pass ·
**Affects:** the repository build, not the published artifact

**Symptom** — `yarn build` failed with **22 TypeScript errors** and produced no `dist/` at all:

```
src/core/NotificationKit.ts(578,11): error TS2307: Cannot find module '@capacitor/local-notifications'
src/index.ts(164,10): error TS2304: Cannot find name '__NOTIFICATION_KIT_VERSION__'
src/providers/FirebaseProvider.ts(4,34): error TS2307: Cannot find module 'firebase/app'
src/providers/OneSignalProvider.ts(5,28): error TS2307: Cannot find module 'react-onesignal'
… 18 more
```

Importantly, the **published `notification-kit@2.1.1` is healthy** — `require()` returns 39 exports — so
this never affected users. It meant the package could not be released again, and no future fix could ship.

**Repro** — `yarn install && yarn build` in a clean checkout.

**Root cause** — two independent causes:

1. **Optional peers had no matching devDependency.** `@capacitor/local-notifications`,
   `@capacitor/push-notifications`, `@capacitor/preferences`, `firebase` and `react-onesignal` are
   correctly declared as optional `peerDependencies` (a consumer installs only what they use), but they
   were absent from `devDependencies`, so nothing installed them locally and `tsc` could not resolve
   their types. The house rule is a peer **plus a matching devDependency** for exactly this reason.
2. **`__NOTIFICATION_KIT_VERSION__` had no type declaration.** Vite injects it via `define`, but `tsc`
   runs first and knows nothing about `define`.

**Fix** — added the five missing devDependencies at the same ranges as their peer declarations, and
added `src/globals.d.ts` declaring the injected constant.

**A third defect surfaced only once the real types resolved** — `fromCapacitorImportance` built a
`Record<CapacitorImportance, ChannelImportance>` with keys `1..5`, but Capacitor's `Importance` is
`0 | 1 | 2 | 3 | 4 | 5`. Android's `0` (IMPORTANCE_NONE) was missing. The `|| 3` fallback already
resolved it to default at runtime, so an explicit `0: 3` entry was added to make the type match the
behaviour that already existed. This bug was invisible while the module failed to resolve — which is
the general lesson: **an unresolved import hides every type error downstream of it.**

**Verification** — `yarn build` exits 0 and emits 41 files to `dist/`; `yarn lint` exits 0.

**Last updated:** 2026-07-25
