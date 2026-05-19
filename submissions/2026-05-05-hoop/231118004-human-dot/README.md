# Nokta — Human Expert Support
## Track A: Dot Capture & Enrich (v2 — Human-in-the-Loop)

**Öğrenci No:** 231118004  
**Track:** A — Dot Capture & Enrich  
**Slug:** human-dot  

---

## Expo QR / Link

Uygulamayı telefonunuzdaki **Expo Go** ile test etmek için aşağıdaki QR kodu okutabilirsiniz:

![Expo QR](https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=exp://u.expo.dev/b72903d8-e28d-4c04-9576-f3067b12d6da?channel-name=main)

> **[Tıkla ve Aç (Telefonlar için)](exp://u.expo.dev/b72903d8-e28d-4c04-9576-f3067b12d6da?channel-name=main)**

---

## Demo Video

> **[▶ Nokta Human-Dot Demo Videosu (YouTube)](https://youtube.com/shorts/K4F4vTg87Xg?feature=share)**

---

## Uygulama Hakkında

Ham bir fikri metin olarak alır, **Gemini AI ile 5 mühendislik sorusu** sorar, cevaplara göre tek sayfalık spec üretir.  
Bu hafta eklenen **Human-in-the-Loop** mimarisiyle spec tamamlanınca gerçek bir uzman **ikinci telefondan** Firebase üzerinden anlık yanıt yazabilir.

### Ekranlar & Özellikler

| Ekran | Özellik |
|-------|---------|
| **Home** | Fikir girişi + Geçmiş / Uzman butonları |
| **Chat** | Gemini **streaming** ile soru üretimi — her chunk'ta cursor animasyonu |
| **Spec** | 3 sekme: Spec kartı / Nokta Skoru / Stack & Maliyet |
| **History** | AsyncStorage ile kaydedilen tüm analizler, tekrar açılabilir |
| **Expert** | Firebase Realtime Database üzerinden **gerçek iki-telefon yazışması** |

### Teknik Özellikler

- **Streaming AI** — `generateContentStream()` ile gerçek zamanlı response akışı
- **Human-in-the-Loop** — Firebase Realtime Database, iki cihaz arasında live sync
- **AsyncStorage** — Tüm analizler offline saklanıp listelenebilir
- **TTS** — `expo-speech` ile spec sesli okunuyor (TR)
- **Smart Fallback** — API rate limit'te kullanıcının cevaplarından gerçekçi veri üretir

---

## Decision Log

| Karar | Neden |
|-------|-------|
| Track A devam | Geçen haftaki temeli koruyup Human Expert katmanı eklendi |
| Firebase Realtime DB | WebSocket bağlantısı, iki telefon arasında anlık sync — Gemini simülasyon değil |
| `generateContentStream` | Streaming hacker tablosundaki en büyük eksikti; tüm API çağrıları streaming'e geçirildi |
| AsyncStorage History | Önceki submission'larda hiç kullanılmamıştı; native storage + offline-first |
| `expo-speech` TTS | Multimodal bonus — spec sesli dinlenebilir, erişilebilirlik |
| Smart fallback | Rate limit durumunda kullanıcının Q&A cevaplarından içerik türetilir, sabit mock değil |
| `softwareKeyboardLayoutMode: pan` | Android klavye açılışındaki titreme sorunu çözüldü |
| Mod seçici (Öğrenci/Uzman) | Aynı APK iki rolde kullanılıyor — demo için iki telefon yeterli |

---

## AI Tool Log

- **Antigravity (Gemini 2.5 Pro):** Mimari kararlar, tüm ekran kodları, Firebase entegrasyonu, streaming implementasyonu, bug fixing
- **Gemini 2.0 Flash API:** Runtime — streaming sorular, spec, Nokta Skoru, Stack & Maliyet analizi
- **Firebase Realtime Database:** Expert queue, iki-cihaz senkronizasyonu
- **EAS Build:** Cloud APK üretimi

---

## Checklist

- [x] Yalnızca `submissions/231118004-human-dot/` altında değişiklik yaptım
- [x] README'de Expo QR link var
- [x] README'de 60 sn demo video linki var
- [x] `app-release.apk` klasörde mevcut
- [x] README'de decision log yazdım
- [x] Track seçimim README'de net
