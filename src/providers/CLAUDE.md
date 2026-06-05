# CLAUDE.md — src/providers/

> Last Updated: 2026-05-26

## Provider Implementation Rules

Providers are the bridge between NotificationKit and external notification services.

### Files

| File | Purpose |
|------|---------|
| `FirebaseProvider.ts` | Firebase Cloud Messaging (FCM) integration |
| `FirebaseNativeBridge.ts` | Capacitor native bridge for FCM |
| `OneSignalProvider.ts` | OneSignal push notification integration |
| `OneSignalNativeBridge.ts` | Capacitor native bridge for OneSignal |

### Implementation Patterns

1. **Interface compliance** — every provider must implement the provider interface from `types.ts`
2. **Dynamic loading** — provider SDKs loaded dynamically, NEVER as static imports at module level
3. **Graceful failure** — if provider SDK not installed, throw descriptive error at init, not at import
4. **Native bridges** — Capacitor-specific code isolated in `*NativeBridge.ts` files
5. **No cross-provider deps** — Firebase provider must NEVER import OneSignal code and vice versa

### Adding a New Provider

1. Create `NewProvider.ts` implementing the provider interface
2. If Capacitor native needed: create `NewNativeBridge.ts`
3. Register in `NotificationKit.ts` provider resolution
4. Update docs and types

### CLAUDE.md + AGENTS.md Rules

- Keep both files in sync — update both when changing rules
- Update at least every 3 days
