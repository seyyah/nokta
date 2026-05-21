# Bug Raporu — Nokta

**Tarih:** 14.05.2026 09:42
**Toplam:** 1 not · 🔴 1 açık · ✅ 0 düzeltildi
**Uygulama:** Nokta v1.0.0
**Raporlayan:** 231118033

---

## Ekran: HomeScreen

### 🔴 #1 — Onboarding butonu dokunuş alanı çok küçük

![Screenshot — HomeScreen](./screenshots/home-onboard-btn.png)

> ⚠️ _Burn-in: Sarı kutu sağ üst köşedeki "?" butonunu işaretliyor._

- **Durum:** Açık
- **Zaman:** 14.05.2026 09:42
- **Raporlayan:** 231118033
- **Ekran:** HomeScreen (`/`)

**Not:**
Sağ üst köşedeki "?" (onboarding) butonu sadece 32×32 px. Parmakla dokunmak çok zor,
sürekli ıskalıyorum. Minimum dokunuş alanı 44×44 px olmalı (Apple HIG). Ayrıca buton
rengi (#4a4a8a) arka planla yeterli kontrast vermiyor, görünürlüğü düşük.

**Beklenen davranış:** Buton en az 44×44 px, erişilebilir bir renkle gösterilmeli.
**Gözlemlenen davranış:** 32×32 px koyu buton — parmak ıskalıyor, dokunuş başarısız.

---

_Rapor @xtatistix/mobile-audit tarafından üretildi._
