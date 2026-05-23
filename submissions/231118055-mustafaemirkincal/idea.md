# NOKTA Idea Cards

## Track C - Migration & Dedup

This submission focuses on the smallest useful slice of NOKTA: take a messy dump of notes, WhatsApp exports, or bullet lists and convert it into clean idea cards.

## Problem

Useful information is usually scattered across repeated messages, half-written thoughts, and duplicated decisions. By the time someone wants to act on it, the original context is already buried in chat noise.

## Solution

The app provides a single paste field and a single analysis action:

1. Paste raw notes or a chat export.
2. Deduplicate repeated lines.
3. Group related notes into traceable cards.
4. Surface a short title, summary, tags, score, and source line numbers.

## Card Model

Each extracted card includes:

- `title`
- `summary`
- `category`
- `tags`
- `score`
- `mergedFrom`

The `mergedFrom` field keeps the result auditable so the output can always be traced back to the original dump.

## Category Scheme

The demo uses five categories:

- `idea`
- `task`
- `decision`
- `risk`
- `other`

This keeps the output focused on common note-dump patterns instead of forcing the user into a narrow template.

## AI Strategy

The app prefers a model-backed extraction path when `EXPO_PUBLIC_GROQ_API_KEY` is available. If no key exists, it falls back to a local dedup pipeline so the demo is still usable in a classroom or offline setup.

## Why this track

Track C is the cleanest fit for the current repository because it demonstrates NOKTA's core thesis: transform fragmented input into a structured artifact with traceability.

