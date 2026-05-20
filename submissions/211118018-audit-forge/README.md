Track: A

# Submission — 211118018-audit-forge

## Özet

Audit-Forge Mission (Track A — Sadelik): Dot Capture host uygulamasına [`@xtatistix/mobile-audit`](https://github.com/seyyah/nokta-audit) drop-in widget gömüldü; ≥3 audit raporu ve ≥3 forge cycle (≥1 rollback) teslim edildi.

## Referans

- Widget kaynağı: [seyyah/nokta-audit](https://github.com/seyyah/nokta-audit)
- Host repo: [seyyah/nokta](https://github.com/seyyah/nokta) (bu PR)

## Expo (QR / link)

- **Expo Go linki:** `exp://10.142.115.249:8081` (LAN; oturum kapandığında `npx expo start` ile yenilenir)
- **Expo Go test:** Telefonda **expo-go** uygulaması ile QR okutun veya bu linki açın
- **QR:** `npx expo start` terminal çıktısındaki QR ile aynı oturum
- Okul ağında sorun: `npx expo start --tunnel`

### Audit FAB hızlı test

1. Ham fikir → scroll → **Sorulara geç** FAB altında kalmamalı (forge cycle 1).
2. Sağ alttaki audit FAB → ekran görüntüsü + not → rapor dışa aktar.
3. Mühendislik sorularında chip helper metni okunur olmalı (forge cycle 2).

```bash
cd submissions/211118018-audit-forge/app
npm install
npx expo start
```

## Demo video (≤60 sn)

- **Video linki:** https://youtube.com/shorts/l8pP4TRfEuE?si=1K8U3IvgIR0DDBY3 (audit FAB + forge fix gösterimi)

## APK

- Dosya: `submissions/211118018-audit-forge/app-release.apk`
- Release build: Windows uzun yol için `D:\dc` kısa dizinde `gradlew assembleRelease`

## Drop-in kontrolü

```bash
grep -r "AuditWidget" app/
# Beklenen: yalnızca App.tsx içinde tek mount + auditDeps import zinciri
```

Widget kaldırıldığında uygulama akışı (idea → questions → spec) çalışmaya devam eder.

## Human touch points

- **Toplam: 5** (FORGE.md cycle tablosunda döküldü)
- Scroll/buton doğrulama, helper metin onayı, rollback kararı, spec CTA kontrast doğrulama, demo kaydı

## AI tool log

| Cycle / alan | Araç |
|---|---|
| Audit rapor metinleri | Manuel (müşteri/tester rolü) |
| Forge cycle 1–2 repair | Cursor Agent |
| Forge cycle 3 rollback kararı | Cursor Agent (refactor reddedildi) |
| Forge cycle 4 repair | Cursor Agent |
| Demo video kaydı | Manuel |

## Decision log

1. **Track A** seçildi: tek mount, minimal diff, widget kaldırılabilir.
2. Host app olarak önceki Dot Capture akışı yeniden kullanıldı (3+ ekran).
3. `deps` injection: capture/write/share/storage host’ta; widget native import etmiyor.
4. `currentScreen` state’ten besleniyor (`HamFikir`, `MuhendislikSorulari`, …).
5. Audit raporları `audit-reports/` altında git’lendi (≥3).
6. `FORGE.md`: 3 success + 1 rollback; başarısız hipotez silinmedi.
7. Canlı video/Stream mentor kapsam dışı (önceki ödev HITL MVP ile uyumlu).

## Dosya yapısı

- `app/` — Expo + AuditWidget
- `audit-reports/` — ≥3 `.md` rapor
- `FORGE.md` — cycle ledger
- `app-release.apk` — zorunlu APK
