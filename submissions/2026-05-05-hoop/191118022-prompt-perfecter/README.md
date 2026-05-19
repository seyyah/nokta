# Prompt Perfecter — Track A Submission

**Öğrenci No:** 191118022  
**Slug:** prompt-perfecter  
**Track:** Track A — Dot Capture & Enrich

---

## Track Secimi

**Track A — Dot Capture & Enrich** seçildi.

Ham fikri metin veya ses ile alan, GPT-5.4-mini AI ile 4 yonlendirici soru soran (problem, kullanici, kapsam, kisit), ardindan **tek sayfalik mukemmel prompt** ureten bir mobil uygulama gelistirildi.

Klasik Track A akisi: `Ham Fikir -> AI Sorulari -> Detayli Cevaplar -> Mukemmel Prompt`.

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
| 2026-05-12 | Gercek cihazda sesli fikir girisi eklendi | Track A akisini bozmadan ham fikrin mikrofonla alinmasi saglandi |
| 2026-05-12 | Expo Speech Recognition secildi | Android telefonda dusuk surtunmeli, dogrudan fikir capture bonusu sagliyor |

## AI Tool Log

- **Antigravity (Google Deepmind Agentic Coding)** — Expo proje iskeletini, tüm ekranları ve Gemini entegrasyonunu otomatik oluşturdu.
- **Codex / GPT-5** — Telefon testi, sesli giris entegrasyonu ve submission paketleme adimlarinda kullanildi.
- Rate limit durumunda backup: manuel kod yazımı.

## Ek Capability

- Ham fikir metin yerine mikrofonla da girilebiliyor.
- Sesli giris ozellikle telefonda test edildi ve Track A'nin "capture" kismini daha dogal hale getirdi.
