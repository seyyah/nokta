# Bug Raporu — Nokta

**Tarih:** 18.05.2026 21:26
**Toplam:** 1 not · 🔴 1 açık · ✅ 0 düzeltildi
**Kaynak:** nokta-audit (`@xtatistix/mobile-audit`) → Markdown export

> Burn-in'li ekran görüntüsü (sarı seçim kutusu görüntünün immutable parçasıdır).

---

## Ekran: IdeaDetailScreen

### 🔴 #1 — Uzun açıklamada metin ekranın altından taşıyor, STATUS satırı görünmüyor

![IdeaDetailScreen burn-in](./03-ideadetail-overflow.png)

İlk fikrin (97 / PURE SLOP) detay sayfasında açıklama metni o kadar uzun ki
ekranın en altına kadar iniyor ve son cümle ("...destined to bootstrap") kenarda
kesiliyor. Aşağı kaydıramıyorum, ekran sabit. Açıklamanın altında olması gereken
STATUS satırı ise hiç görünmüyor. Uzun açıklamalı fikirlerde içerik
kaydırılabilir olmalı.

- **Durum:** Açık
- **Seçim (burn-in bounds):** `{ x: 32, y: 1390, width: 760, height: 220 }`
- **Zaman:** 18.05.2026 21:26
- **Raporlayan:** qa-team
- **currentScreen:** `IdeaDetailScreen` → `src/app/ideas/[id].tsx`
