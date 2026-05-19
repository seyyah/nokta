# SPECIFICATION

## 1. Problem Tanımı
Yaşlı bireyler (65+ yaş), karmaşık sağlık ve ilaç takip uygulamalarını kullanırken bilişsel ve görsel zorluklar yaşamaktadır. Mevcut piyasa çözümleri genellikle küçük fontlar, düşük kontrastlı renkler ve gereksiz navigasyon adımları içerdiği için ilaca uyum oranını düşürmekte ve hayati riskler yaratmaktadır. Temel problem, tamamen ilk hedef kitlenin erişilebilirlik ihtiyaçlarına göre tasarlanmış, bilişsel yük taşımayan bir hatırlatıcı eksikliğidir.

## 2. Hedef Kitle (Persona)
- **Örnek Kullanıcı:** Ahmet Bey (72 yaşında). Emekli lise öğretmeni.
- **Özellikleri:** Temel düzeyde akıllı telefon kullanıcısı ancak ince motor becerilerinde yavaşlama mevcut. Okuma gözlüğü kullanıyor ve günde 4 defa spesifik saatlerde ilaç alması gerekiyor.
- **Beklentisi:** Sadece kırmızı/yeşil gibi net "İlacını İç" bildirimleri görmek; ekstra tablolar veya detaylı raporlar (kalp atışı vs.) içinde kaybolmamak. Arayüzde kafa karıştırıcı yan menüler (hamburger menu) istemiyor.

## 3. Proje Kapsamı (Scope)
- **Sürüm 1.0 (MVP):** Kullanıcının günlük olarak alması gereken ilaçları zamanı geldiğinde tam ekran büyük kartlarla ve sesli uyarı ile cihazda gösteren React Native mobil arayüzü.
- **Dahil Olan Özellikler:**
  - Tek dokunuşla (One-Tap) 'İlacı Aldım' onayı.
  - Basit İlaç Ayar Tüneli (genellikle çocukları/bakıcıları tarafından ayarlanacak).
  - Görsel günlük başarı göstergesi (Progress Bar).
  - **Uzman Desteği (Human Support):** Yaşlıların ihtiyaç duyduğunda gönüllü Doktor veya Sosyal Hizmet Uzmanı gibi kişilere danışabilmesi. AI filtresi ile mesajın bir uzmana gidip gitmeyeceğine karar verilir.
- **Kapsam Dışı Özellikler:** Optik karakter tanıma (OCR) ile reçete okuma, doktor ile anlık mesajlaşma veya bulut sağlık takibi raporları MVP'ye dahil edilmemiştir.

## 4. Teknik Kısıtlamalar (Constraints)
- **Erişilebilirlik (A11y):** Uygulama katı bir şekilde WCAG 2.1 AA standartlarına bağlı kalacaktır. Minimum okunabilir font büyüklüğü 18pt olmak zorundadır. Tıklanabilir buton ve elementlerin dokunmatik hedef alanı (touch target) en az 48x48 dp olacak ve kontrast oranları (4.5:1) test edilecektir. 'Uzmana Danış' butonu ve ekranı da bu standartlara tam uyumlu olacaktır.
- **Veritabanı Mimarisi:** Düşük gecikme süresi ile çalışması, offline modda bile hastaya alarm verdirebilmesi için Google Cloud Firestore (Offline Persistence) kullanılacaktır. Sorguların (Query) anlık çalışması için Firestore Indexing ayarları optimum seviyede yapılandırılacaktır. `experts` koleksiyonu ve yardım taleplerindeki `needsExpertReview` (boolean) alanı ile uzman desteği veri yapısı planlanmıştır.
- **Altyapı:** Düşük donanımlı eski segment Android cihazlara hedefleme yapılacağı için Expo ve React Native kullanılacaktır. Arka planda pil (batarya) israfı engellenerek, Background Fetch API minimum kaynak tüketecektir. Ayrıca Groq (Llama-3-70b) altyapısı, yaşlıdan gelen mesajın uzmanlık gerektirip gerektirmediğini analiz eden bir filtre (`needsExpertReview`) olarak kullanılacaktır.
