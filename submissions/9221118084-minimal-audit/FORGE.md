# FORGE Ledger — Notlar (Track A)

Each cycle follows: READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT (or ROLLBACK).
`kg` is the ratchet: it only increases, and never decreases on a rollback.

---

## Cycle 1
- **Report:** audit-reports/home-screen.md
- **Screen:** HomeScreen
- **Hypothesis:** The "+" lives in the header as a tiny, unlabeled icon and is easy to miss. Replace it with a labeled bottom FAB reading "+ Yeni Not".
- **Files changed:** app/app/index.tsx
- **Result:** ✅ SUCCESS
- **Test:** Launched the app; the "+ Yeni Not" button is now obvious at the bottom-center and navigates to the new-note screen.
- **Verify:** NewNoteScreen and DetailScreen unaffected; widget mount untouched.
- **Commit:** 2d352bd
- **kg:** 1
- **Human touch points:** 1 (reviewed FAB placement/label)

## Cycle 2
- **Report:** audit-reports/new-note-screen.md
- **Screen:** NewNoteScreen
- **Hypothesis:** Save writes to storage but gives no feedback and does not navigate. Add `Alert.alert('Kaydedildi', …)` and call `router.back()` after the write completes.
- **Files changed:** app/app/new-note.tsx
- **Result:** ✅ SUCCESS
- **Test:** Typed a note, pressed Save once; confirmation alert appeared, "Tamam" returned to the list, and the new note was present.
- **Verify:** HomeScreen and DetailScreen unaffected.
- **Commit:** 4265820
- **kg:** 2
- **Human touch points:** 0

## Cycle 3
- **Report:** audit-reports/detail-screen.md
- **Screen:** DetailScreen
- **Hypothesis:** Replace the bare Delete button with a swipe-to-delete gesture using `react-native-gesture-handler`'s `Swipeable`.
- **Files changed:** none (rolled back)
- **Result:** ❌ ROLLBACK
- **Reason for rollback:** Swipeable required installing `react-native-gesture-handler`, wrapping the root in `GestureHandlerRootView`, and reworking the screen layout. This exceeded the 15-minute time-box and violated Track A's minimal-diff rule (one file, one fix) — it touched dependencies and the layout, not a single screen file.
- **Test:** n/a (reverted before commit)
- **Commit:** n/a (reverted)
- **kg:** 2 (unchanged — the ratchet holds through a rollback)
- **Human touch points:** 1 (decided to roll back once the time-box was exceeded)

## Cycle 4
- **Report:** audit-reports/detail-screen.md
- **Screen:** DetailScreen
- **Hypothesis:** Keep the same buttons but guard Delete behind a confirmation. Wrap the delete handler in `Alert.alert('Notu sil', …)` with "İptal" and a destructive "Sil" action.
- **Files changed:** app/app/note/[id].tsx
- **Result:** ✅ SUCCESS
- **Test:** Opened a note, tapped Sil; the confirmation dialog appeared. "İptal" kept the note; "Sil" removed it and returned to the list.
- **Verify:** HomeScreen and NewNoteScreen unaffected; one file changed.
- **Commit:** 12c2393
- **kg:** 3
- **Human touch points:** 0

---

## Summary
- ✅ SUCCESS: 3 (Cycles 1, 2, 4)
- ❌ ROLLBACK: 1 (Cycle 3)
- Final kg: 3
- Total human touch points: 2
