# EVAL

## Golden Checks

| Check | Expected result | Status |
|---|---|---|
| Route coverage | `/`, `/reports`, and `/forge` render separate screens through Expo Router. | pass |
| Drop-in audit boundary | `AuditWidget` appears once, mounted from root layout only. | pass |
| Dynamic screen name | `usePathname()` maps the active route to Capture, Reports, or Forge. | pass |
| Native dependency injection | capture, file, share, and storage capabilities are supplied by host `deps`. | pass |
| Report contract | Three Markdown reports include burn-in image, screen, note, bounds, and agent input. | pass |

## Ratchet Rule

Each success cycle adds a small verified behavior or evidence artifact. A rollback cycle stays in `FORGE.md` so future cycles do not repeat a rejected hypothesis.
