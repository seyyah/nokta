# FORGE.md — Cycle Ledger

> Week 3 ratchet log. Success rows move the system forward. Rollback rows stay visible.

| Cycle | Report | Hypothesis | Result | Changed files | Test | Commit hash | kg | Human touch points |
|---|---|---|---|---|---|---|---|---|
| 1 | `audit-reports/report-01-bridge-gap.md` | Add a dedicated human bridge CTA so Week 2 is visible from the dump flow. | success | `app/screens/DumpScreen.tsx`, `app/screens/BridgeScreen.tsx` | `npx tsc --noEmit` | `pending` | 1 | 0 |
| 2 | `audit-reports/report-02-over-automation.md` | Route every dump directly to the bridge to reduce friction. | rollback | `none` | UX review failed: main dedup path became harder to find. | `pending` | 1 | 1 |
| 3 | `audit-reports/report-03-question-clarity.md` | Three to five focused questions are enough for a useful human handoff. | success | `app/services/claudeApi.ts`, `app/screens/BridgeScreen.tsx` | `npx tsc --noEmit` | `pending` | 2 | 0 |
| 4 | `audit-reports/report-04-ledger-ratchet.md` | A visible forge ledger should expose success, rollback, kg, and human touches at a glance. | success | `app/screens/ForgeScreen.tsx`, `FORGE.md`, `audit-reports/*` | manual review | `pending` | 3 | 0 |

## Summary

- Success cycles: 3
- Rollback cycles: 1
- Final kg: 3
- Total human touch points: 1

## Notes

- The rollback is kept in the ledger on purpose. Ratchet means learning without erasing the mistake.
- The forge view is intentionally small: one screen, one ledger, one visible growth story.
