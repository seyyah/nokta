Track: C

# FitLoop - Audit-to-Forge Submission

**Submission for Track C: Otonomi (human touch points + ratchet).**

## App Summary
FitLoop is a minimal Expo + TypeScript React Native app for daily fitness micro-coaching. Users enter meals, water, and activity, then receive a local `FitScore` and short coaching feedback.

## Audit Widget
- Drop-in mount point: `app/App.tsx`
- Widget source: `app/src/audit/AuditWidget.tsx`
- Report directory: `audit-reports/`
- Report format: Markdown bug report with screenshot ground truth.
- Boundary rule: native file-system and screenshot operations are injected through `deps`; the widget does not import `expo-file-system` or `react-native-view-shot` directly.

## Forge Cycle
- Flow: READ -> LOCATE -> HYPOTHESIZE -> REPAIR -> TEST -> VERIFY -> COMMIT/ROLLBACK.
- Target timebox: 15 minutes per cycle.
- Ledger: `FORGE.md`.
- Verification command: `npx tsc --noEmit`.
- Required future commit format: `[FORGE: ScreenName] Description — Xkg`.

## Human Touch Points
- **Count: 4**
- Cycle 01: Human approved background color target from audit report.
- Cycle 02: Human approved Save button radius target.
- Cycle 03: Human approved Save button font size target.
- Cycle 04: Human rejected invalid red Save button color, triggering rollback.

## AI Tool Log
- Codex generated the AuditWidget integration and Forge ledger setup.
- Codex read audit reports, located affected code, applied repairs, ran TypeScript checks, and committed each cycle.
- Codex simulated the rollback acceptance failure for Cycle 04, then restored the last healthy Cycle 03 file state with git checkout.

## Evidence
- Audit reports: `audit-reports/audit_01.md`, `audit-reports/audit_02.md`, `audit-reports/audit_03.md`
- Burn-in screenshots: `audit-reports/audit_01.png`, `audit-reports/audit_02.png`, `audit-reports/audit_03.png`
- Evaluation notes: `EVAL.md`
- Android APK: `app-release.apk`

## Expo / Demo Links
- Expo Project: https://expo.dev/accounts/eexnmy/projects/FitLoop
- EAS Build APK: https://expo.dev/accounts/eexnmy/projects/FitLoop/builds/51194e1e-7ffb-42d4-9de0-1bb393311e82
- Demo: https://youtube.com/shorts/sySnhjO2TzY

## Decision Log
- Track C was selected to emphasize autonomy, human touch points, and rollback behavior.
- The audit widget remains drop-in and receives native screenshot/file-system behavior through `deps`.
- Forge cycles are intentionally small and monotonic: each accepted repair increments KG, while rejected behavior rolls back.
- Burn-in reports cover `DailyEntryScreen`, `HistoryScreen`, and `ProfileScreen` to prove multi-screen coverage.
