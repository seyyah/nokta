# DELIVERY.md - Final Teslim Kontrolu

## Zorunlu Dosyalar

| Gereksinim | Dosya | Durum |
|---|---|---|
| Kendi yuzunden avatar | `avatar.glb` | Hazir |
| Guncel Forge ledger | `FORGE.md` | Hazir |
| Secilen track dokumani | `PERSONAS.md` | Hazir |
| Expert Bridge dokumani | `BRIDGE.md` | Entegrasyon hazir; gercek gorusme kaniti bekliyor |
| Demo video | `demo-video.MOV` | Mevcut, yaklasik 1:57; 3 dk final kayitla yenilenmeli |
| APK | `nokta-voice-forge-9191118048.apk` | Hazir |

## Teknik Kanit

- Avatar: 72 facial morph target ve gercek viseme/jaw/blink binding.
- Voice visualizer: 80ms metering, 32 bar.
- Avatar chat: push-to-talk, Gemini/OpenAI cevap, Gemini erkek TTS.
- Forge: SUCCESS, ROLLBACK ve STUCK durumlari.
- Expert Bridge: Jitsi entegrasyonu ve sonraki cycle'a context aktarimi.
- APK: `com.nokta.voiceforge`, v2 signed, SHA-256 `38CDE6D5AED00C10C2494FB55BE3334E432327948AC4387768CD760DC81ED11C`.

## PR Oncesi Eksikler

1. Gercek uzmanla en az 60 saniye ses + video + ekran paylasimli Jitsi gorusmesi yap.
2. Gercek gorusme ozetini/transkriptini `BRIDGE.md` icine ekle.
3. Phase A + B + C iceren yaklasik 3 dakikalik final videoyu `demo-video.MOV` ile degistir.
4. Buyuk binary dosyalarin GitHub limitleri icinde oldugunu ve PR diff'inde gorundugunu kontrol et.

## Anti-Slop Notu

Rubric esigi TF-IDF cosine `< 0.80` olarak belirlidir. Bu lokal checkout icinde yalnizca
bu submission bulundugu icin diger submission'larla karsilastirma hesaplanamadi. README
ve karar kaydi son uygulama davranisina ozel olarak yeniden yazildi; CI scoring sonucu
PR acildiginda kontrol edilmelidir.
