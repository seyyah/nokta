# Nokta Assignment Submission

## Student
- Student Number: `9221118087`
- Submission Slug: `nokta-B`

## Selected Track
- Track: `Track B - Slop Detector / Due Diligence`

## Project Slice
This submission focuses on one working Nokta slice: a mobile evaluator tool that analyzes a pasted startup pitch and returns a structured slop/due-diligence report.

## Deliverables
- Expo app path: `submissions/9221118087-nokta-B/app`
- SDK target: `Expo SDK 54`

## Expo Link / QR (Placeholder) APK
- Expo project link: `https://expo.dev/accounts/moncat/projects/nokta-slop-detector-b/builds/3643262c-bc0b-4ea0-b55a-538f332d1052`

## 60s Demo Video (Placeholder)
- Demo link: `https://youtube.com/shorts/7EnINA8yJIE?feature=share`

## Decision Log
- Kept scope to one complete evaluator flow (input -> deterministic analysis -> structured output).
- Implemented a local scoring engine first for stable demo behavior with no backend dependency.
- Structured the engine output so an LLM-backed API can replace the local analyzer later without UI redesign.
- Prioritized explainability: category scores, suspicious claims, rewrites, and manual verification checklist.

## AI Tools Used
- Primary tool: `Codex (GPT-5)`
- Usage: architecture planning, TypeScript implementation, UI scaffolding, heuristic scoring logic, and submission docs drafting.

## Backup Tool Note
- Backup tool (if primary unavailable): `<ADD_BACKUP_TOOL_NAME_HERE>`
- Scope of backup usage: `<ADD_BACKUP_USAGE_NOTES_HERE>`

## Local Run
```bash
cd submissions/9221118087-nokta-B/app
npm install
npm run start
```

## Engineering Trace (Suggested Commit Plan)
1. `feat: initialize Expo SDK 54 TypeScript project in submission folder`
2. `feat: build analyzer input screen and base visual system`
3. `feat: implement deterministic slop scoring engine with category outputs`
4. `feat: render structured result cards and due-diligence sections`
5. `chore: add submission docs (idea.md + README placeholders) and final polish`
6. `refactor: isolate scoring heuristics for future LLM/backend swap`
