# FORGE

Selected Track: C — Otonomi

This file is the Phase B repair log. Each cycle consumes one Markdown audit report and follows the same loop:

`READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT/ROLLBACK`

Phase A prepares the Expo app, sample reports, generated report flow, and this log template. Phase B will use real reports with Codex repair cycles.

## Cycle 1

Report used: `reports/home-primary-action.md`

READ: The report says the HomeScreen primary action is unclear for first-time users. The marked area is the main audit-flow action, and the user note says generic start language does not explain that the action creates an audit report.

LOCATE: `app/src/screens/HomeScreen.tsx`

HYPOTHESIZE: HomeScreen needs an explicit, visible audit-report call to action near the loop summary. The smallest repair is copy and layout, not navigation or widget state changes.

REPAIR: Added a bordered "Create an audit report" action panel that tells the user to tap the red floating button, mark the problem area, and generate Markdown for the coding agent.

TEST: `npm run typecheck` and `npm run lint`

VERIFY: The HomeScreen now contains a clear audit-report action with a visible red cue. It fits within the existing vertical mobile layout and keeps the floating widget as the actual report trigger.

COMMIT/ROLLBACK: COMMIT

Result: Accepted. The human touch point is clearer before the user enters the Markdown report flow.

Loop: READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT/ROLLBACK

## Cycle 2

Report used: `reports/reports-empty-state.md`

READ: The report says generated reports are hard to distinguish from packaged sample reports on ReportsScreen.

LOCATE: `app/src/screens/ReportsScreen.tsx` and `app/src/components/ReportCard.tsx`

HYPOTHESIZE: ReportsScreen already passes source data into ReportCard, but the visual treatment is too subtle. The smallest repair is to make source a prominent card-level distinction.

REPAIR: Added source metadata in ReportCard with explicit labels, different badge colors, and source-colored left borders for generated local reports versus sample files.

TEST: `npm run typecheck` and `npm run lint`

VERIFY: Report cards now read "Generated locally" or "Sample file" and have different left border colors, so generated widget output can be scanned separately from bundled examples.

COMMIT/ROLLBACK: COMMIT

Result: Accepted. The generated report queue is clearer without adding dependencies or changing report storage.

Loop: READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT/ROLLBACK

## Cycle 3

Report used:

READ:

LOCATE:

HYPOTHESIZE:

REPAIR:

TEST:

VERIFY:

COMMIT/ROLLBACK:

Result:

Loop: READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT/ROLLBACK

## Rollback Cycle

Report used:

READ:

LOCATE:

HYPOTHESIZE:

REPAIR:

TEST:

VERIFY:

COMMIT/ROLLBACK:

Result:

Loop: READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT/ROLLBACK
