# idea.md — Nokta Mobil Dilimleme

## Track: B + C Hibrit

---

## Fikir Özeti

Nokta'nın iki temel akışını tek mobil uygulamada birleştiren bir prototip:

1. **Migration & Dedup (Track C):** Kullanıcı dağınık notlarını (WhatsApp logu, bullet listesi, e-posta taslağı) yapıştırır. AI ham metni analiz ederek tekrar eden fikirleri birleştirir, anlamsız kısa notları eler ve temiz idea card'larına dönüştürür.

2. **Departman Analizi + Sentez (Track B):** Kullanıcı bir fikir girer (veya Migration'dan bir idea card seçer). Dört yapay zeka ajanı — Pazarlama, Teknik, Finans, Risk — fikri kendi perspektifinden bağımsız olarak değerlendirir. Dört analiz tamamlanınca sentez ajanı kurumsal karar + yatırım skoru (0–100) üretir.

---

## Problem

Ham fikirler Notion notlarında, WhatsApp mesajlarında ya da e-posta taslakları arasında kaybolur. Bunları bir araya toplamak, tekrarları elemek ve her birini sistematik olarak değerlendirmek için araç yoktur. Mevcut LLM araçları açık uçlu sohbet sunar; yapılandırılmış, departman bazlı, kurumsal karar üretmez.

---

## Kullanıcı

- Ham fikri olan ama bunu olgunlaştırma sürecini bilmeyen solo girişimci
- Dağınık notlarını temizlemek isteyen araştırmacı veya ürün yöneticisi
- Bir fikri hızlıca "yatırıma hazır mı?" filtresiyle geçirmek isteyen melek yatırımcı

---

## Kapsam (Bu Prototipte)

- [x] Ham metin → idea card'lara ayıklama (Track C)
- [x] Idea card'dan doğrudan departman analizine geçiş
- [x] 4 departman AI ajanı (Pazarlama, Teknik, Finans, Risk)
- [x] Sentez ajanı → kurumsal karar + yatırım skoru
- [ ] Ses ile fikir girişi (kapsam dışı)
- [ ] NDA korumalı QA marketplace (kapsam dışı)
- [ ] Sosyal medya trend tarama (kapsam dışı)

---

## Kısıtlar

- Model: `llama-3.3-70b-versatile` via Groq API (hız önceliği)
- Tüm state in-memory, persist yok (prototip kapsamı)
- JSON çıktı zorunlu, serbest metin kabul edilmiyor
- Tek dosya React Native + Expo mimarisi

---

## Çıktı (Artifact)

Her analiz sonunda kullanıcı şunları elde eder:
- 4 departmanın bağımsız değerlendirmesi (güçlü / zayıf / karar / şart)
- Kurumsal karar: `Onayla` / `Şartlı Onayla` / `Reddet`
- Yatırım skoru: 0–100
- Öncelikli ilk adım önerisi

Bu çıktı Nokta tezindeki "engineering-guided artifact" kavramının mobil prototipidir.
