# Audit Report 04 - Ledger Ratchet

**Screen:** Forge  
**Burn-in:** [`assets/report-04-ledger-ratchet.svg`](./assets/report-04-ledger-ratchet.svg)

The forge view needed a simple ledger that tells the story of the loop at a glance.

## READ

Week 3 requires success rows, rollback rows, kg growth, and human touch points.

## LOCATE

`app/screens/ForgeScreen.tsx`

## HYPOTHESIZE

A ledger card stack is enough to expose the ratchet without making the screen heavy.

## REPAIR

Added a static forge ledger view with four cycles, a visible rollback row, and monotonic kg.

## TEST

Manual review

## VERIFY

The forge screen communicates the closed loop clearly and keeps the rollback visible instead of hiding it.
