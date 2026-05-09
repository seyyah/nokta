# Note Migrator — 9221118097

## Track Selected: Track C — Migration & Dedup

Paste messy WhatsApp / Telegram / social media group chat dumps → AI extracts, deduplicates, and categorizes → clean idea cards with full migration trace.

Supports **English**, **Malay**, and **Turkish** input (or any mix).

## Expo Link

[expo.dev/accounts/nadilr/projects/app/builds/82770e4e-6214-4b23-8bc7-04b2c0c3372a](https://expo.dev/accounts/nadilr/projects/app/builds/82770e4e-6214-4b23-8bc7-04b2c0c3372a)

## Demo Video

[Watch on YouTube Shorts](https://youtube.com/shorts/uiLDrmdMbVc?feature=share)

## Screenshots

| Dump Screen | Review Screen | Cards Screen |
|---|---|---|
| Paste any chat dump in any language | Approve, reject, or edit each AI-extracted card | Only human-approved cards appear here |

## Human Loop Integration

### Nokta Mascot (`components/NoktaMascot.tsx`)

An animated character that lives on the DumpScreen and reacts to what the AI is doing in real time:

| State | Emoji | When |
|-------|-------|------|
| idle | 🤖 | App opens, waiting for input |
| thinking | 🤔 | API call in progress |
| done | 🎉 | Cards received |
| error | 😰 | API failure |

Each state has a distinct animation built with React Native's `Animated` API (float, pulse, bounce, shake) — no external libraries.

The Mascot gives the AI a visible presence. Instead of a silent loading spinner, the user sees a collaborator that communicates what it's doing in real time. This is the same embodiment principle behind the 3D conversational avatar projects — making AI feel like a participant, not a form submission.

### HITL Review Screen (`screens/ReviewScreen.tsx`)

A new screen inserted between the AI output and the final cards list. The user reviews each extracted card one at a time and decides:

- **✓ Keep** — card goes to the final list
- **✗ Reject** — card is dropped
- **✏ Edit** — inline editing of title and summary before keeping

Only approved cards reach CardsScreen.

The `mergedFrom[]` field on each card shows the exact line numbers from the original chat dump — giving the human reviewer the context to verify the AI's claim before approving it. That's what makes the HITL gate meaningful rather than a rubber stamp.

### Why these two additions

The original app was **HOOTL** (Human Out Of The Loop) — the AI ran, produced cards, and the user just received whatever it decided. These additions move the app to **HITL** (Human In The Loop):

- The Mascot tells you **when** the AI is working
- The ReviewScreen gives you **control** over what it produces

The ReviewScreen is not just a UI screen — it is the **harness**: the infrastructure between AI output and final state that enforces the loop level. The AI proposes. The system routes each card through a human gate. Only then does anything reach CardsScreen. That's the difference between prompting an AI and engineering around it.

## Decision Log

| Decision | Rationale |
|----------|-----------|
| Track C over A/B | Fewest submissions on this track; most relatable real-world use case |
| WhatsApp chat dump as input | More concrete than generic notes; everyone has this problem daily |
| Groq + Llama 3.3 70B | Free tier (14,400 req/day), no billing required, fast, multilingual |
| Raw `fetch` over SDK | No Groq/Anthropic native SDK for React Native — raw fetch is the correct approach |
| Dark theme (`#0f0f14`) | Reduces eye strain; looks professional on demo video |
| Category emoji system | Instant visual scan — no need to read labels |
| `mergedFrom[]` field | NOKTA anti-slop principle: every output card is traceable to original line numbers |
| `EXPO_PUBLIC_` env vars | Expo's built-in `.env` support — no extra package needed |
| Multilingual system prompt | LLM responds in dominant language of input — works for EN / MY / TR |
| Nokta Mascot (Week 14) | AI embodiment — visible emotional state instead of silent spinner |
| ReviewScreen / HITL (Week 14) | Human gate between AI output and final state — HOOTL → HITL upgrade |
| `mergedFrom[]` as HITL context | Traceability gives the human reviewer enough context to make a real decision |

## Features

- **Migration trace** — each card shows `mergedFrom: [1, 3, 7]`, the exact line numbers from the original dump
- **Deduplication** — semantically similar messages are merged into one card
- **5 categories** — 🍳 Recipe · 📚 Study · ⏰ Reminder · 💡 Tip · 📌 Other
- **Quality score bar** — 0–100 score showing how specific and actionable each idea is
- **Nokta Mascot** — animated AI character with real-time emotion states (idle / thinking / done / error)
- **HITL Review Screen** — card-by-card human approval gate before final output
- **Share button** — share any card via native share sheet
- **Multilingual** — Turkish, Malay, English, or mixed input

## Screen Flow

```
DumpScreen
  → (paste chat dump)
  → Mascot enters "thinking" state
  → Groq API (Llama 3.3 70B)
  → Mascot enters "done" state
  → ReviewScreen  ← NEW (Week 14)
      ✓ Keep / ✗ Reject / ✏ Edit — card by card
  → CardsScreen (approved cards only)
```

## Getting Started

```bash
cd app
cp .env.local.example .env.local
# Paste your free Groq API key from https://console.groq.com
npm install
npx expo start
```

## AI Tools Used

- **Claude Code CLI** (Anthropic) — primary development assistant throughout the project
- **Groq API / Llama 3.3 70B** — runtime AI model for note migration and deduplication