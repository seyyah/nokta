# Nokta Forge Ledger

Cycle timebox: 15 minutes. Ratchet rule: commit only when typecheck/lint scope passes and the screen intent is visually satisfied. Failed hypotheses stay in this ledger.

| Cycle | Report | Hypothesis | Result | Changed files | Test result | Commit hash | kg | Human touch points |
| --- | --- | --- | --- | --- | --- | --- | ---: | ---: |
| 1 | `01-onboarding-cta.md` | A compact handoff strip under the opening copy will make the customer-to-agent loop concrete without changing navigation. | success | `app/app/index.tsx`, `app/src/data.ts` | `npx tsc -p app/tsconfig.json --noEmit` passed; visual check against yellow box passed. | `cf961be` | 10 | 1 |
| 2 | `02-idea-detail-context.md` | The detail page needs explicit customer signal, forge hypothesis, and verify sections sourced from shared data. | success | `app/app/idea/[id].tsx`, `app/src/data.ts` | `npx tsc -p app/tsconfig.json --noEmit` passed; detail card is inside marked area. | `5c1e437` | 15 | 1 |
| 3 | `03-forge-dashboard-feature.md` | Add a full automation control panel above the ledger so rollback state is highly visible. | rollback | none committed | Rejected in visual verify: the panel crowded small screens and hid cycle rows. No commit. | rollback | 0 | 1 |
| 4 | `03-forge-dashboard-feature.md` | A compact ratchet board with rollback rows visible in-line preserves context and avoids layout crowding. | success | `app/app/forge.tsx`, `app/src/data.ts` | `npx tsc -p app/tsconfig.json --noEmit` passed; rollback row remains visible. | `fcb4bf1` | 20 | 1 |

## Rollback Memory

- Cycle 3 should not be retried as a large top-heavy automation panel. The next accepted fix must keep rollback state in the same repeated row pattern as successful cycles.

## Kg Ratchet

- Cycle 1: 10kg
- Cycle 2: 25kg cumulative
- Cycle 3: 25kg cumulative, rollback logged
- Cycle 4: 45kg cumulative
