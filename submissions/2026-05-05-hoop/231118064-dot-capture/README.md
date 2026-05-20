# NOKTA — Dot Capture & Enrich (Track A)

Bu proje, ham fikirleri (noktaları) alıp mühendislik sorularıyla zenginleştirerek slopsuz, net ürün spesifikasyonlarına dönüştüren bir mobil uygulamadır.

## 👤 Öğrenci Bilgileri
- **Ad Soyad:** Kardelen Bal
- **Öğrenci No:** 231118064
- **Seçilen Track:** Track A — Dot Capture & Enrich

---

## 🚀 Proje Özeti
NOKTA, girişimcilerin ve mühendislerin akıllarına gelen ham fikirleri kaybetmemelerini ve bu fikirleri hızla olgunlaştırmalarını sağlar. Uygulama, AI destekli (Claude API) 4 kritik mühendislik sorusu sorarak fikri sorgular ve sonunda tek sayfalık bir ürün spesifikasyonu üretir.

### ✨ Öne Çıkan Özellikler
- **Ham Fikir Yakalama:** Dağınık ve yarım cümleleri "nokta" olarak kabul eder.
- **AI Destekli Sorgulama:** 4 aşamalı engineering soruları (Claude Sonnet 3.5).
- **Otomatik Spec Üretimi:** Engineering-grade ürün dokümanı.
- **İnsan Desteği (Human Support):** Gelişmiş HITL katmanı. İstendiği an uzman desteği talebi oluşturulabilir.
- **Karar Günlüğü (Decision Log):** Uzman/mentor geri bildirimleri doğrudan spec sürecine dahil edilir.

---

## 🎥 Tanıtım ve Demo
- **60 Sn Demo Videosu:** [YouTube Shorts](https://www.youtube.com/shorts/iq2_B1Vliy4)
- **Expo Go:** [exp://u.expo.dev/kardelenbal/nokta](https://expo.dev/@kardelenbal/nokta)

---

## 📦 Kurulum ve Çalıştırma
Uygulamanın hazır derlenmiş hali ana dizinde mevcuttur:
- **APK:** [app-release.apk](app-release.apk) (Android için doğrudan indirip kurabilirsiniz.)

### Yerel Geliştirme:
1. `npm install`
2. `npx react-native start`
3. `npx react-native run-android`

---

## 🧠 HITL & Human Support
Bu sürümde eklenen özel katman sayesinde:
- Kullanıcı, fikir geliştirme aşamasında sağ alttaki **Mascot (NoktaAssistant)** aracılığıyla mentor desteği isteyebilir.
- Verilen mentor geri bildirimleri **"Karar Günlüğü" (Decision Log)** olarak spec dokümanının en altında otomatik olarak listelenir.

---

## 🛠️ Teknoloji Yığını
- **Framework:** React Native CLI
- **Dil:** TypeScript
- **AI:** Anthropic Claude API (messages API)
- **State Management:** React Hooks (useState, useRef, useCallback)
- **Styling:** Custom StyleSheet (Dark Glassmorphism)

---
*NOKTA · NAIM Ecosystem · 231118064*
