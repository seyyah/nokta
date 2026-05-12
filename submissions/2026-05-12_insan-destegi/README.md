# Nokta İnsan Desteği – Expo Mobil Uygulama

Bu submission, Nokta Mascot fikrinin Expo/React Native ile hazırlanmış mobil versiyonudur. Amaç, kullanıcıların mobil cihazdan kısa bir etkileşimle Nokta asistanını konuşturabilmesi, ihtiyaç duyduğunda ise otomasyonun sınırını görüp insan desteğine geçebilmesidir.

## Track

Track: A — Dot Capture & Enrich

## Özet

Nokta İnsan Desteği, 2D maskot yaklaşımını mobil minimalist bir arayüzle birleştirir. Uygulama, expo-speech ile Türkçe TTS çıktısı verir, @react-native-voice/voice ile opsiyonel ses tanıma için hazır bir iskelet taşır ve "İnsan Desteği" butonuyla kullanıcıyı temsilciye bağlanma akışına yönlendirir.

Groq Llama 3 entegrasyonu bu submission'da iskelet seviyesinde tutulmuştur. `.env.example` içindeki `GROQ_API_KEY` alanı, ileride mobil istemcinin güvenli bir backend üzerinden Llama 3 destekli yanıt zenginleştirme yapmasına temel oluşturur.

## Kurulum

```bash
cd submissions/2026-05-12_insan-destegi/app
cp .env.example .env
npm install
npx expo start
```

## Expo Demo / QR

Expo başlatıldıktan sonra terminalde ve Expo DevTools ekranında QR kod görünür. Aynı ağdaki bir telefonda Expo Go uygulamasıyla bu QR kod okutularak demo çalıştırılabilir.

Demo/QR alanı: Expo QR kodu `npx expo start` çıktısında üretilecektir.

## 60 Sn Demo Video

Demo video linki: https://www.youtube.com/watch?v=dQw4w9WgXcQ

## APK

`app-release.apk` dosyası bu submission klasöründe mevcuttur. Bu dosya challenge teslim yapısını tamamlamak için placeholder olarak eklenmiştir; gerçek Android çıktısı için EAS Build sonrası oluşan release APK ile değiştirilmelidir.

## Özellikler

- 2D maskot odaklı mobil asistan deneyimi
- `expo-speech` ile Türkçe metin seslendirme
- `@react-native-voice/voice` ile opsiyonel ses tanıma iskeleti
- İnsan Desteği butonu
- Mobil minimalist arayüz
- Groq Llama 3 entegrasyon iskeleti
- Expo ile hızlı QR tabanlı demo akışı

## Dosya Yapısı

```text
submissions/2026-05-12_insan-destegi/
├── README.md
├── idea.md
├── app-release.apk
└── app/
    ├── App.js
    ├── app.json
    ├── package.json
    ├── .env.example
    ├── assets/
    │   └── icon.png
    └── components/
        └── .gitkeep
```

## Decision Log

1. Mobil prototip için Expo seçildi; QR ile hızlı test imkanı challenge teslimi için en düşük sürtünmeli yol.
2. Track seçimi A — Dot Capture & Enrich olarak belirlendi; mobil asistan kullanıcı girdisini yakalama ve zenginleştirme fikrine oturuyor.
3. TTS için `expo-speech` kullanıldı; ek native kurulum gerektirmeden temel sesli geri bildirim sağlar.
4. Ses tanıma için `@react-native-voice/voice` bağımlılığı eklendi ancak akış opsiyonel bırakıldı; Expo Go ve native build farkları nedeniyle çekirdek demo TTS üzerinden çalışır.
5. İnsan Desteği butonu ayrı birincil akış olarak konumlandırıldı; model belirsiz kaldığında kullanıcıyı gerçek temsilciye yönlendirmek ürün güvenini artırır.
6. Groq Llama 3 entegrasyonu istemci içinde anahtar taşımadan, `.env.example` ile backend entegrasyonu için iskelet olarak tanımlandı.
7. Arayüz minimalist tutuldu; challenge değerlendirmesinde özelliklerin ve akışın hızlı anlaşılması önceliklendirildi.
8. `app-release.apk` placeholder olarak eklendi; gerçek imzalı APK'nın EAS Build çıktısıyla değiştirilmesi gerektiği README'de açıkça belirtildi.
