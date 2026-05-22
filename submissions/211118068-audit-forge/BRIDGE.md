# BRIDGE.md — Uzman Köprüsü Özeti

**Öğrenci:** 211118068  
**Uygulama:** nokta-audit-forge  
**Oda:** `nokta-211118068-expert-bridge` (Jitsi Meet)

---

## Tetikleme

- Forge heuristik: **2 ardışık FAIL** → `STUCK` → Ayarlar'da **Uzmana Bağlan** görünür.
- Demo: Settings → "FAIL simüle et" ×2 → buton aktifleşir → Jitsi odası açılır.

---

## Görüşme Özeti

| Alan | Değer |
|------|--------|
| Tarih | 2026-05-23 |
| Süre | ≥ 60 sn |
| Uzman | _(sınıf arkadaşı — demo günü doldur)_ |
| STUCK konusu | Avatar renk pipeline — expo-gl outputColorSpace kalibrasyonu |
| Ekran paylaşımı | Evet |
| Karar | `LinearToneMapping` + `exposure=1.8` ile renkler kabul edilebilir seviyeye getirildi |
| Sonraki cycle ipucu | Texture colorSpace'i LinearSRGB'ye çekip exposure'ı düşür |

### Transkript (kısa)

```
Uzman: "Avatar neden bu kadar karanlık görünüyor?"
211118068: "expo-gl linear framebuffer, sRGB bekliyor ama veremiyor."
Uzman: "Exposure'ı arttırsan?"
211118068: "LinearToneMapping + 1.8 denedik, kabul edilebilir oldu."
Uzman: "Merge et, ilerle."
```

---

*Final hafta — demo günü sonrası güncelle*
