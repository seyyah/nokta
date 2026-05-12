# Nokta — Dot Capture & Enrich

**Öğrenci:** İpek Balkız · 231118087
**Track:** A — Dot Capture & Enrich

---

## Demo

> 📱 **APK:** `app-release.apk` (bu klasörde)

---

## Track Seçimi

**Track A — Dot Capture & Enrich** seçildi.

**Gerekçe:** NOKTA'nın ana tezini en doğrudan implemente eden track bu.
Ham fikir (nokta) girer → engineering sorularıyla zenginleşir → spec (sayfa) çıkar.
Diğer track'lere kıyasla daha net bir kullanıcı akışı ve daha az belirsiz scope.

---

## Uygulama Nasıl Çalışır

1. Kullanıcı ham fikrini yazar
2. Claude AI 4 engineering sorusu sorar (problem, user, scope, constraint)
3. Kullanıcı cevaplar
4. Claude tek sayfalık ürün spesifikasyonu üretir

---

## Kurulum & Çalıştırma

```bash
cd app
npm install
npx react-native run-android
```

**Gereksinimler:**
- Node.js 18+
- React Native CLI
- Android SDK / emülatör veya fiziksel cihaz

**Not:** Bu proje React Native CLI ile geliştirilmiştir (Expo değil).

---

## APK Build

```bash
cd app/android
./gradlew assembleRelease
# APK: android/app/build/outputs/apk/release/app-release.apk
```

---

## Kullanılan AI Araçlar

| Araç | Kullanım |
|------|----------|
| Claude (claude.ai) | Uygulama kodu üretimi, spec yazımı |
| Anthropic API | Runtime — soru üretme + spec oluşturma |

---

## Decision Log

| Karar | Gerekçe |
|-------|---------|
| Track A seçimi | En net akış, NOKTA tezini doğrudan implemente ediyor |
| React Native CLI (Expo değil) | Daha önce CLI deneyimi var, APK build daha kolay |
| 4 soru (3-5 arası) | 3 az geldi, 5 uzun hissettiriyor — 4 ideal |
| Dark tema | NOKTA branding ile uyumlu |
| Claude claude-sonnet-4-20250514 | En güncel, kaliteli soru ve spec üretiyor |

---

## Dosya Yapısı

```
231118087-dot-capture/
├── README.md          ← bu dosya
├── idea.md            ← Track A fikir dosyası
├── app/               ← React Native CLI projesi
│   ├── App.tsx        ← ana uygulama
│   ├── package.json
│   └── ...
└── app-release.apk    ← Android APK
```

---

*NOKTA · NAIM Ecosystem · Track A · 231118087*