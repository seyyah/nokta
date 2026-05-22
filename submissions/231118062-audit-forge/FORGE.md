# FORGE

| cycle | report | hypothesis | result | changed files | test result | commit hash | kg | human touch points |
|---|---|---|---|---|---|---|---:|---:|
| 1 | capture-cta.md | A minimal Expo Router shell can carry the audit widget without leaking native imports into the widget package. | success | `app/app/_layout.tsx`, `app/src/NoktaScreen.tsx`, `app/src/screens.ts`, route files | `npm run typecheck` pass; `npx expo install --check` pass | 2898a48 | 1kg | 1 |
| 2 | reports-export.md | Burn-in reports can be committed as small Markdown artifacts with mock data only. | success | `audit-reports/*.md`, `audit-reports/assets/*.png` | report checklist pass | de1578b | 2kg | 1 |
| 3 | reports-export.md | Adding an in-app native export history screen would improve the score. | rollback | none, hypothesis rejected for Track A scope discipline | no code retained; rollback logged | n/a | 2.5kg | 1 |
| 4 | forge-ratchet.md | A visible ledger with success and rollback rows is enough to explain the repair loop. | success | `FORGE.md`, `IDEA.md`, `EVAL.md` | `rg -n "success|rollback" FORGE.md` pass | 6106e76 | 3kg | 1 |
| 5 | capture-cta.md | Release evidence can be attached without changing root files or broadening app scope. | success | `README.md`, `demo/demo-60s.mp4`, `app-release.apk` | local score and diff checks pending | d1a73be | 4kg | 1 |
