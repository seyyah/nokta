# Nokta Cleaner — AI Note Migration & Deduplication

**Student ID:** 231118057
**Track:** C — Mobile App

---

## APK (Android)

[Download APK](https://expo.dev/accounts/cubukcu/projects/expo-template-blank/builds/e38dc81b-9786-439e-989f-dc36d8ab847b)

Telefonda tarayıcıyla aç → İndir → Yükle (bilinmeyen kaynaklara izin ver).

---

## What It Does

Dağınık notları (WhatsApp export, bullet point karışıklığı, toplantı notları) yapıştır — Gemini AI temizler, tekrar edenleri birleştirir ve kategorize eder. Uzman, çıkan kartları inceleyip onaylar, reddeder, düzenler.

---

## Features

### AI Processing
- Gemini AI ile not temizleme, tekrar giderme, kategorizasyon (Technical / Business / Design / Other)
- Model fallback zinciri: `gemini-flash-lite-latest` → `gemini-2.5-flash` → `gemini-2.0-flash`

### Human-in-the-Loop (Uzman Desteği)
- **Approve / Reject** — her kart için onay/red, renkli border + badge
- **Bulk Approve All / Reject All** — toplu işlem
- **Inline Edit** — başlık, açıklama, kategori düzenleme
- **Expert Note** — karta uzman notu ekleme
- **Manual Card Addition** — AI'dan bağımsız kart ekleme
- **Re-analyze Rejected** — reddedilen kartları AI'a yeniden gönder
- **Export Approved** — onaylanan kartları kopyala (not + etiket + atanan kişi ile)

### Expert Workflow
- **Priority** — High / Medium / Low badge, görsel öncelik göstergesi
- **Assignee** — her karta `@isim` atama
- **Tags** — serbest etiket ekleme/çıkarma, aramada taranır
- **Card Linking** — ilişkili kartları birbirine bağlama
- **Session Report** — canlı özet: durum, kategori, öncelik, atanan kişiler, etiketler + Export Full Report

### UX
- **Dark Mode** — tam tema desteği
- **Search** — başlık, açıklama, etiket, atanan kişiye göre arama
- **Category Filter** — All / Technical / Business / Design / Other
- **Session History** — son 5 analiz otomatik kaydedilir, tek tıkla geri yükle
- **Card Reorder** — ↑ ↓ butonları ile sıralama
- Web + Android desteği (Expo)

---

## Run Locally

```bash
cd app
cp .env.example .env
# .env içine EXPO_PUBLIC_GEMINI_API_KEY değerini yaz
npm install
npx expo start --web      # Web
npx expo start --android  # Android (Expo Go)
```

Gemini API key: [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

---

## Tech Stack

- React Native + Expo (SDK 54)
- NativeWind (Tailwind CSS)
- Google Gemini AI (`@google/generative-ai`)
- expo-clipboard
