# NonSlop — Human Expert Addition

**Öğrenci No:** 231118026  
**Track Seçimi:** Track C — Implementation (Human-in-the-Loop Expert Feature)

## Ne Eklendi

NonSlop'un mevcut wizard + AI akışına **gerçek insan uzman döngüsü (HITL)** eklendi.

### Akış

```
Klinisyen → "Uzmana Sor"
  → Soru + bileşen özeti ile talep oluşturulur
  → AsyncStorage kuyruğuna kaydedilir
  → Mail uygulaması açılır (konu + bileşenler + skor dolu)

Uzman → logoya 5 kez dokununca Uzman Paneli açılır
  → Bekleyen talepleri görür
  → Rating + özet + güçlü yönler + öneri yazar → yanıtlar

Klinisyen → "Taleplerim" (Ana ekranda badge ile)
  → Uzman yanıtını görür (rating, detaylı değerlendirme)
```

### Eklenen Ekranlar

| Ekran | Açıklama |
|---|---|
| `AskExpert` | Klinisyen — talep formu + AsyncStorage + mailto |
| `RequestSent` | Onay ekranı — "Talebiniz iletildi" |
| `ExpertPanel` | **İnsan uzman paneli** — inbox + yanıt formu |
| `MyRequests` | Klinisyen — talep takibi + yanıt detayı |

### Neden Önemli

`idea.md` Key Insight 7'de tanımlanan HITL moat:
> *"The LLM is the personalization engine; the human audit is the authority."*

AI katmanı (Groq) katalog sınırları içinde kişiselleştirme yapar — ama her klinik değerlendirme gerçek bir uzman tarafından yapılır. Bu fark NonSlop'u "slop" olmaktan çıkaran temel mimari karardır.

## Kurulum

```bash
cd app
npm install
cp .env.example .env
# .env dosyasına Groq API key'ini ekle
npx expo start
```

## Tech Stack

- React Native / Expo
- AsyncStorage (local-first, sıfır backend)
- Groq API (AI Custom Request için)
- React Navigation v6
- i18n TR/EN
