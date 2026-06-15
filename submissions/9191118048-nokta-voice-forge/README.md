Track: B (Yaraticilik - voice-driven avatar ve persona deneyimi)

# Nokta Voice Forge - 9191118048

Nokta Voice Forge; gercek zamanli ses gorsellestirme, kullanicinin kendi yuzunden uretilen 3D avatar, voice-to-audit Forge dongusu ve STUCK durumunda Expert Bridge akisini tek Expo uygulamasinda birlestirir.

## Son Durum

### Phase A - Voice Visualizer ve Avatar

- Mikrofon `expo-audio` metering ile izlenir; 32 barli gorsellestirme sessizlikte soner, konusmada canlanir.
- Mikrofon dugmesi push-to-talk calisir: basili tutunca kayit baslar, parmak kaldirilinca kayit biter.
- `avatar.glb`, kullanicinin kendi yuzunden uretilmis modeldir.
- Runtime model 72 facial morph target icerir: `jawOpen`, `mouthOpen`, ARKit blink hedefleri ve viseme hedefleri.
- Avatar yanit verirken dudak, goz, bas ve el hareketleri birlikte calisir.
- Varsayilan poz `Standing Idle`; kamera kadraji bas-govde odaklidir.
- Konusma akisi Gemini audio understanding veya Deepgram/OpenAI STT, OpenAI/Gemini cevap ve Gemini erkek TTS (`Charon`) ile calisir.
- `<200ms` hedefi mikrofon girdisinin visualizer/avatar tepki suresidir. Bulut STT + LLM + TTS turu ag gecikmesine baglidir.

### Phase B - Audit ve Forge

- Voice Lab kaydi STT ile metne cevrilir ve Markdown audit raporu olarak saklanir.
- `audit-reports/` altinda 3 burn-in raporu bulunur.
- Forge state machine: `READ -> LOCATE -> HYPOTHESIZE -> REPAIR -> TEST -> VERIFY -> COMMIT/ROLLBACK`.
- Iki ardisik `FAIL`, `ROLLBACK` veya `STUCK` sonucu Expert Bridge tetigini acar.
- Bridge context sonraki cycle hipotezine otomatik eklenir.

### Phase C - Expert Bridge

- Uygulama icinden Jitsi odasi acilir.
- Jitsi uzerinden ses, video ve ekran paylasimi kullanilabilir.
- Gercek uzman gorusmesi ve otomatik transkripsiyon kaniti kullanici tarafindan demo kaydinda tamamlanmalidir; mevcut repoda bu adim senaryo olarak dokumante edilmistir.

## Calistirma

```powershell
cd app
npm ci
npm run check:avatar
npx expo start --clear
```

`app/.env.example` dosyasini `app/.env` olarak kopyalayip gerekli anahtarlari ekleyin. `EXPO_PUBLIC_*` degerleri istemci paketinde gorulebilir; production icin backend proxy kullanilmalidir.

## API Akisi

| Islev | Birincil | Fallback |
|---|---|---|
| Avatar audio understanding | Gemini multimodal audio | Deepgram/OpenAI STT |
| Metin cevabi | Gemini veya OpenAI Responses API | Gemini |
| Erkek sesli yanit | Gemini TTS, `Charon` | Cihaz TTS |
| Expert Bridge | Jitsi Meet | - |

## Teslim Dosyalari

| Dosya | Durum | Not |
|---|---|---|
| `avatar.glb` | Hazir | Kendi yuz modeli, SHA-256 `5ECDAD20...C70AE9` |
| `FORGE.md` | Hazir | Son runtime recovery ve APK cycle'lari dahil |
| `PERSONAS.md` | Hazir | Junior-Sen ve Senior-Sen davranis farklari |
| `BRIDGE.md` | Hazir | Tetik ve entegrasyon dokumani; gercek gorusme kaniti bekliyor |
| `demo-video.MOV` | Mevcut | Yaklasik 1:57; 3 dakikalik Phase A+B+C kaydi ile yenilenmeli |
| `nokta-voice-forge-9191118048.apk` | Hazir | Android release APK, 41.59 MB |

## Teknoloji

- Expo SDK 54 / React Native 0.81
- `expo-audio`, `expo-file-system`, `expo-gl`
- `@react-three/fiber`, Three.js, Meshopt
- React Native Reanimated 4 / Worklets
- Deepgram, OpenAI Responses API, Gemini multimodal + TTS
- Jitsi via `expo-web-browser`

## Karar Kaydi

1. Expo Go raw PCM/FFT sinirlari nedeniyle visualizer icin 80ms metering kullanildi.
2. GLB'nin gomulu texture'lari Expo GL icin cache-local GLTF + BIN + texture dosyalarina acildi.
3. Meshopt decoder yuklemeden once GLTFLoader'a baglandi.
4. Morph target bulunan model ile fallback agiz dairesi kaldirildi; gercek viseme/jaw/blink binding kullanildi.
5. Avatar yanit sesi icin cihazdaki degisken TTS yerine Gemini erkek TTS tercih edildi.
6. APK, Windows path-length sorununu asmak icin kisa fiziksel build path'inde `arm64-v8a` release olarak uretildi.

## Dogrulama

```powershell
npx tsc --noEmit
npx expo-doctor
npm run check:avatar
```

APK:

- Paket: `com.nokta.voiceforge`
- Min SDK: 24
- Target SDK: 36
- Imza: APK Signature Scheme v2
- SHA-256: `38CDE6D5AED00C10C2494FB55BE3334E432327948AC4387768CD760DC81ED11C`

## Teslim Oncesi Manuel Kontrol

- [x] Kendi yuzunden `avatar.glb`
- [x] Gercek viseme, jaw ve blink hedefleri
- [x] 3 burn-in audit raporu
- [x] En az 2 SUCCESS ve 1 ROLLBACK Forge cycle
- [x] STUCK heuristigi ve Expert Bridge butonu
- [x] APK
- [ ] Gercek uzmanla en az 60 saniye ses + video + ekran paylasimi
- [ ] Bu gorusmenin gercek transkripsiyonu ile `BRIDGE.md` guncellemesi
- [ ] Phase A + B + C iceren yaklasik 3 dakikalik final demo videosu
