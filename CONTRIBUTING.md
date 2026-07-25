# Contributing to notification-kit

Thanks for considering a contribution. This document covers how the repository is governed, how to set it
up, what a pull request has to pass, and how to get write access if you want it.

## Table of contents

- [Governance](#governance)
- [Ways to contribute](#ways-to-contribute)
- [Becoming a contributor](#becoming-a-contributor)
- [Development setup](#development-setup)
- [Quality gates](#quality-gates)
- [Project layout](#project-layout)
- [Commit conventions](#commit-conventions)
- [Pull request process](#pull-request-process)
- [Reporting a bug](#reporting-a-bug)
- [Security](#security)
- [Releases](#releases)
- [Support](#support)

## Governance

`main` is protected by a repository ruleset:

- every change lands through a **pull request** — no direct pushes;
- a PR needs **at least one approving review**, and approvals are dismissed when new commits are pushed;
- **force-pushes and branch deletion are blocked**;
- the only bypass is the **repository admin** role, held solely by the maintainer, who pushes directly to
  keep the project moving.

Write (collaborator) access still cannot push to `main`. Review is always required, for everyone.

## Ways to contribute

Bug reports and reproductions are as valuable as code. So are documentation fixes, a corrected type, a
clearer error message, and a platform note for a device you own that the maintainer does not.

## Becoming a contributor

**By fork and pull request — no access needed.** Fork the repository, create a branch, open a PR. This is
the normal path and is open to anyone.

**By collaborator access.** If you expect to contribute repeatedly, open a
["Contributor access request" issue](https://github.com/aoneahsan/notification-kit/issues/new) describing
what you plan to work on, or email <aoneahsan@gmail.com>. Access is granted at the maintainer's discretion.
Note again that write access does not let you bypass review on `main`.

## Development setup

Node ≥ 20 is required; the repository is developed on Node 24 (see `.nvmrc`). Yarn is the package manager —
please do not add a `package-lock.json`.

```bash
git clone https://github.com/aoneahsan/notification-kit.git
cd notification-kit
yarn install
yarn build
```

The optional peer dependencies (`firebase`, `react-onesignal`, the Capacitor plugins) are installed as
devDependencies so that `tsc` can resolve their types. **Do not remove them** — the build fails without
them, and that failure is silent in the sense that it only appears on a clean checkout.

## Quality gates

All three must be clean before a PR is ready. There are no automated tests in this repository, and adding
them is not expected of a contributor.

```bash
yarn type-check   # tsc --noEmit
yarn lint         # eslint src
yarn build        # tsc && vite build
```

House rules that the linter does not catch:

- **No `console.*`.** Use the logger in `src/utils/logger.ts`.
- **No secrets**, in any form, anywhere — including examples and test fixtures.
- **No `TODO` / `FIXME` / placeholder code.** If something is blocked, say so in the PR.
- **Delete unused code** rather than renaming it with an underscore.
- **No source maps** in published output.
- **Public API changes need types and docs in the same PR.**

## Project layout

| Path | Contents |
|---|---|
| `src/core/` | `NotificationKit`, permissions, platform detection, storage |
| `src/providers/` | Firebase and OneSignal providers plus their native bridges |
| `src/react/` | the `notification-kit/react` entry point and its hooks |
| `src/utils/` | validation, scheduling, formatting, dynamic loading, in-app rendering |
| `src/templates/` | service-worker templates the setup CLI writes |
| `bin/setup.js` | the `notification-kit-setup` CLI |
| `examples/` | a runnable React + Capacitor demo |
| `docs/` | repository documentation, the issue queues, the package inventory |

The published documentation site is built from a **separate repository**,
[`aoneahsan/notification-kit-docs`](https://github.com/aoneahsan/notification-kit-docs). Documentation
changes for the site belong there.

## Commit conventions

[Conventional Commits](https://www.conventionalcommits.org/):

```
feat(scheduling): accept a Duration object for the relative `in` option
fix(onesignal): stop sending the REST key from client code
docs(readme): correct the channel importance type
chore(deps): update dev dependencies to latest stable
```

A change that alters the public API is a `feat!` or carries a `BREAKING CHANGE:` footer.

## Pull request process

1. Branch from `main`.
2. Make the change, keeping it focused — one concern per PR reviews far faster.
3. Run the three quality gates.
4. Add a `CHANGELOG.md` entry under `## [Unreleased]` if the change is user-visible.
5. Open the PR describing **what** changed, **why**, and how you verified it. Include the platform and
   provider if the change is platform-specific.
6. Address review comments by pushing new commits — please do not force-push during review.

## Reporting a bug

Open an [issue](https://github.com/aoneahsan/notification-kit/issues) with:

- the package version, plus the provider (Firebase or OneSignal) and platform (Web, iOS, Android);
- what you expected and what happened, with the exact error text;
- a minimal reproduction, ideally against `examples/react-capacitor-example`.

Known open issues are tracked in [`docs/REPORTED-ISSUES.md`](./docs/REPORTED-ISSUES.md); fixed ones move to
[`docs/RESOLVED-ISSUES.md`](./docs/RESOLVED-ISSUES.md). Please check both before filing.

## Security

Do not open a public issue for a security problem. Email <aoneahsan@gmail.com> with the details and give a
reasonable window for a fix before disclosing.

Note that OneSignal's REST API key is account-level and is deliberately never used from client code. A PR
that sends it from the browser will be rejected.

## Releases

Publishing to npm is done by the maintainer. `prepublishOnly` runs the build and the linter, and the release
checklist verifies that the version, the changelog, and the README agree before anything is published.

## Support

If this package saves you time, you can
[support its development](https://aoneahsan.com/payment?project-id=notification-kit&project-identifier=notification-kit).
That link is the only sponsorship channel for this project.

## License

By contributing you agree that your contributions are licensed under the
[MIT License](./LICENSE) that covers this project.
