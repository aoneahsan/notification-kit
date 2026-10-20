# CLAUDE.md — src/providers/

**Last optimized:** 2026-10-20
**Next routine optimization:** 2026-11-19

## Scope

Firebase and OneSignal web adapters plus their Capacitor native bridges.

## Rules

- Implement the shared provider contracts from `src/types.ts`.
- Load optional SDKs dynamically and report a missing SDK during initialization.
- Keep Firebase and OneSignal independent; neither provider imports the other.
- Keep Capacitor code in the native bridge files and release every listener during teardown.
- Client code must never contain provider admin credentials or perform privileged server operations.

## Context record

Reviewed against the active tree on 2026-10-20. Inherits the repository root guide.
