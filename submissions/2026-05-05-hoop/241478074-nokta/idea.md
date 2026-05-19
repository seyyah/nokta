# idea.md — Nokta Track C

## Problem

Notes pile up fast. A WhatsApp group might produce 40 messages, half of which repeat the same idea in different words or with different bullet styles. Manually cleaning this is tedious.

There's no good mobile-native tool for: **paste → clean → cards**.

---

## Input Format

The app accepts any newline-separated text:

- Plain lists: `idea one\nidea two`
- Bullet lists: `- item\n• item\n* item`
- WhatsApp exports: `[10:42, 12/04/2024] Ali: - buy milk`
- Mixed: any combination of the above

---

## Output Format

Each unique line becomes an **idea card**:

```
┌─────────────────────────────┐
│  1  buy milk                │
└─────────────────────────────┘
┌─────────────────────────────┐
│  2  call dentist            │
└─────────────────────────────┘
```

Stats shown: `N unique · M removed`

---

## Challenges

1. **What counts as a duplicate?**
   "Buy Milk", "- buy milk", "• Buy milk!" all mean the same thing.
   Solution: normalise before comparing (lowercase + strip bullet prefix + collapse whitespace).

2. **Preserving the original text**
   Users want to see their original phrasing in the cards, not the normalised version.
   Solution: store `trimmed` for display, `normalised` for dedup key.

3. **Order preservation**
   First occurrence wins; later duplicates are dropped silently.

4. **Empty / junk lines**
   Lines that are only punctuation or whitespace after normalisation are skipped.

---

## Solution Approach

```
Raw text
   │
   ▼
split("\n")
   │
   ▼
forEach line:
  trim() → skip if empty
  normalise() → check Set
  if not in Set → add to results + mark Set
   │
   ▼
IdeaCard[]  →  FlatList of animated cards
```

Entirely client-side. No network. No storage. Stateless between sessions.

---

## Why Track C?

It solves a real, concrete problem I personally have — group chats produce duplicate ideas constantly. The scope is well-defined, testable, and demonstrable in a 30-second screen recording.
