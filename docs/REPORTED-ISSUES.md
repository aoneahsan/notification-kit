# notification-kit — Reported Issues (open queue)

Open issues only. An entry **moves** to `docs/RESOLVED-ISSUES.md` when fixed, with the resolution date and
the fixing version — never deleted. Fleet rule: `~/.claude/rules/project-issue-reporting.md`.

**Last Updated:** 2026-07-25

---

### ISSUE-02 — the published README documented four features the package does not have

**Status:** OPEN (README fixed in the working tree; **the fix is not published**) ·
**Reported:** 2026-07-25 during the npm-package standardisation pass ·
**Affects:** `notification-kit@2.1.1` as rendered on npmjs.com and GitHub

**Symptom** — the shipped README's feature list advertised four capabilities with no implementation behind
them:

| Claim in the README | Reality in the source |
|---|---|
| "Offline Support — Queue notifications when offline" | No offline queue exists. The only "queue" is `useInAppNotificationQueue` in `src/react/hooks/useInAppNotification.ts`, which sequences **in-app toasts** for display. Unrelated to connectivity. |
| "i18n Ready — Full internationalization support" | Only a `LocalizationConfig` **type** is exported. A search of `src` for localization/i18n/translate finds no implementation; the only hits are CSS `translateX`. |
| "Accessible — WCAG 2.1 compliant notifications" | `src/utils/inApp.ts` builds the toast DOM with zero `role` or `aria-*` attributes. No accessibility audit has been performed. |
| "Analytics" (`features.analytics = true`) | `analytics: true` is only a capability flag the providers report. The kit implements no analytics. |

**Why it matters** — these are the "claim the package cannot deliver" class. A developer choosing this
library for offline queueing or accessibility compliance would adopt it and then discover the gap.

**Also corrected in the same pass** (API documentation that would not compile or run):

- Every `notifications.schedule({...})` example omitted `id`, which is **required** — `schedule()` takes
  `ScheduleOptions & LocalNotificationPayload`, and `LocalNotificationPayload.id` is `string`, not optional.
- `const id = await notifications.schedule({...})` — `schedule()` resolves to `void`. The caller supplies
  the id; that same id is what `cancel()` takes.
- `notifications.createChannel / deleteChannel / listChannels` do not exist on the `notifications` object.
  Channel management is on `NotificationKit.getInstance()` and on the `useNotifications()` hook.
- `importance: 'high'` — `ChannelImportance` is numeric, `1 | 2 | 3 | 4 | 5`.
- The "Rich Notifications" examples used `image`, `progress`, `inputField`, and `actions` fields. None exist
  on `ScheduleOptions`; the real fields are `largeIcon`, `attachments`, `group`, `groupSummary`,
  `channelId`, and `actionTypeId`.
- Two dead documentation links pointed at `https://github.com/aoneahsan/notification-kit/wiki`, which has no
  content.
- The Configuration example put the colour palette at `inApp.theme` and a `container` object under `styles`.
  Neither exists: `InAppConfig` is `{ position, duration, maxStack, animation, zIndex, container }` and
  `StyleConfig` is `{ theme, colors, borderRadius, boxShadow, fontFamily, fontSize }`. Colours belong at
  `styles.colors`. This one was caught only by compiling the examples — reading them, it looks right.

**Verification of the replacement** — every TypeScript example in the new README was extracted into one
file and compiled with `tsc --strict --noEmit` against the **installed tarball** (not the repo source). It
exits 0. That check is what surfaced the `InAppConfig` / `StyleConfig` errors above, and is the cheapest way
to keep a README honest.

**Fix** — the rewritten `README.md` drops all four unsupported claims, states each as an explicit entry in
its Limitations section, and corrects every API example against the built `.d.ts` files. `CHANGELOG.md`'s
trailing wiki link now points at the documentation site.

**Remaining work** — **the corrected README only reaches users on the next publish**, because npmjs.com
renders the README from the tarball of the last published version. Until then npm still shows the 2.1.1
text. The publish decision belongs to the main session.

---

### ISSUE-03 — `website/` duplicates the separate docs repository (owner decision needed)

**Status:** OPEN — awaiting owner decision · **Reported:** 2026-07-25 ·
**Affects:** the repository only. No effect on the published package.

**Symptom** — this repository contains a full Docusaurus site at `website/` whose `package.json` is named
`notification-kit-docs` at version `0.0.0`. A **separate repository**,
`https://github.com/aoneahsan/notification-kit-docs` at version `0.1.0`, is what actually builds and deploys
`https://notification-kit-docs.aoneahsan.com`.

**Why it matters** — two manifests share one package name. Neither is published to npm and the docs site
deploys from the other repository, so there is no `npm publish` hazard. The real cost is drift: editing
`website/docs/**` here looks like updating the documentation and changes nothing on the live site. The
in-repo copy has no deployment path.

One further consequence: the package README's logo points at
`raw.githubusercontent.com/aoneahsan/notification-kit-docs/main/static/img/logo.svg` (probed, `200`), because
the in-repo `website/static/img/logo.svg` is a `currentColor` outline that renders black and disappears in
GitHub dark mode. If `website/` is deleted, that reference is unaffected.

**Suggested fix** — delete `website/` and keep the docs repository as the single source. Not done here:
removing a directory the agent did not create is an owner call.

**Reporter** — npm-package standardisation pass, 2026-07-25.

---

### ISSUE-04 — `notification-kit-setup` exits with a stack trace when stdin is not interactive

**Status:** OPEN · **Reported:** 2026-07-25 · **Affects:** `bin/setup.js` in `2.1.1` ·
**Severity:** Low — cosmetic, no data loss

**Symptom** — running the CLI without an interactive terminal (CI, a piped heredoc, `< /dev/null`) prints the
banner, does its detection, then dies on the first prompt:

```
Setup failed: Error [ERR_USE_AFTER_CLOSE]: readline was closed
    at [kQuestion] (node:internal/readline/interface:441:13)
    at file:///.../bin/setup.js:19:57
```

**Repro** — `node bin/setup.js < /dev/null`.

**Root cause** — `readline` emits `close` at end-of-stream, and `question()` is then called on the closed
interface. The CLI never checks `process.stdin.isTTY`.

**Not a module-format defect.** `bin/setup.js` is genuine ESM in a `"type": "module"` package; it loads and
runs correctly, detects the framework and Capacitor, and works normally in a real terminal. This is only
about the non-interactive path.

**Suggested fix** — check `process.stdin.isTTY` at entry and exit `1` with a one-line message ("this command
requires an interactive terminal"), or accept flags for non-interactive use.

**Reporter** — npm-package standardisation pass, 2026-07-25.
