# 🔨 FORGE.md — Cycle Ledger

Autonomous repair ledger for the Nokta host app. Each cycle consumes one
`audit-reports/*.md` and runs the Karpathy autoresearch ratchet loop:
`READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT/ROLLBACK`.

- **Agent:** Claude Code (Opus) — single agent, standalone mode.
- **Time box:** 15 min / cycle.
- **TEST gate:** `npx tsc --noEmit` (strict) + `node --test` on `src/lib/*.test.ts`.
- **VERIFY gate:** multimodal compare of a fresh screenshot of the touched
  screen against the report's burn-in region (intent-aligned, not pixel-perfect).
- **Ratchet:** a fix that breaks TEST or fails VERIFY is **rolled back**, never
  committed. Failed hypotheses are kept here as data, not deleted.
- **kg:** scalar effort/value weight — style 5 · layout 10 · feature 15-20.

## Ledger

| # | Report | Hypothesis | Result | Files changed | Test | Commit | kg | Human touch |
|---|--------|-----------|--------|---------------|------|--------|----|-------------|
| 1 | 01-onboarding-cta | Footer lacks horizontal padding; stretched CTA spans edge-to-edge → add `paddingHorizontal` | ✅ success | `src/app/index.tsx` | tsc ✓ · unit ✓ | `5fcac09` | 5 | 0 |
| 2 | 02-idealist-badge-clip | Title has no flex/`numberOfLines` and badge no `flexShrink` → constrain title, pin badge | ✅ success | `src/app/ideas/index.tsx` | tsc ✓ · unit ✓ | `db67c9c` | 10 | 0 |
| 3 | 03-ideadetail-overflow | Description is cut off because its `Text` lacks a fixed height → wrap description `Text` in `flex:1` View | ❌ rollback | (reverted) | tsc ✓ · **verify ✗** | `f72aed5` | 0 | 1 |
| 4 | 03-ideadetail-overflow | Real cause is no scroll container (learned from cycle 3) → swap outer `View` for `ScrollView` | ✅ success | `src/app/ideas/[id].tsx` | tsc ✓ · unit ✓ | `a5f0a99` | 10 | 0 |
| 5 | 04-idealist-empty | No empty state → add `ListEmptyComponent` with friendly copy + CTA | ✅ success | `src/app/ideas/index.tsx` | tsc ✓ · unit ✓ | `45a36aa` | 15 | 0 |

**Totals:** 4 success · 1 rollback · cumulative **40 kg** (5 → 15 → 25 → 40 across the successful cycles) · **1 in-loop human touch point** (cycle 3 rollback confirmation). The two fixed endpoints of the loop — capture (writing the audit reports) and review/merge — are by design and counted separately in the README, not as mid-loop interventions. kg is monotonically increasing — the ratchet held.

---

## Cycle 1 — OnboardingScreen · Get Started CTA hugs both edges

- **READ.** `audit-reports/01-onboarding-cta.md` — "Get Started" button runs
  edge-to-edge, looks broken; burn-in box spans the full-width button.
- **LOCATE.** `currentScreen: OnboardingScreen` → `src/app/index.tsx`. The CTA is
  `styles.cta` (`alignSelf: "stretch"`) inside `styles.footer`.
- **HYPOTHESIZE.** `footer` has `paddingBottom` but **no horizontal padding**, so
  a stretched child fills the whole width down to x=0 and x=screenWidth. Adding
  `paddingHorizontal` to the footer should inset the CTA on both sides.
- **REPAIR.** `footer: { ..., paddingHorizontal: 20 }`. One line, one concern.
- **TEST.** `tsc --noEmit` ✓ · `node --test src/lib/*.test.ts` ✓ (3/3).
- **VERIFY.** Re-rendered onboarding: CTA now sits 20px inset from both edges,
  matching the report's intent. ✓
- **COMMIT/ROLLBACK.** Commit `5fcac09` — `[FORGE: OnboardingScreen] Inset Get Started CTA from screen edges — 5kg`.
- **WRITEBACK.** Golden scenario G1 added to `EVAL.md`. Human touch points: 0.

## Cycle 2 — IdeaListScreen · long title pushes score badge off-screen

- **READ.** `audit-reports/02-idealist-badge-clip.md` — on the long-title card the
  `97 / PURE SLOP` badge is shoved past the right edge and clipped; short-title
  cards are fine. Burn-in box sits on the clipped badge.
- **LOCATE.** `currentScreen: IdeaListScreen` → `src/app/ideas/index.tsx`,
  `IdeaCard` → `styles.cardHeader / cardTitle / badge`.
- **HYPOTHESIZE.** Row is `justifyContent: space-between` but the title has no
  `flex` and no `numberOfLines`, so a long title grows past the badge and the
  badge (no `flexShrink: 0`) gets pushed out. Give the title `flex: 1` +
  `numberOfLines={2}` and pin the badge with `flexShrink: 0`.
- **REPAIR.** `cardTitle: { flex: 1, marginRight: 12 }`, `numberOfLines={2}` on
  the title, `badge: { flexShrink: 0 }`, header `alignItems: flex-start`.
