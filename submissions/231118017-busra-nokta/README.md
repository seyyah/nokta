# Nokta Away Mission - Track A

**Öğrenci:** Büşra
**Öğrenci No:** 231118017
**Seçilen Track:** Track A — Dot Capture & Enrich

## 📋 Proje Özeti
Bu uygulama, ham iş fikirlerini alıp Gemini AI desteğiyle yapılandırılmış mühendislik sorularına (Problem, User, Scope, Constraint) dönüştüren bir mobil arayüzdür. 

## 🚀 Uygulama Erişimi
* **Expo Go Link / QR:** [https://expo.dev/accounts/busra9900/projects/app/builds/88145b21-d1bb-4328-a2a9-9b893db2a3d9](https://expo.dev/accounts/busra9900/projects/app/builds/88145b21-d1bb-4328-a2a9-9b893db2a3d9)
* **APK Dosyası:** [app-release.apk](./app-release.apk)

## 🎥 Demo Videosu
* **Video Linki:** [https://www.youtube.com/watch?v=o-1zmbZUubk]

## 🧠 Teknik Karar Günlüğü (Decision Log)
1. **Framework Seçimi:** Projenin hızlı prototipleme gereksinimi ve Android çıktı alma kolaylığı nedeniyle **React Native + Expo** tercih edilmiştir.
2. **AI Modeli ve Entegrasyonu:** Google'ın en hızlı modeli olan **Gemini 1.5 Flash** kullanılmıştır. SDK ve API versiyonları arasındaki (v1beta) uyuşmazlıkları yönetmek adına bir **Fallback (Geri Çekilme) Mekanizması** kurgulanmıştır.
3. **Hata Yönetimi:** İnternet kesintisi veya API kotası dolması durumunda uygulamanın çökmemesi için simüle edilmiş mühendislik soruları (Mock Data) devreye girecek şekilde `try-catch` blokları yapılandırılmıştır.
4. **Klasör Mimarisi:** Hocanın belirttiği `submissions` standardına sadık kalınarak, tüm `app` dosyaları ve `apk` çıktısı tek bir dizinde toplanmıştır.

## 🛠️ Kurulum
1. `submissions/231118017-busra-nokta/app` klasörüne girin.
2. `npm install` komutunu çalıştırın.
3. `npx expo start` ile projeyi ayağa kaldırın.
