# AGENTS.md — src/core/

**Last optimized:** 2026-10-20
**Next routine optimization:** 2026-11-19

## Scope

Main NotificationKit API, permission routing, platform detection, and storage abstraction.

## Rules

- Do not import React, Firebase, OneSignal, or another provider SDK.
- Delegate provider behavior through the shared types and keep platform code behind detection guards.
- Request or check permission before operations that need it. Never request permission at import time.
- Storage must work without `@capacitor/preferences` and must preserve the package key prefix and TTL rules.
- Keep errors actionable when an optional provider or native bridge is unavailable.

## Context record

Reviewed against the active tree on 2026-10-20. Inherits the repository root guide.
