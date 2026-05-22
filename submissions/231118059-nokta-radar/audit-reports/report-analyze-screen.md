# Audit Report — AnalyzeScreen
**App:** NOKTA RADAR  
**Screen:** /analyze (AnalyzeScreen)  
**Reporter:** 231118059  
**Date:** 2026-05-20  
**Status:** 🔴 open  

---

## Screenshot

> [burn-in screenshot — AnalyzeScreen, pitch TextInput highlighted]

---

## Bug / UX Issue

**Başlık:** Pitch input alanı çok küçük — kullanıcı uzun fikir yazarken ekranı kaplamıyor

**Detay:**  
`AnalyzeScreen`'deki pitch input `minHeight: 180` ile sabit. Kullanıcı 200+ kelimelik bir pitch yazmaya çalıştığında alan yetmiyor, metin scroll içine kayıyor ve ne yazdığını göremez hale geliyor. Özellikle `INTERROGATION` adımında da aynı sorun var: soru kutusu + yanıt input'u ekranda çakışıyor.

**Adımlar (Reproduce):**
1. Analyze sekmesine git
2. TextInput'a 200+ kelimelik bir metin yazmayı dene
3. Alt satırlar görünmez oluyor; yazı scroll ile kayboldu

**Beklenen davranış:** Input alanı en az 220px yüksekliğinde olmalı, içerik tam görünmeli.  
**Mevcut davranış:** `minHeight: 180`, içerik taşıyor.

---

## Engineering Note

`AnalyzeScreen.tsx` → `styles.textArea.minHeight: 180` → `220` yapılmalı.  
Ayrıca `INTERROGATION` step'inde question box ile input kutusu arasına `marginBottom` eklenmeli.

---

## Tags
- `bug` `ux` `input` `analyze-screen`
