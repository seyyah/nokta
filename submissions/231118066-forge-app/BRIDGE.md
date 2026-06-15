# BRIDGE.md — Uzman Görüşme Kayıtları

## Görüşme 1 — 2026-05-28

**Tetikleyici:** FORGE döngüsünde 2 ardışık ROLLBACK — STUCK durumu.

**Katılımcılar:** 231118066 Alperen + Sınıf arkadaşı (uzman rolünde)

**Platform:** Jitsi Meet — meet.jit.si/forge-audit-231118066

**Sorun:** AvatarScreen'de ağız animasyonu 100ms interval ile titreme (jitter) yapıyordu. Konuşma sırasında ağız animasyonu düzgün çalışmıyordu.

**Uzmanın önerileri:**

* setInterval süresini 100ms'den 160ms'ye çıkar
* Animated.timing'e Easing.inOut ekle
* Head bob animasyonunu ayrı loop'ta tut

**Uygulanan düzeltme:** Cycle 8'de uygulandı — commit `a3f9c21`

**Ekran paylaşımı:** ✅ Demo videoda gösterildi

**Görüşme özeti:** Uzman, animasyon jitter sorununun temel nedeninin setInterval'ın Animated.timing tamamlanmadan yeni animasyon başlatması olduğunu açıkladı. 160ms interval ile animasyonların tamamlanmasına yeterli süre tanındı ve titreme sorunu çözüldü.

\---

## Görüşme 2 — 2026-05-28

**Tetikleyici:** VoiceScreen bar animasyonu sessizlikte sönmüyor.

**Sorun:** Mikrofon kapandıktan sonra barlar 500ms boyunca yüksek kalmaya devam ediyor. Fade duration 80ms yerine 300ms olmalı.

**Uzmanın önerisi:** Animated.timing duration değerini 80ms'den 300ms'ye çıkar, silenceBars fonksiyonuna debounce ekle.

**Uygulanan düzeltme:** Cycle 5'te uygulandı — commit `b1e3f4a`

**Sonuç:** ✅ Başarılı



\---



\## Demo Görüşmesi — 2026-05-28



\*\*Platform:\*\* Jitsi Meet — meet.jit.si/forge-audit-231118066



\*\*Katılımcılar:\*\* 231118066 Alperen + Sınıf arkadaşı



\*\*Süre:\*\* 60 saniye+ (ekran paylaşımlı)



\*\*Konuşulan başlıklar:\*\*

\- ForgeApp'in genel işleyişi ve FORGE döngüsü anlatıldı

\- Voice visualizer ve avatar özellikleri gösterildi

\- Audit widget'ın drop-in yapısı açıklandı

\- Uzman görüşmesinin STUCK durumunda nasıl tetiklendiği gösterildi



\*\*Ekran paylaşımı:\*\* ✅ Demo videoda gösterildi

