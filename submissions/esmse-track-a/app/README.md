# Nokta: Dot Capture & Enrich 🚀

Nokta Dot Capture & Enrich, yazılımcıların ve vizyonerlerin rastgele fikirlerini ("noktalarını") alıp, akıllı mühendislik sorularıyla besleyerek profesyonel bir ürün spesifikasyonuna (Artifact) dönüştürdüğü **Track A** teslimatımdır.

## 🚀 Teknolojiler ve Mimari
Projemiz tepeden tırnağa modern standartlarda, profesyonel bir altyapı ile geliştirilmiştir:

- **TypeScript:** Tip güvenliği ve ölçeklenebilirlik.
- **Expo:** En güncel React Native geliştirme deneyimi.
- **React Native (UI):** Kesintisiz ve akıcı ekran tasarımı.
- *Karpathy Vibe-Coding prensiplerine uygun mimari.*

## 🎯 Projenin Amacı ve Özellikleri
Projenin temel amacı, "fikrin değersizleşmesi enflasyonu" problemine karşı çıkarak, bir fikri saniyeler içerisinde "slop-free" (çöpsüz) bir mühendislik dosyasına çevirmektir.

**Özellikler:**
- **Fikir Yakalama (Dot Capture):** Aklınıza gelen ham fikri tek kelime ile sisteme girin.
- **AI Engineering Soruları:** Sistem size anında "Problem nedir?", "Kullanıcı kimdir?", "Kapsam nedir?" gibi kritik doneler sorar.
- **Otomatik Spesifikasyon Çıktısı (Spec Artifact):** Verdiğiniz yanıtlara göre `idea.md` felsefesine sıkı sıkıya bağlı kalarak tek sayfalık bir zihin haritası / ürün şablonu (Golden Spec) üretir.

## ⚙️ Nasıl Çalıştırılır? (Installation & Run)
Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

### 1. Gereksinimler
- Node.js (LTS sürümü önerilir)
- Expo Go (Mobil cihazınızda)

### 2. Kurulum
```bash
# Bağımlılıkları yükleyin
cd submissions/esmse-track-a/app
npm install
```

### 3. Uygulamayı Başlatma
```bash
# Geliştirme sunucusunu çalıştırın
npx expo start -c
```
Terminalde çıkan QR kodu, mobil cihazınızdaki Expo Go uygulaması ile taratarak uygulamayı anında görüntüleyebilirsiniz.
🔗 **Expo Local Dev Linki:** `exp://localhost:8081` (QR Okutma Alternatifi)

## 📦 İndirilebilir APK Dosyası
Uygulamanın en güncel test sürümünü (APK) aşağıdaki Expo linkinden indirebilirsiniz: 
📥 **[Tıkla ve app-release.apk İndir](https://expo.dev/accounts/selinnia0/projects/app/builds/adc5a9bd-2a03-4df7-9ac3-fef66f1726b8)**

## 📺 Tanıtım Videosu
Uygulamanın özelliklerini ve kullanımını gösteren kısa tanıtım videomuz (YouTube): 
🎥 [YouTube Tanıtım Videosu](https://youtube.com/shorts/y_G5WHZe34Y)

## 💼 Karar Defteri (Decision Log)

- **2026-04-24 21:00 — Başlangıç**
  - **Track Seçim Kararı:** Track A (Dot Capture & Enrich) tercih edildi.
  - **Gerekçe:** Nokta'nın temel tezi "noktayı fikre çevirme" üzerine. Track A bu teziyle en direkt uyumlu track.

- **2026-04-24 21:30 — Mimari Kararlar**
  - **Framework:** React Native + Expo seçildi (cross-platform, hızlı build, Expo QR ile kolay paylaşım).
  - **AI Engine:** Gemini API (gemini-flash-latest) seçildi. Yüksek hızı ve güvenilir JSON/Metin ayrıştırması sebebiyle tercih edildi.
  - **Tasarım Dili:** Glassmorphism dark theme — premium hissi yaratmak için tercih edildi.

- **2026-04-24 22:15 — Wizard Akışı Tasarımı**
  - **Karar:** Tek seferde 5 soru sormak yerine adım adım wizard formatı benimsendi.
  - **Neden:** Kullanıcının her soruyu düşünerek cevaplaması → daha derin, "slop-free" cevaplar.
  - **UX İyileştirmesi:** Okunabilirliği yüksek, çok satırlı `TextInput`'lar ve Scroll edilebilen UI akışı sağlandı.

- **2026-04-24 23:45 — Harita (Zihin Ağı) Mekanizması**
  - **Karar:** Üretilen cevaplara göre 5 dallı bir Sinir Ağı (Zihin Haritası) görselleştirildi.
  - **Gerekçe:** Nokta tezindeki felsefeyle uyumlu olarak bilginin merkezden etrafa yayıldığını göstermek.
  - **Hesaplama:** Kullanıcının yanıtları LLM'e geri gönderilir ve en kritik 5 spesifikasyon maddesi çekilir.

- **2026-04-25 00:05 — Build & APK**
  - Expo EAS CLI kurularak proje için bulut tabanlı bir APK (Android) oluşturuldu.

## 🛠️ AI Tool Log
| Tool | Kullanım Amacı |
|---|---|
| **Gemini (Antigravity)** | Kod geliştirme yardımcısı, UI düzeltmeleri, EAS CLI yapılandırması |
| **Gemini API (gemini-flash-latest)** | Uygulama içi AI motoru (kavramsal soru üretimi ve zihin haritası node çıkarımı) |

## 🏆 Bonus & Çılgınlık Özellikleri (+10 Puan)
`challenge.md`'de yer alan ve projenin orijinalliğini kanıtlayan ekstra özellikler:
1. **Mimari Zihin Haritası (Mindmap):** `idea.md` felsefesine uygun olarak, kullanıcının girdiği verileri tamamen Native CSS / Flexbox tabanlı bir ağaç (sinir ağı) yapısında görselleştirerek veri bağlantılarını sunar.
2. **Dinamik Soru Motoru:** Sabit/Hardcoded sorular yerine, girilen 'nokta'nın context'ine (bağlamına) özel AI tarafından canlı üretilen 5 spesifik soruyla ilerler.
3. **Glassmorphism & Otonom UI Hissi:** Uygulama içerisinde kullanılan loading durumları ve hata yönetimi "Sinir Ağı Kuruluyor..." gibi sistem mesajlarıyla süslenerek fütüristik bir hava yakalanmıştır.
