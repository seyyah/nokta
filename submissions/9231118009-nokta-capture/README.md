# 💩 Slop Dedektörü

**Öğrenci No:** 9231118009  
**Slug:** nokta-capture  
**Track:** B — Yaratıcılık (IDEA.md + feature pitch)

---

## Ne Yapıyor?

Startup pitch paragrafını yapıştır → AI 5 boyutta analiz eder → **Slop Score (0–100)** + detaylı gerekçe + iyileştirme önerileri üretir.

Human Loop Spectrum entegrasyonu:
- **HOOTL** — AI otonom analiz eder
- **HOTL** — Kullanıcı sonucu onaylar veya reddeder
- **HITL** — Kullanıcı skoru manuel düzenler

**nokta-audit** entegrasyonu ile her ekranda 🐛 FAB'ına basarak bug raporu üretilebilir. Bu raporlar `FORGE.md` döngüsünde coding agent'a input olarak verildi.

---

## Demo

- **Expo QR / Update:** https://expo.dev/accounts/mrcyberexe/projects/slop-dedektoru/updates/99fb6569-5fbb-4ebb-bd49-0b2af98f5e8e
- **Demo Video (60sn):** https://youtube.com/shorts/7lNcCJ6SNk8?feature=share
- **APK:** https://expo.dev/accounts/mrcyberexe/projects/slop-dedektoru/builds


---

## Kurulum & Çalıştırma

```bash
cd app
npm install
npx expo start
```

Uygulama açıldığında:
1. 🔑 API Key butonuna tıkla → Anthropic API key'ini gir
2. Pitch paragrafını yapıştır (veya örnek seç)
3. "Analiz Et" butonuna bas
4. HOTL onay ekranında onayla veya HITL ile düzenle
5. 🐛 FAB ile bug raporu üret

---

## Dosya Yapısı

```
submissions/9231118009-nokta-capture/
├── README.md          ← bu dosya
├── idea.md            ← Track 2 fikir detayı
├── IDEA.md            ← Track B feature pitch (Pitch Coach Modu)
├── FORGE.md           ← Phase B onarım döngüsü logu
├── reports/           ← Phase A nokta-audit bug raporları
│   ├── report-01-input-screen.md
│   ├── report-02-results-screen.md
│   └── report-03-hotl-screen.md
└── app/
    ├── App.js          ← ana uygulama + AuditWidget entegrasyonu
    ├── auditStorage.js ← AsyncStorage adaptörü
    ├── app.json
    ├── eas.json
    └── package.json
```

---

## Tech Stack

- **React Native + Expo**
- **Anthropic Claude API** (claude-sonnet-4-20250514)
- **@xtatistix/mobile-audit** — nokta-audit widget
- **react-native-view-shot** — ekran yakalama
- **expo-file-system + expo-sharing** — dosya yazma ve paylaşım
- **@react-native-async-storage/async-storage** — not depolama

---

## Decision Log

| Karar | Neden |
|-------|-------|
| Track B seçildi | IDEA.md + feature pitch en uygun akış |
| Expo blank template | Minimum bağımlılık, hızlı geliştirme |
| Client-side API çağrısı | Demo amaçlı; production'da backend proxy kullanılmalı |
| Dark theme | Slop dedektörü konseptine uygun edgy estetik |
| 5 boyutlu analiz | Tek sayıdan daha anlamlı ve öğretici |
| HOTL/HITL katmanı | Hoca'nın Human Loop Spectrum framework'ü |
| nokta-audit entegrasyonu | Phase A — bug raporlama + Phase B forge döngüsü için input |
| FORGE.md | 3 COMMIT + 1 ROLLBACK döngüsü logu |