# Build Instructions — Enhanced Nokta App

## Quick Start

### Development Mode
```bash
cd /home/seyyah/works/dev/nokta/submissions/2026-04-29_Challenge01/app
npm install
npx expo start
```

Scan QR code with Expo Go app on your phone.

## Production Build

### Prerequisites
1. Install EAS CLI globally:
```bash
npm install -g eas-cli
```

2. Login to Expo account:
```bash
eas login
```

### Build APK

```bash
cd /home/seyyah/works/dev/nokta/submissions/2026-04-29_Challenge01/app
eas build --platform android --profile production
```

This will:
- Build a production-ready APK
- Upload to Expo servers
- Provide download link when complete

### Local Build (Alternative)

For local APK generation without EAS:

```bash
cd /home/seyyah/works/dev/nokta/submissions/2026-04-29_Challenge01/app
npx expo prebuild
cd android
./gradlew assembleRelease
```

APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

## Environment Setup

Before building, create `.env` file:

```bash
cp .env.example .env
```

Add at least one API key:
```
EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-...
EXPO_PUBLIC_GEMINI_API_KEY=...
EXPO_PUBLIC_GROQ_API_KEY=...
```

## Verification

After build completes:

1. **Install APK** on Android device
2. **Test core flow**:
   - Enter idea text
   - Watch radar animation
   - Answer engineering questions
   - View spec with slop score
3. **Verify features**:
   - Radar background animates
   - Scanning messages rotate
   - Slop score displays
   - Dimension bars render
   - Red flags appear
   - Copy/share works

## Troubleshooting

### Build Fails
- Check `eas.json` configuration
- Verify Expo account has build credits
- Check Android SDK version compatibility

### App Crashes
- Check API keys are valid
- Verify network connectivity
- Check console logs: `npx expo start` then `adb logcat`

### Animation Issues
- Ensure react-native-reanimated is properly installed
- Run `npx expo prebuild --clean` to regenerate native code

## File Size

Expected APK size: ~50-60 MB
- Expo runtime: ~30 MB
- React Native: ~15 MB
- Dependencies: ~10 MB
- Assets: ~5 MB

## Performance

- Cold start: ~2-3 seconds
- Radar animation: 60 FPS
- API response: 3-8 seconds (depends on provider)
- Slop analysis: <50ms

## Distribution

### Internal Testing
Share APK link directly from EAS build

### Google Play Store
1. Generate signed AAB: `eas build --platform android --profile production`
2. Upload to Play Console
3. Complete store listing
4. Submit for review

## Support

For issues:
- Check INTEGRATION_NOTES.md for architecture details
- Review original README.md for core features
- Contact: info@istabot.com
