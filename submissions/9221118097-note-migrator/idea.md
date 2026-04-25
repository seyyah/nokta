# Note Migrator — Track C: Migration & Dedup

## The Problem

Every day, people receive dozens of messages in WhatsApp groups, Telegram chats, and social media — recipes shared mid-conversation, exam hints scattered across replies, life tips buried in noise. Useful information is lost inside chat chaos.

## The Idea

**Note Migrator** takes a raw dump of messy chat messages and transforms them into clean, structured idea cards using Claude AI.

Input: Paste any WhatsApp/Telegram/social media chat export  
Output: Categorized, deduplicated idea cards with migration trace

## Track C Alignment

This directly implements the **Migration & Dedup** track:
- **Migration**: moves fragmented chat messages into structured idea cards
- **Dedup**: identifies when multiple messages discuss the same topic and merges them
- **Migration trace**: each card shows which original line numbers it was synthesized from

## Supported Categories

| Emoji | Category | Example |
|-------|----------|---------|
| 🍳 | Recipe | Kek batik ingredients shared across 3 messages |
| 📚 | Study | Exam hints mentioned by multiple classmates |
| ⏰ | Reminder | "Jangan lupa bawak notes esok" |
| 💡 | Tip | Forwarded life hack or study technique |
| 📌 | Other | Everything else worth keeping |

## Key Feature: Migration Trace

Each idea card shows `mergedFrom: [1, 3, 7]` — the exact line numbers from the original dump that were collapsed into that card. This is NOKTA's anti-slop principle in action: full traceability from raw input to clean output.

## Tech Stack

- React Native + Expo (blank-typescript)
- Claude Haiku 4.5 via raw fetch (fast, cost-effective for this use case)
- React Navigation (native stack)
- EXPO_PUBLIC_ env var for secure API key storage

## AI Tool Log

- Claude Code CLI — used throughout for scaffolding, service architecture, and screen implementation
