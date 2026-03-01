# Capacitor/Capawesome/Trapeze rollout note (2026-03-01)

- Project: `notification-kit`
- Scope assessment: package repository with docs website (`website/` is Docusaurus docs, not a deployable Capacitor app target).
- Result:
  - Capacitor: not applicable at project website/docs level for this rollout.
  - Capawesome: not applicable at project website/docs level for this rollout.
  - Trapeze (`apps-config.yaml`): not applicable (no app target in nested docs website).

## Verification

Commands executed:

```bash
yarn type-check
yarn lint
yarn build
yarn test
```

Outcome:

- Typecheck: pass
- Lint: pass
- Build: pass
- Tests: fail (existing suite failures in current branch state; rollout did not require code changes in this project)

