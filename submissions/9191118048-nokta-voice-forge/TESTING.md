# Device Test Runbook - 2026-06-15

## Temiz Baslangic

```powershell
cd app
npm install
npm run check:avatar
npx expo start --clear
```

Expo Go uygulamasini tamamen kapatip yeni QR kodunu okut.

## Phase A - Voice ve Avatar

1. `Dijital Ikiz` ekranini ac.
2. Avatarin dokulu, bas-govde kadrajinda ve Standing Idle pozunda gorundugunu kontrol et.
3. Mikrofon dugmesine basili tutarak konus; parmagini kaldirinca kaydin bittigini kontrol et.
4. Ekranda `DUSUNUYOR`, sonra `KONUSUYOR` durumunu gor.
5. Barlarin kullanici sesiyle; dudak, goz ve ellerin avatar yaniti sirasinda tepki verdigini kontrol et.
6. Anlasilan kullanici metninin ve Senior-Sen yanitinin panelde gorundugunu kontrol et.
7. Yanit sesinin erkek Gemini TTS (`Charon`) sesi oldugunu kontrol et.
8. `Voice Lab` ekraninda bir kayit olustur ve STT raporunun Audit ekranina dustugunu kontrol et.

Gercek sohbet testi icin `app/.env` icinde Gemini anahtari; fallback akislar icin
Deepgram ve OpenAI anahtarlari bulunmalidir. Gemini TTS icin `EXPO_PUBLIC_GEMINI_TTS_VOICE=Charon`
kullanilir.

## Phase B - Forge

1. `Audit` ekraninda en az uc raporu goruntule.
2. `Forge` ekraninda SUCCESS, ROLLBACK ve STUCK cycle'larini kontrol et.
3. STUCK banner'indan Expert Bridge ekranini ac.

## Phase C - Expert Bridge

1. Jitsi gorusmesini baslat.
2. Ikinci cihaz veya sinif arkadasi ile ses, video ve ekran paylasimini test et.
3. Gorusme ozetini kaydet.
4. Yeni Forge cycle baslat ve Bridge context'inin hipoteze eklendigini kontrol et.

## Build Kontrolleri

```powershell
npx tsc --noEmit
npx expo-doctor
npx expo export --platform ios
npx expo export --platform android
```

APK icin:

```powershell
npx eas build --platform android --profile preview
```

Lokal release build kaniti:

- Paket: `com.nokta.voiceforge`
- APK: `../nokta-voice-forge-9191118048.apk`
- SHA-256: `38CDE6D5AED00C10C2494FB55BE3334E432327948AC4387768CD760DC81ED11C`
