# Phase 03 — Security fixes

**Goal:** Close the security findings. Highest priority after a green toolchain.
**Skills:** `security-review` (invoke to validate the fixes), `capacitor-best-practices`.
**Reference:** findings.md §B — CP-S1, CP-S2, RU-S1, CP-S3.

## Work items

- **phase03.1 — CP-S1 (Critical):** `src/providers/OneSignalProvider.ts:279-310`. Client-side `sendNotification` must NOT send the REST API key from the browser/app. Make it `throw` a descriptive "OneSignal notifications must be sent from a trusted server (REST API key is a secret); use a backend endpoint" — mirror `FirebaseProvider`'s server-only stance. Ensure `restApiKey` is not required/consumed on the web init path. Update `getCapabilities` if it implies client send.
- **phase03.2 — CP-S2 (Critical):** `src/utils/inApp.ts:189-190`. Replace `icon.innerHTML = options.icon` with safe rendering: if `icon` is a known keyword/glyph use a hardcoded inline SVG/text; otherwise set via `textContent`, or accept a caller-built `HTMLElement`. Never inject arbitrary HTML strings. Add a doc note on the trust model for `InAppOptions.icon`.
- **phase03.3 — RU-S1:** `src/utils/formatting.ts:356-362`. Keep `stripHtml` as a formatter; rename doc/JSDoc to state explicitly it is NOT a sanitizer and must not be used to make untrusted HTML safe. Confirm its output is never assigned via `innerHTML` anywhere.
- **phase03.4 — CP-S3 / RU-L3:** `src/utils/config-validator.ts:114-137`. Make the hardcoded-secret heuristic best-effort (do not iterate/scan all `process.env`); keep "warn only, never log values"; or drop the heuristic. Keep it from producing false positives in Vite/Next/Expo apps.

## Verification
- Re-read each touched function; `yarn type-check` + `yarn build` clean. Confirm no `innerHTML` from untrusted input remains: `grep -rn "innerHTML" src`.

## Status log
| Date | Sub-task | Result |
|---|---|---|
| | | |
