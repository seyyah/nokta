Track: B

# SlopDetec - Nokta Audit Forge

SlopDetec, startup pitch metinlerini "slop" riskine gore inceleyen Expo + TypeScript mobil uygulamasidir. Bu teslimde uygulamaya drop-in audit yuzeyi eklendi: kullanici soldaki `Audit` dugmesini acar, yalnizca `Sec` komutuna basinca ekrandaki bolgeyi isaretler, notunu yazar ve Markdown ya da Word `.docx` raporu uretir. Secim her dokunusta baslamaz; bu sayede uygulamanin ana butonlari audit akisini kazara tetiklemez.

## Teslim linkleri

- Expo QR / Link: https://expo.dev/accounts/yilmazurn/projects/app/updates/0a2f3adb-e5e2-4097-98e2-7fde391b7feb
- Demo video: https://youtube.com/shorts/bstyC_Q3j40?feature=share
- APK: `app-release.apk` 
- Kaynak kod: `app/`
- Audit raporlari: `audit-reports/` (3 burn-in + 1 kullanici raporu)
- Forge ledger: `FORGE.md`

## Nasil calisir?

1. `app/` icinde Expo uygulamasini baslat: `npm install && npm run start`.
2. `Analyzer`, `Results`, `Forge` sekmeleri arasinda gez.
3. Sol taraftaki `Audit` butonuna bas.
4. `Sec` komutunu kullanarak bir UI bolgesi isaretle.
5. Notu kaydet.
6. `Notlar`, `MD` veya `DOCX` komutlariyla rapor uret.

## Decision log

- Track B secildi: audit raporu sadece stil bug'i degil, musteri-gelistirici feature istegini de tasiyor.
- Audit widget uygulama icine `app/src/audit/` altinda drop-in primitive olarak kondu; host uygulama sadece `deps` ve `currentScreen` verir.
- `currentScreen` sekme state'inden dinamik beslenir: `Analyzer`, `Results`, `Forge`.
- Secim akisi soldaki paneldeki `Sec` komutuna baglandi; tek FAB'a her basista capture baslatma hipotezi rollback edildi.
- Backend yok. Raporlar host tarafindan Markdown ve Word uyumlu `.docx` artifact olarak uretilir.
- Burn-in ground truth icin audit raporlari `audit-reports/assets/*.svg` gorselleriyle git'e eklendi.

## Human touch points

Toplam: 2

1. Ilk kapsam verildi: sadece `submissions/2026-05-05-hoop/231118044-slopdetec` icinde calisilacak ve secim soldaki butondan baslayacak.
2. Kullanici audit raporu verdi: `audit-reports/004-user-audit-2026-05-18-18-06.md`.

## AI tool log

- Codex: audit entegrasyonu, rapor ornekleri, forge ledger ve teslim belgeleri.
- Forge cycle sayisi: 5 toplam, 4 success, 1 rollback.
- Basarili cycle agirligi: 37kg.

## Self-check

- [x] README ilk satirda `Track: B`
- [x] Expo + TypeScript app `app/` altinda
- [x] Drop-in audit widget mount edildi
- [x] `currentScreen` dinamik
- [x] Secim sadece soldaki `Sec` dugmesiyle basliyor
- [x] `audit-reports/` altinda 3 burn-in rapor + 1 kullanici raporu
- [x] `FORGE.md` icinde 4 success + 1 rollback cycle
- [x] APK mevcut
