# Audit Report 03 - Question Clarity

**Screen:** Bridge  
**Burn-in:** [`assets/report-03-question-clarity.svg`](./assets/report-03-question-clarity.svg)

The bridge needed sharp questions, not a long prompt dump.

## READ

The human support handoff should capture problem, user, scope, constraints, and success in a compact form.

## LOCATE

`app/services/claudeApi.ts`

## HYPOTHESIZE

Three to five focused engineering questions are enough for a clean expert handoff.

## REPAIR

Added a bridge generator with a structured question set and a local fallback when Gemini is unavailable.

## TEST

`npx tsc --noEmit`

## VERIFY

The bridge screen now shows a short brief, a decision note, and only the relevant questions.
