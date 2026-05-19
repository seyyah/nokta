Track: C

# Nokta Game Pitch Audit-Forge

## Submission

- **Ogrenci no:** 231118081
- **Slug:** idea-distillery
- **Track:** C - Otonomi / ratchet discipline

## Goal

This submission turns the old Nokta Game Pitch app into an Audit-Forge host.
The user is no longer only someone who asks a developer for changes. The user
becomes a customer-developer: they capture the screen, mark the problem, write a
short note, and produce a markdown report that Codex can repair against.

The app theme stays specific: solo indie game developers paste messy game notes
and receive a scoped GDD-lite brief with mentor review when needed.

## Customer-Developer Loop

```txt
User sees a problem or feature opportunity
-> Audit widget captures the screen and note
-> Markdown report becomes forge input
-> Codex reads, locates, repairs, tests, and verifies
-> The accepted behavior is added to EVAL.md as a ratchet
```

Optional automation layer:

```txt
Audit widget exports markdown
-> local forge server receives it
-> Ollama proposes a bounded patch
-> server typechecks
-> Git commit or rollback is logged
```

The Codex iterative repair notebook was used only as methodology. I did not add
the notebook, Python runner, or heavy automation files to this submission. The
notebook's `Review -> Repair -> Validate` loop maps to this app as
`Audit report -> Codex repair -> Typecheck/manual verify -> FORGE.md`.

## What The App Does

- User and Mentor enter through separate role screens.
- User pastes game notes and distills them into a GDD-lite brief.
- Groq can produce structured analysis when `EXPO_PUBLIC_GROQ_API_KEY` exists.
- If Groq is missing or fails, the deterministic local distiller still works.
- User selects game decisions before saving.
- HOTL/HITL briefs create mentor review tickets.
- Mentor sees only pending tickets.
- Mentor feedback writes back into the saved brief as future plan.
- Audit FAB is mounted as a drop-in widget and can export markdown reports.
- If `EXPO_PUBLIC_FORGE_ENDPOINT` is set, markdown reports are also sent to a
  local forge server for autonomous repair.

## Audit Integration

Package:

```txt
@xtatistix/mobile-audit
```

Host boundary:

- `captureScreen` and `captureRef` come from `react-native-view-shot`.
- file writing comes from `expo-file-system`.
- sharing comes from `expo-sharing`.
- audit note storage comes from `AsyncStorage`.
- the widget receives dynamic `currentScreen` from app state.

The widget is mounted in `app/App.tsx`. Native packages stay in the host adapter
under `app/src/audit/`, not inside the widget package.

## Optional Local Forge Server

The extra autonomy layer lives in:

`tools/forge-server.mjs`

It listens for `POST /audit`, sends the report to a local Ollama model, accepts
only bounded JSON patch output, runs `npm run typecheck`, and commits or logs a
rollback. Full instructions are in `FORGE_AUTOMATION.md`.

Example:

```powershell
cd submissions/231118081-idea-distillery
$env:OLLAMA_MODEL="your-installed-model"
node tools/forge-server.mjs
```

Then set `app/.env`:

```env
EXPO_PUBLIC_FORGE_ENDPOINT=http://10.0.2.2:8787/audit
```

Use `localhost` for web/iOS simulator and the computer LAN IP for a physical
phone.

## Audit Reports

Committed reports:

- `audit-reports/report-01-user-workspace-status.md`
- `audit-reports/report-02-new-brief-creep-actions.md`
- `audit-reports/report-03-mentor-decision-context.md`
- `audit-reports/report-04-rollback-home-ticket.md`

The first three reports produced accepted repairs. The fourth is the rollback:
creating mentor tickets directly from Home was rejected because a valid ticket
needs a saved brief, readiness review, mentor packet, and user decisions.

## Forge Summary

Full ledger: `FORGE.md`

| Cycle | Result | Commit |
|---|---|---|
| Audit mount | success | `e945e9b` |
| User workspace status actions | success | `ceb23fb` |
| Feature creep action labels | success | `9521a0c` |
| Mentor user decision context | success | `7804aad` |
| Direct Home mentor ticket | rollback | no retained commit |

