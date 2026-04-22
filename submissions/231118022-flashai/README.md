# FlashAI — Sınav Flashcard Üreteci

**Öğrenci No:** 231118022  
**Slug:** flashai  
**Klasör:** `submissions/231118022-flashai/`

---

## Track Seçimi

**Track 1 — Ham fikir → Engineering sorular → Tek sayfa spec**

Ham fikri (metin) alır, AI ile 5 engineering sorusu sorar (problem, user, scope, constraint, success) ve tek sayfa spec üretir.

---

## Uygulama

FlashAI, üniversite öğrencilerinin ders notlarını veya PDF dosyalarını yükleyerek otomatik flashcard seti oluşturmasını sağlayan bir mobil uygulamadır. Anthropic Claude API kullanılarak saniyeler içinde soru-cevap kartları üretilir.

### Özellikler
- Metin yapıştır veya PDF yükle (metin bazlı)
- AI ile otomatik Q&A flashcard üretimi (Claude Sonnet)
- Kart çevirme animasyonu (soru ↔ cevap)
- İlerleme çubuğu
- Kart sayısı seçimi (5 / 10 / 20)
- Tek kart için "Yeniden Üret" butonu
- AsyncStorage ile lokal kart kaydetme (max 10 set)
- API anahtarı güvenli saklama (AsyncStorage)

---

## Demo

- **Expo QR:** _[Expo Go ile çalıştırın: `npx expo start` → QR taratın]_
- **Demo Video (60 sn):** _[Video linki — EAS build sonrası eklenecek]_
- **APK:** `app-release.apk` — EAS Preview build ile üretilir (bkz. Kurulum)

---

## Kurulum & Çalıştırma

```bash
# 1. app/ klasörüne gir
cd app

# 2. Bağımlılıkları yükle
npm install

# 3. API anahtarını ayarla
cp .env.example .env
# .env dosyasını aç, EXPO_PUBLIC_ANTHROPIC_KEY=sk-ant-... satırını doldur
# (Ya da uygulamayı açınca 🔑 butonuna bas, uygulama içi gir)

# 4. Başlat
npx expo start
```

### APK Üretimi (EAS)
```bash
# EAS CLI kur
npm install -g eas-cli

# Giriş yap
eas login

# APK build (preview profili)
eas build --platform android --profile preview
```

---

## Decision Log

| Tarih | Karar | Gerekçe |
|-------|-------|---------|
| 2025-04-22 | Track 1 seçildi | Ham fikirden spec üretme akışı en net öğrenme çıktısı sunuyor |
| 2025-04-22 | Expo seçildi | Hızlı prototip + APK üretimi için en uygun araç |
| 2025-04-22 | Anthropic Claude API | Türkçe metin kalitesi ve JSON output güvenilirliği |
| 2025-04-22 | PDF scope kısıtlandı | Sadece metin bazlı PDF; görsel OCR MVP dışı bırakıldı |
| 2025-04-22 | Offline mod yok | API bağımlılığı MVP için kabul edilebilir trade-off |
| 2025-04-22 | API key AsyncStorage | `EXPO_PUBLIC_` env var veya uygulama içi güvenli giriş |
| 2025-04-22 | Progress bar eklendi | UX: kullanıcı kart ilerlemesini görsel takip eder |
| 2025-04-22 | Yeniden üret butonu | Kullanıcı düşük kaliteli kartı tek tıkla yenileyebilir |
| 2025-04-22 | Kaydetme özelliği | AsyncStorage ile max 10 kart seti kalıcı saklanır |

---

## Stack

- **Framework:** Expo 52 (React Native 0.76)
- **AI:** Anthropic Claude API (`claude-sonnet-4-20250514`)
- **PDF:** `expo-document-picker` + `expo-file-system`
- **Storage:** `@react-native-async-storage/async-storage`

---

## Klasör Yapısı

```
submissions/231118022-flashai/
├── README.md              ← bu dosya
├── idea.md                ← Track 1 spec (engineering sorular + tek sayfa spec)
├── app/
│   ├── App.js             ← Ana uygulama (tüm ekranlar tek dosyada)
│   ├── package.json
│   ├── app.json           ← Expo config
│   ├── eas.json           ← EAS build profilleri
│   ├── babel.config.js
│   ├── .env.example       ← API key şablonu
│   └── .gitignore
└── app-release.apk        ← EAS Preview build çıktısı (build sonrası ekle)
```
