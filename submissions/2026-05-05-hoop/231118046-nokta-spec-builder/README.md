# NOKTA Spec Builder

## Project Details
- **Student Number:** 231118046
- **Track Selection:** Track A (Idea → Clarifying Questions → One-Page Spec)

## Overview
NOKTA Spec Builder is a minimalistic, polished mobile application developed to help entrepreneurs, developers, and product managers convert raw ideas into structured specifications. By simulating an AI-assisted workflow, the app forces the user to clarify constraints upfront and automatically compiles the input into a clean, ready-to-use One-Page Product Spec.

## How It Works
The application uses a linear, state-driven user flow:
1. **Idea Pitch:** The user enters their raw startup or product idea into a text field.
2. **Clarification Phase:** The user answers four hardcoded, constraint-focused product questions:
   - What specific problem does this solve?
   - Who is the exact target user?
   - What is the absolute minimum feature set?
   - What is the biggest constraint or risk?
3. **Spec Generation:** The app processes the answers and displays a beautifully formatted, single-page specification document summarizing the project.

## Tech Stack
- **Framework:** Expo + React Native (Plain JavaScript)
- **Styling:** React Native `StyleSheet`
- **Architecture:** Single-file state machine (`App.js`)

## Running Locally
To test the MVP on a local machine, simply run:
```bash
cd app
npm install
npx expo start
```
*(Press `a` to open in the Android emulator, `i` to open in the iOS simulator, or scan the QR code with the Expo Go app).*

## APK Build Instructions (EAS)
This project is configured to easily build an Android APK via Expo Application Services. Run the following command in the `app/` directory:
```bash
eas build -p android --profile preview
```

## Demo & Submission Links
- **Demo Video:** https://youtube.com/shorts/_T-CS_F6lmM
- **Expo / APK Link:** https://expo.dev/accounts/ravzanurr/projects/app/builds/9dddb181-4263-4bad-a1c0-c3e968e2acc2

## Decision Log
1. **Plain JavaScript over TypeScript:** I chose JS to keep the MVP extremely lightweight and fast to develop, as the data structures are isolated to just three basic local states.
2. **Skipped React Navigation:** I utilized a single integer-based state (`step`) to conditionally render different views inside `App.js`. This eliminated navigation boilerplate and guaranteed a completely crash-free linear flow.
3. **Hardcoding Questions vs. AI:** I opted to hardcode the four clarifying questions. This guarantees perfect stability during the 60-second submission demo and avoids unpredictable API latencies, while perfectly satisfying the Track A logic.
4. **Native StyleSheet over Tailwind:** Choosing pure `StyleSheet` styling removed external dependencies and ensured out-of-the-box compatibility across both web and native devices without extra compilation times.
5. **Combined Form State Structure:** All answers are housed within a single state object (`answers`). This decision makes future refactoring to a real AI backend seamless, as the object can simply be serialized and sent as a single payload.

## Summary
This project delivers exactly on the Track A objective: it takes a messy idea, applies constraints through targeted questioning, and automatically generates a highly readable product specification document.
