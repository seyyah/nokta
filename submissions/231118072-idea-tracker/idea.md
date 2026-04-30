# idea.md — Track A Çıktısı

## Ham Fikir

> "Öğrencilerin ve yazılımcıların aklına gelen ham fikirleri yapılandırılmış bir ürün spec'ine dönüştüren mobil uygulama. Kullanıcı fikri yazar, uygulama doğru soruları sorar, cevapları kaydeder ve tek sayfalık spec oluşturur."

---

## AI'ın Sorduğu 3-5 Engineering Sorusu ve Cevapları

### Soru 1: Problem Tanımı
**Soru:** Bu uygulama tam olarak hangi problemi çözüyor? Kullanıcı şu an bu problemi nasıl çözüyor?

**Cevap:** Öğrenciler ve junior yazılımcılar aklına gelen fikirleri genellikle not defterine ya da bir mesajlaşma uygulamasına ham metin olarak yazıyor. Bu ham notlar ya hiçbir zaman ürüne dönüşmüyor ya da tekrar okunduğunda yetersiz bilgi içerdiği için anlaşılamıyor. Mevcut alternatifler (Notion, Confluence) çok karmaşık ve boş sayfayla başlamak zor. Bu uygulama, yapılandırılmış sorularla kullanıcıyı yönlendiriyor ve ham fikri somut bir spec'e dönüştürüyor.

---

### Soru 2: Hedef Kullanıcı
**Soru:** Bu uygulamanın birincil kullanıcısı kim? Demografik ve davranışsal özellikleri neler?

**Cevap:** Birincil kullanıcı 18-28 yaş arası üniversite öğrencileri ve yeni mezun yazılım geliştiricileri. Ortak özellikleri: fikir üretmek istiyorlar ama onu nasıl yapılandıracaklarını bilmiyorlar, teknoloji meraklılar ve mobil first kullanıcılar, sabah/akşam metro veya kafede uygulama kullanıyorlar, çoğu zaman 5-10 dakika içinde hızlı bir şey kaydetmek istiyorlar.

---

### Soru 3: Kapsam (Scope)
**Soru:** MVP için hangi özellikler kesinlikle gerekli, hangileri sonraya bırakılabilir?

**Cevap:**
- **MVP'de olması gerekenler:** Ham fikir metin girişi, 5 sabit engineering sorusu (problem, kullanıcı, kapsam, kısıtlar, çözüm), cevap kaydetme, tek sayfalık spec görüntüleme, AsyncStorage ile yerel kayıt.
- **Sonraya bırakılacaklar:** Ses girişi (STT), gerçek AI entegrasyonu (OpenAI API), spec'i PDF'e aktarma, takım paylaşımı, cloud sync.

---

### Soru 4: Teknik Kısıtlar
**Soru:** Hangi teknik kısıtlar altında çalışıyorsunuz? (platform, offline, performans, vb.)

**Cevap:** Expo Go ile çalışmalı (native build yok), Expo SDK 51+, TypeScript, offline-first (AsyncStorage), yalnızca Expo Go compatible kütüphaneler kullanılabilir, API key gerektiren servislere ilk MVP'de bağımlı olunmamalı (hardcoded sorular yeterli). iOS ve Android her ikisinde de çalışmalı.

---

### Soru 5: Başarı Kriterleri
**Soru:** Bu uygulamanın başarılı olduğunu nasıl ölçeceksiniz? İlk kullanıcıdan beklentiniz ne?

**Cevap:** Bir kullanıcı uygulamaya ham fikir yazıp 5 soruyu cevapladıktan sonra elinde okunaklı, paylaşılabilir bir tek sayfalık spec olmalı. Başarı kriteri: kullanıcı spec'i başka birine gösterip "işte bunu yapmak istiyorum" diyebilmeli. İlk versiyonda en az 3 farklı fikir için spec oluşturulabilmeli ve bunlar yerel olarak kaydedilip tekrar görüntülenebilmeli.

---

## Tek Sayfalık Spec Çıktısı

---

### PRODUCT SPEC — Idea Tracker v1.0

**Proje Adı:** Idea Tracker  
**Track:** A — Ham Fikir → Engineering Sorular → Spec  
**Tarih:** Nisan 2026  
**Yazar:** zeynepyardimci (231118072)

---

#### Problem

Öğrenciler ve junior geliştiriciler ham fikirlerini not alsalar da bu notlar hiçbir zaman somut ürün planına dönüşmüyor. Mevcut araçlar (Notion, Confluence) çok karmaşık; yapılandırılmış sorular sormayan araçlar ise yetersiz bağlam içeren notlar üretiyor.

#### Kullanıcı

**Birincil:** 18-28 yaş, üniversite öğrencisi veya junior yazılımcı. Mobil-first, fikir üretmeye meraklı ama bunu nasıl yapılandıracağını bilmiyor.

**Kullanıcı Hikayesi:** "Bir fikir geldi aklıma, 5 dakikada kaydetmek istiyorum ve yarın sabah okuduğumda hâlâ anlamlı gelsin."

#### Kapsam (MVP)

- **Dahil:** Ham metin girişi → 5 engineering sorusu → cevap kaydetme → spec görüntüleme → yerel kayıt (AsyncStorage) → geçmiş fikirler listesi
- **Dışında:** Ses girişi, gerçek AI, cloud sync, paylaşım, PDF export

#### Kısıtlar

- Expo Go compatible (native build yok)
- Expo SDK 51+, TypeScript zorunlu
- Offline-first, internet bağlantısı gerektirmez
- Yalnızca AsyncStorage ile yerel veri saklama

#### Çözüm

Kullanıcı ham fikrini bir metin kutusuna yazar. Uygulama 5 mühendislik sorusunu sırayla gösterir (problem, kullanıcı, kapsam, kısıt, başarı kriteri). Kullanıcı her soruya cevap girdikçe ilerleme kaydedilir. Tüm sorular tamamlandığında uygulama tek sayfalık bir spec ekranı üretir. Spec ekranı okunabilir formatta tüm cevapları özetler ve fikir AsyncStorage'e kaydedilir. Kullanıcı geçmiş fikirlerine ana ekrandan erişebilir.

#### Teknik Mimari

- **Frontend:** Expo Router (file-based routing), React Native, TypeScript
- **Durum Yönetimi:** React useState (lokal), AsyncStorage (kalıcı)
- **Navigasyon:** Stack navigator (Expo Router) — 3 ekran: Home, Questions, Spec
- **Veri:** JSON formatında AsyncStorage, her fikir UUID + timestamp ile

---
