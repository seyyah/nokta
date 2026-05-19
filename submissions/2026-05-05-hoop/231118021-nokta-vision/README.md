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

### 🧠 Expert Support & HOOP (Human-on-the-loop)
Standart AI akışının yetersiz kaldığı veya kullanıcının stratejik bir derinliğe ihtiyaç duyduğu anlarda devreye giren **Strateji Uzmanı** modülü eklendi. Bu modül:
- **HOOP Mantığı:** AI'nın genel yeteneklerinden ziyade, belirli bir "Senior Product Manager" personasına bürünmüş, daha kısıtlı ama daha derinlemesine bir uzmanlık sunar.
- **Dinamik Sohbet:** Kullanıcı, fikrinin pazar değerini veya teknik uygulanabilirliğini bu uzmanla birebir tartışabilir.

---

## 📱 Expo Bağlantısı

**Yerel başlatma:**
```bash
cd submissions/231118021-nokta-vision/app
npm install
npx expo start
```

**Expo QR / Preview Linki:**
> `exp://172.20.10.2:8081`

---

## 🎬 Demo Video

| Alan | Link |
|------|------|
| 60 sn Demo Video | https://youtube.com/shorts/S0M6sqqnHxM?feature=share |
| **Android APK** | `app-release.apk` (Root dizininde mevcut) |

---

## 🛠️ Teknik Yığın

| Katman | Teknoloji |
|--------|-----------|
| Framework | React Native + Expo (v54.0.33) |
| Architecture | **New Architecture (React Native 0.81.5 / React 19)** |
| Routing | Expo Router (file-based) |
| AI Servisi | OpenRouter API (Multi-model Fallback: Gemini 2.0, Llama 3.3, Qwen 2.5) |
| Animasyon | React Native Reanimated v3 (Worklets enabled) |
| UI | LinearGradient, Glassmorphism, Custom Markdown renderer |

---

## 📋 Karar Günlüğü (Decision Log)

| Saat | Karar | Gerekçe |
|------|-------|---------|
| 10:09 | Track A seçildi | Nokta'nın çekirdek değer önerisi "slop-free ideation" ile en doğrudan örtüşüyor |
| 10:15 | Expo Router kullanıldı | File-based routing ile 3 ekran (index → interview → result) hızlı kuruldu |
| 10:30 | Gemini API → OpenRouter değiştirildi | Gemini v1beta 404 hatası verdi; `gemini-2.0-flash` model adı API'de mevcut değildi. OpenRouter ücretsiz ve stabil alternatif sundu |
| 10:45 | Multi-model Fallback eklendi | Tek modele bağlı kalmamak için Gemini 2.0, Llama 3.3 ve Qwen 2.5 modelleri arasında otomatik geçiş sağlandı |
| 11:00 | Retry logic eklendi | Ücretsiz modeller zaman zaman 429 dönüyor; 15/30/45s backoff ile otomatik yeniden deneme sağlandı |
| 11:10 | Türkçe prompt | Kullanıcı deneyimini lokalize etmek için prompt dili Türkçe'ye alındı |
| 11:15 | Custom Markdown renderer yazıldı | React Native'de `react-native-markdown` yerine sıfırdan renderer — `##`, `-`, `**` parse edilip stilize native component olarak render ediliyor |
| 22:30 | Expert Support (HOOP) eklendi | PR #86 ve #92'deki başarılı "İnsan Desteği" desenleri projeye uyarlandı. Stratejik derinlik için ayrı bir persona tanımlandı |
| 22:45 | Groq/Llama-3.3 Entegrasyonu | Uzman desteği için daha yüksek parametreli ve hızlı bir model (Llama-3.3-70b) tercih edildi |

---

## ✨ Özellikler

- **AI Mühendislik Mülakatı** — 3 kritik soruyla fikri derine inen yapılandırılmış akış
- **Akıllı Retry** — Rate limit'te otomatik bekleme + yeniden deneme
- **Türkçe Deneyim** — Tüm sorular ve spec çıktısı Türkçe
- **Premium UI** — Glow efektleri, glassmorphism kartlar, slide animasyonları
- **Paylaş** — Üretilen spec anında Share API ile paylaşılabilir
- **Custom Markdown** — `##`, bullet, kalın metin native olarak stilize render
- **Stratejik Uzman Desteği (HOOP)** — Ürün stratejisi konusunda derinlemesine danışmanlık veren özel AI personası
- **Gelişmiş AI Modeli** — Uzman desteği için Llama-3.3-70b (via OpenRouter) kullanımı

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
    │   ├── result.tsx     ← Product spec görüntüleme
    │   └── expert.tsx     ← Stratejik uzman desteği (HOOP)
    └── services/
        └── gemini.ts      ← AI servisleri (OpenRouter)
```

---

*Geliştirici: Esra Musul — 231118021*
*AI araçları: Antigravity (Google DeepMind) — tüm kod üretimi loglandı.*
