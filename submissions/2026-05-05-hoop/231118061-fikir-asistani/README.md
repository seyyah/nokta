# NOKTA — Fikir Asistanı

**Öğrenci No:** 231118061  
**Track:** Track 1 — Ham Fikir → Engineering Spec  
**Tarih:** Nisan 2026

---

## Track Seçimi

**Track 1 — Ham Fikir** seçildi.

Kullanıcı ham bir uygulama fikrini girer → AI (Gemini 2.0 Flash) 4 mühendislik sorusu sorar → kullanıcı cevaplar → AI tek sayfalık ürün spec'i üretir.

---

## Uygulama

### Expo QR Kodu
> Uygulamayı çalıştırmak için:
> ```bash
> cd app
> npm install
> npx expo start
> ```
> Açılan QR kodu Expo Go uygulamasıyla tara.

### Demo Video
> [Demo video linki buraya eklenecek]

---

## Kurulum

```bash
# Repoyu klonla
git clone https://github.com/KULLANICI_ADIN/nokta
cd nokta/submissions/231118061-fikir-asistani/app

# Bağımlılıkları yükle
npm install

# Gemini API key'ini app/App.js içine gir
# GEMINI_API_KEY = 'AIza...'

# Çalıştır
npx expo start
```

---

## Proje Yapısı

```
submissions/231118061-fikir-asistani/
├── README.md          ← bu dosya
├── idea.md            ← track seçimi ve fikir detayları
└── app/
    ├── App.js         ← ana uygulama (tek ekran, AI entegrasyonlu)
    ├── app.json       ← Expo konfigürasyonu
    ├── package.json   ← bağımlılıklar
    └── babel.config.js
```

---

## Decision Log

| Karar | Seçim | Gerekçe |
|-------|-------|---------|
| Track | Track 1 | En net tanımlı, kısa sürede tamamlanabilir |
| Framework | Expo 52 + React Native | Cross-platform, ödev gereksinimi |
| AI | Gemini 2.0 Flash | Ücretsiz tier, hızlı yanıt süresi |
| Mimari | Single-screen stage bazlı | MVP'ye odaklan, navigasyon karmaşıklığı yok |
| State | React useState | Yeterli, external state manager gereksiz |
