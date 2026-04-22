# Idea: Idea Tracker — Track A Spec

## Ham Fikir Açıklaması

**Fikir:** Geliştiricilerin ve girişimcilerin aklına gelen ham fikirleri hızlıca yapılandırılmış bir proje spec'ine dönüştüren mobil uygulama.

**Detay:** Kullanıcı aklına gelen ham fikri (örn: "bir uygulama yapayım insanlar kendi bitkilerini takip edebilsin") giriyor. Uygulama bu ham fikri alıp, mühendislik perspektifinden kritik sorular soruyor — problem nedir, kullanıcı kimdir, kapsam nedir, kısıtlar nelerdir. Yanıtlar tamamlandığında tek sayfalık, net bir proje spec'i otomatik olarak oluşturuluyor.

---

## AI Engineering Soruları ve Cevaplar

*Aşağıdaki örnek, "bitki bakım takip uygulaması" ham fikri üzerinden yapılmış bir senaryo göstermektedir.*

### Soru 1: Gerçek Problem

**Soru:** "Bu fikrin çözdüğü tek ve en önemli problem nedir? Neden bu problem şu an çözülmemiş?"

**Cevap:** İnsanlar evdeki bitkilerini ne zaman sulamaları, gübreleme zamanlamasını ve mevsimsel bakım ihtiyaçlarını unutuyor. Mevcut uygulamalar ya çok karmaşık (tüm botanik bilgileri içeriyor) ya da sadece timer (neden suluyorum bilmiyorum). Problem: bağlamsal hatırlatma yok, yani "bu bitkiyi sulamanın tam zamanı çünkü son 7 gündür sulamadın ve hava sıcak" gibi akıllı bir sistem yok.

### Soru 2: Hedef Kullanıcı

**Soru:** "Bu uygulamayı ilk haftada kim kullanacak? Bunu kullanan kişinin bir gününü tarif et."

**Cevap:** 25-40 yaş arası, şehirde yaşayan, evinde 3-10 arasında bitkisi olan, teknolojiye aşina ama botanik uzmanı olmayan kişiler. Sabah kahvesini içerken telefona bakar, hangi bitkinin sulanması gerektiğini görür, akşam eve gelince yapıyor. Hafta sonu bahçe marketine gittiğinde yeni bitki ekliyor. Tatile giderken birinin sulayıp sulamaması gerektiğini merak ediyor.

### Soru 3: Kapsam (MVP)

**Soru:** "6 haftada tek başına yapabileceğin en küçük sürüm ne olabilir? Hangi özellikler kesinlikle olmalı, hangilerini çıkarabilirsin?"

**Cevap:** MVP şunları içermeli: bitki ekleme (fotoğraf + isim + tür), sulama sıklığı belirleme, bildirim gönderme, sulama kaydı tutma. Dışarıda bırakılabilir: hava durumu entegrasyonu, bitki hastalık teşhisi, sosyal paylaşım, bitki tanıma kamerası, alışveriş listesi. MVP'yi 4 haftada yapabilirim, 2 hafta test için.

### Soru 4: Teknik Kısıtlar

**Soru:** "Bu uygulamayı geliştirirken karşılaşacağın en büyük 2 teknik zorluk nedir? Bu zorlukları nasıl aşacaksın?"

**Cevap:** 
1. **Bildirim yönetimi:** Her bitki için farklı zamanlama, bildirim izni, arka planda çalışma. Çözüm: expo-notifications ile basit, günlük tek bildirim. Karmaşık zamanlamaları sonraya bırak.
2. **Veri kalıcılığı:** Kullanıcının bitkilerini kaybetmemesi, yedekleme. Çözüm: önce AsyncStorage, kullanıcı tabanı oluşunca Supabase ekle.

### Soru 5: Başarı Kriterleri

**Soru:** "3 ay sonra bu uygulama 'başarılı' sayılırsa ne olmuş olacak? Bunu nasıl ölçersin?"

