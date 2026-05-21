# NOKTA RADAR — Anti-Slop Due Diligence

Bu proje, Nokta ekosisteminin bir parçası olarak, fikirlerin teknik derinliğini ve pazar gerçekliğini test eden otonom bir analiz aracıdır.

## 🚀 Track Seçimi (challenge.md)
**Track B — Slop Detector / Due Diligence**

## 🛡️ Track Seçimi (challenge-audit-forge.md)
**Track A — Sadelik (drop-in primitive disiplini)**

`grep -r 'AuditWidget' app/` → tek mount satırı döner (`app/_layout.tsx`).  
Widget kaldırıldığında app değişmeden çalışır.

## 📱 Uygulama Erişimi
- **Expo Proje Sayfası (QR Kod & APK):** [https://expo.dev/accounts/m_sahin_sft/projects/temp_app/builds/d6cb5686-09aa-4ce3-b668-a3e9140bf3ec]
- **Demo Videosu:** [https://youtube.com/shorts/GZ3K1-j7Bco]
- **APK:** `app-release.apk` dosyası bu klasörde mevcuttur.

## 🐛 AuditWidget Entegrasyonu
- **Paket:** `@xtatistix/mobile-audit`
- **Mount:** `app/_layout.tsx` — tek satır, drop-in
- **Bağımlılıklar:** `expo-sharing`, `react-native-view-shot` (host boundary)
- **Raporlar:** `audit-reports/` — 3 ekrandan `.md` raporları
- **Forge Ledger:** [`FORGE.md`](./FORGE.md)

## 🔁 Forge Döngüsü
4 cycle koşturuldu: **3 başarılı + 1 ROLLBACK**

| Cycle | Ekran | Sonuç |
|---|---|---|
| 1 | AnalyzeScreen | ✅ SUCCESS — input height fix |
| 2 | ChatScreen | ✅ SUCCESS — keyboard offset fix |
| 3 | ChatScreen | ✅ SUCCESS — input minHeight |
| 4 | ManifestoScreen | ❌ ROLLBACK — scope too large |

## 🛠 Decision Log (Teknik Kararlar)
1. **Acımasız Skorlama:** AI asistan modu yerine "Venture Capital" analisti modu kullanıldı.
2. **Oyunlaştırılmış UX:** Swipe mekanizması Doğru/Yanlış sınavına dönüştürüldü.
3. **Mühendislik Odaklı Tasarım:** Dark Mode ve "Radar" temalı görsel dil.
4. **Çok Aşamalı Sorgu:** 3 engineering sorusu üzerinden analiz akışı.
5. **Drop-in AuditWidget:** `_layout.tsx`'de tek mount; host boundary korundu; `deps` DI ile native paketler host'tan enjekte edildi.
6. **Track A Seçimi:** Minimum kod değişikliği, maksimum etki. Widget kaldırılabilir olarak tasarlandı.

## 🏗 Kurulum
1. `npm install`
2. `npx expo start`

## AI Tool Log
- Antigravity (Google DeepMind) — audit-forge entegrasyonu ve FORGE cycle'ları