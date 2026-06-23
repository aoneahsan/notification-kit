# Manual / User-Only Tasks — notification-kit

> The ONE place for everything only you (the human) can do. Fixed path: `docs/MANUAL-TASKS.md`.
> Global spec: `~/.claude/rules/manual-tasks.md`. Last updated: 2026-06-23

The agent finished its part of every item below; each still needs you because it requires a
credential, a publish/deploy action, DNS access, or a real device the agent must not touch.

## ⏳ Pending manual tasks

| # | Task | Why only you | Detailed runbook | Status |
|---|------|--------------|------------------|--------|
| 1 | **Publish `notification-kit` to npm** when you next cut a release | Needs your npm auth token / `npm publish` (agent never publishes) | `npm whoami` → should be `aoneahsan`; `yarn build` → `npm publish` (see `package.json` `prepublishOnly`) | ☐ Not started |
| 2 | **Create the docs-site Firebase Hosting target** `notification-kit-docs` and deploy | Needs your Firebase account/login + project | In `notification-kit-docs/`: `yarn build` then `npx -y firebase-tools@latest deploy --only hosting --project notification-kit-docs` (see its `package.json` scripts) | ☐ Not started |
| 3 | **Point DNS / custom domain** `notification-kit-docs.aoneahsan.com` at the chosen host (Firebase Hosting or GitHub Pages) | Needs DNS registrar access | Add the host's verification + A/CNAME records; confirm `static/CNAME` matches if using GitHub Pages | ☐ Not started |
| 4 | **(Optional) Enable GitHub Pages** for `aoneahsan/notification-kit-docs` | Needs repo Settings access | Repo → Settings → Pages → Build from GitHub Actions; the Pages workflow is committed | ☐ Not started |
| 5 | **Real-device push verification** (FCM token receipt, local-notification scheduling on iOS/Android) | Needs physical devices + your Firebase/OneSignal project credentials | Use the example app under `examples/react-capacitor-example/` with your own provider keys | ☐ Not started |
| 6 | **Register the docs dev port** in `~/.dev-ports.json` if you run the docs locally | Personal registry on your machine | Docs site uses ports 5962 (start) / 5963 (serve) — add a `notification-kit-docs` entry | ☐ Not started |

## ✅ Completed manual tasks

(none yet — move rows here with the date once done)
