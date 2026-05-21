# Audit Report — ManifestoScreen
**App:** NOKTA RADAR  
**Screen:** /manifesto (ManifestoScreen)  
**Reporter:** 231118059  
**Date:** 2026-05-20  
**Status:** 🔴 open  

---

## Screenshot

> [burn-in screenshot — ManifestoScreen, header area highlighted]

---

## Bug / UX Issue

**Başlık:** Manifesto başlığı status bar ile çakışıyor — üstte padding yok

**Detay:**  
`ManifestoScreen`'de `scrollContent` style'ında `padding: 24` var ama `paddingTop` yok. Cihazda status bar yüksekliği (özellikle notch'lu cihazlarda) 44-54px arasında. Bu durumda Terminal ikonu ve "MANİFESTO" başlığı status bar'ın altına sıkışıyor.

**Adımlar (Reproduce):**
1. Manifesto sekmesine git
2. En üstteki Terminal ikonu + başlığın status bar'a çok yakın olduğunu gör

**Beklenen davranış:** Header, status bar'ın altında rahat oturmalı; `paddingTop: 56` (veya `useSafeAreaInsets`) olmalı.  
**Mevcut davranış:** `padding: 24` → `paddingTop` etkisiz (scrollContent'te tanımlı ama View'de uygulanmıyor).

---

## Engineering Note

`ManifestoScreen.tsx` → `scrollContent` style → `paddingTop: 56` ekle.  
Alternatif: `useSafeAreaInsets()` hook'u ile dinamik çözüm.  
**NOT:** Bu ekranda zaten `ScrollView` var, `View` wrapper gerekli değil.

---

## Tags
- `bug` `layout` `safe-area` `manifesto-screen`
