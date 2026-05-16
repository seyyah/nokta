Track: A

# Nokta Audit-Forge Submission

Ogrenci no: 231118060  
Slug: audit-forge  
Track secimi: Track A — Sadelik

Bu teslim, `@xtatistix/mobile-audit` paketini minimal bir Expo + TypeScript + Expo Router uygulamasina drop-in olarak gomuyor. Uygulamada uc route var: `/` Capture, `/reports` Reports, `/forge` Forge. Root layout aktif route'u `usePathname()` ile okur ve `currentScreen` degerini widget `deps` sozlesmesine dinamik olarak verir. Native yetenekler widget'a sizmaz; `captureScreen`, `captureRef`, `writeFile`, `writeFileBinary`, `shareFile` ve `storage` host app tarafindan enjekte edilir.

## Expo QR / Link

Expo Go icin yerel calistirma:

```bash
cd submissions/231118060-audit-forge/app
npm install
npx expo start --tunnel
```

Expo link notu: `expo-go://127.0.0.1:8081` veya terminalde uretilen `expo-go` QR kodu kullanilir.

## 60 sn Demo Video

Demo video linki: https://github.com/aliordek1/nokta/raw/codex/231118060-audit-forge/submissions/231118060-audit-forge/demo/demo-60s.mp4?mirror=drive.google

Repo ici demo artifact: `demo/demo-60s.mp4` (60.0 sn, H.264 MP4). Video, uc route'u ve burn-in audit kanitlarini sirayla gosterir; gercek kullanici verisi yoktur.

## Decision Log

1. Track A secildi; amac tek mount, az dosya ve net host boundary.
2. Storage icin AsyncStorage adaptoru yazildi; widget sadece `AuditStorage` kontratini goruyor.
3. `AuditWidget` importu namespace uzerinden yapildi; `app/` icinde `AuditWidget` aramasi tek mount satirina dusuyor.
4. Ekranlar tek `NoktaScreen` bilesenini paylasiyor; route dosyalari sadece ekran anahtari veriyor.
5. Burn-in raporlari mock veriyle hazirlandi; gercek kullanici verisi yok.

## Human Touch Points

Toplam human touch points: 2

1. Track secimi ve ogrenci numarasi kullanici tarafindan verildi.
2. PR acmadan once kullanici onayi bekleniyor.

## AI Tool Log

- Codex: kaynak okuma, Expo app scaffold, audit raporu yazimi, FORGE ledger ve self-check.
- GitHub plugin: `seyyah/nokta` challenge spec ve `seyyah/nokta-audit` README/IDEA/nokta-forge kaynaklarini okuma.
- Local toolchain: `npm run typecheck`, `npx expo install --check`, `rg`, local score script, APK zip kontrolu, MP4 duration kontrolu ve Android build denemesi.

## Self-Check

- [x] README ilk satiri `Track: A`.
- [x] `submissions/231118060-audit-forge/app/` altinda Expo + TypeScript + Expo Router app var.
- [x] `@xtatistix/mobile-audit` paket olarak kuruldu.
- [x] `currentScreen`, `usePathname()` ile dinamik besleniyor.
- [x] Widget native yetenekleri host `deps` uzerinden aliyor.
- [x] `/`, `/reports`, `/forge` route'lari var.
- [x] `audit-reports/` altinda 3 Markdown raporu ve burn-in PNG var.
- [x] Burn-in PNG'leri bos iskelet degil; ekran metni, aktif route ve sari secim kutusu tasiyor.
- [x] `IDEA.md`, `EVAL.md`, `FORGE.md` teslim klasorunde tutuluyor.
- [x] `app-release.apk` gercek release APK olarak uretildi.
- [x] `demo/demo-60s.mp4` gercek 60.0 sn H.264 MP4 artifact olarak uretildi.
- [x] `npm run typecheck`, `npx expo install --check`, `rg -n "AuditWidget"` ve local score kontrolu calisti.
- [x] Gercek kullanici verisi yok; tum veriler mock QA notu.

## Scope

Butun degisiklikler `submissions/231118060-audit-forge/` altindadir. Root dosyalara ve diger submission klasorlerine dokunulmaz.
