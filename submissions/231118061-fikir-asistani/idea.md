# idea.md — Track 1: Ham Fikir

## Seçilen Track
**Track 1 — Ham Fikir → Engineering Spec**

Kullanıcı ham bir uygulama fikrini girer. AI, fikri netleştirmek için 4 mühendislik sorusu sorar (problem, kullanıcı, kapsam, kısıt). Kullanıcı cevapladıktan sonra AI tek sayfalık bir ürün spec'i üretir.

---

## Uygulama Fikri

**NOKTA Fikir Asistanı** — Mobil uygulama fikirlerini yapılandırılmış bir spec'e dönüştüren AI destekli araç.

### Problem
Geliştiriciler ve girişimciler çoğu zaman ürün fikirlerine sahip olsa da bu fikirleri net bir şekilde tanımlayamaz. Hangi problemi çözdüklerini, kimin için yaptıklarını ve neyi kapsam dışı bıraktıklarını bilmeden geliştirmeye başlarlar.

### Hedef Kullanıcı
- Mobil uygulama geliştirmeye yeni başlayan öğrenciler
- Bağımsız girişimciler ve indie developers
- Hackathon katılımcıları

### Çözüm (MVP)
1. Kullanıcı ham fikrini metin olarak girer
2. AI (Gemini 2.0 Flash) 4 mühendislik sorusu üretir:
   - Problem: Gerçek bir ağrı noktası mı?
   - Kullanıcı: Kim kullanacak, kaç kişi?
   - Kapsam: MVP'de ne var, ne yok?
   - Kısıt: Teknik/yasal kısıtlar var mı?
3. Kullanıcı cevaplar
4. AI tek sayfalık spec üretir (Problem / Hedef Kullanıcı / Çözüm / Kapsam Dışı / Başarı Kriteri)

### Kapsam Dışı
- Kullanıcı hesapları / oturum açma
- Spec kaydetme / paylaşma
- Ses girişi
- Çoklu dil desteği

### Başarı Kriteri
- Kullanıcı 3 dakikada ham fikirden spec'e ulaşabilmeli
- AI soruları her seferinde fikre özgü olmalı
- Üretilen spec, bir geliştirici için actionable olmalı

---

## Teknik Kararlar

| Karar | Seçim | Gerekçe |
|-------|-------|---------|
| Framework | Expo (React Native) | Cross-platform, hızlı prototipleme |
| AI API | Google Gemini 2.0 Flash | Ücretsiz tier mevcut, hızlı yanıt |
| State | React useState | MVP için yeterli, karmaşıklık yok |
| Navigasyon | Tek ekran (stage bazlı) | Basitlik, ödev kapsamına uygun |

---

## Decision Log

- **Neden Track 1?** En az ambiguity, AI entegrasyonu açıkça tanımlı, kısa sürede tamamlanabilir.
- **Neden Gemini?** Anthropic API ücretli, Gemini ücretsiz tier sunuyor ve aynı kalitede yanıt üretiyor.
- **Neden single-screen?** Navigation karmaşıklığı yerine AI mantığına odaklanmak istedik.
