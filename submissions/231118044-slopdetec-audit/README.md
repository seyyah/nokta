Track: C

# SlopDetec - Nokta Audit Forge

SlopDetec, startup pitch metinlerini "slop" riskine gore inceleyen Expo + TypeScript mobil uygulamasidir. Final haftada uygulamaya Voice visualizer, avatar lipsync sahnesi ve STUCK durumunda Jitsi tabanli expert bridge eklendi. Onceki audit widget korunur: kullanici soldaki `Audit` dugmesini acar, yalnizca `Sec` komutuna basinca ekrandaki bolgeyi isaretler, notunu yazar ve Markdown ya da Word `.docx` raporu uretir.

## Teslim linkleri

- Expo QR / Link: https://expo.dev/accounts/yilmazurn/projects/app/updates/0a2f3adb-e5e2-4097-98e2-7fde391b7feb
- Demo video: https://youtube.com/shorts/b-ESHIIzl_0?feature=share
- APK: `app-release.apk` 
- Avatar asset: `avatar.glb` ve `app/assets/avatar.glb`
- Kaynak kod: `app/`
- Audit raporlari: `audit-reports/` (onceki 4 rapor + 3 final dikte raporu)
- Forge ledger: `FORGE.md`
- Expert bridge ozeti: `BRIDGE.md`
- Persona dokumu: `PERSONAS.md`

## Nasil calisir?

1. `app/` icinde Expo uygulamasini baslat: `npm install && npm run start`.
2. `Analyzer`, `Results`, `Forge`, `Voice`, `Avatar`, `Bridge` sekmeleri arasinda gez.
3. Sol taraftaki `Audit` butonuna bas.
4. `Sec` komutunu kullanarak bir UI bolgesi isaretle.
5. Notu kaydet.
6. `Notlar`, `MD` veya `DOCX` komutlariyla rapor uret.
7. `Voice` sekmesinde mikrofonu ac; barlar konusurken canlanir.
8. `Avatar` sekmesinde mikrofonla avatar agzini oynat; webde `GLB yukle` ile kendi Avaturn dosyani secebilir, `Rapor okut` ile `.md/.txt` raporu avatara okutabilirsin.
9. `Forge` sekmesinde `Kasitli STUCK demo tetikle`; uygulama `Bridge` ekranina gecer ve Jitsi odasini acar.

## Decision log

- Track C secildi: stuck tespiti heuristik; 2 ardil `FAIL`/`ROLLBACK` expert bridge'i tetikler.
- Audit widget uygulama icine `app/src/audit/` altinda drop-in primitive olarak kondu; host uygulama sadece `deps` ve `currentScreen` verir.
- `currentScreen` sekme state'inden dinamik beslenir: `Analyzer`, `Results`, `Forge`, `Voice`, `Avatar`, `Bridge`.
- Secim akisi soldaki paneldeki `Sec` komutuna baglandi; tek FAB'a her basista capture baslatma hipotezi rollback edildi.
- Backend yok. Raporlar host tarafindan Markdown ve Word uyumlu `.docx` artifact olarak uretilir.
- Burn-in ground truth icin audit raporlari `audit-reports/assets/*.svg` gorselleriyle git'e eklendi.
- `avatar.glb` placeholder olarak eklendi; gercek Avaturn export ile ayni dosya adindan degistirilmelidir.
- Analyzer ekrani API key yokken de lokal fallback analiz uretir; key varsa Gemini sonucunu kullanir.

## Human touch points

Toplam: 2

1. Ilk kapsam verildi: sadece `submissions/2026-05-05-hoop/231118044-slopdetec` icinde calisilacak ve secim soldaki butondan baslayacak.
2. Kullanici audit raporu verdi: `audit-reports/004-user-audit-2026-05-18-18-06.md`.

## AI tool log

- Codex: audit entegrasyonu, rapor ornekleri, forge ledger ve teslim belgeleri.
- Forge cycle sayisi: 10 toplam, 7 success, 2 rollback, 1 fail.
- Final hafta cycle agirligi: 41kg.

## Self-check

- [x] README ilk satirda `Track: C`
- [x] Expo + TypeScript app `app/` altinda
- [x] Drop-in audit widget mount edildi
- [x] `currentScreen` dinamik
- [x] Secim sadece soldaki `Sec` dugmesiyle basliyor
- [x] `audit-reports/` altinda 3 final dikte raporu ve burn-in SVG var
- [x] `FORGE.md` icinde final hafta 2 success + 1 rollback + 1 fail + bridge recovery var
- [x] `BRIDGE.md` Jitsi odasi ve gorusme ozetini iceriyor
- [x] Voice visualizer `expo-av` + web FFT/RMS hattina bagli
- [x] Avatar sahnesi R3F + GLB + viseme fallback destekli
- [x] APK mevcut
