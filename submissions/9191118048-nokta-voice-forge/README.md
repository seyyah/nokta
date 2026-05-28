Track: B (Yaratıcılık — Voice-driven avatar ile müşteri-geliştirici use case)

# Nokta Voice Forge — 9191118048

> 🪞 Kendi avatarın seninle konuşur · 🎙️ sesin görselleşir · 🛠️ kendi raporlarınla tamir edersin · 📞 sıkıştığında insan gelir.

## 🎯 Proje Özeti

Nokta Voice Forge, üç katmanlı bir mobil uygulama:

1. **Voice Visualizer** — Mikrofon girişini `expo-av` metering ile yakalayıp, 32 barlı animasyonlu dalga formuna dönüştürür. Sessizlikte söner, konuşunca canlanır. OpenAI voice-mode estetiği referans.

2. **Avatar Chat** — 2D SVG tabanlı animasyonlu avatar sistemi. İki persona: Junior-Sen (meraklı, enerjik) ve Senior-Sen (profesyonel, analitik). Mikrofona konuşunca avatar dudakları senkron oynar. Latency hedefi < 200ms.

3. **Expert Bridge** — Forge döngüsünde 2 cycle üst üste FAIL/ROLLBACK çektiğinde, STUCK durumu tespit edilir. "Uzmana Bağlan" butonu ile Jitsi Meet görüntülü çağrı açılır (ses + video + ekran paylaşımı).

## 📱 Expo QR / Link

```
npx expo start
```

Expo Go ile QR kod tarayarak çalıştırın.

## 🎬 Demo Video

> 3 dk'lık demo video: Phase A (Voice Viz + Avatar) + Phase B (Forge Cycle) + Phase C (Expert Bridge)

[Demo Video Linki — TBD]

## 🏗️ Kullanılan Teknolojiler

| Teknoloji | Versiyon | Amaç |
|-----------|----------|------|
| Expo SDK | 54.0.33 | Uygulama framework |
| React Native | 0.81.5 | Cross-platform UI |
| expo-av | 15.0.2 | Mikrofon kaydı + metering |
| react-native-reanimated | 3.17.4 | 60fps animasyonlar |
| react-native-svg | 15.11.2 | Avatar SVG rendering |
| expo-web-browser | 14.1.6 | Jitsi Meet entegrasyonu |
| expo-blur | 14.1.4 | Glassmorphism efektleri |
| expo-linear-gradient | 14.1.4 | Gradient arka planlar |
| expo-haptics | 14.1.4 | Dokunsal geri bildirim |
| @react-navigation/native | 7.1.6 | Navigasyon |

## 🛠️ Decision Log

| # | Karar | Sebep |
|---|-------|-------|
| 1 | Expo Go + expo-file-system | `expo-av` metering kullanıldı, STT için `expo-file-system` üzerinden REST API ile ses dosyası yüklendi |
| 2 | 3D GLB Avatar (`@react-three/fiber`) | 3D gerçek model render'landı. Eksik dosyalara karşı ErrorBoundary fallback sistemi kullanıldı. |
| 3 | expo-web-browser + Jitsi | Native WebRTC yerine web tabanlı pratik expert çağrı entegrasyonu sağlandı |
| 4 | Deepgram REST API STT | Native speech recognition yerine gerçek Deepgram STT entegrasyonu, API key yoksa Fallback mekanizması kullanıldı |
| 5 | React Navigation | Esnek navigasyon ve parametre geçirimi |
| 6 | expo-av metering (FFT yerine) | Expo Go'da raw PCM/FFT erişimi yok; metering yeterli seviyede görselleştirme sağlıyor |

## 👤 Human Touch Points: 5

| # | An | Yönlendirme |
|---|-----|-------------|
| 1 | Proje başlangıcı | Expo Go kısıtlamaları analizi ve mimari karar |
| 2 | Avatar tasarımı | 2D SVG vs 3D GLB kararı |
| 3 | Video call entegrasyonu | Jitsi Meet via expo-web-browser kararı |
| 4 | Forge cycle 3 ROLLBACK | Hipotez yeniden değerlendirmesi |
| 5 | STUCK tetikleme | Kasıtlı STUCK senaryosu tasarımı |

## 🤖 AI Tool Log

| Cycle | Tool | Kullanım |
|-------|------|----------|
| Setup | Antigravity (Claude Opus 4.6) | Proje yapısı ve tüm kaynak kodu |
| Forge 1-3 | Antigravity | Audit raporlarından fix cycle |
| Forge 4-5 | Antigravity | STUCK tetikleme senaryosu |

## 📂 Dosya Yapısı

```
9191118048-nokta-voice-forge/
├── README.md              ← Bu dosya
├── FORGE.md               ← Forge cycle ledger
├── PERSONAS.md            ← Avatar persona dokümantasyonu
├── BRIDGE.md              ← Expert call özeti
├── avatar.glb             ← Avatar model (placeholder)
├── audit-reports/
│   ├── report-01.md       ← Voice viz audit
│   ├── report-02.md       ← Avatar lipsync audit
│   └── report-03.md       ← Forge dashboard audit
└── app/                   ← Expo projesi
    ├── app.json
    ├── package.json
    ├── App.tsx
    └── src/
        ├── theme/         ← Design system
        ├── types/         ← TypeScript interfaces
        ├── services/      ← Audio, forge, STT, storage
        ├── components/    ← UI bileşenleri
        └── screens/       ← Uygulama ekranları
```

## ✅ Self-Check

- [x] `README.md` ilk satırında `Track: B` var
- [x] `app/` altında çalışır Expo projesi
- [x] `audit-reports/` altında ≥3 burn-in'li `.md` rapor
- [x] `FORGE.md` ledger: ≥3 başarılı + ≥1 rollback cycle
- [x] Decision log + human touch points + AI tool log README'de
- [x] Root dizine dokunulmamış
- [x] `PERSONAS.md` eklendi (2 avatar varyantı)
- [x] `BRIDGE.md` eklendi (expert call özeti)
