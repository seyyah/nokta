# idea.md — Track A: Dot Capture & Enrich

## Raw Idea (Input)
> "An app that helps students turn vague study notes into structured learning cards with AI."

---

## AI Engineering Interview (3–5 Questions)

**Q1 — Problem:**
What exact pain does this solve? A student has messy notes after a lecture. They don't know how to summarise them into something reviewable. Existing tools (Notion, Anki) require manual effort to format. This app takes raw text and does the structuring automatically.

**Q2 — User:**
Who is the primary user? University/high-school students who take unstructured notes (bullet dumps, stream-of-consciousness) during class or while reading. Secondary: self-learners on platforms like Coursera or YouTube.

**Q3 — Scope:**
What is the MVP? Input: paste raw text notes. Output: 3–5 structured "idea cards" with title, summary, and a review question. No login, no sync, no collaboration in v1.

**Q4 — Constraint:**
What are the main constraints? Must work offline-first (students have poor campus Wi-Fi). Cards must be exportable (JSON / Markdown). AI calls must be cheap — use a small model or batch prompts.

**Q5 — Success metric:**
How do we know it works? A student can go from raw lecture notes → reviewable cards in under 60 seconds. Card quality: title is ≤ 8 words, summary is 2–3 sentences, review question is answerable from the notes alone.

---

## One-Page Spec

### Product Name
**NotePoint** — *Your notes, sharpened.*

### Problem Statement
Students accumulate unstructured notes but rarely review them effectively. The gap between "raw capture" and "ready to study" costs time and mental energy most students don't have.

### Solution
A mobile-first app (Expo / React Native) where a student pastes or speaks their raw notes. The AI (Gemini 2.5 Flash-Lite) asks 3–5 clarifying questions about the content domain and scope, then produces structured idea cards ready for review.

### Core User Flow
```
[Paste / Speak Notes]
        ↓
[AI asks 3–5 scoped questions]
        ↓
[Generate 3–5 Idea Cards]
        ↓
[Review / Export / Share]
```

### Idea Card Schema
```json
{
  "title": "string (≤ 8 words)",
  "summary": "string (2–3 sentences)",
  "review_question": "string",
  "tags": ["string"],
  "source_excerpt": "string (original text snippet)"
}
```

### Tech Stack
| Layer | Choice | Reason |
|---|---|---|
| Framework | Expo (React Native) | Cross-platform, easy APK export |
| AI | Gemini 2.5 Flash-Lite | Fast, cheap, sufficient quality |
| Storage | AsyncStorage + JSON export | Offline-first |
| UI | NativeWind (Tailwind for RN) | Rapid styling |

### Constraints & Mitigations
- **Offline**: Cache last 5 sessions locally; AI only called on demand
- **Cost**: Use Gemini 2.5 Flash-Lite model, max 500 tokens per call
- **Privacy**: Notes never stored server-side; all data stays on device

### Out of Scope (v1)
- User accounts / sync
- Spaced repetition scheduling
- Image / PDF input
- Collaboration

### Open Questions
1. Should the AI questions be shown one at a time (conversational) or all at once (form)?
2. Do we support voice input via Expo Speech API in v1?
3. Should cards be shareable as image tiles (like Instagram stories)?

---

## Decision Log
| Date | Decision | Reason |
|---|---|---|
| 2026-04-21 | Chose Track A | Best fit for AI-guided spec generation; suits LLM engineering focus |
| 2026-04-21 | Chose Expo over bare RN | Faster APK build pipeline, QR code preview built-in |
| 2026-04-21 | Chose Gemini 2.5 Flash-Lite | Latency + cost; quality sufficient for short note summarisation |
| 2026-04-21 | No login in v1 | Reduces scope; privacy-preserving; faster to ship |

---

## Karpathy / Autoresearch Reference
This project relates to **Prompt Engineering and LLM Applications**. The core technique is a multi-turn structured prompting loop: the model first asks clarifying questions (scoped to problem/user/constraint), then uses the answers to condition a generation task. This mirrors Karpathy's framing of LLMs as "reasoning engines" that improve output quality through iterative context-building rather than single-shot prompting. The idea card schema is a minimal structured output format, aligning with best practices for constrained generation (JSON mode / tool use).