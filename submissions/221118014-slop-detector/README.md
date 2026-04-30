# Nokta Away Mission — Solo Seferi: Slop Detector

Bu proje, Nokta projesi kapsamında Track B (Slop Detector / Due Diligence) görevi için geliştirilmiştir.

## Track Seçimi
**Track B — Slop Detector / Due Diligence**: Pitch paragrafı yapıştırılır, AI pazar iddialarını test eder, "slop score" + gerekçe üretir.

## Proje Bağlantıları
- **Expo QR Kodu / Linki:** [https://expo.dev/accounts/yurthann/projects/app/builds/0024560b-5df8-4d10-a889-6c3c63fc9a28](https://expo.dev/accounts/yurthann/projects/app/builds/0024560b-5df8-4d10-a889-6c3c63fc9a28)
- **Demo Video (60 sn):** [https://youtube.com/shorts/LAuCFmUByM8](https://youtube.com/shorts/LAuCFmUByM8)

## Decision Log (Karar Günlüğü)
- **Framework Seçimi:** Hızlı iterasyon ve cross-platform destek için React Native + Expo kullanıldı.
- **Tasarım Dili:** Kullanıcı deneyimini artırmak için "Glassmorphism" ve modern karanlık mod (dark mode) tercih edildi. Pitch giren bir analistin kendini premium bir araç kullanıyor gibi hissetmesi hedeflendi.
- **AI Entegrasyonu:** Gerçek bir "Due Diligence" simülasyonu için **Google Gemini 2.5 Flash API** kullanıldı. Prompt mühendisliği ile AI'ın "acımasız bir VC analisti" karakterine bürünmesi sağlandı. Ödev yönergesindeki *"Rate limit vurursan backup tool'a geç, README'de belirt"* kuralına uygun olarak; API yoğunluktan dolayı hata (503 High Demand) verirse, uygulama çökmek yerine sorunsuzca kendi içerisindeki "Offline Backup (Mock)" sistemine geçiş yapacak şekilde tasarlandı.
- **Architecture:** Tek sayfa üzerinden temiz bir akış sağlandı. State yönetimi için React `useState` kullanıldı, karmaşıklıktan kaçınıldı.

## Kurulum ve Çalıştırma
Projeyi yerel ortamda çalıştırmak için:
```bash
cd submissions/221118014-slop-detector/app
npm install
npx expo start
```

_Not: Proje ile birlikte oluşturulan Android APK dosyası (app-release.apk) ana dizinde yer almaktadır._

