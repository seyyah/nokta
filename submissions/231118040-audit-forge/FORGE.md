# FORGE Ledger

Time box: 15 minutes per cycle.  
Agent: OpenAI Codex.  
Track: A - Sadelik / drop-in discipline.  
Human touch points: 2 total (initial scope approval, final PR review).

| Cycle | Report | Hypothesis | Result | Changed files | Test result | Commit hash | kg | Human touch points |
|---|---|---|---|---|---|---|---:|---|
| 1 | `audit-reports/capture-cta.md` | Capture flow should be a real Expo Router route and the audit widget should stay in the root host boundary. | success | `app/app/*`, `app/src/*`, `app/package.json` | `npm run typecheck` passed | `9d115e8` | 5 | 0 |
| 2 | `audit-reports/reports-export.md` | Audit reports need burn-in visual truth and Markdown handoff text so the coding agent can consume them directly. | success | `audit-reports/*` | Markdown artifacts verified | `24ab0aa` | 11 | 0 |
| 3 | `audit-reports/forge-ratchet.md` | The release artifact must match the routed app and demo artifact so the submission is testable without rebuilding. | success | `app-release.apk`, `demo/demo-60s.mp4` | `gradlew assembleRelease` passed | `3927e09` | 18 | 1 |
| 4 | `audit-reports/forge-ratchet.md` | Replacing in-memory storage with async persistent storage would improve realism. | rollback | none retained | rollback after dependency risk; no commit | `ROLLBACK: persistent storage exceeded Track A scope` | 18 | 1 |

## Cycle Details

### Cycle 1 - Capture

- READ: `capture-cta.md` flagged unclear first-use capture behavior.
- LOCATE: Route shell and screen copy in `app/app/_layout.tsx`, `app/src/NoktaScreen.tsx`, and `app/src/screens.ts`.
- HYPOTHESIZE: Expo Router can provide route truth while keeping the audit widget mounted once in the root layout.
- REPAIR: Added `/`, `/reports`, and `/forge`; `usePathname()` now feeds `deps.currentScreen`.
- TEST: `npm run typecheck`.
- VERIFY: `grep -r "AuditWidget" app/` returns one app mount line when generated folders are excluded.
- COMMIT: `9d115e8`.

### Cycle 2 - Reports

- READ: `reports-export.md` flagged weak handoff language.
- LOCATE: `audit-reports/` and linked burn-in screenshots.
- HYPOTHESIZE: Small, grounded reports are enough for Track A and reduce slop.
- REPAIR: Added three Markdown reports with burn-in images, notes, bounds, and agent input.
- TEST: Markdown links and image paths checked locally.
- VERIFY: `audit-reports/` contains three reports and three visual ground-truth images.
- COMMIT: `24ab0aa`.

### Cycle 3 - Forge

- READ: `forge-ratchet.md` flagged missing ratchet evidence and stale delivery artifacts.
- LOCATE: Release APK and demo artifact.
- HYPOTHESIZE: Rebuilding after Router migration prevents a mismatch between source and APK.
- REPAIR: Rebuilt Android release in a short temp path and copied the APK into the submission root.
- TEST: `gradlew assembleRelease` passed with Java 17.
- VERIFY: `app-release.apk` is a real release artifact, not a placeholder.
- COMMIT: `3927e09`.

### Cycle 4 - Rollback

- READ: Persistent storage would be more realistic.
- LOCATE: `auditStorage` in `app/app/_layout.tsx`.
- HYPOTHESIZE: Add AsyncStorage.
- REPAIR: Rejected before commit because it expands dependencies and weakens Track A minimalism.
- TEST: Not run; rollback at hypothesis gate.
- VERIFY: App remains drop-in and dependency-light.
- ROLLBACK: no retained code changes.
