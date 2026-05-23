# 231118055 Mustafa Emir Kincal

## Track Selected

**Track C - Migration & Dedup**

Raw dumps, WhatsApp exports, and messy bullet lists are pasted into the app. NOKTA deduplicates repeated lines, clusters related notes, and turns them into traceable idea cards.

## Expo QR Code / Link

[http://localhost:8084](http://localhost:8084)

## Demo Video

`PENDING_RECORDING`

## What is included

- `app/` - Expo app source
- `idea.md` - Track C-specific idea brief
- `app-release.apk` - Android release binary

## Decision Log

1. I chose Track C because it maps directly to the everyday problem of messy chat notes turning into reusable idea cards.
2. I kept a local fallback dedup pipeline in the app so the demo still works even if no API key is configured.
3. I used a dark amber/cyan visual style to make the card hierarchy obvious on a phone screen.
4. I renamed the product surface to NOKTA Idea Cards so the demo reads as a focused slice of the parent project, not a generic note app.
5. I kept the card output traceable with `mergedFrom` so the output stays auditable instead of looking like slop.

## Run

```bash
cd app
npm install
npx expo start
```
