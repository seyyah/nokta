# Bug Raporu — Nokta

**Tarih:** 14.05.2026 10:15
**Toplam:** 1 not · 🔴 1 açık · ✅ 0 düzeltildi
**Uygulama:** Nokta v1.0.0
**Raporlayan:** 231118033

---

## Ekran: IdeaDetailScreen

### 🔴 #1 — "Oy Ver" butonu FAB'ın altında kalıyor

![Screenshot — IdeaDetailScreen](./screenshots/idea-detail-vote-btn.png)

> ⚠️ _Burn-in: Sarı kutu ekranın altındaki "Oy Ver" butonunu işaretliyor —
> buton kısmen bug raporu FAB'ı (#e53e3e kırmızı) tarafından örtülüyor._

- **Durum:** Açık
- **Zaman:** 14.05.2026 10:15
- **Raporlayan:** 231118033
- **Ekran:** IdeaDetailScreen (`/idea/1`)

**Not:**
ScrollView'ın `paddingBottom: 100` değeri FAB'ın yüksekliğiyle hesaplanmış ama
cihaza göre (safe area + FAB boyutu) "Oy Ver" butonu hâlâ kısmen görünmüyor.
Küçük ekranlı cihazlarda (iPhone SE) butonun alt kısmı FAB'ın arkasına giriyor.

**Beklenen davranış:** ScrollView içeriği her cihazda tam görünmeli; FAB "Oy Ver" butonunu örtmemeli.
**Gözlemlenen davranış:** iPhone SE simülatöründe "Oy Ver" butonunun alt yarısı FAB arkasında kalıyor.

**Tekrar adımları:**
1. Küçük ekran (375×667) ile aç
2. `/idea/1` ekranına git
3. Sayfayı en alta kaydır
4. "Oy Ver" butonu kısmen görünmez

---

_Rapor @xtatistix/mobile-audit tarafından üretildi._
