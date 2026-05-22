# 🧪 EVAL.md — Golden Scenarios (ratchet)

A monotonically growing evaluation set. Every **successful** forge cycle adds a
golden scenario here. The ratchet rule: a future cycle may not break an existing
golden scenario — if it does, that is a major incident and the cycle is rolled
back. This is the Track C autonomy proof: the agent's own regression net grows
with each repair, so quality only moves forward.

> Manual check today (no e2e runner wired): each scenario is verified by reading
> the touched screen + `tsc`/unit gate. The list is written so it could be
> promoted to Detox/Maestro specs later without rewording.

---

### G1 — Onboarding CTA respects screen margins
*Added by cycle 1.*
- **Given** the Onboarding screen on any phone width,
- **Then** the "Get Started" button is inset from both screen edges (not flush),
- **And** `tsc --noEmit` + `src/lib` unit tests pass.
- **Guards against:** regressing `footer` padding or the CTA stretch behaviour.

### G2 — Idea card keeps the slop badge on-screen for any title length
*Added by cycle 2.*
- **Given** an idea whose title is long enough to wrap,
- **Then** the title clamps to 2 lines and the slop-score badge stays fully
  visible at the right edge (never clipped),
- **And** short-title cards render unchanged.
- **Guards against:** removing `flex:1`/`numberOfLines` on the title or
  `flexShrink:0` on the badge.

### G3 — Idea detail is fully readable for any description length
*Added by cycle 4.*
- **Given** the idea with the longest description (id `1`),
- **Then** the whole description can be scrolled to its end **and** the STATUS row
  is reachable,
- **And** the detail screen uses a scroll container (not a fixed `View`).
- **Guards against:** reverting `ScrollView` back to a plain `View`, or the
  cycle-3 anti-pattern of "fix overflow with `flex` alone."

### G4 — Idea list shows a friendly empty state, never a blank screen
*Added by cycle 5.*
- **Given** the idea list with zero items,
- **Then** a centered empty state renders (heading + body + "Add your first dot"
  CTA) instead of a blank screen,
- **And** with one or more ideas the list renders normally.
- **Guards against:** removing `ListEmptyComponent` or the `flexGrow` centering.

---

**Coverage:** 4 golden scenarios across 3 screens. Each was added the moment its
cycle went green; none has been broken by a later cycle (ratchet intact).
