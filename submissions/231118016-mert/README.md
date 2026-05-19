# Nokta Away Mission - Track A (Dot Capture & Enrich)

**Öğrenci No:** 231118016
**Ad Soyad:** Mert Ali keleş

## Proje Hakkında
Bu proje, "Nokta" uygulamasının bir dilimi olan "Dot Capture & Enrich" akışını gerçekleştirir. Kullanıcıdan ham bir fikir alınır, Gemini AI kullanılarak değerlendirilir ve eksik noktalar tespit edilip kullanıcıya sorularak olgunlaştırılmış bir Specification (Spec) belgesi üretilir.

## Demo & Bağlantılar
- **Demo Videosu:** https://youtu.be/81kcH2KgpTM
- **Expo Projesi / Build:** [EAS Build Linki](https://expo.dev/accounts/musontra/projects/noktaa/builds/8741b72c-2a75-41f3-8019-6c586c2ce76a) (Ayrıca APK dosyası klasörde mevcuttur)

## Decision Log
- Fikirleri ve Gemini AI akışını test etmek için mock verilerden gerçek API entegrasyonuna geçildi.
- Ekran geçişleri için React Navigation kullanıldı (IdeaScreen -> QuestionsScreen -> SpecScreen).
- Kullanıcı deneyimini artırmak için dinamik form yapısı ve "Readiness Score" eklendi.

## Kurulum ve Çalıştırma
```bash
cd app
npm install
npx expo start
```
