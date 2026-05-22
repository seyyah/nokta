Track: A — Sadelik (drop-in disiplini)

# Nokta Audit-Forge — 231118014

**Öğrenci:** 231118014 — Ahsen Ece Hancı
**Track:** A — Sadelik (drop-in primitive disiplini)
**Host app:** `submissions/231118014-audit-forge/app/`

---

## Demo

🎥 **Video (≤60 sn):** https://www.youtube.com/shorts/Uli1QXto4Hk

📦 **APK:** `submissions/231118014-audit-forge/app-release.apk` (85 MB)

📱 **Expo (yerel ağ):** exp://10.124.207.194:8081

```bash
cd submissions/231118014-audit-forge/app
npm install --legacy-peer-deps
npx expo start
```

Çalıştırıldığında Metro şu formatta bir yerel link üretir:
`exp://10.124.207.194:8081`

Aynı Wi-Fi'daki cihazlardan Expo Go ile QR'ı tarayarak veya doğrudan APK kurarak test edilebilir.

---

## Track Seçimi: A — Sadelik

Track A'nın temel disiplini şu: **Audit widget host app'e sızmaz, kaldırıldığında uygulama çalışmaya devam eder.**

Uygulama bu disiplinde tasarlandı:

- Widget tek satır mount edildi: `app/app/_layout.tsx`
- Native bağımlılıklar (capture, file I/O, share) widget'a `deps` prop'u üzerinden enjekte edildi — widget içine native import yok.
- Audit raporları tek-kutulu, küçük (her biri ~2KB).
- Forge cycle'ları minimum diff: her commit tek dosya, tek satır değişikliği.

### Drop-in Tersinden Testi

`<AuditWidget>` referansı sadece bir yerde geçiyor:

```bash
grep -r "AuditWidget" app/app/
# Sadece app/app/_layout.tsx altında tek mount satırı dönmeli.
```

Mount satırı kaldırıldığında uygulama hatasız çalışır — bu drop-in primitive disiplininin kanıtı.

---

## Forge Cycle Özeti

| #   | Ekran       | Sonuç       | Commit    |
| --- | ----------- | ----------- | --------- |
| 1   | `/` (Pulse) | ✅ Başarılı | `08f8ad8` |
| 2   | `/notes`    | ✅ Başarılı | `7076188` |
| 3   | `/settings` | ✅ Başarılı | `add565d` |
| 4   | `/` (Pulse) | ⏪ Rollback | —         |

**Toplam:** 3 başarılı cycle + 1 rollback. Detaylı log, hipotezler ve dersler için → [`FORGE.md`](./FORGE.md)

---

## Decision Log

**Neden Track A (Sadelik)?**
Audit widget bir "drop-in primitive" olarak tasarlanmış; bunun ruhu host app'e sızmamak. Bu track aynı zamanda en küçük yüzey alanı sunduğu için forge cycle'larında "minimum diff" disiplinini doğal olarak zorluyor. Track B (Yaratıcılık) için yeni feature pitch'i, Track C (Otonomi) için ratchet altyapısı bir hafta için fazla geniş geldi.

**Audit raporları nasıl seçildi?**
3 farklı ekran (Pulse, Notes, Settings) seçildi çünkü her biri farklı bir UX pattern'ini temsil ediyor: bilgi yoğun dashboard (Pulse), liste/kart (Notes), form/ayar (Settings). Bu çeşitlilik forge cycle'larının da çeşitli olmasına yol açtı: padding (Pulse), fontSize (Notes), ScrollView padding (Settings).

**Cycle 4 neden rollback?**
Pulse ekranındaki metrik kartlara fade-in animasyonu eklemek başlangıçta cazip görünüyordu ama New Architecture'da `Animated.View` layout hesaplamalarını bozdu. Spec "başarısız hipotez değerli veridir, onu silme, logla" diyor — bu yüzden rollback gizlenmedi, açıkça loglandı. Gelecekteki bir cycle'da Reanimated 3 + worklets ile daha hedeflenmiş bir animasyon yaklaşımı denenebilir.

**Commit stratejisi?**
Her cycle tek dosya, tek satır, tek anlamlı değişiklik. Hash'ler `08f8ad8` / `7076188` / `add565d` — `git log --oneline` ile doğrulanabilir. Commit mesajları spec'in `[FORGE: EkranAdı] Açıklama — Xkg` formatına uygun.

---

## Human Touch Points

**Toplam: 4 müdahale noktası**

- **Cycle 1:** Audit raporu agent'a manuel iletildi, padding değeri için onay verildi.
- **Cycle 2:** fontSize seçimi (12→13) agent önerdi, manuel doğrulama yapıldı.
- **Cycle 3:** ScrollView paddingBottom değeri (140→160) için manuel karar.
- **Cycle 4:** Animasyon denemesi layout'u bozunca rollback kararı manuel verildi.

---

## AI Tool Log

| Aşama                    | Tool                                             | Açıklama                                                                        |
| ------------------------ | ------------------------------------------------ | ------------------------------------------------------------------------------- |
| Uygulama iskeleti        | **Rork**                                         | Expo + TypeScript proje yapısı, 3 ekran (Pulse/Notes/Settings) ve temel UI      |
| Audit raporları          | **AuditWidget (Claude tarafından üretilen .md)** | 3 ekranda widget tetiklenip burn-in'li raporlar üretildi                        |
| Forge cycle'ları         | **Claude (sohbet)**                              | READ → LOCATE → HYPOTHESIZE → REPAIR adımları için kod önerileri ve hash takibi |
| README + FORGE belgeleme | **Claude (sohbet)**                              | Markdown yapısı ve decision log yazımında                                       |

Rate limit ile karşılaşılmadı, tek bir tool ile tüm cycle'lar tamamlandı.

---

## Self-Check

- [x] `README.md` ilk satırında `Track: A`
- [x] `app/` altında çalışır Expo projesi + AuditWidget mount (tek satır)
- [x] `audit-reports/` altında 3 burn-in'li `.md` rapor
- [x] `FORGE.md` ledger: 3 başarılı + 1 rollback cycle, gerçek commit hash'leri
- [x] `app-release.apk` (85 MB, repoda)
- [x] Decision log + human touch points + AI tool log README'de
- [x] Root dizine dokunulmadı, sadece `submissions/231118014-audit-forge/` altı commit'li

---

🤖 _Müşteri yakalar, agent onarır, ben review ederim._
