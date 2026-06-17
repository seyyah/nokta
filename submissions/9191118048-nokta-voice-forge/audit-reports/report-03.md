# Audit Report — Forge Dashboard

**Rapor ID:** report-03
**Ekran:** ForgeScreen (Forge Dashboard)
**Tarih:** 2026-05-28T14:10:00Z
**Severity:** 🟢 Low
**Status:** Resolved (via Forge Cycle 3)

---

## Gözlem

Forge dashboard ekranındaki timeline kartları genişletildiğinde (tap to expand) birden fazla kart aynı anda açık kalabiliyor. Bu durum:

1. Ekranda çok fazla bilgi görüntülenmesine
2. Hangi kartın aktif olduğunun anlaşılamamasına
3. Scroll pozisyonunun kaymasına

neden oluyor. Accordion pattern (tek seferde tek kart açık) uygulanmalı.

## Burn-in Detayları

### Ekran Durumu
- Uygulama: Forge Dashboard ekranı
- Durum: 3 cycle kartı listelenmiş, 2'si expanded durumda
- Beklenen: Bir karta tıklanınca diğerleri kapanmalı
- Gerçekleşen: Tüm kartlar bağımsız olarak açılıp kapanıyor

### Teknik Notlar
- Her ForgeTimeline kartı kendi `isExpanded` boolean state'ini tutuyor
- Kartlar arası state koordinasyonu yok
- Layout shift: expanded kartlar ~200px ek yükseklik ekliyor

## Önerilen Aksiyon

1. Bireysel `isExpanded` state'leri kaldır
2. Tek bir `expandedId: number | null` state'i ile accordion pattern uygula
3. Kart açılırken smooth height animasyonu ekle (LayoutAnimation veya reanimated)

## Forge Cycle Referansları

- **Cycle 3:** Accordion pattern fix → SUCCESS ✅

## 2026-06-15 Son Dogrulama

- Forge state machine SUCCESS, ROLLBACK, FAIL ve STUCK sonuclarini destekler.
- Iki ardisik basarisizlik Expert Bridge tetigini acar.
- Bridge context, sonraki Forge cycle hipotezine otomatik eklenir.
- Gercek uzman gorusmesi/transkripsiyonu teslimden once manuel olarak tamamlanmalidir.
