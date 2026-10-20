# AGENTS.md — src/

**Last optimized:** 2026-10-20
**Next routine optimization:** 2026-11-19

## Scope

Published TypeScript source. `src/index.ts` defines the main entry and `src/react/index.ts` defines the optional React entry.

## Rules

- Keep all peer dependencies optional and dynamically loaded at the feature boundary.
- Keep `core/` free of React and provider SDK imports.
- Preserve public API compatibility within major version 2.
- Use strict TypeScript, JSDoc for public APIs, relative imports, and the internal logger.
- Update the package and deployed docs when a public type or behavior changes.

## Verify

Run `yarn type-check`, `yarn lint`, `yarn format:check`, and `yarn build` from the repository root.

## Context record

Reviewed against the active tree on 2026-10-20. Inherits the repository root guide.
