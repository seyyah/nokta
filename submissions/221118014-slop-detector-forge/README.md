# Nokta Away Mission — Solo Seferi: Slop Detector

Bu proje, Nokta projesi kapsamında Track B (Slop Detector / Due Diligence) görevi için geliştirilmiştir. Ayrıca Nokta Audit-Forge (Phase A & B) iterasyonları da tam olarak entegre edilmiştir.

## Track Seçimi
**Track B — Slop Detector / Due Diligence**: Pitch paragrafı yapıştırılır, AI pazar iddialarını test eder, "slop score" + gerekçe üretir.

## Proje Bağlantıları
- **Demo Video:** [https://youtube.com/shorts/Hyiwr7yqx2w?feature=share](https://youtube.com/shorts/Hyiwr7yqx2w?feature=share)
- **EAS Build (APK):** [https://expo.dev/accounts/yurthann/projects/app/builds/dd4b1153-74ef-4bd0-859c-47d8bc895356](https://expo.dev/accounts/yurthann/projects/app/builds/dd4b1153-74ef-4bd0-859c-47d8bc895356)

## Otonom Geliştirme Döngüsü (Audit-Forge)
- **Phase A:** `<AuditWidget />` projeye gömüldü ve `Onboarding`, `Pitch-List`, `Pitch-Detail` olmak üzere 3 farklı ekrandan detaylı hata raporları (`.md`) üretildi.
- **Phase B:** Üretilen raporlar ile 4 Forge döngüsü koşturuldu (FORGE.md'de kayıtlıdır):
  1. Offline Pitch Geçmişi (`user_pitches.json` - `expo-file-system/legacy` ile kaydedildi).
  2. Domain validasyonu denendi fakat hatalı API yanıtları sebebiyle Rollback yapıldı.
  3. API Limitlerine (Offline) karşı Premium Hata Kartı (Alert Card) tasarımı eklendi.
  4. **Challenger Bonus:** AI'ın yakaladığı "Slop" (Boş vaat) cümlelerinin UI üzerinde dinamik olarak vurgulanması (highlight) sağlandı.

## Decision Log (Karar Günlüğü)
- **Framework Seçimi:** Hızlı iterasyon ve cross-platform destek için React Native + Expo kullanıldı. TypeScript (TS) entegrasyonu tamamlandı.
- **Tasarım Dili:** Kullanıcı deneyimini artırmak için "Glassmorphism" ve modern karanlık mod (dark mode) tercih edildi.
- **AI Entegrasyonu:** Gerçek bir "Due Diligence" simülasyonu için **Google Gemini 2.5 Flash API** kullanıldı. Prompt mühendisliği ile AI'ın "acımasız bir VC analisti" karakterine bürünmesi sağlandı. Uygulama API hatası durumunda çökmek yerine sorunsuzca "Offline Backup (Mock)" sistemine geçiş yapacak şekilde tasarlandı.

## Kurulum ve Çalıştırma
Projeyi yerel ortamda çalıştırmak için:
```bash
cd app
npm install
npx expo start
```

_Not: Bulut üzerinden EAS Build ile oluşturulan güncel Android APK dosyası (app-release.apk) ana dizinde yer almaktadır._
