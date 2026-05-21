# Audit Forge

Student number: 9221118087  
Slug: audit-forge  
Selected Track: C — Otonomi

## Summary

Audit Forge is a minimal Expo + TypeScript host app that recreates the useful behavior of `nokta-audit` for the Week 14 audit-forge homework. The app mounts a local `AuditWidget` on every screen, lets a user mark a simulated yellow area, write an issue note, generate a Markdown audit report, and view generated reports in the app.

The upstream `nokta-audit` widget was inspected first. Its public component is `AuditWidget`, and its real integration expects host-provided screenshot capture, file writing, sharing, storage, `currentScreen`, `reporterId`, and icon dependencies. This submission keeps the same repair-loop behavior in a portable local implementation so it remains demoable in a small Expo app.

All work is inside `submissions/9221118087-audit-forge/`.

## App Path

`submissions/9221118087-audit-forge/app/`

## Setup

```bash
cd submissions/9221118087-audit-forge/app
npm install
```

## Run

```bash
npm start
npm run android
npm run ios
npm run web
```

## Expo Link

Placeholder: add Expo link after publishing.

## Demo Video

Placeholder: add demo video link after recording.

## Checklist

- [x] Expo + TypeScript app under `app/`
- [x] At least 3 screens: HomeScreen, ReportsScreen, SettingsScreen
- [x] Navigation between screens
- [x] AuditWidget mounted globally
- [x] User can generate Markdown audit reports
- [x] Generated reports are viewable in the app
- [x] At least 3 sample Markdown reports under `reports/`
- [x] Reports include agent-ready repair instructions
- [x] Track C — Otonomi is represented in app flow, docs, and FORGE.md
- [x] No backend, auth, payment, or heavy dependencies

## AI Tools Used

- Codex was used to inspect the upstream widget, scaffold the Expo host app, create the local compatible `AuditWidget`, generate sample reports, and write the Track C documentation.

## Track C Fit

The human touch point is the report created through `AuditWidget`. The generated Markdown becomes the coding agent input. The ratchet is the repeated verified repair cycle: each accepted fix improves the app. Rollback protects quality by rejecting failed repair attempts and recording them instead of accepting unverified changes.