- **TEST.** `tsc --noEmit` ✓ · unit ✓ (3/3).
- **VERIFY.** Long title now clamps to two lines with an ellipsis and the badge
  stays fully visible at the right; short cards unchanged. ✓
- **COMMIT/ROLLBACK.** Commit `db67c9c` — `[FORGE: IdeaListScreen] Constrain title + pin slop badge so it stops clipping — 10kg`.
- **WRITEBACK.** Golden scenario G2 added. Human touch points: 0.

## Cycle 3 — IdeaDetailScreen · description overflow (❌ ROLLBACK)

- **READ.** `audit-reports/03-ideadetail-overflow.md` — on the long idea the
  description runs off the bottom edge, can't scroll, STATUS row never shows.
- **LOCATE.** `currentScreen: IdeaDetailScreen` → `src/app/ideas/[id].tsx`.
- **HYPOTHESIZE (wrong).** "The description is cut off because its `Text` has no
  room to grow — wrap it in a `flex: 1` View so it fills the available space."
- **REPAIR.** Wrapped `<Text style={description}>` in `<View style={{flex:1}}>`.
- **TEST.** `tsc --noEmit` ✓ — the change is type-clean.
- **VERIFY (fail).** Re-rendered idea #1: `flex: 1` only redistributes space
  *inside* the still-non-scrolling parent `View`. The description is taller than
  any leftover space, so it **still clips** at the box bottom, and now the pitch
  is squeezed too. The burn-in region (cut-off description tail + missing STATUS)
  is **not** resolved. Intent not met → ratchet rule 2 triggers.
- **COMMIT/ROLLBACK.** **Rolled back** (`git checkout -- ideas/[id].tsx`). No app
  code committed. Commit `f72aed5` records this ledger entry only.
- **WRITEBACK / lesson.** The problem is not "the Text needs space" — it is
  "there is no scroll container at all." `flex` cannot fix unbounded content in a
  fixed viewport. **Next cycle must add scrolling, and must not retry `flex` on
  the description.** Human touch points: **1** (I paused the agent to confirm the
  rollback rather than let it pile a second guess on top of the first).

## Cycle 4 — IdeaDetailScreen · description overflow (✅ success, learned from C3)

- **READ.** Same report (`03-ideadetail-overflow.md`) + the cycle-3 lesson in this
  ledger: *do not retry `flex` on the description; add a real scroll container.*
- **LOCATE.** `src/app/ideas/[id].tsx`, the outer `<View style={content}>`.
- **HYPOTHESIZE.** The viewport is fixed and the content is unbounded, so the only
  correct fix is to make the content scrollable. Swap the outer `View` for a
  `ScrollView` (padding moves to `contentContainerStyle`).
- **REPAIR.** `View` → `ScrollView` with `contentInner` padding + `paddingBottom`.
- **TEST.** `tsc --noEmit` ✓ · unit ✓ (3/3).
- **VERIFY.** Idea #1's full description now scrolls to the end and the STATUS row
  is reachable; short ideas are unaffected. Burn-in region resolved. ✓
- **COMMIT/ROLLBACK.** Commit `a5f0a99` — `[FORGE: IdeaDetailScreen] Make detail content scrollable so long descriptions are reachable — 10kg`.
- **WRITEBACK.** Golden scenario G3 added. Human touch points: 0. *No repeated
  hypothesis: cycle 4 did not re-try the `flex` approach that cycle 3 ruled out.*

## Cycle 5 — IdeaListScreen · empty-state feature request (✅ success)

- **READ.** `audit-reports/04-idealist-empty.md` — intent is **feature request**,
  not a bug: when the list is empty the screen is blank; add a friendly empty
  state. (This is the "customer-as-developer" case from the mission brief.)
- **LOCATE.** `src/app/ideas/index.tsx`, the `FlatList`.
- **HYPOTHESIZE.** A `FlatList` renders nothing for empty data unless given a
  `ListEmptyComponent`. Add one + make the container `flexGrow` so it centers.
- **REPAIR.** New `EmptyState` component (dot, title, body, "Add your first dot"
  CTA → `/`), wired via `ListEmptyComponent`, plus `listEmpty` container style.
- **TEST.** `tsc --noEmit` ✓ · unit ✓ (3/3).
- **VERIFY.** With `IDEAS` temporarily emptied the screen shows the centered empty
  state + CTA instead of a blank; with data present the list renders unchanged.
  Matches the requested behaviour. ✓
- **COMMIT/ROLLBACK.** Commit `45a36aa` — `[FORGE: IdeaListScreen] Add empty-state with CTA for the no-ideas case — 15kg`.
- **WRITEBACK.** Golden scenario G4 added. Human touch points: 0.

---

## Retrospective

- **Ratchet held:** kg only ever increased on success (5 → 15 → 25 → 40); the one
  failed hypothesis (C3) was rolled back, never committed as app code.
- **Learning between cycles:** C4 explicitly consumed C3's logged lesson and
  avoided repeating the `flex` dead-end (jury question #7).
- **Minimal diffs:** every successful cycle touched exactly one screen file and
  one concern — no opportunistic refactors (jury question #4).
- **Drop-in intact:** `grep -rn "AuditWidget" app/src` still returns one import +
  one mount; removing that mount line leaves the host fully working.
