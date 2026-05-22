Track: B

# Emre Kaan Şensoy - Öğrenci Görev Takibi (nokta-audit entegrasyonu)

Bu proje, `@xtatistix/mobile-audit` widget'ı kullanılarak geliştirilmiş bir görev takibi uygulamasıdır. Proje **Track B (Yaratıcılık)** odaklıdır. Amaç, widget'ın sadece hata (bug) bulmak için değil, özellik (feature) talepleri için de (müşteri-geliştirici loop'u) otonom olarak nasıl kullanılabileceğini göstermektir.

## 🚀 Proje Hakkında
- **Kullanılan AI Tool:** Antigravity (Gemini 3.1 Pro High) 
- **Human Touch Points Sayısı:** 0 (Otomatik onarım süreci ajan tarafından tamamlandı)
- **Expo QR / Link:** (Localhost veya Expo Go üzerinden açılabilir)
- **Demo Video Linki:** (Teslim öncesi eklenecek)

## 📋 Decision Log (Karar Defteri)
1. **Track Seçimi:** Track B seçildi çünkü uygulamanın temel işlevleri sorunsuz çalışıyordu ve UI/UX alanında yapılabilecek yenilikler çok daha değerliydi.
2. **Audit Widget Mount:** `App.js` içerisinde en dış (kök) `<SafeAreaView>` bileşeni altına drop-in mantığı ile minimum prop setiyle mount edildi. Herhangi bir native modül içe aktarması widget'a aktarılmadı, tam bağımsız bırakıldı.
3. **Rollback Kararı (Cycle 4):** Agent arkaplanı beyaza çekmeyi denedi, ancak projenin ana rengi bordoya/kırmızıya odaklı (Dark mode benzeri) olduğu için tüm renk hiyerarşisi bozuldu ve başarılı bir şekilde Rollback edildi.

## 📂 Dosya Yapısı ve Çıktılar
- `app/` (veya root `emre/` klasörü): AuditWidget'in entegre edildiği ana Expo projesi.
- `audit-reports/`: Müşteri tarafından oluşturulmuş 4 farklı markdown hata/istek raporu.
- `FORGE.md`: Döngü sırasında yaşanan success ve rollback raporlarının dökümü.
- `IDEA.md`: Track B'ye özel olarak tasarlanmış "müşteri-geliştirici" vizyon belgesi.
- `app-release.apk`: (Eğer build alınırsa buraya eklenecektir.)
