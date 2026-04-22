# idea.md — Track 1: Ham Fikir → Spec

## Uygulama Adı
**FlashAI** — Sınav Flashcard Üreteci

## Track
Track 1 — Ham fikir → Engineering sorular → Tek sayfa spec

---

## Engineering Soruları & Cevaplar

| # | Boyut | Soru | Cevap |
|---|-------|------|-------|
| 1 | Problem | Öğrenciler flashcard olmadan ne kaybediyor? | Elle kart hazırlamak çok zaman alır; çoğu öğrenci hiç yapmadan sınava girer. Tekrar kalitesi düşer, önemli kavramlar atlanır. |
| 2 | User | Birincil kullanıcı kim? | 18-25 yaş arası üniversite öğrencisi. Sınavdan 1-2 gün önce yoğun çalışıyor. Teknik seviyesi orta, mobil öncelikli kullanıcı. |
| 3 | Scope | MVP'de ne var, ne yok? | **VAR:** Metin / metin bazlı PDF yükleme, AI ile otomatik Q&A flashcard üretme, swipe arayüzü. **YOK:** Görsel tanıma, çoktan seçmeli format, hesap sistemi, paylaşım, offline mod. |
| 4 | Constraint | Teknik / iş kısıtları? | Tek kişi, 1 hafta. Stack: Expo (React Native) + Anthropic Claude API. İnternet zorunlu, native modül yok. |
| 5 | Success | Başarı metriği? | Kullanıcı PDF yükleyip 60 saniye içinde ≥10 flashcard elde eder. Kartlar konuyla açıkça alakalı olmalı. |

---

## Tek Sayfa Spec

### Problem Statement
Üniversite öğrencileri sınav öncesi ders notlarını etkili biçimde tekrar etmek ister; ancak elle flashcard hazırlamak zahmetli ve zaman alıcıdır. Sonuç: ya hiç kart yapılmaz, ya da düşük kaliteli, eksik kartlar. **FlashAI**, ders notunu veya PDF'i yükleyince saniyeler içinde soru-cevap kartı seti üretir.

### User Story
> "Üniversite öğrencisi olarak, ders notumu yükleyip otomatik flashcard almak istiyorum; böylece sınava hazırlanmak için harcadığım zamanı azaltabilirim."

### Özellik Listesi (MVP)

| Öncelik | Özellik | Açıklama |
|---------|---------|----------|
| P0 | Metin girişi | Kullanıcı düz metin yapıştırır |
| P0 | PDF yükleme | Metin bazlı PDF parse edilir |
| P0 | AI kart üretimi | Claude API → soru + cevap çiftleri (JSON) |
| P0 | Swipe arayüzü | Kart yığını, dokunarak çevirme animasyonu |
| P1 | Kart sayısı seçimi | 5 / 10 / 20 kart seçeneği |
| P1 | Yeniden üret | Tek karta "yeniden üret" butonu |
| P2 | Kartları kaydet | AsyncStorage ile lokal saklama |

### Teknik Mimari

```
Kullanıcı
  │
  ├─ Metin / PDF yükle
  │     └─ expo-document-picker + expo-file-system
  │
  ├─ Metin → Anthropic API (claude-sonnet-4-20250514)
  │     Prompt: "Aşağıdaki metinden {n} adet Türkçe flashcard üret.
  │              JSON array: [{question, answer}]"
  │
  └─ Kartlar → FlashcardViewer (swipe / flip animasyonu)
                    └─ AsyncStorage (opsiyonel kayıt)
```

### Prompt Tasarımı
```
Sen bir sınav hazırlık asistanısın.
Aşağıdaki ders notundan {n} adet flashcard üret.
Her kart: {"question": "...", "answer": "..."}
Sadece JSON array döndür, başka hiçbir şey yazma.
Türkçe metin için Türkçe kart üret.

Metin:
{text}
```

### Riskler & Mitigasyon

| Risk | Olasılık | Çözüm |
|------|----------|-------|
| PDF'den metin çıkarılamıyor | Orta | Sadece metin bazlı PDF destekle, uyarı göster |
| API gecikmesi >10 sn | Düşük | Loading skeleton + timeout mesajı |
| Kart kalitesi düşük | Orta | Kullanıcıya "yeniden üret" butonu sun |
| API maliyeti | Düşük | max_tokens=1000, kısa prompt |

### Başarı Metrikleri
- Yükleme → ilk kart görünme süresi: **≤60 saniye**
- Minimum kart sayısı: **≥10 kart / istek**
- Kart alakalılığı: kullanıcı geri bildirimine göre **≥80%**

---

## Slug
`flashai`

## Klasör
`submissions/231118022-flashai/`
