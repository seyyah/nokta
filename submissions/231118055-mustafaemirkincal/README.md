# 231118055 Mustafa Emir Kincal

This folder is the single submission target.

## Track Selected

**Track C - Migration & Dedup**

The app accepts messy dumps, WhatsApp exports, and bullet lists, then deduplicates them into traceable idea cards. The folder also includes a simple avatar/bridge structure so everything stays in one place.

## API

The app is wired for a Gemini API key via `app/.env.local` or the build environment:

```env
EXPO_PUBLIC_GEMINI_API_KEY=your_key_here
```

## Expo QR Code / Link

[http://localhost:8084](http://localhost:8084)

## Demo Video

`PENDING_RECORDING`

## APK

- `app-release.apk`

## What is included

- `app/` - Expo app source
- `app-release.apk` - Android release binary
- `avatar.glb` - custom avatar asset for the final-week voice demo
- `AVATAR_GUIDE.md` - how to create and plug in your own avatar
- `BRIDGE.md` - human bridge summary and expert-call protocol
- `FORGE.md` - forge ratchet log
- `PERSONAS.md` - avatar personas
- `audit-reports/` - dictated burn-in reports
- `idea.md` - consolidated idea brief

## Decision Log

1. I kept everything in one submission folder so the repo stays easy to review.
2. I kept the API-backed app in `app/` so the APK remains runnable with the configured Gemini key.
3. I preserved the note dedup flow because it is the clearest fit for Track C.
4. I added a simple avatar and bridge surface instead of a heavy media stack so the demo stays understandable.
5. I documented avatar preparation in `AVATAR_GUIDE.md` so you can swap in your own face later.
6. I kept the APK in the same folder as the source so the final reviewer can test the binary immediately.

## Run

```bash
cd app
npm install
npx expo start
```
