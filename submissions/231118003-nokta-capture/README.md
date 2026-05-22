Track: B

# nokta. — Audit & Forge

> **Öğrenci No:** 231118003
> **Süre:** Yaklaşık 3.5 Saat (Geliştirme + Widget Entegrasyonu + AI Otonomi Testleri)

---

## 🎯 Track Seçimi: Track B (Audit-Forge)
Bu proje, "Customer-as-a-developer" vizyonu doğrultusunda geliştirilmiştir. Uygulama içine entegre edilen **Mobile Audit Widget** sayesinde müşteri (kullanıcı), UI/UX hatalarını veya isteklerini anında raporlar. Sisteme entegre olan Yapay Zeka Ajanı (Antigravity), bu raporları okuyup otonom olarak (insan müdahalesi olmadan) kod bazında onarım yapar (Forge Cycle).

---

## 📁 Proje Teslim Dosyaları
Track B gereksinimleri olan özel belgeler projeye eklenmiştir:
- **`IDEA.md`**: Müşterinin isteklerini ve iş gerekçelerini anlatan senaryo dosyası.
- **`FORGE.md`**: Yapay Zekanın otonom olarak yaptığı düzeltmeleri ve aldığı teknik kararları (Rollback dahil) saniye saniye işlediği seyir defteri (Ledger).
- **`EVAL.md`**: Bonus puan (Track C otonomi) hedefiyle oluşturulan, yapay zekanın mantıksız bir müşteri talebini neden reddedip geri aldığını anlatan analiz raporu.
- **`audit-reports/`**: Gözlem aracıyla (Widget) oluşturulan .md uzantılı orijinal hata raporlarının bulunduğu klasör.

---

## 🌐 Expo Projesi (QR Kod / Link)
- Bulunmuyor (Proje doğrudan APK olarak teslim edilmiştir).

---

## 📱 APK İndirme Bağlantısı
- [📦 app-release.apk Dosyasını İndir](./app-release.apk)
*(Bu GitHub reposunda bulunan güncel APK dosyasına tıklayarak veya indirerek doğrudan test edebilirsiniz).*

---

## 🎬 Demo Videosu
- [YouTube Üzerinden İzle (Nokta Audit-Forge Demo)](https://youtube.com/shorts/CN8DIDAJcCE?feature=share)

---

## 🏗️ Uygulama Akışı (Audit-Forge Loop)
1. **Raporlama:** Kullanıcı, uygulamanın arayüzündeki eksikleri (Örn: "Buton daha ışıltılı olsun") Audit Widget üzerinden ekran resmiyle birlikte kaydeder.
2. **Otonom Onarım (Forge):** AI, bu `.md` dosyasını okur. İlgili React Native bileşenlerini (`HomeScreen.js`, `theme.js`) tespit eder ve kodu anında günceller.
3. **Rollback (Geri Alma) Savunması:** Eğer kullanıcı uygulamayı bozacak bir talepte bulunursa ("Butonları tamamen sil" gibi), AI önce dener, hatayı fark edip inisiyatif kullanarak otonom olarak eski koda geri döner (Rollback).

---

## 🧠 Decision Log (Teknik Kararlar)
| # | Karar | Seçim | Gerekçe |
|---|-------|-------|---------|
| 1 | AI Modeli | Google Gemini 2.0 Flash | Hız ve Türkçe doğal dil işleme yeteneği. |
| 2 | SDK Versiyonu | Expo SDK 54 | Modern Android cihazlarla tam uyumluluk. |
| 3 | UI Estetiği | Cyberpunk Theme | Nokta projesinin fütüristik vizyonuna uyum sağlayan neon yeşil/pembe parıltılar. |
| 4 | Veri Saklama | AsyncStorage | Widget raporlarının gizliliği için tamamen cihaz üzerinde depolama. |

---

## 🤖 AI Araçları Kullanımı ve Human Touch Points
- **Antigravity (AI Assistant):** 4 Forge Cycle boyunca koda otonom müdahale eden ajan.
- **Human Touch Points:** Toplam 2 kez insan müdahalesi yapılmıştır: 1) Widget raporu oluşturulması, 2) "Daha belirgin tema" talebinin kodda tam yansımadığının uyarılması üzerine ajanın SpecScreen kartlarına neon parıltı (glow) eklemesi.
- **Google Gemini:** Uygulama içinde ürün spesifikasyonlarını üretmek için runtime motoru.

---

## 🛠️ Teknik Stack
- **Framework:** React Native + Expo SDK 54
- **Audit:** `@xtatistix/mobile-audit` (Widget & Snapshot)
- **File System:** `expo-file-system/legacy` (MD dosya yönetimi)
- **AI Agent:** Antigravity (Otonom Kod Geliştirici)
- **UI:** Neon Cyberpunk Theme, Linear Gradient, Haptic Feedback

---

## ✨ Bonus Capability (+10 Puan)
**Tam Otonomi ve İnisiyatif (Track C Eklentisi):** AI Ajanı kendisine verilen müşteri görevlerini körü körüne yapmamıştır. "Sıradaki butonunu sil" komutunu uyguladığında uygulamanın soft-lock olduğunu (kilitlendiğini) otonom olarak tespit etmiş ve bu mantıksız mimari kararı reddederek kendi kendine kodu **Rollback (Geri Alma)** yapmıştır. Bu süreç `FORGE.md` ve `EVAL.md` içinde belgelenmiştir.
