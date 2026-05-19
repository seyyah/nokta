# Nokta: Dot Capture & Enrich 🚀

Nokta Dot Capture & Enrich, yazılımcıların ve vizyonerlerin rastgele fikirlerini ("noktalarını") alıp, akıllı mühendislik sorularıyla besleyerek profesyonel bir ürün spesifikasyonuna (Artifact) dönüştürdüğü **Track A** teslimatımdır.

## 🚀 Teknolojiler ve Mimari
Projemiz tepeden tırnağa modern standartlarda, profesyonel bir altyapı ile geliştirilmiştir:

- **TypeScript:** Tip güvenliği ve ölçeklenebilirlik.
- **Expo v55:** En güncel React Native geliştirme deneyimi.
- **React Native (UI):** Kesintisiz ve akıcı ekran tasarımı.
- *Karpathy Vibe-Coding prensiplerine uygun mimari.*

## 🎯 Projenin Amacı ve Özellikleri
Projenin temel amacı, "fikrin değersizleşmesi enflasyonu" problemine karşı çıkarak, bir fikri saniyeler içerisinde "slop-free" (çöpsüz) bir mühendislik dosyasına çevirmektir.

**Özellikler:**
- **Fikir Yakalama (Dot Capture):** Aklınıza gelen ham fikri tek kelime ile sisteme girin.
- **AI Engineering Soruları:** Sistem size anında "Problem nedir?", "Kullanıcı kimdir?", "Kapsam nedir?" gibi kritik doneler sorar.
- **Otomatik Spesifikasyon Çıktısı (Spec Artifact):** Verdiğiniz yanıtlara göre `idea.md` felsefesine sıkı sıkıya bağlı kalarak tek sayfalık bir ürün şablonu (Golden Spec) üretir.

## ⚙️ Nasıl Çalıştırılır? (Installation & Run)
Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

### 1. Gereksinimler
- Node.js (LTS sürümü önerilir)
- Expo Go (Mobil cihazınızda, SDK 55 uyumlu)

### 2. Kurulum
```bash
# Bağımlılıkları yükleyin
cd submissions/9211118091-mohammed-almashhor/app
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
Uygulamanın en güncel test sürümünü (APK) teslimat klasöründe bulabilirsiniz: 
📥 **[Tıkla ve app-release.apk İndir](https://raw.githubusercontent.com/MOHAMMEDALMASHHOR/nokta/submission/track-a-meshur/submissions/9211118091-mohammed-almashhor/app-release.apk)**

## 📺 Tanıtım Videosu
Uygulamanın özelliklerini ve kullanımını gösteren kısa tanıtım videomuz (YouTube): 
🎥 [YouTube Tanıtım Videosu](https://youtube.com/shorts/PbXz4dpBAcI)

## 💼 Karar Defteri (Decision Log)

- **2026-04-18 10:15 — Başlangıç**
  - **Track Seçim Kararı:** Track A (Dot Capture & Enrich) tercih edildi.
  - **Gerekçe:** Nokta'nın temel tezi "noktayı fikre çevirme" üzerine. Track A bu teziyle en direkt uyumlu track.
  - **Alternatif Değerlendirmeler:** Track B (Slop Detector) heyecanlı ama dar kapsamlı. Track C (Migration & Dedup) back-end ağırlıklı, demo'da görsel etki düşük.

- **2026-04-18 10:30 — Mimari Kararlar**
  - **Framework:** React Native + Expo seçildi (cross-platform, hızlı build, Expo QR ile kolay paylaşım).
  - **AI Engine:** xAI API (Grok-beta) seçildi. (Gemini 404 hataları ve Groq limitleri nedeniyle projenin final aşamasında xAI'nin Grok modeline geçiş yapıldı).
  - **Tasarım Dili:** Glassmorphism dark theme — premium hissi yaratmak için tercih edildi.

- **2026-04-18 10:50 — Wizard Akışı Tasarımı**
  - **Karar:** Tek seferde 5 soru sormak yerine adım adım wizard formatı benimsendi.
  - **Neden:** Kullanıcının her soruyu düşünerek cevaplaması → daha derin, "slop-free" cevaplar.
  - **UX İyileştirmesi:** Her adımda ilerleme çubuğu (progress bar) gösterilir.

- **2026-04-18 11:20 — Trust Score Mekanizması**
  - **Karar:** Üretilen spec'e 0-100 arası güven puanı (Trust Score) eklendi.
  - **Gerekçe:** Nokta tezindeki "anti-slop" felsefesiyle uyumlu — fikrin kalitesinin ölçülebilir göstergesi.
  - **Hesaplama:** Cevap uzunluğu, teknik detay seviyesi ve tutarlılık metrikleri AI tarafından değerlendirilir.

- **2026-04-18 11:45 — History & Persistence**
  - **Karar:** AsyncStorage ile lokal persistance eklendi.
  - **Gerekçe:** Kullanıcının geçmiş fikirlerini tekrar görebilmesi — iterate edebilmesi önemli.
  - **Backend yok:** Bilinçli tercih — 2 saatlik sürede back-end kurulumu yerine polished frontend'e odaklanma.

- **2026-04-18 12:15 — Build & APK**
  - Expo EAS Build çalıştırıldı, APK dosyası oluşturuldu.
  - Final doğrulama: tüm akış uçtan uca test edildi.

- **2026-04-20 Güncelleme:** Uygulama içi AI motoru xAI (Grok-beta) ile değiştirilerek performans ve yanıt kalitesi artırıldı.

## 🛠️ AI Tool Log
| Tool | Kullanım Amacı |
|---|---|
| **Gemini (Antigravity)** | Kod geliştirme yardımcısı |
| **xAI API (Grok-beta)** | Uygulama içi AI motoru (soru üretimi + spec generation) |

## 🏆 Bonus & Çılgınlık Özellikleri (+10 Puan)
`challenge.md`'de yer alan ve projenin orijinalliğini kanıtlayan ekstra özellikler:
1. **Mimari Zihin Haritası (Mindmap):** `idea.md` felsefesine uygun olarak, kullanıcının girdiği verileri tamamen Native CSS / Flexbox tabanlı bir ağaç yapısında görselleştirerek veri bağlantılarını sunar.
2. **AI Action Prompts Sentezi:** Çıktı sadece doküman üretmekle kalmaz; "Artifact" sayfasının en altında projeyi anında hayata geçirmek için kopyalanabilir üretim prompları (prompt engineering) sentezler.
3. **Simüle Edilmiş Sesle Giriş (Voice-to-Text):** Projedeki friction'ı sıfırlamak adına, test simülasyonu sağlayan bir "🎤 HOLD TO SPEAK" özelliği bulunur.
