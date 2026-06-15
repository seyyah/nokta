# 231118066 — forge-app (Final Hafta)

**Track A — Sadelik (Drop-in Discipline)**
Öğrenci No: `231118066`

---

## Demo Video

🎬 **[Demo Video — Phase A + B + C](https://www.youtube.com/watch?v=jHfM2VTH_Wc)**

---

## Expo / APK

📱 **Expo Go:** [exp://172.20.10.2:8081](exp://172.20.10.2:8081)

📦 **APK:** `app-release.apk` (submissions klasöründe mevcut)

---

## Proje Yapısı

```
231118066-forge-app/
├── app/
│   ├── App.tsx
│   ├── app.json
│   ├── eas.json
│   ├── app-release.apk
│   ├── assets/
│   │   └── avatar.glb          ← avaturn.me ile kendi yüzümden üretildi
│   └── src/
│       ├── audit/
│       │   └── AuditWidget.tsx  ← drop-in widget (sıfır coupling)
│       └── screens/
│           ├── HomeScreen.tsx
│           ├── TasksScreen.tsx
│           ├── SettingsScreen.tsx
│           ├── VoiceScreen.tsx      ← Phase A: ses görselleştirici
│           ├── AvatarScreen.tsx     ← Phase B: avatar + lipsync
│           └── ExpertCallScreen.tsx ← Phase C: Jitsi WebRTC
├── reports/
│   ├── voice-viz.md
│   ├── avatar-glb.md
│   └── expert-call-ux.md
├── avatar.glb
├── app-release.apk
├── FORGE.md      ← 8 cycle ledger
├── BRIDGE.md     ← uzman görüşme özeti
├── PERSONAS.md   ← Junior-Sen / Senior-Sen dokümantasyonu
└── README.md
```

---

## Phase A — Ses Görselleştirici

- Mikrofon girişi `expo-audio` ile yakalanır (native) / Web Audio API (web)
- RMS değeri: `clamp((db + 60) / 60, 0, 1)`
- 28 bar `Animated.spring` ile güncellenir (<80ms latency)
- Sessizlikte söner, konuşunca canlanır

## Phase B — Avatar + Lipsync

- `avaturn.me` ile kendi yüzümden üretilen `.glb` dosyası (`avatar.glb`)
- 2D animasyonlu yüz: göz kırpma, kafa sallama, ağız açılma
- `expo-speech` ile Türkçe TTS (tr-TR)
- **Junior-Sen** (pitch: 0.9, rate: 0.8) — destekleyici, yavaş
- **Senior-Sen** (pitch: 1.3, rate: 1.1) — doğrudan, hızlı

## Phase C — Uzman Görüntülü Çağrı

- FORGE döngüsünde 2 ardışık FAIL/ROLLBACK → `ExpertCallScreen` otomatik açılır
- Jitsi Meet: `meet.jit.si/forge-audit-231118066`
- Ekran paylaşımı + ses + video
- Görüşme özeti `BRIDGE.md`'ye kaydedilir

---

## FORGE Özeti

| Hafta | Başarılı | Rollback | STUCK | Expert Call | kg |
|-------|----------|----------|-------|-------------|-----|
| 1-2   | 3        | 1        | 0     | 0           | 4   |
| Final | 2        | 2        | 1     | 1           | 4   |
| Toplam| 5        | 3        | 1     | 1           | 8   |

Detaylar: [`FORGE.md`](./FORGE.md)

---

## Kurulum

```bash
cd app
npm install
npm start
```

## AI Tool Log

Claude (claude.ai) — kod üretimi, dosya yapısı, git komutları, FORGE döngüsü simülasyonu
