# Nokta Hoop - Uzman Destekli Fikir Platformu

Bu proje, dağınık fikirleri toplamak ve gerçek uzmanlarla (mentörlerle) canlı görüntülü görüşme sağlayarak bu fikirleri olgunlaştırmak için tasarlanmıştır.

## Özellikler
- **Nokta Maskot:** Fikirlerinizi dinleyen ve size rehberlik eden akıllı asistan.
- **Uzman İste:** Stream Video altyapısı ile anında canlı mentor bağlantısı.
- **Modern Arayüz:** Karanlık mod ve premium tasarım estetiği.

## Kurulum ve Çalıştırma

1. **Bağımlılıkları Yükleyin:**
   ```bash
   npm install
   ```

2. **Sunucuyu Başlatın:**
   ```bash
   npm run server
   ```

3. **Uygulamayı Başlatın:**
   ```bash
   npx expo start --dev-client
   ```

## Klasör Yapısı
- `App.js`: Ana uygulama dosyası.
- `server/`: Token üretimini sağlayan arka plan sunucusu.
- `assets/`: Görsel materyaller.
- `.env`: API anahtarları.

## Yapılan Çalışmalar ve Yenilikler

Bu projede, standart bir fikir yakalama uygulamasının ötesine geçilerek "Human-in-the-loop" (insan döngüde) prensibiyle çalışan bir uzman destek ekosistemi kurulmuştur.

### 🎥 Uzman (Mentor) Desteği Entegrasyonu
- **Canlı Görüntülü Görüşme:** `Stream Video SDK` kullanılarak mentor ve kullanıcı arasında gerçek zamanlı sesli ve görüntülü iletişim altyapısı kurulmuştur.
- **Token Güvenlik Katmanı:** Kullanıcıların güvenli şekilde görüşmeye katılabilmesi için Node.js/Express tabanlı bir **Token Server** backend modülü geliştirilmiştir.
- **WebRTC Desteği:** Yüksek kaliteli ve düşük gecikmeli yayın için WebRTC protokolü entegre edilmiştir.

### 🤖 Nokta Maskot (Akıllı Asistan)
- **Dinamik İfadeler:** Maskotun durumu, kullanıcının girdiği verilere ve sistemin o anki işlemine (Düşünüyor, Mutlu, Sinirli) göre anlık olarak değişmektedir.
- **Etkileşimli Sohbet:** Kullanıcı fikirlerini girdikçe maskot bu fikirleri analiz eder ve kritik noktalarda kullanıcıyı uzmana (mentora) yönlendirir.

### 💎 Tasarım ve Kullanıcı Deneyimi
- **Premium Dark Mode:** Uygulama genelinde modern, göz yormayan ve teknoloji odaklı bir karanlık mod estetiği benimsenmiştir.
- **A2UI (Adaptif Arayüz):** Kullanıcı mentora bağlandığında arayüz otomatik olarak video konferans moduna geçiş yapar.

## Teknik Mimari
Proje, monorepo karmaşıklığından arındırılarak daha hızlı yönetilebilir ve test edilebilir bir **Flat Structure** (Tekil Yapı) mimarisine dönüştürülmüştür. Tüm kritik uygulama mantığı `App.js` içinde optimize edilerek toplanmıştır.

