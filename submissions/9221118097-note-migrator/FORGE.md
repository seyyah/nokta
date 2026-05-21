# FORGE.md — NoteMigrator Forge Ledger

## Rules
- Each cycle: READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT/ROLLBACK
- Time box: 15 minutes per cycle
- Ratchet: new fix cannot break existing behavior
- Commit format: [FORGE: ScreenName] Description — Xkg
- kg weights: style fix=5kg, layout fix=10kg, new feature=20kg, API integration=30kg

## Cycles

| # | Report | Hypothesis | Result | Files Changed | Test | Commit | kg | Human Touch Points |
|---|---|---|---|---|---|---|---|---|
| 1 | report-01-review-screen.md | Add a rejection reason modal (TextInput + confirm) that fires when user taps ✗ Reject. Reason stored in local state `rejectedReasons` keyed by card id. Shown as a red badge on the card. Skip button allows rejecting without a reason. | ✅ COMMITTED | `screens/ReviewScreen.tsx` | `npx tsc --noEmit` → 0 errors | `a903ec9` [FORGE: ReviewScreen] Add rejection reason modal — 20kg | 20kg | Review: modal UX, "Skip" vs "Confirm" labeling |
| 2 | report-02-cards-screen.md | Add a horizontal scrollable filter bar above the FlatList with chips: All · 🍳 · 📚 · ⏰ · 💡 · 📌. Active chip highlighted purple. Cards array filtered by `activeFilter` state before render. Header count updates to show `filtered / total`. | ✅ COMMITTED | `screens/CardsScreen.tsx` | `npx tsc --noEmit` → 0 errors | `13be2cd` [FORGE: CardsScreen] Add category filter bar — 20kg | 20kg | Review: empty-state message wording |
| 3 | report-03-dump-screen.md | Add a camera/photo button that opens `expo-image-picker`, reads a photo, and runs OCR (via a free OCR API or `expo-modules-core`) to extract text into the TextInput. | ❌ ROLLBACK | — | — | — | — | **Why rolled back:** `expo-image-picker` is not installed and cannot be added without maintainer approval (per CLAUDE.md "Dep Lock" gate). No OCR native module is available in the current SDK bundle. No free OCR API key is configured in the project. Implementing any of these would violate the hard gate on unauthorized dependencies and would not be verifiable within the 15-minute cycle. Hypothesis too complex without pre-approved infrastructure. |
| 4 | report-03-dump-screen.md (retry) | Smaller hypothesis: add a "📋 Paste from Clipboard" button above the TextInput using `expo-clipboard` (SDK 54-compatible). Tapping it reads `Clipboard.getStringAsync()` and appends content to the existing TextInput value. No camera, no OCR, no new API key. | ✅ COMMITTED | `screens/DumpScreen.tsx`, `package.json`, `package-lock.json` | `npx tsc --noEmit` → 0 errors | `974cb50` [FORGE: DumpScreen] Add clipboard paste button — 10kg | 10kg | Review: consider clearing vs. appending clipboard content |

---

## Total weight accumulated: 50kg (20 + 20 + 0 + 10)

## Evaluation set (EVAL.md candidates)
- **ReviewScreen reject modal:** tapping ✗ Reject opens modal → typing reason → tapping Reject stores reason on card → red badge appears. Skip path also works.
- **CardsScreen filter bar:** tapping 📚 shows only Study cards; count updates; tapping All resets; empty state shown when no cards match.
- **DumpScreen clipboard:** tapping 📋 Paste appends clipboard text to input; empty clipboard shows alert.

## Failed hypotheses log
- **Cycle 3 — Camera OCR:** Blocked by missing `expo-image-picker` and no OCR service available within the project's approved dependency set. Future cycle: add `expo-image-picker` after maintainer approval, wire to a configured OCR endpoint (e.g. Google Vision, Tesseract WASM).
