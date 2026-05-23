# Audit Report 01 - Bridge Gap

**Screen:** Dump  
**Burn-in:** [`assets/report-01-bridge-gap.svg`](./assets/report-01-bridge-gap.svg)

The main dump screen needed a visible human escalation path. Without it, unclear inputs were forced through the card generator.

## READ

The dump flow already deduplicated notes well, but it did not offer a person-in-the-loop fallback.

## LOCATE

`app/screens/DumpScreen.tsx`

## HYPOTHESIZE

If the screen exposes a direct "Ask human expert" CTA, the Week 2 path becomes discoverable without hurting Week 1.

## REPAIR

Added a second CTA that builds a bridge brief and navigates to the human support screen.

## TEST

`npx tsc --noEmit`

## VERIFY

The dump flow still works, and the bridge CTA is now visible below the main analyze button.
