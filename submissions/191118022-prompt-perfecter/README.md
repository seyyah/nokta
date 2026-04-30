# Prompt Perfecter — Track A Submission

**Öğrenci No:** 191118022  
**Slug:** prompt-perfecter  
**Track:** Track A — Dot Capture & Enrich

---

## Track Seçimi

**Track A — Dot Capture & Enrich** seçildi.

Ham fikri (text) alan, GPT-5.4-mini AI ile 4 yönlendirici soru soran (problem, kullanıcı, kapsam, kısıt), ardından **tek sayfalık mükemmel prompt** üreten bir mobil uygulama geliştirildi.

Klasik Track A akışı: `Ham Fikir → AI Soruları → Detaylı Cevaplar → Mükemmel Prompt`.

---

## Demo

- **Expo QR / Link:** [exp://192.168.1.177:8082](exp://192.168.1.177:8082)
- **Demo Video:** [https://www.youtube.com/shorts/2WSSAulrjsA](https://www.youtube.com/shorts/2WSSAulrjsA)

---

## Decision Log

| Tarih | Karar | Gerekçe |
|---|---|---|
| 2026-04-22 | Track A seçildi | Fikir zenginleştirme akışı en güçlü UX potansiyeline sahip |
| 2026-04-22 | OpenAI API (gpt-5.4-mini) | Hızlı yanıt, Türkçe destek. İlk baştaki Gemini tercihi ChatGPT lehine değiştirildi. |
| 2026-04-22 | Görsel üretimi iptal edildi | İstenildiği üzere sadeleştirildi |
| 2026-04-22 | React Native Expo SDK 52 | Hızlı APK çıktısı, EAS Build desteği |
| 2026-04-22 | 4 engineering sorusu: Problem, Hedef Kullanıcı, Kapsam, Kısıt | Track A rubriğine tam uyum |
| 2026-04-22 | Cross-track bonus: Slop Score | Track B mantığı Track A çıktısına entegre edildi; özgünlük skoru ve öneri üretiyor |

| 2026-04-22 | AI Tool: Antigravity (Google Deepmind) | Kod iskeletini ve ekranları otomatik oluşturdu |

## AI Tool Log

- **Antigravity (Google Deepmind Agentic Coding)** — Expo proje iskeletini, tüm ekranları ve Gemini entegrasyonunu otomatik oluşturdu.
- Rate limit durumunda backup: manuel kod yazımı.
