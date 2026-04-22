# nokta. — Dot Capture & Enrich

> **Öğrenci No:** 231118003
> **Track:** A — Dot Capture & Enrich

---

## 🎯 Track Seçimi: Track A
Ham fikirleri ("nokta") yakalayıp, mühendislik disiplini ile sorgulayan ve ayakları yere basan bir ürün spesifikasyonuna ("artifact") dönüştüren mobil uygulama katmanıdır.

---

## 🌐 Expo Projesi (QR Kod / Link)
- Bulunmuyor (Proje doğrudan APK olarak teslim edilmiştir).

---

## 📱 APK İndirme Bağlantısı
- [APK'yı İndirmek İçin Tıklayın](https://expo.dev/artifacts/eas/bcQ2b8E5evjMsq9nTm3SYw.apk)
*(Ayrıca bu klasörde app-release.apk olarak mevcuttur)*

---

## 🎬 Demo Videosu
- [YouTube Üzerinden İzle](https://youtube.com/shorts/vEBJpCgyBOM?feature=share)

---

## 🏗️ Uygulama Akışı
1. **Fikir Yakalama:** Ana ekranda ham fikrin (dot) girişi.
2. **AI Zenginleştirme:** Gemini AI tarafından sorulan 5 kritik mühendislik sorusu (Problem, Kullanıcı, Kapsam, Kısıtlar, Başarı Metrikleri).
3. **Spec Üretimi:** Verilen cevapların sentezlenerek profesyonel bir ürün kartına dönüştürülmesi.
4. **Geçmiş Yönetimi:** Üretilen tüm spec'lerin yerel cihazda güvenli şekilde saklanması.

---

## 🧠 Decision Log (Teknik Kararlar)

| # | Karar | Seçim | Gerekçe |
|---|-------|-------|---------|
| 1 | AI Modeli | Google Gemini 2.0 Flash | Hız ve Türkçe doğal dil işleme yeteneği. |
| 2 | SDK Versiyonu | Expo SDK 54 | Modern Android cihazlarla tam uyumluluk (PrediabetApp referansı ile). |
| 3 | UI Estetiği | Dark Mode + Soft Glow | Nokta tezinin "premium" ve "gelecekçi" vizyonuna uyum sağlayan pastel yeşil/pembe parıltılar. |
| 4 | Veri Saklama | AsyncStorage | Fikirlerin gizliliği için tamamen cihaz üzerinde (offline-first) depolama. |
| 5 | Build Stratejisi | .easignore + Minimal Deps | Windows üzerindeki dosya sistemi kilitlenmelerini (EBUSY) aşmak ve Gradle stabilitesini sağlamak için bağımlılıklar minimize edildi. |

---

## 🛠️ Teknik Stack
- **Framework:** React Native + Expo SDK 54
- **Navigation:** React Navigation (Native Stack)
- **AI:** @google/generative-ai (Gemini API)
- **UI:** Custom Glassmorphism, Linear Gradient, Haptic Feedback
- **Storage:** @react-native-async-storage/async-storage

---

## 🤖 AI Araçları Kullanımı
- **Antigravity (AI Assistant):** Uygulama mimarisi, UI tasarımı, Gradle hata çözümleri ve kod yazımında eşlikçi olarak kullanılmıştır.
- **Google Gemini:** Uygulama içinde ürün spesifikasyonlarını üretmek için runtime motoru olarak kullanılmıştır.

---

## ✨ Bonus Capability 
**Engineering-Guided AI Loop:** Uygulama sadece metin üretmez; kullanıcıyı 5 aşamalı bir "Engineering Trace" sürecine sokar. Bu süreç, fikrin "slop" (çöp veri) olmasını engelleyerek gerçek bir ürün iskeleti oluşmasını sağlar.
