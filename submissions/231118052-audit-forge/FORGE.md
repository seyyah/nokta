# FORGE Ledger

| cycle | report | hypothesis | result | changed files | test result | commit hash | kg | human touch points |
|---|---|---|---|---|---|---|---|---|
| 1 | capture-cta.md | A clearer capture call-to-action will reduce hesitation on the first screen. | success | `app/src/screens.ts` | `npm run typecheck` passed | `edb41e9` | 1kg | 0 |
| 2 | reports-export.md | Showing two export actions in one card may improve discoverability. | rollback | none retained | visual review: rejected because it duplicated widget export controls | rollback | 2kg | 0 |
| 3 | reports-export.md | A short export explanation will make the artifact flow easier to scan. | success | `app/src/screens.ts` | `npm run typecheck` passed | `4c4236b` | 3kg | 0 |
| 4 | forge-ratchet.md | Surfacing the next repair step will make the loop state readable at a glance. | success | `app/src/screens.ts` | `npm run typecheck` passed | `68f27d2` | 4kg | 0 |
