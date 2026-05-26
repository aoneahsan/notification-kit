# Phase 06 — Utils correctness

**Goal:** Correct scheduling/date/cron math and formatting edge cases; honest loader errors.
**Skills:** `simplify`. (Scheduling is pure logic — no domain skill needed.)
**Reference:** findings.md §D (RU-H3/H4/H5/H6, RU-M3/M4/M5, RU-L2/L4/L9 + incomplete cron).

## Work items

- **phase06.1 — RU-H4 + RU-H3:** `scheduling.ts`. `calculateAtTime` (`:46-54`): if `scheduledTime <= now`, advance to strictly future (loop by the relevant unit) or reject past `at` consistently with the validator. `calculateOnTime` (`:60-83`): define explicit precedence — if `weekday` given, it wins and ignore `day`; if `day` given, ignore `weekday`; don't mix. Document.
- **phase06.2 — RU-H5:** Clamp month overflow in `setMonth` paths (Jan-31 + 1mo must not roll to Mar). Decide `timezone` (`types.ts:503`): either honor it (convert) or remove from the public type and document local-time semantics. Prefer documenting local-time + removing the unused field cleanly if honoring is non-trivial (backward-compatible: keep field but document it's ignored, or drop if no consumer).
- **phase06.3 — RU-H6:** `parseCronExpression` (`:368-413`): at minimum map the day-of-week field into `on.weekday` (currently dropped, `:424`); document that ranges/steps/lists are unsupported, OR implement basic range/step/list parsing. Remove dead `numberToWeekday` (`:518-522`) or use it. Fix `cronToSchedule` weekly interval (`:452`).
- **phase06.4 — RU-M3 + RU-M4 + RU-M5 + RU-L2:** `formatting.ts`. `truncateText` (`:255-265`) guard `maxLength<=3`. `formatRelativeTime` (`:295-314`) handle future dates (`Math.abs` + "in Xm" branch). `formatFileSize` (`:208-216`) guard `bytes<1` and negatives. Replace deprecated `substr` with `slice`/`substring` (`:288` toTitleCase + `inApp.ts:461`).
- **phase06.5 — RU-L4 + RU-L9:** `dynamic-loader.ts` (`:73-78,104-109,164-169`) inspect `error.code` (`MODULE_NOT_FOUND`/`ERR_MODULE_NOT_FOUND`) before claiming "not installed"; otherwise rethrow original. `validateOnSchedule` (`:230-239`) validate day-per-month or document JS-Date rollover.

## Verification
- `yarn type-check` + `yarn build` + `yarn test --run` clean (scheduling/formatting have existing tests in `validation.test.ts` — confirm still green; fix tests only if a legitimate change breaks them).
- `grep -rn "substr(" src` → zero.

## Status log
| Date | Sub-task | Result |
|---|---|---|
| | | |
