Track: A

# HydroFlow - Su Tüketim Takipçisi (Challenge 2 - Track A)

**Öğrenci Adı Soyadı:** Busenur Çİl
**Öğrenci No:** 231118023
**Seçilen Track:** Track A

HydroFlow, kullanıcıların günlük su tüketim hedeflerini takip etmelerine, vücut ağırlıklarına göre kişiselleştirilmiş su tüketimi önerileri almalarına ve geçmiş su tüketimlerini görselleştirmelerine yardımcı olan modern bir mobil uygulamadır. Bu uygulama, `@xtatistix/mobile-audit` hata raporlama widget'ı ile entegre edilmiştir.

---

## 🔗 Teslimat Linkleri
- **Expo Go Proje Linki:** https://expo.dev/accounts/busssnrrr/projects/app/builds/6e32cbaa-c6e5-4762-a5d4-27f71c9791cf
- **Demo Tanıtım Videosu:** https://youtube.com/shorts/lTG7GihwEo8?feature=share
- **Android APK Dosyası:** app.zip/app.apk

---

## 👥 Human Touch Points (İnsan Müdahalesi Sayısı)
- **Toplam Müdahale:** 1
- **Açıklama:** Geliştirme süreci ve otonom döngüler (Phase B) tamamen yapay zeka asistanı tarafından gerçekleştirilmiştir. Sadece kütüphanelerin yerel kurulumu ve derleme esnasında karşılaşılan Windows symlink/Metro paketleyici uyumsuzlukları için 1 kez manuel yapılandırma müdahalesi yapılmıştır.

---

## 🤖 Kullanılan AI Araçları (AI Tools Log)
- **Phase A (Uygulama Geliştirme ve Entegrasyon):** Antigravity AI (Gemini 3.1 Pro tabanlı asistan)
- **Phase B (Hata Çözüm Döngüleri):** Antigravity AI (Otonom Forge Döngüsü)
  - **Cycle 1 (Dashboard Overflow):** Antigravity AI (Başarılı)
  - **Cycle 2 (Settings NaN):** Antigravity AI (Başarılı)
  - **Cycle 3 (History Sync):** Antigravity AI (Başarılı)
  - **Cycle 4 (Settings Theme):** Antigravity AI (Geri Alma / Rollback)

---

## 🛠️ Karar Logu (Decision Log)

Bu bölümde, projenin geliştirilmesi ve entegrasyonu sürecinde alınan kritik kararlar listelenmiştir:

1. **Tasarım Sistemi Seçimi (Aesthetics):**
   Uygulama için göz yormayan, modern ve şık bir derin karanlık mod (Dark Slate Theme) tercih edilmiştir. Ana arka plan rengi `#0F172A`, kart arka planları ise `#1E293B` olarak belirlenmiştir. Suyun doluluk seviyesini göstermek amacıyla `%` değerine göre yüksekliği dinamik değişen, yumuşak kenarlı özel bir cam bardak görseli tasarlanmıştır.

2. **Gezinti (Navigation) Yaklaşımı:**
   Gereksiz bağımlılıkları ve karmaşıklığı önlemek adına Expo Router veya React Navigation yerine saf React Native `state` tabanlı bir alt sekme gezintisi (Bottom Tab Bar) geliştirilmiştir. Bu sayede widget entegrasyonu ve ekran isimleri (`currentScreen`) dinamik olarak en stabil şekilde paylaşılabilmiştir.

3. **Mobil Audit Entegrasyonu (Track A Disiplini):**
   `@xtatistix/mobile-audit` widget'ı, host uygulamanın kod kalitesini kirletmemesi için drop-in olarak `App.tsx` içerisine tek bir mount satırı ile yerleştirilmiştir. `expo-file-system/legacy` kütüphanesi kullanılarak dosya yazma ve paylaşım (`expo-sharing`) bağımlılıkları widget ile buluşturulmuştur.

4. **Kasıtlı Hataların Yerleştirilmesi (Intentional Bugs):**
   Otonom forge döngülerinin test edilebilmesi amacıyla kod tabanında 4 adet kasıtlı hata bırakılmıştır:
   - **Hata 1 (Visual/Layout):** Dashboard ekranındaki hızlı su ekleme butonları küçük ekranlarda sığmayıp taşmakta veya üst üste binmektedir (Flexbox wrap eksikliği).
   - **Hata 2 (Form/Validation):** Ayarlar ekranındaki kilo ve hedef girdilerinde sayısal olmayan değerler veya negatif sayılar filtrelenmemekte, bu durum `NaN` oluşmasına sebep olmaktadır.
   - **Hata 3 (State Sync):** Geçmiş ekranından bir su kaydı silindiğinde veri tabanından silinmekte ancak ana sayfadaki toplam tüketim göstergesi uygulama yeniden başlatılana kadar güncellenmemektedir (Parent state güncelleme eksikliği).
   - **Hata 4 (Rollback Test):** Ayarlar ekranına eklenen premium tema geçiş butonu, tıklandığında uygulamanın yerleşim düzenini bozmakta ve ekranı kaplamaktadır.

---

## 🚀 Proje Yapısı

```text
submissions/231118023-busenur/
├── app/                  # Expo + TypeScript Mobil Uygulama Projesi
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx    # Ana Ekran (Doluluk oranı, cam bardak animasyonu)
│   │   │   ├── History.tsx      # Geçmiş Ekranı (Son 7 gün grafiği, kayıt listesi)
│   │   │   └── Settings.tsx     # Ayarlar Ekranı (Kilo bazlı hesaplama, hedef)
│   │   └── utils/
│   │       ├── storage.ts       # AsyncStorage veri tabanı yönetimi
│   │       └── auditStorage.ts  # Audit Widget'ı için yerel depolama adaptörü
│   ├── App.tsx                  # Ana uygulamanın başlangıç ve widget mount noktası
│   ├── app.json                 # Expo yapılandırması
│   ├── metro.config.js          # Windows symlink/Metro özelleştirilmiş ayarları
│   └── package.json             # Bağımlılıklar
├── audit-reports/        # NoktaAudit Tarafından Üretilen Hata Raporları
│   ├── assets/           # Rapor ekran görüntüleri (Mock)
│   ├── report-bug-1.md   # Hata 1 Raporu (Buton taşması)
│   ├── report-bug-2.md   # Hata 2 Raporu (Settings NaN)
│   ├── report-bug-3.md   # Hata 3 Raporu (History Senkronizasyonu)
│   └── report-bug-4.md   # Hata 4 Raporu (Tema Seçim Bozulması)
├── app-release.apk       # Android APK Çıktısı (Rubric Bonus)
├── FORGE.md              # Otonom Onarım Aşamaları ve Karar Günlüğü
└── README.md             # Bu doküman
```
