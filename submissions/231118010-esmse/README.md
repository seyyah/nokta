Track: A

# Nokta - Audit Forge Submission

**Öğrenci No:** 231118010
**Öğrenci Adı:** Esma Selin Sağlam
**Track Seçimi:** Track A — Sadelik (drop-in primitive disiplini)

## 🚀 Proje Bağlantıları
- **Expo QR / Link:** [Buraya Expo Publish linki gelecek]
- **Demo Video (60 sn):** [Buraya Video linki gelecek]

## 📝 Decision Log (Karar Günlüğü)
- **Audit Widget Entegrasyonu:** `nokta-audit` paketi projeye dışarıdan (drop-in) entegre edildi. Hiçbir core dosya bozulmadı, widget sadece `app/_layout.tsx` üzerinden mount edildi.
- **AI Entegrasyonu:** Fikri derinleştirmek ve JSON tabanlı bir yapı elde etmek için Gemini modeli tercih edildi. AI'ın halüsinasyon görmesini engellemek adına System Prompt ile kesin kurallar ve JSON formatı dayatıldı.
- **State Management:** Kullanıcının verdiği cevaplar ve AI'ın ürettiği sorular akıcı bir UX (User Experience) sağlamak için React state'leri üzerinde adım adım ilerleyecek şekilde tasarlandı.
- **UI/UX:** Kullanıcıyı yormamak adına karmaşık mesajlaşma ekranları yerine, "Adım adım Form/Röportaj" (Wizard) mantığı kullanıldı ve yükleme (loading) durumları eklendi.

## 🤖 AI Tool Log
- **Antigravity (Gemini):** Hata ayıklama, kod adaptasyonu, Metro bundler konfigürasyonları ve git süreçleri için kullanıldı.
- **Claude / Cursor:** [Varsa diğer kullandığınız toollar]


## 📦 Klasör Yapısı
- `app/` klasörü uygulamanın kaynak kodlarını ve Expo yapılandırmasını içerir.
- `idea.md` dosyasında, Track A baz alınarak özelleştirilmiş proje felsefesi ve işleyişi anlatılmıştır.
- `app-release.apk` uygulamaya ait derlenmiş çıktı dosyasıdır.
