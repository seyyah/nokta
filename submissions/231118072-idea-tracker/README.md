# 💡 Idea Tracker — 231118072

> **Track A** · Ham fikri alır, AI ile mühendislik soruları sorar, tek sayfa spec üretir.

---

## 🎯 Proje Özeti

**Idea Tracker**, kullanıcının zihninde beliren ham bir fikri yapılandırılmış bir ürün spesifikasyonuna dönüştüren bir mobil uygulamadır. Kullanıcı fikrini metin olarak girer; uygulama 5 temel mühendislik sorusuyla fikri derinleştirir ve tek sayfalık bir spec belgesi üretir.

---

## 🛤️ Seçilen Track

**Track A — Idea → Spec Pipeline**

Ham fikri (metin) alır, AI destekli 5 engineering sorusu sorar (problem, kullanıcı, scope, constraint, çözüm), ardından tek sayfalık bir spec belgesi üretir.

---

## 📱 Expo QR Kodu

> Expo Go ile test etmek için aşağıdaki komutu çalıştırın:

```bash
cd submissions/231118072-idea-tracker/app
npm install
npx expo start
```

Terminalde görünen QR kodu Expo Go uygulamasıyla tarayın.

**Expo Snack (Online Demo):**
`https://snack.expo.dev/@zeynepyardimci/idea-tracker`

---

## 🎬 60 Saniye Demo Video

[![Demo Video](https://img.shields.io/badge/Demo-Video%20Link-red?style=for-the-badge&logo=youtube)](https://youtu.be/eFXUsPKDeFo)

> Video içeriği:
> 1. Ana ekran — ham fikir girişi (0:00–0:10)
> 2. Engineering soruları akışı (0:10–0:35)
> 3. Spec belgesi ekranı (0:35–0:55)
> 4. Kaydet & paylaş butonu (0:55–1:00)

---

## 📋 Decision Log

### Neden Track A?

Track A'yı seçmemin iki temel sebebi var:

1. **Kişisel ihtiyaç:** Ders projelerinde veya hackathon'larda sık sık "aklımda bir fikir var ama nasıl somutlaştıracağım?" sorusuyla karşılaşıyorum. Bu uygulamayı bizzat kullanmak istiyorum.

2. **Teknik öğrenme:** LLM entegrasyonu olmadan bile "structured questioning" yaklaşımını simüle edebileceğimi fark ettim. Bu sayede AI API'ye bağımlı kalmadan çalışan bir MVP çıkarabiliyorum.

3. **Ölçeklenebilirlik:** İleride gerçek bir OpenAI/Gemini API entegrasyonu eklendiğinde Track A'nın pipeline'ı buna en uygun yapıyı sunuyor.

### Neden Bu Fikir (Idea Tracker)?

Yazılım mühendisliği öğrencileri olarak en büyük sorunumuz "fikirden ürüne geçiş" sürecinin belirsizliği. Herkesin aklında onlarca fikir var ama bunları somutlaştıracak yapısal bir araç yok. Notion şablonları çok karmaşık, sticky note'lar ise çok basit. Idea Tracker tam ortada duruyor: hızlı, mobil, yapılandırılmış.

### Teknik Kararlar

| Karar | Seçim | Gerekçe |
|-------|-------|---------|
| Framework | Expo (React Native) | Cross-platform, hızlı prototipleme |
| Dil | TypeScript | Tip güvenliği, ödev şartı |
| State | useState + useReducer | Basit state, Context gereksiz |
| Navigasyon | Expo Router | File-based routing, modern yaklaşım |
| Stil | StyleSheet API | Native performans, Tailwind gereksiz |
| Veri | AsyncStorage | Offline-first, backend olmadan çalışır |

---

## 👤 Geliştirici

- **Ad Soyad:** Zeynep Yardımcı
- **Öğrenci No:** 231118072
- **GitHub:** [@zeynepyardimci](https://github.com/zeynepyardimci)
- **Fork:** [github.com/zeynepyardimci/nokta](https://github.com/zeynepyardimci/nokta)

---

## 🗂️ Dosya Yapısı

```
231118072-idea-tracker/
├── README.md          ← Bu dosya
├── idea.md            ← Ham fikir + engineering soruları + spec
└── app/               ← Expo projesi
    ├── app/
    │   ├── index.tsx          ← Ana ekran (fikir girişi)
    │   ├── questions.tsx      ← Engineering soruları
    │   ├── spec.tsx           ← Spec belgesi ekranı
    │   └── _layout.tsx        ← Navigasyon düzeni
    ├── components/
    │   ├── IdeaInput.tsx
    │   ├── QuestionCard.tsx
    │   └── SpecDocument.tsx
    ├── constants/
    │   └── questions.ts       ← 5 engineering sorusu
    ├── types/
    │   └── index.ts
    ├── app.json
    ├── package.json
    └── tsconfig.json
```
