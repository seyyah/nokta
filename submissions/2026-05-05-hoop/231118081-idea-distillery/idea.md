# Nokta Game Pitch: Indie Game Notes to Buildable GDD-lite

## Selected Track

**Track C - Migration & Dedup**

Nokta Game Pitch is a themed upgrade of the original Nokta Draft idea. It keeps
the Track C core: messy notes are migrated, deduplicated, structured, and turned
into a clearer artifact. The domain is now specific: **solo indie game
developers**.

## Thesis

Indie game ideas often start as exciting but unstable note piles:

- genre fragments
- reference games
- mechanics wishlist
- feature creep
- prototype deadlines
- contradictory tone notes
- mentor feedback

The problem is not that the idea is bad. The problem is that the first playable
version is unclear.

Nokta Game Pitch turns those notes into a scoped **GDD-lite** brief that tells
the developer what to build first, what to cut, and when a mentor should review
the scope.

## Core Promise

```txt
messy game notes
-> structured GDD-lite
-> prototype readiness score
-> mentor handoff packet
-> saved brief and review ticket
-> feedback writeback
-> final buildable brief
```

## User

The primary user is a solo or very small indie game team. They have ideas,
references, and mechanics, but they need help turning ambition into a prototype
they can actually build.

## What The App Produces

### Game Summary

The game idea compressed into one buildable direction.

### Core Loop

The repeatable player activity that should be proven in the first prototype.

### Player Fantasy

The feeling or role the player should experience.

### Core Mechanics

Only the mechanics that support the first playable loop.

### Scope Boundary

What belongs in v1 and what should move to later.

### Feature Creep Warnings

Large systems that can break a solo prototype:

- online multiplayer
- open world
- base building
- pet systems
- procedural worlds
- boss fights
- full crafting economy

### Prototype Plan

A small playable plan instead of a full production roadmap.

### Mentor Handoff Packet

If the pitch is risky, the app prepares a packet for a game designer or
technical producer mentor.

### Role-Based Review Queue

The user and mentor do not share the same screen.

The user logs in, pastes notes, gets a brief, selects decisions, then saves it.
If the readiness mode is HOTL or HITL, the app creates a mentor review ticket.

The mentor logs in separately and only sees pending review tickets. The mentor
does not edit the raw notes. They review the generated packet and paste feedback.

### Feedback Writeback

Mentor notes or transcripts are pasted into the mentor ticket. The app extracts:

- accepted decisions
- rejected assumptions
- new constraints
- next build actions

The saved brief is updated with a future plan based on the mentor feedback.

## Groq Role

Groq is used as the structured game design analyst. It receives raw game notes
and returns a strict JSON GDD-lite draft.

The app does not depend entirely on Groq. If the API key is missing or the
response fails, the deterministic local engine still runs.

## Hoop Inspiration

The updated `nokta-hoop` system inspired the mentor flow:

- Mascot decides whether a question can be answered or should be escalated.
- Mentor requests have status and context.
- Human feedback returns to the conversation as useful memory.

Nokta Game Pitch adapts that idea without importing the heavy video/TTS stack.
The app creates an in-app mentor ticket queue and writes mentor feedback back
into the saved brief.

## Anti-Slop Rules

- Do not let every mechanic survive.
- Do not treat reference games as a design.
- Do not claim a huge game is buildable by one developer unless the prototype is tiny.
- Do not resolve contradictions by hiding them.
- Do not generate a final brief before scope, tone, and core loop are clear.

## Example

Input:

```txt
cozy horror farming game
solo developer
two week prototype
crafting fishing pets base building multiplayer
no combat but maybe boss fight
```

Output:

```txt
Core Loop:
Explore a small island at night -> gather one resource -> return to lighthouse -> upgrade lantern.

Feature Creep:
Cut multiplayer, pets, base building, and boss fights from v1.

Mentor Question:
Should horror be atmosphere only, or should it change the mechanics?
```

## What It Does Not Do

- It does not build the game.
- It does not generate assets.
- It does not connect to Steam.
- It does not run real video mentor calls.
- It does not replace game designer judgment.

It prepares the idea so the next human or AI step has a sharper artifact to
work from.
