# Audit Report 02 - Over Automation

**Screen:** Dump  
**Burn-in:** [`assets/report-02-over-automation.svg`](./assets/report-02-over-automation.svg)

This report intentionally records a rollback. Sending every dump straight into the bridge made the main dedup flow feel hidden and noisy.

## READ

The current input often starts as a normal note dump, so the default path still needs to be the analyzer.

## LOCATE

`app/screens/DumpScreen.tsx`

## HYPOTHESIZE

Always auto-routing to the bridge would reduce choice, but it would also bury the app's core value.

## REPAIR

The idea was rejected. The main analyze path stayed primary, and the bridge remained a secondary action.

## TEST

Manual UX review

## VERIFY

The rollback preserved the original flow and kept the bridge as a help path, not the only path.