Accepted kg ratchet:

```txt
2kg -> 5kg -> 9kg
```

Rollback keeps the cumulative kg at `9kg`.

## Human Touch Points

Total human touch points: **4**.

- One customer note per audit report.
- No extra human correction was needed during the three accepted repairs.
- The rollback was stopped at hypothesis/verification before retained code.

## EVAL Ratchet

`EVAL.md` contains the Track C golden scenarios:

- saved brief status must be actionable
- feature creep warnings must become decisions
- mentor must see locked user decisions
- Home must not create context-free mentor tickets

## Groq Setup

From repo root:

```bash
cd submissions/231118081-idea-distillery/app
copy .env.example .env
```

`.env`:

```env
EXPO_PUBLIC_GROQ_API_KEY=your_groq_key
EXPO_PUBLIC_GROQ_MODEL=llama-3.3-70b-versatile
EXPO_PUBLIC_FORGE_ENDPOINT=
```

Groq is optional. The forge endpoint is also optional. The app works with local
fallback when no key or server endpoint is present.

## Run

```bash
cd submissions/231118081-idea-distillery/app
npm install
npm run start
```

Verification:

```bash
npm run typecheck
npx expo install --check
```

## Demo Flow

1. Open **User Login**.
2. Select **Add Notes / Idea**.
3. Load sample game notes.
4. Distill the game pitch.
5. Select game decisions.
6. Save the brief and create a mentor ticket when readiness requires it.
7. Open **Mentor Login**.
8. Review the pending ticket, including locked user decisions.
9. Paste mentor feedback.
10. Resolve the ticket and return to the user workspace.
11. Open the reviewed saved brief and inspect the future plan.
12. Use the audit FAB to capture any screen and export a markdown report.

## Expo QR Link

Expo project / QR page:
https://expo.dev/accounts/samsun081/projects/nokta-draft-231118081

The Expo slug stays `nokta-draft-231118081` to keep the existing EAS project id.
The visible app name is **Nokta Game Pitch**.

Latest Android EAS build:
https://expo.dev/accounts/samsun081/projects/nokta-draft-231118081/builds/81d8c52a-f728-41b2-a2d8-9cf7027e4558

Latest APK artifact:
https://expo.dev/artifacts/eas/h2YtVctehFqg89a4Bzcbeo.apk

## 60 Second Demo

Demo video link:
https://youtube.com/shorts/SQF166ex9W8?feature=share

## APK

APK file in submission:

`submissions/231118081-idea-distillery/app-release.apk`

This APK was rebuilt on 2026-05-19 after adding the audit native dependencies.

## Decision Log

- Kept Track C because the assignment rewards autonomy, ratchet logs, and low
  human touch points.
- Reused the existing Game Pitch app instead of creating a new minimal app.
- Mounted `nokta-audit` as a drop-in widget through a host adapter.
- Did not import native modules from the widget package.
- Used the Codex repair notebook only as methodology, not as repo artifact.
- Added audit reports as the input surface for forge cycles.
- Added an optional Ollama-powered local forge server so new audit markdown can
  trigger a guarded repair loop.
- Accepted three small user-facing repairs.
- Rejected direct Home mentor ticket creation because it breaks the saved brief
  lifecycle.
- Added `EVAL.md` so future cycles cannot regress accepted behavior.

## AI Tool Log

- Codex: read active mission, inspected the existing app, integrated audit host
  deps, ran forge repair cycles, updated README/FORGE/EVAL, and ran typecheck.
- Ollama: optional local model endpoint for the autonomous forge server; no
  shared chat history is required or stored by the app.
- Groq API: optional runtime analyst for game pitch distillation; local fallback
  is used when no API key is configured.

## Known Limits

- Audit exports are local files shared from the device; there is no backend.
- The local forge server is a developer-machine automation tool, not a hosted
  production backend.
- Mentor connection is an in-app review queue, not a real video call.
- The EAS build was run from an app-only temporary copy so the monorepo's other
  submission folders were not uploaded into the build archive.
