# AGENTS.md — src/providers/

> Last Updated: 2026-05-26

## Provider Implementation Rules

Providers bridge NotificationKit to external notification services (Firebase, OneSignal).

### Files

| File | Purpose |
|------|---------|
| `FirebaseProvider.ts` | FCM integration |
| `FirebaseNativeBridge.ts` | Capacitor native bridge for FCM |
| `OneSignalProvider.ts` | OneSignal push notification integration |
| `OneSignalNativeBridge.ts` | Capacitor native bridge for OneSignal |

### Implementation Patterns

1. **Interface compliance** — implement provider interface from `types.ts`
2. **Dynamic loading** — provider SDKs loaded dynamically, NEVER static imports
3. **Graceful failure** — descriptive error at init if SDK not installed, not at import
4. **Native bridges** — Capacitor code isolated in `*NativeBridge.ts` files
5. **No cross-provider deps** — Firebase NEVER imports OneSignal and vice versa

### Adding a New Provider

1. Create `NewProvider.ts`
2. If Capacitor native needed: `NewNativeBridge.ts`
3. Register in `NotificationKit.ts` provider resolution
4. Update docs and types

### CLAUDE.md + AGENTS.md Rules

- Keep both files in sync — update both when changing rules
- Update at least every 3 days


## Sub-agents & Skills — Main-Context-First (IRON-SOLID)
Default/built-in sub-agents (`general-purpose`, `Explore`, `Plan`, `claude`, `fork`, …) do NOT have
access to `/skills`, so delegating to them silently SKIPS the skills RULE #0 requires. Do all
skill-relevant work in the **MAIN context**; use a sub-agent ONLY when a **custom** agent exists in
`.claude/agents/` for that job; a default `Explore`/`Plan` agent is allowed ONLY for read-only,
no-skill search/exploration. When a relevant skill is missing, **install/enable it** rather than
proceeding skill-less. (Owner directive 2026-07-11; full text in `~/.claude/CLAUDE.md`.)
