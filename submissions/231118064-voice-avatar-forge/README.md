# Nokta Final — Voice Avatar Forge

**Student No:** 231118064
**Slug:** voice-avatar-forge
**Track:** Track 1 — Voice visualizer akıcılığı + lipsync senkronu

Bu proje mikrofon sesini görselleştirir, kişisel GLB avatarı ses seviyesiyle konuşturur, voice-dictated audit raporlarıyla forge cycle yürütür ve STUCK durumunda uzman görüşmesi açar.

## Özellikler

- Expo microphone capture
- RMS metering
- Voice visualizer
- Avaturn personal avatar
- React-three-fiber avatar scene
- Audio-level based lipsync fallback
- AuditWidget
- Forge cycles
- STUCK detection
- Jitsi expert bridge

## Kurulum

```bash
cd "C:\Users\balka\OneDrive\Masaüstü\Mug\nokta\submissions\231118064-voice-avatar-forge\app"
npm install
npx expo start
```

## Avatar Asset Status

The app is prepared to load:

app/assets/avatar.glb

Before final PR, the real Avaturn personal avatar must be exported and placed at this path. A placeholder or generic head model is not acceptable.

## Lipsync Implementation Note

This prototype uses low-latency audio-level based mouth animation as a reliable fallback for Track 1. The implementation searches common GLB morph target keys such as mouthOpen, jawOpen and viseme_aa. If the exported Avaturn model exposes compatible morph targets, the avatar mouth is animated from the microphone audio level.

A full phoneme-timed viseme pipeline is documented as a next iteration, but the current implementation prioritizes smooth visual feedback and low latency for the final demo.

## Demo Flow

### Phase A — Voice Visualizer
Mikrofon başlatılır, konuşunca barlar canlanır, sessizlikte söner.

### Phase B — Avatar Lipsync
Kişisel avatar sahnede gösterilir. Ses seviyesi avatarın ağız hareketine bağlanır.

### Phase C — Forge + Expert Bridge
Üç burn-in raporu ve forge cycle’ları gösterilir. STUCK cycle sonrası “Uzmana Bağlan” butonu ile Jitsi görüşmesi açılır.

## Demo Video

Final demo video must be around 3 minutes and include:

1. Phase A — Microphone voice visualizer
2. Phase B — Avatar lipsync
3. Phase C — Forge cycles and Expert Bridge
4. 60+ seconds Jitsi expert call with audio, video and screen sharing

Demo Video Link:
[https://www.youtube.com/shorts/oEbr0Gi1GRc](https://www.youtube.com/shorts/oEbr0Gi1GRc)

## Final Submission Checklist

- [x] App folder prepared
- [x] expo-av microphone capture implemented
- [x] Audio metering normalized to 0–1
- [x] Voice visualizer implemented
- [x] Avatar scene prepared with react-three-fiber
- [x] Audio-level lipsync fallback implemented
- [x] AuditWidget includes 3 burn-in reports
- [x] FORGE.md includes 2 SUCCESS + 1 ROLLBACK + 1 STUCK
- [x] Expert Bridge opens Jitsi room
- [x] BRIDGE.md template prepared
- [ ] Real Avaturn avatar.glb must be added to app/assets/avatar.glb
- [x] APK must be generated before PR
- [x] Demo video link must be added after recording
- [ ] BRIDGE.md post-demo call summary must be updated after the real call

## APK Build Status

APK file is not committed yet. It must be generated before final submission.

Expected APK output after EAS build:

EAS dashboard artifact link or local downloaded APK file.

Recommended final APK name:

231118064-voice-avatar-forge.apk

```bash
cd "C:\Users\balka\OneDrive\Masaüstü\Mug\nokta\submissions\231118064-voice-avatar-forge\app"
npm install
npx eas build -p android --profile preview
```

After the APK is generated, add the APK link or file path here:

APK Link / File:
[https://expo.dev/artifacts/eas/emzUMZ1Jrumvs4J8eZrPmE.apk](https://expo.dev/artifacts/eas/emzUMZ1Jrumvs4J8eZrPmE.apk)
