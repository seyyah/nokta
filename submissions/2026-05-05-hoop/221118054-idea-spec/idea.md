# idea.md - Track 1: Idea Spec + Uzman Destegi (v2)

## Track Secimi
**Track 1** - Ham fikri AI ile 5 sorulu sohbete sokar, tek sayfa spec uretir.
**v2 Eklentisi:** Olusturulan spec'e insan uzman desteği katmani.

---

## v2 Akisi

```
Spec ekrani -> "Spec'e Uzman Destegi Al" butonu
   -> 4 uzman karti
   -> Uzman secilir, soru opsiyonel
   -> 3sn loading
   -> Recommendation badge (DEVAM/REVIZE/PIVOT) + detayli yanit
   -> Gecmise kaydedilir
```

## 4 Uzman Profili

| Uzman | Uzmanlik | Odak |
|-------|----------|------|
| 👩‍💼 Ayse - UX Stratejisti | Problem Framing, User Research | problem & user |
| 👨‍💼 Mehmet - PM | MVP Scope, Roadmap | scope |
| 👩‍🔬 Zeynep - Domain Expert | Customer Discovery, PMF | severity & metrics |
| 👨‍💻 Burak - Tech Advisor | Tech Feasibility | constraints |

## Spec Quality Detection

Yanit motoru spec'in dolu olma seviyesine gore farkli ton tutar:

- **excellent** (4-5 alan dolu, ortalama uzunluk > 40 char) -> DEVAM ET
- **good** (3+ alan dolu, ortalama uzunluk > 20 char) -> REVIZE ET
- **weak** (cogu alan bos veya kisa) -> PIVOT YAP

## Decision Log (v2)

| Karar | Neden |
|-------|-------|
| 4 uzman (mock) | Backend yok, demo icin yeterli cesitlilik |
| Spec quality detection | Yanit kalitesinin spec'e gore adapt olmasi |
| 3 recommendation type | KILL agir, PROCEED/ITERATE/PIVOT yeterli |
| Tek dosyali state machine | 4 ekran yerine basit, tutarli |
| AsyncStorage @nokta/expert_responses | Mevcut storage pattern uyumlu |
