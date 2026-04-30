# Nokta Away Mission — 231118021 / Esra Musul

> **Track A — Dot Capture & Enrich**

---

## 🎯 Track Seçimi

**Track A — Dot Capture & Enrich** seçildi.

Ham fikir (text input) → AI mühendislik mülakatı (3 soru: Problem, Kullanıcı, Kapsam) → Tek sayfalık profesyonel product spec üretimi.

### Ana Akış (Eksiksiz)

```
[Kullanıcı fikir girer]
        ↓
[AI 3 mühendislik sorusu üretir]   ← generateEngineeringQuestions()
        ↓
[Kullanıcı her soruyu yanıtlar]    ← InterviewScreen (soru soru)
        ↓
[AI yanıtları birleştirip Spec üretir] ← generateFinalSpec()
        ↓
[Markdown formatında Product Spec gösterilir + paylaşılabilir]
```

---

## 📱 Expo Bağlantısı

**Yerel başlatma:**
```bash
cd submissions/231118021-nokta-vision/app
npm install
npx expo start
```

**Expo QR / Preview Linki:**
> `exp://172.20.10.3:8081`

---

## 🎬 Demo Video

| Alan | Link |
|------|------|
| 60 sn Demo Video | https://youtube.com/shorts/gFwZ1mliaJ0?feature=share |
| **Android APK** | `app-release.apk` (Root dizininde mevcut) |

---

## 🛠️ Teknik Yığın

| Katman | Teknoloji |
|--------|-----------|
| Framework | React Native + Expo (v54.0.33) |
| Architecture | **New Architecture (React Native 0.81.5 / React 19)** |
| Routing | Expo Router (file-based) |
| AI Servisi | OpenRouter API → `google/gemma-3-27b-it:free` |
| Animasyon | React Native Reanimated v3 (Worklets enabled) |
| UI | LinearGradient, Glassmorphism, Custom Markdown renderer |

---

## 📋 Karar Günlüğü (Decision Log)

| Saat | Karar | Gerekçe |
|------|-------|---------|
| 10:09 | Track A seçildi | Nokta'nın çekirdek değer önerisi "slop-free ideation" ile en doğrudan örtüşüyor |
| 10:15 | Expo Router kullanıldı | File-based routing ile 3 ekran (index → interview → result) hızlı kuruldu |
| 10:30 | Gemini API → OpenRouter değiştirildi | Gemini v1beta 404 hatası verdi; `gemini-2.0-flash` model adı API'de mevcut değildi. OpenRouter ücretsiz ve stabil alternatif sundu |
| 10:45 | `google/gemma-3-27b-it:free` seçildi | `meta-llama/llama-3.1-8b` ve `deepseek/deepseek-r1` endpoint bulunamadı; gemma-3-27b aktif ve güçlü bir model |
| 11:00 | Retry logic eklendi | Ücretsiz modeller zaman zaman 429 dönüyor; 15/30/45s backoff ile otomatik yeniden deneme sağlandı |
| 11:10 | Türkçe prompt | Kullanıcı deneyimini lokalize etmek için prompt dili Türkçe'ye alındı |
| 11:15 | Custom Markdown renderer yazıldı | React Native'de `react-native-markdown` yerine sıfırdan renderer — `##`, `-`, `**` parse edilip stilize native component olarak render ediliyor |

---

## ✨ Özellikler

- **AI Mühendislik Mülakatı** — 3 kritik soruyla fikri derine inen yapılandırılmış akış
- **Akıllı Retry** — Rate limit'te otomatik bekleme + yeniden deneme
- **Türkçe Deneyim** — Tüm sorular ve spec çıktısı Türkçe
- **Premium UI** — Glow efektleri, glassmorphism kartlar, slide animasyonları
- **Paylaş** — Üretilen spec anında Share API ile paylaşılabilir
- **Custom Markdown** — `##`, bullet, kalın metin native olarak stilize render

---

## 📁 Klasör Yapısı

```
231118021-nokta-vision/
├── README.md          ← bu dosya
├── idea.md            ← track için özelleşmiş fikir dosyası
└── app/               ← Expo projesi
    ├── app/
    │   ├── _layout.tsx
    │   ├── index.tsx      ← Karşılama & fikir girişi
    │   ├── interview.tsx  ← AI mülakat akışı
    │   └── result.tsx     ← Product spec görüntüleme
    └── services/
        └── gemini.ts      ← OpenRouter API servisi
```

---

*Geliştirici: Esra Musul — 231118021*
*AI araçları: Antigravity (Google DeepMind) — tüm kod üretimi loglandı.*
