# FORGE Ledger

Method reference: the Codex iterative repair notebook is used only as a process
reference. I did not add the notebook or a Python runner to the submission.
The mapping for this app is:

```txt
Review -> Repair -> Validate
Audit report -> Codex repair -> Typecheck/manual verify -> Ledger
```

Optional automation extends the same loop:

```txt
Audit report -> local forge server -> Ollama patch -> typecheck -> commit/rollback
```

## Phase A

| Step | Evidence |
|---|---|
| Audit package | `@xtatistix/mobile-audit` mounted through host deps |
| Native boundary | host injects capture, file write, sharing, storage |
| Mount location | `app/App.tsx` root component |
| Dynamic screen | state-based `currentScreen` from `home`, `user`, `newBrief.result`, `mentor.ticketDetail`, `savedBrief.detail` |
| Integration commit | `e945e9b` |
| Optional server | `tools/forge-server.mjs` can receive new audit reports and run a guarded Ollama repair loop |

## Phase B Cycles

| Cycle | Report | Hypothesis | Result | Changed files | Test result | Commit hash | kg | Human touch points |
|---|---|---|---|---|---|---|---:|---:|
| 1 | `audit-reports/report-01-user-workspace-status.md` | Translating raw saved brief status into a next action will let the customer drive the review loop without developer explanation. | success | `app/App.tsx` | `npm run typecheck` passed | `ceb23fb` | 2 | 1 |
| 2 | `audit-reports/report-02-new-brief-creep-actions.md` | Feature creep warnings become agent-ready when each warning has an action label. | success | `app/App.tsx` | `npm run typecheck` passed | `9521a0c` | 3 | 1 |
| 3 | `audit-reports/report-03-mentor-decision-context.md` | Mentor feedback is safer when the mentor sees the user decisions already locked into the brief. | success | `app/App.tsx` | `npm run typecheck` passed | `7804aad` | 4 | 1 |
| 4 | `audit-reports/report-04-rollback-home-ticket.md` | A Home shortcut for direct mentor tickets might reduce steps. | rollback | none retained | lifecycle check: rejected because tickets require saved brief, readiness, mentor packet, and user decisions | rollback before commit | 0 | 1 |

## Rollback Note

Cycle 4 was intentionally stopped before code was retained. The proposed Home
shortcut would create mentor tickets without a saved brief, selected decisions,
or generated mentor packet. That violates the closed loop:

```txt
user notes -> brief -> decisions -> saved brief -> mentor ticket -> feedback writeback
```

The rollback preserves the app's data contract and avoids a context-free mentor
queue.

## Human Touch Point Counter

Total human touch points: **4**.

- 1 per audit report to describe the customer-developer intent.
- No extra human correction was needed during the three accepted repairs.
- The rollback was resolved at hypothesis/verification, before a retained code
  change.

## Ratchet

Accepted kg is monotonic across successful cycles:

```txt
Cycle 1: 2kg
Cycle 2: 5kg cumulative
Cycle 3: 9kg cumulative
Cycle 4: rollback, cumulative kg remains 9kg
```

## Automation Guardrails

The optional local server is intentionally narrower than a free-form coding
agent:

- it accepts only `POST /audit` markdown input
- it asks Ollama for JSON with exact edits or a unified diff
- it validates that edit paths stay under `app/App.tsx` or `app/src/`
- it runs `npm run typecheck`
- it commits only after tests pass
- it logs rollback when the model rejects the request or validation fails

## Automated Server Cycles

| Cycle | Report | Hypothesis | Result | Changed files | Test result | Commit hash | kg | Human touch points |
|---|---|---|---|---|---|---|---:|---:|
| 5 | `audit-reports/inbox/2026-05-19T17-29-45-004Z-bug-report-2026-05-19-17-29.md` | Introducing a bullet color prop enables dynamic styling for readiness indicators, with success color specifically applied to the Prototype Readiness card to meet user expectations. | rollback | app/src/components/DraftSectionCard.tsx | npm run typecheck failed; reverse patch applied | rollback before commit | 0 | 0 |
| 6 | `audit-reports/inbox/2026-05-19T17-34-27-167Z-bug-report-2026-05-19-17-34.md` | Introducing a bullet color prop enables dynamic styling for readiness indicators, with success color specifically for Prototype Readiness to match user expectations. | rollback | app/src/components/DraftSectionCard.tsx | npm run typecheck failed; reverse patch applied | rollback before commit | 0 | 0 |
| 7 | `audit-reports/inbox/2026-05-19T17-51-42-187Z-bug-report-2026-05-19-17-51.md` | Introducing a bullet color prop enables dynamic styling of list items, with success color specifically enhancing visibility for prototype readiness status. | rollback | none retained | already satisfied before patch | rollback before commit | 0 | 0 |
| 8 | `audit-reports/inbox/2026-05-19T19-10-44-500Z-retry-scope-boundary-kirmizi.md` | The selected Scope Boundary card should show the requested red bullet color immediately. | success | app/App.tsx | npm run typecheck passed | 70cb282 | 1 | 0 |
| 9 | `audit-reports/inbox/2026-05-19T19-20-54-491Z-bug-report-2026-05-19-19-20.md` | The selected Core Loop card should show the requested blue bullet color immediately. | success | app/App.tsx | npm run typecheck passed | aeb8652 | 1 | 0 |
| 10 | `audit-reports/inbox/2026-05-19T19-21-19-330Z-bug-report-2026-05-19-19-21.md` | The selected Core Loop card should show the requested green bullet color immediately. | success | app/App.tsx | npm run typecheck passed | d91c827 | 1 | 0 |
| 11 | `audit-reports/inbox/2026-05-19T19-21-37-695Z-bug-report-2026-05-19-19-21.md` | The selected Feature Creep Warnings card should show the requested green bullet color immediately. | success | app/App.tsx | npm run typecheck passed | 4311092 | 1 | 0 |
