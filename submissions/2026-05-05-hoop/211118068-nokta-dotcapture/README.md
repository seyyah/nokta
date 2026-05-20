# 211118068 - NOKTA Dot Capture Submission

## Track Selection
- Selected Track: **Track A - Dot Capture & Enrich**

## Project Overview
This mobile app takes a raw idea, asks 3-5 engineering discovery questions, and generates a one-page product spec.

## Expo Run / QR
1. Open terminal in `submissions/211118068-nokta-dotcapture/app`
2. Install dependencies (already installed during setup):
   - `npm install`
3. Start Expo:
   - `npx expo start`
4. Scan the QR code from Expo DevTools with Expo Go.

Expo project link (QR erişimi buradan da mümkün):
- https://expo.dev/accounts/mrkarahann/projects/nokta-dot-capture-211118068

Environment setup for AI calls:
- Copy `app/.env.example` to `app/.env`
- Set `EXPO_PUBLIC_OPENROUTER_API_KEY`

## Demo Video (60s)
- Demo video link:
- `https://youtube.com/shorts/kLPz2hu1Neg?feature=share`

## Decision Log
1. Chose Track A because it is the clearest and lowest-risk path to show an end-to-end working AI flow in limited time.
2. Built the app as a single-screen flow for fast demoability and reduced UI complexity.
3. Added OpenRouter API integration (`EXPO_PUBLIC_OPENROUTER_API_KEY`) with fallback logic so the app still works without API key or during rate limits.
4. Used fixed section headings for spec output to align with product/engineering readability.
5. Prioritized robust submission compliance: only worked under `submissions/211118068-nokta-dotcapture/`.

## AI/Tool Usage Notes
- Primary: OpenRouter chat completion for question and spec generation.
- Fallback: Local deterministic question/spec generation when AI call fails.

## APK
- APK file path (required): `submissions/211118068-nokta-dotcapture/app-release.apk`
- EAS artifact link: https://expo.dev/artifacts/eas/eaJYiUtzF4FKoRa56nALfk.apk
- Build command suggestion:
  - `npx eas build -p android --profile preview`
