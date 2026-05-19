Track: B
# Nokta — Human Expert Support

**Öğrenci No:** 231118004  
**Track:** B — Yaratıcılık (müşteri-geliştirici use case'i)  
**Slug:** human-dot  

---

## APK İndirme & Kurulum

Bu proje, Expo Go yerine bağımsız bir **EAS Build (APK)** olarak derlenmiştir. Uygulamayı Android cihazınıza yüklemek için aşağıdaki QR kodu okutabilir veya indirme bağlantısına tıklayabilirsiniz:

![APK QR](https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://expo.dev/artifacts/eas/4b6oqyjzyzUdwTbshC8Ui8.apk)

> **[📦 APK'yı İndir (Android)](https://expo.dev/artifacts/eas/4b6oqyjzyzUdwTbshC8Ui8.apk)**

Ayrıca derlenen APK dosyası `app-release.apk` ismiyle klasörde de bulunmaktadır.

---

## Demo Video

> **[▶ Nokta Human-Dot Demo Videosu (YouTube)](https://youtube.com/shorts/w_Lqlu7HaTs?feature=share)**

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
| **Audit Widget** | Uygulama içi yüzen buton ile ekran görüntülü hata raporu (.md) oluşturma aracı |

### Teknik Özellikler

- **Streaming AI** — `generateContentStream()` ile gerçek zamanlı response akışı
- **Human-in-the-Loop** — Firebase Realtime Database, iki cihaz arasında live sync
- **AsyncStorage** — Tüm analizler offline saklanıp listelenebilir
- **TTS** — `expo-speech` ile spec sesli okunuyor (TR)
- **Smart Fallback** — API rate limit'te kullanıcının cevaplarından gerçekçi veri üretir
- **Nokta Audit Widget** — Geliştirme sürecinde ekran görüntüsü (burn-in) alıp, anında markdown formatında bug raporu export edebilme

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
| `.easignore` + `EAS_NO_VCS` | Ana Git deposundaki (2.1GB) diğer projelerin upload edilmesini engellemek için Git taraması devre dışı bırakıldı, sadece bu klasör upload edildi |

---

## AI Tool Log & Forge Ledger

- **Antigravity (Gemini 2.5 Pro):** Mimari kararlar, tüm ekran kodları, Firebase entegrasyonu, streaming implementasyonu, bug fixing
- **Gemini 2.0 Flash API:** Runtime — streaming sorular, spec, Nokta Skoru, Stack & Maliyet analizi
- **Firebase Realtime Database:** Expert queue, iki-cihaz senkronizasyonu
- **EAS Build:** Cloud APK üretimi

**Forge Human Touch Points (Manuel Yönlendirmeler):** Toplam 4 müdahale loglanmıştır (3 Başarılı Cycle + 1 Rollback Cycle). Detaylar `FORGE.md` dosyasında yer almaktadır.

---

## Teslim Öncesi Self-Check (Checklist)

- [x] `README.md` ilk satırında Track: B var
- [x] `app/` altında çalışır Expo projesi + audit widget mount edildi
- [x] `audit-reports/` altında ≥3 burn-in'li .md rapor mevcut
- [x] `FORGE.md` ledger: 3 başarılı + 1 rollback cycle yazıldı
- [x] `app-release.apk` var (EAS Build alındı)
- [x] Decision log + human touch points + AI tool log README'de bulunuyor
- [x] Root dizine dokunulmamış (sadece `submissions/231118004-human-dot/` altı commit'li)
- [x] (Track B) `IDEA.md` dosyası eklendi (Müşteri Geliştirici Use Case'i)
- [x] Demo video linki eklendi
