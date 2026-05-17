Track: B

# Nokta Audit-Forge Submission

## Project Summary

Bu submission, mevcut Expo tabanli Nokta host uygulamasina `@xtatistix/mobile-audit` widget'ini root seviyesinde entegre eder. Uygulama hala fikir girisi, soru akisi ve sonuc ekranini calistirir; buna ek olarak kullanici ekran uzerinden audit FAB'e dokunup ekran goruntusu alabilir, sari kutu ile alan isaretleyebilir, not yazabilir ve gercek Markdown raporu disa aktarabilir.

Bu teslimde resmi track `B` olarak secildi. Ayrica Track C'den ilham alan bir otonomi kati eklendi: insan dokunus sayaci, rollback kaydi, manuel golden scenario listesi ve gercek raporlar geldikten sonra doldurulacak forge ledger yapisi.

## How To Run

```bash
cd submissions/201118062-mergen-wolfscatt/app
npm install
npx expo start
```

`npx expo start` sonrasi uygulamayi Expo Go veya emulator ile acin. Codex bu oturumda interaktif Expo acilisini dogrulayamadi.

## AuditWidget Integration Summary

- `AuditWidget` yalnizca bir kez, [App.js](app/App.js) icinde root seviyesinde mount edildi.
- Host bagimliliklari [auditHost.js](app/auditHost.js) icinde toplandi.
- `currentScreen`, mevcut local `screen` state'inden uretiliyor.
- `deps` icinde `captureScreen`, `captureRef`, `writeFile`, `writeFileBinary`, `shareFile` ve `storage` host tarafindan enjekte ediliyor.
- Her kayitli note artik audit note list icinden ayri `Markdown` ve `Screenshot` aksiyonlari ile disa aktarilabiliyor.
- Markdown export artik screenshot'i base64 icine gommek yerine `./screenshots/<slug>.png` goreli path'i ile referansliyor.
- Widget kendi icinde native paket import etmiyor; native sinir host uygulamada kaliyor.

## Real Audit Report Workflow

1. Uygulamayi acin.
2. Hedef ekrana gidin.
3. Audit FAB'e dokunun.
4. Ekran goruntusunu alin.
5. Sari kutu ile ilgili alani isaretleyin.
6. Notunuzu yazin.
7. Audit note list ekranini acin ve ilgili note kartindaki `Markdown` aksiyonu ile `.md` dosyasini olusturun.
8. Ayni note icin `Screenshot` aksiyonunu kullanarak ayri `.png` dosyasini alin.
9. Markdown dosyasini `audit-reports/` klasorune, screenshot dosyasini `audit-reports/screenshots/` klasorune kopyalayin.
10. Markdown icindeki image path'in `./screenshots/<slug>.png` oldugunu kontrol edin.
11. Gerekirse dosya adini repo icinde `01-home-feature-request.md` gibi daha kisa bir formata cevirin.

Eski kombine export raporu `audit-reports/archive/` altina alindi. Final forge girdileri icin hala en az 3 adet tek-note Markdown raporu ve bunlara ait ayri PNG screenshot dosyalarina ihtiyac var.

## Planned Track B Captures

- `01-home-feature-request.md`
  Ornek not: `Bu giris ekraninda fikri hizlica temizleme butonu olsa iyi olurdu.`
- `02-question-feature-request.md`
  Ornek not: `Bu soru ekraninda onceki soruya geri donebilme ozelligi olsa iyi olurdu.`
- `03-result-feature-request.md`
  Ornek not: `Sonuc ekraninda uretilen ozeti kopyalama butonu olsa iyi olurdu.`

## Forge Cycle Process

Her gercek rapor icin hedeflenen dongu:

`READ -> LOCATE -> HYPOTHESIZE -> REPAIR -> TEST -> VERIFY -> COMMIT/ROLLBACK`

Bu oturumda yalnizca entegrasyon ve ledger hazirligi yapildi. Gercek widget raporlari kopyalandiktan sonra her rapor icin minimum degisiklik prensibiyle ayri forge cycle calistirilmali.

## Human Touch Points Counter

- Mevcut sayac: `1`
- Tamamlanan insan dokunusu: gorevin kapsam ve guvenlik kurallarinin verilmesi
- Bekleyen insan dokunuslari:
  - uygulamayi acip 3 gercek audit raporu uretmek
  - export edilen `.md` ve burn-in goruntulerini `audit-reports/` altina kopyalamak
  - APK build ve demo video kaydini eklemek

## AI Tool Log

- Tool: `Codex`
- Usage: audit integration, host dependency adapter, report workflow documentation, forge ledger preparation

## Submission Documents

- Decision log: [DECISIONS.md](DECISIONS.md)
- Idea note: [IDEA.md](IDEA.md)
- Evaluation checklist: [EVAL.md](EVAL.md)
- Forge ledger: [FORGE.md](FORGE.md)
- Audit report instructions: [audit-reports/README.md](audit-reports/README.md)

## Expo Link Placeholder

`TODO: Add Expo QR/link after running the app.`

## Demo Video Placeholder

`TODO: Add <=60s demo video link.`

## APK Status

- Submission root altinda `app-release.apk` adli bir dosya mevcut.
- Bu oturumda APK yeniden build edilmedi veya yeniden dogrulanmadi.
- Gerekirse not: `TODO: Add app-release.apk after build.`

## Self-Check Checklist

- [x] Existing app was adapted instead of creating a new app.
- [x] `AuditWidget` is mounted once at the app root.
- [x] Host-side deps are injected from the app boundary.
- [x] `DECISIONS.md`, `IDEA.md`, `EVAL.md`, `FORGE.md` and `audit-reports/README.md` exist.
- [x] Root repository files outside this submission folder were not edited.
- [ ] 3 real widget-generated audit reports are present under `audit-reports/`.
- [ ] Final forge cycles have been completed from real reports.
- [ ] Expo link has been added after a manual run.
- [ ] Demo video link has been added.
- [ ] APK has been freshly verified after the latest changes.
