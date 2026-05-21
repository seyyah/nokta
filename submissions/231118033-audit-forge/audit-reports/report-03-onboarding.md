# Bug Raporu — Nokta

**Tarih:** 14.05.2026 10:48
**Toplam:** 1 not · 🔴 1 açık · ✅ 0 düzeltildi
**Uygulama:** Nokta v1.0.0
**Raporlayan:** 231118033

---

## Ekran: OnboardingScreen

### 🔴 #1 — "Atla" butonu ilk adımda görünmüyor / gri ve silik

![Screenshot — OnboardingScreen](./screenshots/onboarding-skip-btn.png)

> ⚠️ _Burn-in: Sarı kutu sağ üst köşedeki "Atla" yazısını işaretliyor —
> metin rengi (#64748b) çok soluk, arka plan (#1a1a2e) ile kontrast oranı WCAG AA'yı karşılamıyor._

- **Durum:** Açık
- **Zaman:** 14.05.2026 10:48
- **Raporlayan:** 231118033
- **Ekran:** OnboardingScreen (`/onboarding`)

**Not:**
"Atla" butonu rengi `#64748b`. Arka plan `#1a1a2e` üzerinde kontrast oranı ~2.4:1,
WCAG AA standardı için minimum 4.5:1 gerekli. Kullanıcı "Atla" seçeneğini görmüyor,
mecburen 3 adımı geçiyor. Özellikle gün ışığında ekran neredeyse okunamıyor.

Ayrıca: "Atla" butonu `accessibilityLabel="Atla"` var ama dokunuş alanı yalnızca
metin boyutunda (yaklaşık 40×20 px). Genişletilmeli.

**Beklenen davranış:**
- "Atla" metni en az `#94a3b8` (kontrast ~4.6:1) rengiyle gösterilmeli
- Dokunuş alanı minimum 44×44 px olmalı

**Gözlemlenen davranış:**
- Soluk gri metin, arka planla neredeyse birleşiyor
- Küçük dokunuş alanı, ıskalanıyor

---

_Rapor @xtatistix/mobile-audit tarafından üretildi._
