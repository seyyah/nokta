Track: A

# Notlar — Audit Forge Submission

**Student:** 9221118084
**Expo Link:** [Install APK (EAS build)](https://expo.dev/accounts/abou2223/projects/notlar/builds/68982026-e410-4cba-b248-7e0e01b0ad59) — or run locally with `cd app && npx expo start`
**Demo Video:** https://youtube.com/shorts/XCzyfQooJDw
**AI Tool Used:** Claude Code (claude-opus-4-7)

## Decision Log

I chose **Track A (Simplicity)** because the assignment rewards drop-in discipline: the bug-reporting widget mounts in exactly one place and every forge cycle produces a minimal, single-file diff. That maps directly onto how a coding agent works best — focused, contained changes — so the track and the tool reinforce each other.

The app is a small three-screen notes application called **Notlar**, built on Expo Router + TypeScript. I deliberately planted three real points of UX friction so each audit report had a genuine, specific problem to repair: (1) the only way to create a note was a tiny, unlabeled "+" in the header — easy to miss; (2) pressing **Save** wrote the note but gave no feedback at all, leaving the user unsure whether it worked; and (3) the **Delete** button sat right next to **Edit** at the same size and deleted instantly with no confirmation.

The widget itself never imports any native package. Everything it needs — screenshot capture, file writes, sharing, storage, the current screen name — is injected through a single `deps` prop in `app/_layout.tsx` (the "host application boundary"). Because of that, the entire integration is one self-contained block in one file, and removing it leaves the app fully functional.

For **Cycle 3**, I attempted swipe-to-delete on the DetailScreen. The hypothesis was wrong for this track: it required installing `react-native-gesture-handler`, wrapping the root in a gesture provider, and reworking the screen layout — exceeding the 15-minute time-box and violating the minimal-diff rule. I rolled it back and logged the failure honestly; the ratchet (`kg`) held at 2. **Cycle 4** then solved the same report with one function call in the same file: a confirmation dialog before delete.

## Human Touch Points: 2

1. **Cycle 1** — reviewed the FAB button positioning and label after the fix.
2. **Cycle 3** — decided to roll back once the swipe-to-delete attempt exceeded the 15-minute time-box.

## Forge Cycles

See [FORGE.md](FORGE.md) for the full ledger. Summary: 3 ✅ SUCCESS + 1 ❌ ROLLBACK, final `kg` = 3.

| Cycle | Report | Fix | Result |
|---|---|---|---|
| 1 | home-screen.md | Labeled bottom FAB replaces tiny header "+" | ✅ |
| 2 | new-note-screen.md | Save confirmation alert + auto-navigate back | ✅ |
| 3 | detail-screen.md | Swipe-to-delete (too complex) | ❌ ROLLBACK |
| 4 | detail-screen.md | Delete confirmation dialog | ✅ |

## Drop-in Verification

The widget mounts in exactly one file:

```bash
grep -rl 'AuditWidget' app/
# → app/_layout.tsx   (one file: the single mount point)
```

Inside that file the mount is one contiguous `<AuditWidget … />` block. Deleting that block (and its imports) leaves the app fully functional — the three screens read and write notes through `lib/notes.ts`, which is independent of the widget.

## Run It

```bash
cd app
npm install            # or: npx expo install
npx expo start         # scan the QR with Expo Go
```

## Project Layout

```
app/
├── app/
│   ├── _layout.tsx     ← AuditWidget mounted once (drop-in)
│   ├── index.tsx       ← HomeScreen
│   ├── new-note.tsx    ← NewNoteScreen
│   └── note/[id].tsx   ← DetailScreen
└── lib/notes.ts        ← AsyncStorage notes (separate from widget storage)
audit-reports/          ← 3 bug reports (one per screen)
FORGE.md                ← cycle ledger
```

## Still To Do Before Submitting

- [x] Demo video recorded → linked above
- [x] APK built on EAS → `app-release.apk` present
- [x] Expo/EAS install link added above
- [ ] Capture the 3 reports on a device (🐛 FAB → draw box → note → Export MD) so the burn-in screenshots are real, and replace the placeholder images in `audit-reports/`
- [ ] Move this folder into your `seyyah/nokta` fork under `submissions/` and open the PR
