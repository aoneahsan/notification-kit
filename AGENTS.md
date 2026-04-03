# AGENTS.md - Notification Kit

> AI Agent Instructions for Notification Kit Development

## Project Overview

Unified notification library for React + Capacitor apps. One API for push notifications, in-app notifications, and local notifications across Web, iOS, and Android.

| Property | Value |
|----------|-------|
| Package Name | `notification-kit` |
| Version | 2.0.6 |
| License | MIT |
| Repository | Public |

### Features
- Push notifications (Firebase, OneSignal)
- Local notifications
- In-app notifications
- Zero required dependencies (all peer deps optional)
- React hooks integration

## Agent Responsibilities

| Agent | Role |
|-------|------|
| **Claude Code** | Primary implementation. Writes code, runs tests, publishes. |
| **Codex** | Reviews, provides specs. Does NOT implement unless explicitly requested. |

## Setup Instructions

### Prerequisites
- Node.js >= 24.13.0
- Yarn

### Installation
```bash
yarn install
```

## Build & Test Commands

| Command | Purpose |
|---------|---------|
| `yarn build` | Build (tsc + vite) |
| `yarn build:watch` | Watch mode |
| `yarn dev` | Development server |
| `yarn lint` | ESLint |
| `yarn lint:fix` | Auto-fix lint issues |
| `yarn format` | Prettier format |
| `yarn type-check` | TypeScript check |
| `yarn test` | Run Vitest |
| `yarn test:ui` | Vitest UI |
| `yarn test:coverage` | Coverage report |

## Code Style & Conventions

### Module Exports
```typescript
// Main
import { NotificationKit } from 'notification-kit';

// React hooks
import { useNotifications } from 'notification-kit/react';
```

### Zero Dependencies
- All peer dependencies are optional
- Graceful degradation when deps unavailable
- Framework-independent core

## Project-Specific Rules

### DO NOTs
1. **NEVER** add required dependencies
2. **NEVER** break API compatibility
3. **NEVER** require specific notification provider

### DOs
1. **DO** keep zero-dependency philosophy
2. **DO** test all notification types
3. **DO** handle permission gracefully

## Security Notes

- Request permissions responsibly
- Handle notification tokens securely
- Follow platform notification guidelines

## Testing Requirements

Before publishing:
```bash
yarn build        # Must pass
yarn lint         # Must pass
yarn type-check   # Must pass
```

## Publishing

```bash
yarn prepublishOnly  # Build + lint
npm publish
```
