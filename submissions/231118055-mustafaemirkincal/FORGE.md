# FORGE.md

> Final-week ratchet log. Success rows move forward. Rollback rows stay visible. A bridge report appends two rollbacks and opens the human call.

| Cycle | Report | Hypothesis | Result | Changed files | Test | Commit hash | kg | Human touches |
|---|---|---|---|---|---|---|---|---|
| 1 | `voice-note-01.md` | The voice visualizer should feel alive and keep the transcript readable. | success | `App.js`, `src/components/VoiceVisualizer.js`, `src/hooks/useVoiceCapture.js` | Manual mic talk test | working-tree | 1 | 0 |
| 2 | `voice-note-02.md` | The avatar should not stutter when the meter changes quickly. | rollback | none | Visual pass failed during an over-eager animation attempt. | rollback/no-commit | 1 | 0 |
| 3 | `voice-note-03.md` | Only the jaw and root rotation should move with amplitude. | success | `src/components/AvatarStage.js` | Manual lipsync pass | working-tree | 2 | 0 |
| 4 | `voice-note-04.md` | The forge ledger should expose stuck state and open the human bridge. | success | `src/components/ForgeRail.js`, `src/bridge/BridgeModal.js`, `src/forge/forgeData.js` | Stuck heuristic + bridge preview | working-tree | 3 | 1 |

## Summary

- Success cycles: 3
- Rollback cycles: 1
- Final kg: 3
- Human touch points: 1

## Bridge rule

- If a later bridge report is saved in the app, it appends two rollback rows and opens the expert bridge immediately.
- The rollbacks are intentionally preserved so the next cycle can learn from them.
