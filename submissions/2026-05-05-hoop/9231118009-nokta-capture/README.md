# 💩 Slop Dedektörü

**Track:** Track 2 — Pitch → Slop Score  
**Öğrenci No:** 20210999  
**Slug:** slop-dedektoru

---

## Ne Yapıyor?

Startup pitch paragrafını yapıştır → AI 5 boyutta analiz eder → **Slop Score (0–100)** + detaylı gerekçe + iyileştirme önerileri üretir.

### Analiz Boyutları

| #   | Boyut              | Açıklama                           |
| --- | ------------------ | ---------------------------------- |
| 1   | Buzzword Yoğunluğu | Boş jargon oranı                   |
| 2   | Kanıt Eksikliği    | Veri/metrik olmadan büyük iddialar |
| 3   | Pazar Şişirme      | Abartılı TAM/SAM/SOM               |
| 4   | Belirsiz Fayda     | Somut değer yerine genel vaatler   |
| 5   | Teknik Muğlaklık   | Detaysız teknoloji kullanımı       |

## Demo

- **Expo QR:** `<!-- QR kodu buraya eklenecek -->`
- **Demo Video (60sn):** `<!-- video linki buraya eklenecek -->`

## Kurulum & Çalıştırma

```bash
cd app/slop-dedektoru
npm install
npx expo start
```

Uygulama açıldığında:

1. 🔑 API Key butonuna tıkla → Anthropic API key'ini gir
2. Pitch paragrafını yapıştır (veya örnek seç)
3. "Analiz Et" butonuna bas
4. Sonucu incele ve paylaş

## Tech Stack

- **React Native + Expo** (blank template)
- **Anthropic Claude API** (claude-sonnet-4-20250514)
- Ekstra kütüphane yok — sadece core RN

## Decision Log

| Karar                   | Neden                                                         |
| ----------------------- | ------------------------------------------------------------- |
| Track 2 seçildi         | En basit akış: tek input → tek output, multi-turn/parsing yok |
| Expo blank template     | Minimum bağımlılık, hızlı geliştirme                          |
| Client-side API çağrısı | Demo amaçlı; production'da backend proxy kullanılmalı         |
| Dark theme              | Slop dedektörü konseptine uygun karanlık/edgy estetik         |
| 5 boyutlu analiz        | Tek bir sayıdan daha anlamlı ve öğretici                      |
| Örnek pitch'ler eklendi | İlk kullanımda boş ekran sorunu çözüldü                       |

## Dosya Yapısı

```
submissions/20210999-slop-dedektoru/
├── README.md          ← bu dosya
├── idea.md            ← track fikir detayı
├── app/
│   └── slop-dedektoru/
│       ├── App.js     ← ana uygulama kodu
│       ├── package.json
│       └── ...
└──apk linki:https://expo.dev/artifacts/eas/uroBVYETxBwqiFn5218qzS.apk
```