# Nokta Capture

## Seçilen Track

**Track A - Dot Capture & Enrich**

## Kısa Proje Özeti

Nokta Capture, kullanıcının ham bir uygulama veya girişim fikrini alıp kısa bir ürün netleştirme akışıyla tek sayfalık bir spec özetine dönüştüren mobil bir prototiptir. Bu çalışma, Nokta vizyonunun tamamını değil; fikir yakalama, 4 takip sorusu ile netleştirme ve özet üretme dilimini hedefleyen küçük ve odaklı bir submission'dır.

## Özellikler

- Ham fikir girişi
- 4 adet takip ürünü sorusu
- Kısa cevaplarla ilerleyen yönlendirilmiş akış
- Tek sayfalık ürün özeti üretimi
- Temiz ve mobil odaklı prototype deneyimi
- Gerekirse local/mock logic ile AI davranışı simülasyonu

## Ana Akış

1. Kullanıcı ham fikrini tek cümle veya kısa paragraf olarak girer.
2. Uygulama sırayla 4 takip sorusu sorar.
3. Sorular problem, hedef kullanıcı, ilk sürüm kapsamı ve temel kısıt üzerine yoğunlaşır.
4. Kullanıcı kısa cevaplarını girer.
5. Uygulama bu cevaplardan tek sayfalık bir ürün özeti oluşturur.
6. Kullanıcı sonuç ekranında daha net, paylaşılabilir bir spec çıktısı görür.

## Kullanılan Teknolojiler

- React Native
- Expo
- JavaScript
- Local state yönetimi
- Mock/local summary generation logic

## Kurulum ve Çalıştırma

```bash
cd submissions/201118062-mergen-wolfscatt/app
npm install
npx expo start
```

Expo açıldıktan sonra uygulama:

- Expo Go ile QR kod okutularak
- Android emulator üzerinden
- Web preview ile

çalıştırılabilir.

## Proje Yapısı

```text
submissions/201118062-mergen-wolfscatt/
├─ README.md
├─ idea.md
├─ app/
│  ├─ components/
│  ├─ constants/
│  ├─ data/
│  ├─ screens/
│  ├─ utils/
│  ├─ App.js
│  ├─ package.json
│  └─ app.json
└─ app-release.apk
```

Not: Challenge kuralına uygun şekilde root klasör değiştirilmemiştir. Tüm çalışma yalnızca `submissions/201118062-mergen-wolfscatt/` altında tutulmuştur.

## Expo Linki

[Expo linki](https://expo.dev/accounts/velmora/projects/nokta-capture/builds/897a568c-aa77-4a96-ab52-cd1eb3308a60)

## Demo Video

[Video](https://youtube.com/shorts/VzqHTmlCTUc?feature=share)

## APK

[APK dosya yolu ](https://github.com/wolfscatt/nokta/blob/main/submissions/201118062-mergen-wolfscatt/app/app-release.apk)

## Decision Log

- Tam Nokta platformu yerine yalnızca Track A'nın çekirdek akışı seçildi; böylece submission yüzeysel değil, çalışan bir dilim oldu.
- Girdi formatı metin odaklı tutuldu; ses girişi bu challenge süresinde değerine göre fazla ek yük oluşturacağı için kapsam dışı bırakıldı.
- Takip soru sayısı 4 olarak sabitlendi; bu sayı hem yeterli netleştirme sağlıyor hem de mobil akışı uzatmıyor.
- Sorular açık uçlu sohbet yerine problem, kullanıcı, kapsam ve kısıt eksenlerine bağlandı; bu sayede çıktı daha tutarlı hale geldi.
- Gerçek LLM entegrasyonu zorunlu kabul edilmedi; gerektiğinde local/mock logic ile demo akışı garanti altına alındı.
- Çıktı formatı uzun PRD yerine tek sayfalık ürün özeti olarak tasarlandı; amaç hızlı okunan ve hemen kullanılabilen bir sonuç üretmekti.
- Mimari, tek kullanıcı senaryosunu hızlı gösterecek şekilde basit tutuldu; authentication, backend ve kalıcı veri yapıları eklenmedi.

## Kullanılan AI Araçları

- ChatGPT / Codex: içerik netleştirme, akış tasarımı, metin yazımı ve uygulama geliştirme desteği
