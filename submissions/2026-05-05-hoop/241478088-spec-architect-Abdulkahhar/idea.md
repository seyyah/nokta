# Fikir: Spec Architect — Track A Özelleştirmesi

## Temel Konsept

**Spec Architect**, Nokta tezini alır — "her harika ürün birinin kafasında yüzen ham bir fikirle başladı" — ve *ilk mil sorununu* çözer: o fikri kafadan çıkarıp mühendislerin gerçekten geliştirebileceği bir forma dönüştürmek.

## Problem

Geliştiriciler bir fikre sahip olduklarında genellikle üç hatalı şeyden birini yapar:
1. Spec olmadan direkt yazmaya başlar → kapsam kayması, yitirilmiş haftalar
2. Mühendislerin anlayamayacağı muğlak bir PRD yazar
3. Ürün danışmanı tutar (pahalı, yavaş)

Spec Architect, AI destekli orta yoldur.

## Track A Akışı

### Giriş Katmanı (Çift Kanal)
- **Metin girişi**: Serbest biçim fikir açıklaması
- **Ses girişi**: expo-av ile sesli kayıt (Whisper entegrasyonuna hazır)

### AI Netleştirme Katmanı
AI fikri analiz eder ve şu konulara odaklanan 3-5 soru üretir:
- **Problem**: Hangi spesifik acıyı çözüyor?
- **Kullanıcı**: Kim kullanacak?
- **Kapsam**: v1'de ne var, ne yok?
- **Kısıtlar**: Zaman, bütçe, teknik sınırlar?
- **Başarı**: 3 ayda "çalıştı" ne anlama gelir?

### Spec Üretim Katmanı
Tüm veriler birleştirilip şu bölümleri içeren Markdown spec üretilir:
- Yönetici Özeti, Problem Tanımı, Hedef Kullanıcılar
- Çözüm Genel Bakışı, Özellik Kapsamı (kapsam içi/dışı)
- Teknik Gereksinimler (Mimari, Stack, API'lar)
- Kısıtlar, Başarı Metrikleri, Risk Analizi, Zaman Çizelgesi

## Farklılaştırma

Spec Architect sıradan spec jeneratörlerinden farklı olarak:
1. Fikri **sorgular** — alan odaklı sorularla
2. Tüm cevapları bütüncül olarak **sentezler**
3. Çıktıyı kanıtlanmış mühendislik formatında **yapılandırır**
4. Riski proaktif olarak **işaretler**

## Bonus Yetenek (Çılgınlık)

**Çevrimdışı/Demo Modu**: API anahtarı olmadan uygulama, tam UX akışının değerlendirilebilmesi için kaliteli mock sorular ve gerçekçi örnek bir spec sunar. Bu aynı zamanda paydaşlara yapılan demoları da güvenilir kılar.

Gelecek genişleme (v2): **Whisper API ile ses transkripti** — ses altyapısı hazır (expo-av kaydı), sadece `transcribeAudio()` servisinin gerçek bir STT uç noktasına bağlanması gerekiyor.

## Nokta Tezi Bağlantısı

Nokta tezi, gerçek kıtlığın fikirler değil — bunları netlikle hayata geçirme becerisi olduğunu savunur. Spec Architect, "bir fikrim var" ile "ekibim ne inşa edeceğini biliyor" arasındaki darboğazı ortadan kaldırır.
