# Spec Architect — 241478088 Abdulkahhar

**Track: A — Dot Capture & Enrich**

Ham fikirleri AI yardımıyla profesyonel mühendislik şartnamelerine dönüştüren React Native (Expo) uygulaması.

---

## Track Seçimi

**Track A — Dot Capture & Enrich**

Uygulama ham fikri metin veya ses yoluyla alır, Problem/Kullanıcı/Kapsam/Kısıtlar odaklı 3-5 soru sorar ve ardından kapsamlı bir Markdown spec sheet üretir.

---

## Expo QR / Link

`app/` klasöründe `npx expo start` çalıştır → terminaldeki QR kodu Expo Go ile tara.

**Public Link:** _(publish sonrası eklenecek)_

---

## Demo Video

**Link:** _(60 sn video kaydedilecek)_

---

## Karar Günlüğü

| Tarih | Karar | Gerekçe |
|-------|-------|---------|
| 2026-04-20 | Track A seçildi | Nokta tezinin özü: fikir → spec dönüşümü |
| 2026-04-20 | Gemini 2.0 Flash | Hızlı, ücretsiz kota, prototip için ideal |
| 2026-04-20 | Demo modu eklendi | API key olmadan tüm akış test edilebilir |
| 2026-04-20 | react-native-markdown-display | Tablo desteği olan en güvenilir MD renderer |
| 2026-04-20 | Stack navigator | Doğrusal akış (Fikir→Soru→Spec) stack'e uygun |
| 2026-04-20 | Koyu mor tema | Mühendislik aracı estetiği, benzersiz görünüm |
| 2026-04-20 | expo-av ses kaydı | Expo ekosistemiyle entegre, native config gerektirmez |
| 2026-04-20 | EXPO_PUBLIC_ prefix | Expo'nun managed workflow için önerilen env yöntemi |
| 2026-04-20 | Antigravity AI ile geliştirme | Birincil kod üretim aracı |

---

## Mimari

```
app/
├── App.js                 # Stack Navigator (Home→Questions→SpecSheet)
├── app.json               # Expo config + mikrofon izinleri
├── .env                   # API anahtarları
└── src/
    ├── config/index.js    # Merkezi config
    ├── theme/index.js     # Tasarım token'ları
    ├── services/
    │   ├── aiService.js   # Gemini / OpenAI + Demo modu
    │   └── audioService.js # expo-av kayıt + izin
    └── screens/
        ├── HomeScreen.js      # Çift giriş: metin + ses
        ├── QuestionsScreen.js # AI soruları + progress bar
        └── SpecSheetScreen.js # Markdown spec + paylaş
```

---

## Çalıştırma

```bash
cd submissions/241478088-spec-architect-Abdulkahhar/app
# .env dosyasına Gemini API anahtarını ekle
npx expo start
```

> API anahtarı olmadan uygulama **Demo Modunda** çalışır.
