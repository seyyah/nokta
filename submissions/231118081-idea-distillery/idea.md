# Nokta Game Pitch: Customer-Developer Forge Loop

## Selected Track

**Track C - Otonomi / ratchet discipline**

## Thesis

Nokta Game Pitch is still an indie game brief tool, but the new assignment
changes the role of the user. Before, the user pasted notes and received a
brief. Now the user also becomes part of development: they can capture a screen,
mark a problem or feature opportunity, write a short note, and turn that into an
agent-readable markdown repair input.

The goal is not to let the user write TypeScript. The goal is to let the user
change the product by producing better evidence. A marked screenshot plus a
short note is stronger than a vague request, so Codex can run a smaller,
testable repair cycle.

## Core Loop

```txt
messy game notes
-> GDD-lite brief
-> user decisions
-> saved brief
-> mentor ticket when needed
-> feedback writeback
-> audit report if the flow needs improvement
-> Codex repair
-> EVAL ratchet
```

## Why This Fits Game Pitch

Indie game ideas are full of uncertain decisions: scope, platform, combat,
multiplayer, timebox, mentor review. Those decisions are exactly where users
notice product gaps. The audit widget lets the user point at the specific screen
where the gap appears.

Examples:

- a saved brief status does not explain the next action
- feature creep warnings are passive instead of decision-oriented
- mentor tickets lack the user's selected decisions
- a shortcut request looks useful but breaks the data lifecycle

Each report becomes one bounded forge cycle.

## What The App Produces

- Game Summary
- Core Loop
- Player Fantasy
- Core Mechanics
- Scope Boundary
- Feature Creep Warnings
- Prototype Plan
- Mentor Handoff Packet
- Saved Brief
- Mentor Feedback Writeback
- Audit Markdown Report

## Audit-Forge Rule

Every accepted change must be small enough to explain in `FORGE.md` and stable
enough to protect in `EVAL.md`.

```txt
READ -> LOCATE -> HYPOTHESIZE -> REPAIR -> TEST -> VERIFY -> COMMIT/ROLLBACK
```

Rollback is part of the product. If a customer request breaks the brief lifecycle
or creates context-free mentor work, it should be rejected and logged instead of
quietly implemented.

## What It Does Not Do

- It does not add a backend.
- It does not make the mentor queue a real video call.
- It does not add the Codex notebook as a runtime dependency.
- It does not create mentor tickets without a saved brief.
- It does not let feature creep survive without a decision.
