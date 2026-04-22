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

**QR Kod:**
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█ ▄▄▄▄▄ █ ██▀▀▀ ▄▄█▄▀▀█ ▄▄▄▄▄ █
█ █   █ █  ▀█ ▀  ▀▄  ▄█ █   █ █
█ █▄▄▄█ █▀  █▄▄▀▄▄█▄▀██ █▄▄▄█ █
█▄▄▄▄▄▄▄█▄█ ▀▄█▄█▄▀▄█▄█▄▄▄▄▄▄▄█
█▄▄▀█▄ ▄▀▀█▄█▄▀▀ █▄▄█▄▀▀ ▀ ▄  █
█▀██ ▄█▄▄▄ ▄█▀█    ▀█▄▄▀███▄  █
█  ▀█▄▀▄▄ ▀▀▄▀▀▀▀   ▄▄█▀▀▀▄█▀▀█
█▀▄ █▀█▄▀▀ ▀ ▄▄▀    ███▀█▀▄▄▀ █
█▀█▄▀ ▀▄ ▀█▀█▄▀█   ▄█▄▀▀█▀▄█▀ █
███ ▀▄▄▄█ ▄ █▀█▄ █ █▀▄▄  █ ▄█ █
█▄▄████▄█ █ ▄▀▄ ▀▀▄▄  ▄▄▄  █▄▀█
█ ▄▄▄▄▄ █▀█  ▄ ▄▄▄ █  █▄█ █▄█ █
█ █   █ █▄█▄█▄ ▀ █ ▄ ▄ ▄ ▄▄██ █
█ █▄▄▄█ █▀▄▄█▀█▀ ▀ █▄ █▀ █ █  █
█▄▄▄▄▄▄▄█▄▄▄▄█▄▄█▄▄▄█▄▄█▄█▄█▄██

**Public Link:** exp://j-l0-ey-1unchained1-8081.exp.direct

---

## Demo Video

**Link:** [YouTube Demo Video](https://youtu.be/Qb20Qi34pT4)

---

## Karar Günlüğü

| Tarih | Karar | Gerekçe |
|-------|-------|---------|
| 2026-04-20 | Track A seçildi | Nokta tezinin özü: fikir → spec dönüşümü |
| 2026-04-22 | Groq API'ye Geçildi | Gemini API kota limiti sorunu nedeniyle, LLaMA-3 destekli yüksek hızlı ve ücretsiz Groq API entegre edildi. Ses işleme için Whisper-Large kullanıldı. |
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


