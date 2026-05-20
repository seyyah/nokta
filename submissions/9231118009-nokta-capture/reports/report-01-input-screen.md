# Bug Raporu — Slop Dedektörü

**Tarih:** 20.05.2026 14:22  
**Toplam:** 1 not · 🔴 1 açık · ✅ 0 düzeltildi

---

## Ekran: InputScreen

### 🔴 #1 — "Analiz Et" butonu çok kısa pitch'te uyarı vermiyor

- **Durum:** Açık  
- **Zaman:** 20.05.2026 14:22  
- **Raporlayan:** slop-qa  

**Not:** Kullanıcı 5 karakterlik bir metin girip "Analiz Et" butonuna basabiliyor. API'ye gidiyor ama anlamsız sonuç dönüyor. Minimum karakter sınırı (örn. 50 karakter) eklenmeli, buton disabled veya uyarı gösterilmeli.

**Beklenen:** Pitch çok kısaysa buton disabled ya da sarı uyarı banner görünmeli.  
**Gerçekleşen:** Buton aktif, API çağrısı yapılıyor, saçma sonuç dönüyor.
