# Bug Raporu — Slop Dedektörü

**Tarih:** 20.05.2026 14:35  
**Toplam:** 1 not · 🔴 1 açık · ✅ 0 düzeltildi

---

## Ekran: ResultsScreen

### 🔴 #2 — Skor göstergesi bar animasyonu ikinci analizde çalışmıyor

- **Durum:** Açık  
- **Zaman:** 20.05.2026 14:35  
- **Raporlayan:** slop-qa  

**Not:** İlk analizde `ScoreGauge` bar animasyonu düzgün çalışıyor (0'dan skora doğru genişliyor). Aynı oturumda ikinci pitch analiz edildiğinde bar animasyonu çalışmıyor — bar direkt son konumda beliriyor.

**Kök neden:** `fadeAnim.setValue(0)` reset ediliyor ama `ScoreGauge` içindeki `Animated.Value` reset edilmiyor. Her render'da yeni `useRef` oluşturulmuyor, eski değer kalıyor.

**Beklenen:** Her yeni analizde bar animasyonu sıfırdan başlamalı.  
**Gerçekleşen:** İkinci analizden itibaren animasyon yok, bar statik görünüyor.
