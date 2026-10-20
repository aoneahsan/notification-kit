# AGENTS.md — src/utils/

**Last optimized:** 2026-10-20
**Next routine optimization:** 2026-11-19

## Scope

Shared validation, formatting, scheduling, dynamic loading, in-app display, Capacitor conversion, and logging.

## Rules

- Prefer pure, browser-safe functions and validate every public input with actionable errors.
- Do not import React or provider SDKs into general utilities.
- Resolve optional dependencies through `dynamic-loader.ts`.
- Route diagnostics through `logger.ts`; the library must not patch the consumer's console automatically.
- Treat DOM content as untrusted and avoid HTML injection sinks.

## Context record

Reviewed against the active tree on 2026-10-20. Inherits the repository root guide.
