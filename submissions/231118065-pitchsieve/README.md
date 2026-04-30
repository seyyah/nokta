# PitchSieve

## Selected Track

**Track B - Slop Detector / Due Diligence**

## Project Summary

PitchSieve is an offline Expo / React Native app that reads a startup pitch paragraph like a skeptical first-pass associate. It scores the language for slop, explains why the score happened, surfaces critique tags, and proposes a tighter rewrite. Everything runs locally with deterministic heuristics. No backend, no API key, no network dependency for the core feature.

## Expo Link / QR

- Expo project: https://expo.dev/accounts/emre23232/projects/pitchsieve
- Android APK artifact: https://expo.dev/artifacts/eas/x7EzxdX7nWFchFwEmm6Wf2.apk
- TODO: Add Expo QR link if you also publish a preview experience

## 60-Second Demo Video

- Demo video: https://www.youtube.com/shorts/HXngcqEFLow

## Decision Log

- Chose a fully local heuristic engine so the app works offline and stays compliant with the no-backend requirement.
- Kept the UX on a single screen to make the demo flow fast: paste, analyze, inspect score, reset.
- Scored pitch language rather than startup quality; the app critiques rhetoric, specificity, and evidence signals, not whether the company will win.
- Added a rewrite suggestion that pushes the pitch toward a narrower, more testable framing instead of trying to generate a polished investor deck.
- Avoided extra dependencies beyond the default Expo stack to keep the submission small and easier to run.
- Used Expo EAS cloud build for the APK because the local machine did not have the Android SDK toolchain.
- Switched the EAS Android image to `sdk-54` after the first build attempt failed on Java 11; the successful build used Expo's JDK 17 image.

## Run Instructions

```bash
cd submissions/231118065-pitchsieve/app
npm install
npx expo start
```

Then open the app in Expo Go, on an Android emulator, or on an iOS simulator if available.

## APK Build Instructions

`app-release.apk` **was generated successfully** on April 22, 2026 using Expo EAS cloud build.

Successful cloud build command:

```bash
cd submissions/231118065-pitchsieve/app
npx eas build --platform android --profile submission-apk
```

Notes:

- The local machine still does not have `ANDROID_HOME`, `ANDROID_SDK_ROOT`, `adb`, or `gradle`, so local native compilation was not practical here.
- The working EAS profile is in `app/eas.json` and uses Expo's `sdk-54` Android image.

If you want a local native build on a machine with the Android SDK installed, run:

```bash
cd submissions/231118065-pitchsieve/app
npm install
npx expo prebuild --platform android
cd android
gradlew.bat assembleRelease
```

The APK for this submission is stored at:

```text
submissions/231118065-pitchsieve/app-release.apk
```

## Submission Contents

- `README.md`
- `idea.md`
- `app/`
- `app-release.apk`
