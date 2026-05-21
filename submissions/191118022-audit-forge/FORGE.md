# FORGE Ledger

## Context

- Host app: `submissions/191118022-audit-forge/app`
- Track: `A`
- Audit inputs: `audit-reports/*.md`
- Agent: `Codex`
- Timebox policy: `15 min / cycle`

## Ratchet Summary

- Successful cycles: `3`
- Rollback cycles: `1`
- Total accepted weight: `18kg`
- Baseline scaffold commit: `da94dca`

## Cycle Log

| Cycle | Input | Timebox | Locate | Hypothesis | Action | Test | Verify | Result | Files | Commit |
|---|---|---:|---|---|---|---|---|---|---|---|
| 1 | `audit-reports/01-home-action-overflow.md` | 12m | `app/app/index.tsx` hero action row | Fixed-width CTA buttons should stack below 420px instead of competing in one row. | Added compact viewport detection with `useWindowDimensions`, switched action row to column mode on narrow widths, and removed fixed minimum width in compact mode. | `npm run typecheck` | Mobile viewport preview showed the secondary CTA no longer clipping off-screen. | success | `app/app/index.tsx` | `e543c1d` |
| 2 | `audit-reports/02-backlog-chip-collapse.md` | 9m | `app/app/backlog.tsx` chip cluster | Shrinking chip typography alone might recover enough breathing room. | Tried a smaller chip-only adjustment locally, but card body rhythm still broke on narrow width and the visual delta was too weak. Change was discarded. | `npm run typecheck` | Visual comparison still showed the right edge pressure around the highlighted region. | rollback | `app/app/backlog.tsx` | `rollback/no-commit` |
| 3 | `audit-reports/02-backlog-chip-collapse.md` | 11m | `app/app/backlog.tsx` chip cluster | The row needs wrapping behavior, not just smaller text. | Enabled `flexWrap`, split row/column gaps, and let each chip self-size so the card can breathe again. | `npm run typecheck` | `audit-reports/verify/backlog-fixed.png` and fresh web export confirmed the highlighted zone regained spacing. | success | `app/app/backlog.tsx` | `652b3c5` |
| 4 | `audit-reports/03-settings-hint-contrast.md` | 8m | `app/app/settings.tsx` helper copy | The issue is mostly contrast plus cramped vertical rhythm. | Increased row padding and promoted helper text from `faint` to `muted` contrast with a slightly taller line height. | `npm run typecheck` and `npx expo export --platform web` | `audit-reports/verify/settings-fixed.png` showed the highlighted helper text reading cleanly against the paper background. | success | `app/app/settings.tsx` | `5070759` |

## Notes

- The audit widget is still mounted exactly once in `app/components/AuditMount.native.tsx`.
- The local package is consumed as a tarball to keep the drop-in contract deterministic inside the submission folder.
- `app-release.apk` was built from a short-path worktree clone to avoid Windows path-length failures during native compilation; the copied APK in the submission root matches the current accepted code state.
