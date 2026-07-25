/**
 * Build-time constants injected by Vite's `define` (see `vite.config.ts`).
 *
 * `tsc` runs before Vite and knows nothing about `define`, so without this
 * declaration `yarn build` fails with `TS2304: Cannot find name
 * '__NOTIFICATION_KIT_VERSION__'` even though the value is present at runtime.
 */

/** The package version, single-sourced from `package.json` at build time. */
declare const __NOTIFICATION_KIT_VERSION__: string;
