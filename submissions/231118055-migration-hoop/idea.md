# Nokta AI Note Analysis

## Thesis

Rough notes become much more useful when they are clustered into idea cards and then answered by an AI helper on the same screen. This slice turns pasted dots into a compact board, lets the user add extra notes one by one, then keeps a live AI chat running under the analysis panel.

## Problem

- Notes are scattered across WhatsApp exports, voice transcriptions, email drafts, and quick bullets.
- Similar ideas are often repeated with slightly different wording.
- Users usually want a fast answer, not another navigation layer.
- Review feedback is useful only if it is visible right after clustering.
- A useful assistant should also be able to keep talking after the first answer lands.

## Solution

The app follows a short pipeline:

1. Normalize pasted fragments into note objects.
2. Let the user append extra short notes into a quick-add queue.
3. Cluster similar notes into idea cards.
4. Show provenance, confidence, and merge candidates.
5. Ask OpenRouter to summarize the cluster, answer the user's notes directly, and continue the conversation below the analysis card.
6. Fall back to deterministic local analysis when the API key is missing.

## Why this is different

- Provenance tags keep the source trail visible.
- Confidence rails make the cluster quality easy to read.
- The AI answer sits next to the cards instead of hiding behind another screen.
- A quick-add note queue makes it easier to build a richer board from multiple fragments.
- The follow-up chat keeps the assistant available after the first analysis, which feels more like a real helper.
- Local fallback keeps the demo working even when the API is not configured.

## Non-goals

- Full backend syncing
- A marketplace, social feed, or large multi-screen product
- Voice capture inside the app itself

## Summary

This is a focused Track C slice with a direct AI answer layer and a small chat loop. It keeps the submission small, but still shows a meaningful Nokta direction: capture, dedup, answer, chat, and keep provenance visible.
