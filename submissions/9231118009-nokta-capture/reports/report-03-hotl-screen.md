# Bug Raporu — Slop Dedektörü

**Tarih:** 20.05.2026 14:48  
**Toplam:** 1 not · 🔴 1 açık · ✅ 0 düzeltildi

---

## Ekran: HotlScreen

### 🔴 #3 — HOTL onay ekranında "Düzenle" butonu HITL'e geçince geri dönüş yolu yok

- **Durum:** Açık  
- **Zaman:** 20.05.2026 14:48  
- **Raporlayan:** slop-qa  

**Not:** Kullanıcı HOTL ekranında "✏️ Düzenle (HITL)" butonuna bastığında HITL moduna geçiyor. HITL ekranında sadece "✅ Onayla ve Kaydet" butonu var — "Geri" veya "İptal" yok. Kullanıcı yanlışlıkla Düzenle'ye bastıysa çıkış yolu bulunmuyor, zorla bir sayı girmek zorunda kalıyor.

**Beklenen:** HITL ekranında "← Geri" butonu olmalı, HOTL onay ekranına döndürmeli.  
**Gerçekleşen:** Tek çıkış yolu sayı girip onaylamak — hatalı UX.
