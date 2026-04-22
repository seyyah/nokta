# Nokta Submission — Track A: Dot Capture & Enrich

**Öğrenci No:** 231118004
**Track:** A — Dot Capture & Enrich

---

## Expo QR / Link

> **[Nokta Mobil Uygulamayı Test Et (Expo QR)](exp://192.168.1.105:8081)**

---

## Demo Video

> **[Nokta Demo Videosunu İzle (YouTube)](https://youtube.com/shorts/spjn73W5nE8)**

---

## Uygulama Hakkında

Ham bir fikri (tek cümle metin) alır; Gemini AI ile 5 soru sorar, cevaplara göre tek sayfalık ürün spesifikasyonu üretir. Spec ekranında 3 sekme bulunur:

| Sekme | İçerik |
|-------|--------|
| **Spec** | Problem / Kullanıcı / Kapsam / Kısıt / Başarı Metriği kartı |
| **Nokta Skoru** | 4 boyutlu animasyonlu halka grafik (Problem Netliği, Pazar, Orijinallik, Fizibilite) |
| **Stack & Maliyet** | AI tarafından önerilen teknoloji stack'i + 3 aylık maliyet tahmini |

**Özgün özellik:** Sohbet ekranında kullanıcı her soruyu cevapladıkça baştaki "nokta" görsel olarak büyür — fikir olgunlaştıkça nokta yıldıza dönüşür.

---

## Decision Log

| Karar | Neden |
|-------|-------|
| Track A seçildi | Nokta'nın özü "engineering-guided enrichment" — Track A bunu en doğrudan temsil ediyor |
| 5 soru boyutu: Kullanıcı & Problem / Değer / İlk Adım / Risk / Başarı | Mühendislik jargonu yerine sade ve anlaşılır sorular; herkes cevaplayabilir |
| Gemini 1.5 Flash 8B | Ücretsiz tier'da en yüksek rate limit (1500 istek/gün), Türkçe prompt desteği tam |
| JSON-only response format | Strict JSON schema prompt ile halüsinasyon ve parse hataları minimize edildi |
| Fallback (mock) mekanizması | API rate limit'inde uygulama çökmüyor; demo ve jüri değerlendirmesi kesintisiz devam eder |
| Nokta Skoru bonus özelliği | "slop-free" felsefesini görünür kılmak; 4 boyutlu animasyonlu puanlama jüri demosu için etkileyici |
| Stack & Maliyet 3. sekmesi | Fikrin hayata geçirilmesi için teknoloji ve maliyet tahmini — pratik çıktı, özgünlük katkısı |
| Noktanın soru başına büyümesi | Uygulamanın asıl metaforu: fikir her cevapla olgunlaşır, nokta yıldıza dönüşür |
| Dark cosmic tema | "Nokta" = derin uzayda doğan bir fikir; tasarım bu metaforu görselleştirir |

---

## AI Tool Log

- **Antigravity (Claude Sonnet 4.6 Thinking):** Proje planlaması, tüm ekran kodları (HomeScreen, ChatScreen, SpecScreen), Gemini prompt mühendisliği, component tasarımı (GlowDot, ScoreRing), fallback mekanizması
- **Gemini 1.5 Flash 8B API:** Runtime — fikre özel engineering soruları üretme, spec üretimi, Nokta Skoru hesaplama, Stack & Maliyet analizi
