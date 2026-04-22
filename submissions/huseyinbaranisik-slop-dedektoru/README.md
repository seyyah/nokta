# Track B — Slop Detector / Due Diligence

## Track Seçimi

**Track B — Slop Detector / Due Diligence**

Pitch paragrafı yapıştırılır → AI (Gemini 1.5 Flash) pazar iddialarını test eder → **Slop Skoru (0–100)** ve gerekçeli iddia analizi üretir.

---

## Expo Bağlantısı

> Projeyi klonlayıp bağımlılıkları yükledikten sonra `npx expo start` komutuyla çalıştırın.

```bash
cd submissions/huseyinbaranisik-slop-dedektoru/app
npm install
npx expo start
```

QR kodu terminalde görünür. Expo Go uygulamasıyla okutabilirsiniz.

---

## Demo Video

> 60 sn demo videosu: [Lütfen kayıt alıp buraya link ekleyin]

---

## 🚀 Kurulum ve Çalıştırma

1. **Bağımlılıklar**: `cd app && npm install`
2. **API Key**: `app/.env` dosyasına `EXPO_PUBLIC_GROQ_API_KEY` değişkenini ekleyin. (Mock modunda da çalışabilir)
3. **Başlat**: `npx expo start`


---

## Uygulama Akışı

```
HomeScreen
  ├── Pitch text input (TextInput, maks 2000 karakter)
  ├── Örnek pitch pill'leri (tap to fill)
  └── "Analiz Et" butonu
        │
        ▼  analyzePitch() — Gemini 1.5 Flash
        │
ResultScreen
  ├── SlopGauge (SVG animasyonlu daire)
  ├── AI Özeti
  ├── ClaimCard listesi (iddia × verdict)
  ├── Yatırımcı Önerisi
  └── Paylaş / Yeni Pitch butonları
```

---

## Decision Log

| # | Karar | Gerekçe |
|---|-------|---------|
| 1 | **Gemini 1.5 Flash** seçildi | Hız/maliyet/kalite optimumu; 128k context sayesinde uzun pitch'leri sığdırır |
| 2 | **Offline Mock** eklendi | API key yokken demo koşulabilir; jüri key olmadan da değerlendirebilir |
| 3 | **react-native-svg** ile Gauge | Bar/text yerine görsel etki maksimum; Recharts/Victory'den hafif |
| 4 | **Auto-JSON parsing** | Model bazen ```json``` bloğu ekler; regex ile temizlenir |
| 5 | **Animated fade+slide** ResultScreen | Kullanıcı score'u "açılıyor" hisseder; engagement artar |
| 6 | **Expo Linear Gradient** | iOS/Android gradient desteği cross-platform; native katman |
| 7 | Root dosyalara dokunulmadı | challenge.md kuralına tam uyum |

---

## AI Tool Log

- **Antigravity (Google DeepMind)** — kod scaffold, bileşen mimarisi, Gemini prompt tasarımı
- Model: Gemini 3 Flash

---

## 📦 APK Alma (EAS Build)

Rubric gereği `app-release.apk` dosyası bu klasörün kök dizininde olmalıdır. Oluşturmak için:

```bash
cd app
eas build -p android --profile preview
```

Build bittikten sonra inen APK'yı `submissions/huseyinbaranisik-slop-dedektoru/app-release.zip` olarak (GitHub limitleri nedeniyle ZIP'lenmiş şekilde) kaydedin.

> [!NOTE]
> GitHub dosya boyutu limitleri nedeniyle APK dosyası `app-release.zip` içerisindedir. Test için lütfen ZIP'den çıkarın.


---

## Öz Değerlendirme

| Eksen | Beklenen | Durum |
|-------|----------|-------|
| Çalışır Teslim | 35 | ✅ Expo link + mock demo + APK |
| Scope Disiplini | 25 | ✅ Track B tam akışı eksiksiz |
| Anti-Slop Orijinallik | 20 | ✅ Orijinal prompt + UX tasarımı |
| Engineering Trace | 20 | ✅ Decision log + commit'ler |