**Cevap:** Başarı kriterleri: 500 aktif kullanıcı (haftada en az 2 kez açıyor), kullanıcı başına ortalama 5 bitki kaydı (gerçekten kullanıyorlar), %70 bildirime tıklama oranı (işe yarıyor), App Store'da 4.2+ puan. Ölçüm: Firebase Analytics ile açılış sayısı, sulama kaydı sayısı, bildirim etkileşimi.

---

## Tek Sayfalık Spec Çıktısı

---

### PROJE SPEC: PlantPal — Akıllı Bitki Bakım Takip Uygulaması

**Versiyon:** 1.0 MVP  
**Tarih:** Nisan 2026  
**Geliştirici:** dilfinakkurt

---

#### Problem

Şehirde yaşayan insanlar evdeki bitkilerinin bakımını düzenli ve bağlamsal bilgiyle yapamıyor. Mevcut çözümler ya aşırı karmaşık botanik bilgi sunuyor ya da yalnızca basit bir zamanlayıcı işlevi görüyor; ikisi de "neden şimdi sulamalıyım?" sorusunu cevaplamıyor.

#### Hedef Kullanıcı

- **Segment:** 25-40 yaş, şehirde yaşayan, evde 3-10 bitki sahibi
- **Teknik düzey:** Orta (smartphone kullanıcısı, botanik uzmanı değil)
- **Ana davranış:** Sabah veya akşam kısa check-in, haftalık aktif bakım
- **Acı noktası:** Bitkinin ne zaman sulanacağını unutmak ve bunu fark etmek için bitkinin solmasını beklemek

#### Kapsam (MVP — 6 Hafta)

**Dahil:**
- Bitki ekleme: fotoğraf (kameradan veya galeriden), isim, tür kategorisi
- Sulama takvimi: basit "her X günde bir" periyot belirleme
- Günlük bildirim: sabah tek bildirim, o gün sulanması gereken bitkiler
- Sulama kaydı: tek dokunuş ile "suladım" işaretleme
- Bitki listesi: son sulama tarihi ve bir sonraki sulama tarihi görüntüleme

**Dahil Değil (v2+):**
- Hava durumu entegrasyonu
- Bitki hastalık teşhisi
- Sosyal paylaşım / bitki topluluk
- Fotoğrafla bitki tanıma
- Alışveriş listesi / bitki marketi

#### Teknik Mimari

- **Platform:** React Native + Expo (iOS & Android)
- **Veri saklama:** AsyncStorage (MVP), Supabase (v2)
- **Bildirimler:** expo-notifications
- **Fotoğraf:** expo-image-picker
- **State:** React Context + useState
- **Navigasyon:** expo-router

#### Kısıtlar

| Kısıt | Detay |
|-------|-------|
| Tek geliştirici | 6 hafta sprint, basit mimari |
| Expo Go uyumluluğu | Native modül kullanımı sınırlı |
| Offline-first | İnternet bağlantısı gerektirmemeli |
| Bildirimlere izin | Kullanıcı reddetse bile uygulama çalışmalı |
| iOS & Android | Platform farkları için Platform.OS kontrolleri |

#### Çözüm Yaklaşımı

PlantPal, "minimal effective dose" prensibini benimser: kullanıcıya sadece o gün yapması gereken şeyi göster. Ana ekran = bugün sulanacak bitkiler. Tüm karmaşıklık arka planda, arayüz son derece basit.

**Kullanıcı akışı:**
1. İlk açılış → bitki ekle (fotoğraf + isim + sulama sıklığı)
2. Her sabah bildirim: "2 bitkini sulamanın zamanı geldi"
3. Uygulamayı aç → tek dokunuş ile "suladım"
4. Tarihçe: bitki başına kaç kez sulandı, son ne zaman

#### Başarı Kriterleri

| Metrik | Hedef (3. ay) |
|--------|---------------|
| Aktif kullanıcı | 500 (haftada 2+ açılış) |
| Kullanıcı başına bitki | ≥ 5 |
| Bildirim tıklama oranı | ≥ %70 |
| App Store puanı | ≥ 4.2 |
| 7 günlük retention | ≥ %40 |

---

*Bu spec, Idea Tracker uygulamasının Track A akışı kullanılarak üretilmiştir.*
