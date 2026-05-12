# Note Migrator — 9221118097

## Track Selected: Track C — Migration & Dedup

Paste messy WhatsApp / Telegram / social media group chat dumps → AI extracts, deduplicates, and categorizes → clean idea cards with full migration trace.

Supports **English**, **Malay**, and **Turkish** input (or any mix).

## Expo Link

[expo.dev/accounts/nadilr/projects/app/builds/82770e4e-6214-4b23-8bc7-04b2c0c3372a](https://expo.dev/accounts/nadilr/projects/app/builds/82770e4e-6214-4b23-8bc7-04b2c0c3372a)

## Demo Video

[Watch on YouTube Shorts](https://youtube.com/shorts/uiLDrmdMbVc?feature=share)

## Screenshots

| Dump Screen | Cards Screen |
|---|---|
| Paste any chat dump in any language | Extracted, deduplicated idea cards |

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

## Features

- **Migration trace** — each card shows `mergedFrom: [1, 3, 7]`, the exact line numbers from the original dump
- **Deduplication** — semantically similar messages are merged into one card
- **5 categories** — 🍳 Recipe · 📚 Study · ⏰ Reminder · 💡 Tip · 📌 Other
- **Quality score bar** — 0–100 score showing how specific and actionable each idea is
- **Share button** — share any card via native share sheet
- **Multilingual** — Turkish, Malay, English, or mixed input

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
