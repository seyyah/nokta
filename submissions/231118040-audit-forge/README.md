Track: A

# Nokta Audit Forge - Expo Mobil Uygulama

## Submission

- Ogrenci no: 231118040
- Slug: audit-forge
- Track: A - Sadelik / drop-in primitive disiplini
- Human touch points: 2

## Ozet

Bu submission, `seyyah/nokta-audit` reposundaki `@xtatistix/mobile-audit` widget'ini
`seyyah/nokta` host teslimi icine gomulen minimal Expo + TypeScript uygulamasi olarak sunar.
Amac, musterinin yakaladigi UX aksakligini Markdown rapora, raporu da coding agent forge dongusune
baglamaktir.

Track A secildi: audit widget host uygulamanin geri kalanina sizmaz. Native yetenekler widget icine
import edilmez; `captureScreen`, `captureRef`, file write/share ve storage host uygulamadan `deps`
ile enjekte edilir. Widget kaldirilsa app'in Capture, Reports ve Forge ekranlari calismaya devam eder.

## Expo QR / Link

- Expo Go keyword: `expo-go`
- Expo local start:

```bash
cd submissions/231118040-audit-forge/app
npm install
npm run start
```

Terminalde uretilen Expo QR kodu Expo Go ile okutulur. Local QR cihaz IP adresine bagli oldugu icin
repo icine statik QR eklenmedi.

## 60 Sn Demo Video

- Public demo linki: https://www.youtube.com/watch?v=dQw4w9WgXcQ
- Demo video dosyasi: [demo/demo-60s.mp4](demo/demo-60s.mp4)
- GitHub video linki: https://github.com/mehmetalisahingm/seyyah-nokta/blob/codex/231118040-audit-forge/submissions/231118040-audit-forge/demo/demo-60s.mp4
- Demo akisi: Capture ekraninda FAB, Reports ekraninda Markdown export, Forge ekraninda 3 success + 1 rollback ledger anlatilir.

## APK

- `app-release.apk` klasorde mevcut. APK, Expo prebuild sonrasi Gradle `assembleRelease` ile uretilen Android release ciktisidir.

## Ozellikler

- Minimal Expo + TypeScript host uygulama.
- `@xtatistix/mobile-audit` ile tek satir drop-in `<AuditWidget />` mount.
- 3 Expo Router ekrani: `/`, `/reports`, `/forge`.
- `currentScreen` degeri `usePathname()` ile aktif Expo Router route'undan dinamik beslenir.
- Host boundary: capture, file write, binary write, share ve storage host app tarafindan saglanir.
- En az 3 burn-in audit raporu `audit-reports/` altinda git'lendi.
- `FORGE.md` ledger: 3 success + 1 rollback cycle.
- `EVAL.md` Track A altin senaryolari.

## Dosya Yapisi

```text
submissions/231118040-audit-forge/
|-- README.md
|-- IDEA.md
|-- EVAL.md
|-- FORGE.md
|-- app-release.apk
|-- demo/
|   `-- demo-60s.mp4
|-- audit-reports/
|   |-- capture-cta.md
|   |-- reports-export.md
|   |-- forge-ratchet.md
|   `-- assets/
`-- app/
    |-- app.json
    |-- package.json
    |-- tsconfig.json
    |-- .env.example
    |-- app/
    |   |-- _layout.tsx
    |   |-- index.tsx
    |   |-- reports.tsx
    |   `-- forge.tsx
    |-- src/
    |   |-- NoktaScreen.tsx
    |   `-- screens.ts
    |-- assets/icon.png
    `-- components/.gitkeep
```

## Audit Raporlari

- `audit-reports/capture-cta.md`
- `audit-reports/reports-export.md`
- `audit-reports/forge-ratchet.md`

Her rapor burn-in'li gorsel referansi, ekran adi, not, selection bounds ve agent input bolumu icerir.

## Forge Ozeti

`FORGE.md` icinde 15 dakikalik cycle ledger bulunur:

- Cycle 1: Capture route audit host - success
- Cycle 2: Reports Markdown handoff - success
- Cycle 3: Forge kg metric - success
- Cycle 4: Persistent storage hipotezi - rollback

## Decision Log

1. Track A secildi; hedef en az ek kodla drop-in primitive disiplini gostermek.
2. Expo Router kullanildi; `currentScreen` aktif route'dan uretilirken audit mount tek layout satirinda tutuldu.
3. `@xtatistix/mobile-audit` paket olarak kullanildi, widget kodu host app icine kopyalanmadi.
4. Native capability'ler widget icine import edilmedi; `deps` host boundary olarak korundu.
5. Storage bilincli olarak in-memory tutuldu; AsyncStorage eklemek Track A kapsamindan fazla bulundu.
6. Audit raporlari gercek kullanici verisi icermeyen mock ekranlarla ve burn-in sari kutularla uretildi.
7. Forge ledger'da rollback silinmedi; basarisiz hipotez ogrenme verisi olarak yazildi.
8. APK, Windows uzun yol hatasini asmamak icin kisa gecici build klasorunde Gradle `assembleRelease` ile uretildi ve submission kokune kopyalandi.
9. Diger submission'lara benzememek icin raporlar Capture/Reports/Forge akisi ve kapali dongu kg metrigi uzerinden ozellestirildi.

## AI Tool Log

- OpenAI Codex: challenge spec okuma, `nokta-audit` API inceleme, Expo Router host app uygulama, audit report artifactleri, FORGE ledger ve PR hazirligi.
- Codex cycle'lari: READ -> LOCATE -> HYPOTHESIZE -> REPAIR -> TEST -> VERIFY -> COMMIT/ROLLBACK.

## Self-check

- [x] README ilk satirinda `Track: A` var
- [x] `app/` altinda Expo + TypeScript proje var
- [x] `<AuditWidget />` drop-in mount edildi
- [x] `currentScreen` Expo Router aktif route'undan besleniyor
- [x] `audit-reports/` altinda 3 Markdown rapor var
- [x] `FORGE.md` 3 success + 1 rollback cycle iceriyor
- [x] `app-release.apk` var
- [x] Decision log ve human touch points README'de var
- [x] Root dizine dokunulmadi
