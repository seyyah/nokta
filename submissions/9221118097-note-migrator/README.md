Track: B

# Note Migrator — 9221118097

## Track Selected: Track C — Migration & Dedup (Original) · Track B — Audit-Forge (Week 14)

Paste messy WhatsApp / Telegram / social media group chat dumps → AI extracts, 
deduplicates, and categorizes → clean idea cards with full migration trace.

Supports **English**, **Malay**, and **Turkish** input (or any mix).

## Expo Link

[https://expo.dev/accounts/nadilr/projects/app/builds/3af41197-c45d-4e1d-8c3a-520a2bde1442](https://expo.dev/accounts/nadilr/projects/app/builds/82770e4e-6214-4b23-8bc7-04b2c0c3372a)

## Demo Video

[Watch on YouTube Shorts](https://youtube.com/shorts/uiLDrmdMbVc?feature=share)

## Screenshots

| Dump Screen | Review Screen | Cards Screen |
|---|---|---|
| Paste any chat dump in any language | Approve, reject, or edit each AI-extracted card | Only human-approved cards appear here |

---

## Week 14 — Audit-Forge Integration (Track B)

### What was added

nokta-audit widget (`@xtatistix/mobile-audit`) mounted as a single drop-in
component in `App.tsx`. A draggable 🐛 FAB floats above all screens.
Single tap captures the screen and opens the area selector. Double tap
opens the saved note list with Markdown export.

Three feature-request audit reports were generated across all three screens
and stored in `audit-reports/`. Each report was then used as input for a
forge cycle run by Claude Code following the
`READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT/ROLLBACK`
loop defined in `FORGE.md`.

### Human Touch Points: 2

| # | When | Why |
|---|---|---|
| 1 | Cycle 1 | Reviewed modal UX — chose "Skip" over "Cancel" for reject-without-reason path |
| 2 | Cycle 2 | Reviewed empty-state message wording for filter with no matching cards |

All other decisions were made autonomously by the agent within the cycle.

### Forge Results Summary

| Cycle | Feature | Result | kg |
|---|---|---|---|
| 1 | Rejection reason modal on ReviewScreen | ✅ COMMITTED | 20kg |
| 2 | Category filter bar on CardsScreen | ✅ COMMITTED | 20kg |
| 3 | Camera OCR on DumpScreen | ❌ ROLLBACK | 0kg |
| 4 | Clipboard paste button on DumpScreen | ✅ COMMITTED | 10kg |

**Total: 50kg across 4 cycles (3 success + 1 rollback)**

### The Composition

NoteMigrator already had HITL ReviewScreen (Week 13) — human approves
AI output. Adding nokta-audit creates a second loop: the same human,
as a customer, now directs what gets built next. Their plain-language
note inside the widget becomes the spec. The spec becomes code.
The human reviews the PR. See `idea.md` for the full use case.

---

## Human Loop Integration

### Nokta Mascot (`components/NoktaMascot.tsx`)

An animated character that lives on the DumpScreen and reacts to what 
the AI is doing in real time:

| State | Emoji | When |
|-------|-------|------|
| idle | 🤖 | App opens, waiting for input |
| thinking | 🤔 | API call in progress |
| done | 🎉 | Cards received |
| error | 😰 | API failure |

Each state has a distinct animation built with React Native's `Animated`
API (float, pulse, bounce, shake) — no external libraries.

### HITL Review Screen (`screens/ReviewScreen.tsx`)

A new screen inserted between the AI output and the final cards list. 
The user reviews each extracted card one at a time and decides:

- **✓ Keep** — card goes to the final list
- **✗ Reject** — card is dropped (with optional rejection reason — Week 14)
- **✏ Edit** — inline editing of title and summary before keeping

Only approved cards reach CardsScreen.

### Why these additions

The original app was **HOOTL** — the AI ran, produced cards, and the user
just received whatever it decided. These additions move the app to **HITL**:

- The Mascot tells you **when** the AI is working
- The ReviewScreen gives you **control** over what it produces
- nokta-audit gives you **voice** to direct what gets built next

## Decision Log

| Decision | Rationale |
|----------|-----------|
| Track C over A/B (original) | Fewest submissions on this track; most relatable real-world use case |
| Track B for Week 14 | HITL + audit composition is a genuine müşteri-geliştirici story |
| WhatsApp chat dump as input | More concrete than generic notes; everyone has this problem daily |
| Groq + Llama 3.3 70B | Free tier (14,400 req/day), no billing required, fast, multilingual |
| Raw `fetch` over SDK | No Groq/Anthropic native SDK for React Native — raw fetch is correct |
| Dark theme (`#0f0f14`) | Reduces eye strain; looks professional on demo video |
| Category emoji system | Instant visual scan — no need to read labels |
| `mergedFrom[]` field | NOKTA anti-slop principle: every output card is traceable to line numbers |
| `EXPO_PUBLIC_` env vars | Expo's built-in `.env` support — no extra package needed |
| Multilingual system prompt | LLM responds in dominant language of input — EN / MY / TR |
| Nokta Mascot (Week 13) | AI embodiment — visible emotional state instead of silent spinner |
| ReviewScreen / HITL (Week 13) | Human gate between AI output and final state — HOOTL → HITL |
| `mergedFrom[]` as HITL context | Traceability gives reviewer context to make a real decision |
| nokta-audit drop-in (Week 14) | Single mount in App.tsx — widget removable without breaking app |
| Track B feature requests | Audit reports as feature specs — customer directs agent builds |
| Cycle 3 rollback (OCR) | expo-image-picker not in approved deps — honest rollback, not skipped |
| Clipboard paste (Cycle 4) | Simpler hypothesis after OCR rollback — 10kg, zero new API dependency |

## Features

- **Migration trace** — `mergedFrom: [1, 3, 7]` on every card
- **Deduplication** — semantically similar messages merged into one card
- **5 categories** — 🍳 Recipe · 📚 Study · ⏰ Reminder · 💡 Tip · 📌 Other
- **Quality score bar** — 0–100 score per card
- **Nokta Mascot** — animated AI with real-time emotion states
- **HITL Review Screen** — card-by-card human approval gate
- **Rejection reason** — optional reason stored per rejected card (Week 14)
- **Category filter bar** — filter CardsScreen by emoji category (Week 14)
- **Clipboard paste** — one-tap paste from clipboard on DumpScreen (Week 14)
- **nokta-audit widget** — drop-in 🐛 FAB for UX audit and feature requests
- **Share button** — share any card via native share sheet
- **Multilingual** — Turkish, Malay, English, or mixed input

## Screen Flow

DumpScreen  [🐛 FAB available]
→ (paste chat dump or 📋 clipboard paste — Week 14)
→ Mascot enters "thinking" state
→ Groq API (Llama 3.3 70B)
→ Mascot enters "done" state
→ ReviewScreen  [🐛 FAB available]
✓ Keep / ✗ Reject (+ reason — Week 14) / ✏ Edit
→ CardsScreen  [🐛 FAB available]
filter by category — Week 

## Getting Started

```bash
cd app
cp .env.local.example .env.local
# Paste your free Groq API key from https://console.groq.com
npm install
npx expo start
```

## AI Tools Used

- **Claude Code CLI** (Anthropic) — scaffolding, architecture, forge cycles
- **Groq API / Llama 3.3 70B** — runtime AI for note migration and dedup
- **Claude.ai backbone chat** — scope, planning, prompt engineering