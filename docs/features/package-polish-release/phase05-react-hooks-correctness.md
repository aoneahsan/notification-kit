# Phase 05 — React hooks correctness

**Goal:** Eliminate the render-loop and listener-churn bugs every consumer hits; fix schedule shape and identity churn.
**Skills:** `react-best-practices`, `react-19`, `react-useeffect` (if listed), `simplify`.
**Reference:** findings.md §D (RU-C*, RU-H1/H2, RU-M6/M7/M9, RU-L7/L8). Depends on Phase 04 (in-app manager may gain an emitter).

## Work items

- **phase05.1 — RU-C1 (Critical):** `useInAppNotification.ts:313-324`. Remove the 1 s `setInterval`. Add a subscription on `InAppNotificationManager` that emits on show/dismiss (add a tiny observer to the manager in `src/utils/inApp.ts` if not present), and update active list on those events only. Apply to base hook + `useInAppNotificationSimple`/`Queue`/`Persistence`. Add a `mountedRef` guard as belt-and-suspenders.
- **phase05.2 — RU-C2 (Critical):** `useNotifications.ts:604-655`. Use functional `setState(prev => ({...prev, notifications: [...prev.notifications, n]}))`; change the setup effect deps to `[state.isInitialized, updateState]` (drop `state.notifications`) so listeners register once.
- **phase05.3 — RU-C3:** `useNotifications.ts:506`. Replace `Date.now()` listener id with a monotonic counter ref or `crypto.randomUUID()`.
- **phase05.4 — RU-H2:** `useNotifications.ts:350-380`. Build `scheduleOptions` as a proper `NotificationSchedule` (no `title`/`body`); stop forcing empty strings through `as any`.
- **phase05.5 — RU-M6 + RU-M7 + RU-H1:** `configure` (`:116-126`) functional setState, drop `state.config` dep, single merge. Queue (`:417-458`) driven off manager show/dismiss events, not polled `hasActive`. Document `destroy()` process-global semantics (RU-H1) in hook JSDoc + docs (no ref-count rework unless trivial).
- **phase05.6 — RU-M9 + RU-L7 + RU-L8:** Replace empty `catch {}` blocks with `Logger.warn/debug` (useNotifications `:127-129,196-198,549-551`; useInAppNotification `:144-149,245-250,432-438`). `useMemo` the `showInApp` object (`:583-599`) and optionally the hook return objects.

## Verification
- `yarn type-check` + `yarn build` + `yarn test --run` clean. Re-read effects for correct dep arrays + cleanup. Confirm no `setInterval` remains in `useInAppNotification.ts`.

## Status log
| Date | Sub-task | Result |
|---|---|---|
| | | |
