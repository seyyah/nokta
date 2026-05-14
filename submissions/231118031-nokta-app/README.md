Track: B

# Nokta Audit Forge Submission

Student: 231118031  
Slug: 231118031-nokta-app  
Track: B - Yaraticilik / customer-as-developer feature loop

This submission turns the customer into a developer-shaped input source. The host app contains a small Expo + TypeScript Nokta clone under `app/`. A tester can open the app, tap the red QA floating button, mark the current screen, write a note, and export a Markdown audit report. The reports in `audit-reports/` are then consumed by the forge cycle ledger in `FORGE.md`.

## Run

```bash
cd app
npx expo start
```

Expo link / QR: run the command above and scan the Expo Go QR from the terminal. For local web smoke test, use `npx expo start --web`.

Demo video: [existing 60 sec demo short](https://youtube.com/shorts/ge9CWeWHVyY)

APK: previous build link is [Google Drive](https://drive.google.com/file/d/1UvqgKWH71D_CgL2AsCQj2mjs_Nuyd_0P/view?usp=sharing). A fresh `app-release.apk` was not rebuilt inside this offline workspace.

## What Is Included

- `app/`: Expo Router + TypeScript app with 4 screens: Onboarding, IdeaList, IdeaDetail, ForgeBoard.
- `app/src/mobile-audit/`: local vendored drop-in audit primitive matching the `@xtatistix/mobile-audit` boundary.
- `app/app/_layout.tsx`: single root mount for `<AuditWidget deps={auditDeps} currentScreen={currentScreen} />`.
- `app/src/auditDeps.ts`: host-provided dependency bundle for capture, burn-in, file write/share, and storage.
- `audit-reports/`: 3 Markdown reports with burn-in visual ground truth.
- `FORGE.md`: 4 cycles, including 3 successes and 1 rollback.
- `IDEA.md`: Track B customer-as-developer use case.

## Decision Log

1. Track B was selected because the most useful audit report here is a feature request, not a cosmetic bug.
2. Expo Router is used so `currentScreen` is derived dynamically from the active path.
3. The audit widget imports no native file-system, sharing, storage, or screenshot packages. Those capabilities are injected through `deps`.
4. A local vendored audit primitive is used instead of network installation so the project remains runnable in the restricted workspace.
5. The forge fixes are intentionally small: one report, one hypothesis, one screen-level change.
6. Rollback memory is visible in both `FORGE.md` and the ForgeBoard screen.

## Human Touch Points

Total: 4

- Cycle 1: human selected the onboarding report and accepted the compact handoff scope.
- Cycle 2: human confirmed that the detail screen should expose the customer sentence as implementation context.
- Cycle 3: human rejected the oversized automation panel after visual review.
- Cycle 4: human accepted the compact rollback-row design.

## AI Tool Log

- Codex: repository inspection, Expo app scaffold, audit widget host boundary, forge ledger, and validation.
- Prior existing submission note: the older root Expo prototype used Gemini/Antigravity for voice assistant experimentation; this challenge layer is implemented as the audit-forge track.

## Self Check

- Track line is first line of this README.
- `app/` contains a working Expo + TypeScript project.
- Audit widget is mounted once at the app root and receives `deps` plus dynamic `currentScreen`.
- `audit-reports/` contains 3 Markdown reports with embedded burn-in visuals.
- `FORGE.md` contains 3 success cycles and 1 rollback cycle.
- Root repository files outside this submission directory were not modified.
