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
- [📦 app-release.apk Dosyasını İndir](./app-release.apk)
*(Bu GitHub reposunda bulunan güncel APK dosyasına tıklayarak veya indirerek doğrudan test edebilirsiniz).*

---

## 🎬 Demo Videosu
- [YouTube Üzerinden İzle (Yeni HITL Özelliği)](https://youtube.com/shorts/06iyMkiMjMo?feature=share)

---

## 🏗️ Uygulama Akışı
1. **Fikir Yakalama:** Ana ekranda ham fikrin (dot) girişi.
2. **AI Zenginleştirme:** Gemini AI tarafından sorulan 5 kritik mühendislik sorusu (Problem, Kullanıcı, Kapsam, Kısıtlar, Başarı Metrikleri).
3. **Spec Üretimi:** Verilen cevapların sentezlenerek profesyonel bir ürün kartına dönüştürülmesi.
4. **Uzman Onayı (Human-in-the-Loop):** Yapay zekanın ürettiği spesifikasyonun, uygulamanın içinden çıkmadan bir insan/uzman tarafından eleştirilmesi ve AI'nin bu eleştiriyi alarak belgeyi baştan yazması (Expert Critique Loop).

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

expert-support-odevi
## ✨ Bonus Capability (+10 Puan)
**1. Engineering-Guided AI Loop:** Uygulama sadece metin üretmez; kullanıcıyı 5 aşamalı bir "Engineering Trace" sürecine sokar. Bu süreç, fikrin "slop" (çöp veri) olmasını engelleyerek gerçek bir ürün iskeleti oluşmasını sağlar.
**2. Expert Critique Loop (Human-in-the-Loop):** Fikir üretildikten sonra, sisteme dahil olan gerçek bir uzmanın uygulamaya "Eleştiri/Yönlendirme" yazması sağlanır. Yapay zeka bu insan yönlendirmesini (feedback) girdi olarak kabul edip, dokümanı uzmanın isteğine göre anında yeniden yazar. Gerçek bir AI-İnsan işbirliği sunar.

## ✨ Bonus Capability 
**Engineering-Guided AI Loop:** Uygulama sadece metin üretmez; kullanıcıyı 5 aşamalı bir "Engineering Trace" sürecine sokar. Bu süreç, fikrin "slop" (çöp veri) olmasını engelleyerek gerçek bir ürün iskeleti oluşmasını sağlar.
 main
