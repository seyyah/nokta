# NisaDot — 231118006 Nisa Naz Korkmaz

Bu proje, Nokta Away Mission (Solo Seferi) kapsamında geliştirilmiştir.

**Seçilen Track:** Track A — Dot Capture & Enrich

---

## 🎯 Proje Açıklaması

NisaDot, kullanıcının ham fikir kırıntılarını yakalayarak AI destekli mühendislik sorgulamasıyla yapılandırılmış ürün spesifikasyonlarına dönüştüren bir mobil uygulamadır. Kullanıcı bir fikir girer → AI 5 kritik mühendislik sorusu sorar → tek sayfalık slop-free bir spec üretilir.

---

## 📱 Expo QR

> Projeyi Expo Go ile test etmek için aşağıdaki linki kullanın:
>
> 🔗 [Expo Dev Build](https://expo.dev/@nisakrkmz/nokta-nisa)

---

## 🎥 Demo Video

> 📹 [NisaDot — Demo Video](https://www.youtube.com/shorts/HrEOj4IpQmM)

---

## 📦 APK

> [!TIP]
> **app-release.apk** dosyası bu klasörün kök dizininde mevcuttur.
>
> Kurulum: APK dosyasını Android cihaza indirip "Bilinmeyen Kaynaklardan Yükleme" izni vererek kurabilirsiniz.

---

## 📓 Decision Log

### 2026-04-18 10:15 — Başlangıç
- **Track Seçim Kararı:** Track A (Dot Capture & Enrich) tercih edildi.
  - **Gerekçe:** Nokta'nın temel tezi "noktayı fikre çevirme" üzerine. Track A bu teziyle en direkt uyumlu track.
  - **Alternatif Değerlendirmeler:** Track B (Slop Detector) heyecanlı ama dar kapsamlı. Track C (Migration & Dedup) back-end ağırlıklı, demo'da görsel etki düşük.

### 2026-04-18 10:30 — Mimari Kararlar
- **Framework:** React Native + Expo seçildi (cross-platform, hızlı build, Expo QR ile kolay paylaşım).
- **AI Engine:** Groq API (Llama 3.3) seçildi. (Gemini 404 hataları ve hız kısıtları nedeniyle projenin final aşamasında Groq'un ultra-düşük gecikmeli Llama 3.3 modeline geçiş yapıldı).
- **Tasarım Dili:** Glassmorphism dark theme — premium hissi yaratmak için tercih edildi.

### 2026-04-18 10:50 — Wizard Akışı Tasarımı
- **Karar:** Tek seferde 5 soru sormak yerine **adım adım wizard** formatı benimsendi.
  - **Neden:** Kullanıcının her soruyu düşünerek cevaplaması → daha derin, "slop-free" cevaplar.
  - **UX İyileştirmesi:** Her adımda ilerleme çubuğu (progress bar) gösterilir.

### 2026-04-18 11:20 — Trust Score Mekanizması
- **Karar:** Üretilen spec'e 0-100 arası güven puanı (Trust Score) eklendi.
  - **Gerekçe:** Nokta tezindeki "anti-slop" felsefesiyle uyumlu — fikrin kalitesinin ölçülebilir göstergesi.
  - **Hesaplama:** Cevap uzunluğu, teknik detay seviyesi ve tutarlılık metrikleri AI tarafından değerlendirilir.

### 2026-04-18 11:45 — History & Persistence
- **Karar:** AsyncStorage ile lokal persistance eklendi.
  - **Gerekçe:** Kullanıcının geçmiş fikirlerini tekrar görebilmesi — iterate edebilmesi önemli.
  - **Backend yok:** Bilinçli tercih — 2 saatlik sürede back-end kurulumu yerine polished frontend'e odaklanma.

### 2026-04-18 12:15 — Build & APK
- **Expo EAS Build** çalıştırıldı, APK dosyası oluşturuldu.
- Final doğrulama: tüm akış uçtan uca test edildi.
- **2026-04-20 Güncelleme:** Uygulama içi AI motoru Groq (Llama 3.3) ile değiştirilerek performans ve yanıt kalitesi artırıldı.

---

## 🛠️ AI Tool Log

| Tool | Kullanım Amacı |
|------|---------------|
| Gemini (Antigravity) | Kod geliştirme yardımcısı |
| Groq API (Llama 3.3) | Uygulama içi AI motoru (soru üretimi + spec generation) |

---

## 📁 Proje Yapısı

```
submissions/231118006-nokta-nisa/
├── README.md          ← Bu dosya
├── idea.md            ← Track A özelleşmiş fikir dosyası
├── app/               ← Expo React Native projesi
│   ├── app.json
│   ├── package.json
│   ├── App.js
│   └── src/
│       ├── screens/
│       └── components/
└── app-release.apk    ← Android APK dosyası
```
