Track: A

# 231118033 — audit-forge

## Proje Özeti

Minimal bir Expo + TypeScript nokta klonu uygulamasına `@xtatistix/mobile-audit` widget'ı drop-in olarak mount edilmiştir. 3 farklı ekrandan burn-in'li audit raporları üretilmiş, bu raporlar Claude Code ajanına input verilerek `READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT/ROLLBACK` döngüsü koşturulmuştur.

## Track: A — Sadelik (Drop-in Primitive Disiplini)

Widget host uygulamanın geri kalanından tamamen izole tutulmuştur. `grep -r 'AuditWidget' app/` komutu yalnızca tek bir mount satırı döner (`app/_layout.tsx`). Widget kaldırıldığında uygulama eksiksiz çalışmaya devam eder.

## Expo Linki

```
npx expo start --go
```

Proje `app/` klasöründen çalıştırılabilir.

## Demo Video

> Hazırlanmakta — teslim öncesi eklenecektir.

## Uygulama Ekranları

| Ekran | Route | Açıklama |
|-------|-------|----------|
| HomeScreen | `/` | Fikir listesi |
| IdeaDetailScreen | `/idea/[id]` | Fikir detayı |
| OnboardingScreen | `/onboarding` | Karşılama / onboarding |

## Drop-in Kanıtı

```bash
# Widget mount noktası — tek satır:
grep -r 'AuditWidget' app/
# app/_layout.tsx:  <AuditWidget deps={auditDeps} appName="Nokta" />
```

Widget kaldırıldığında `_layout.tsx`'ten yalnızca bu iki satır çıkar; uygulamanın başka hiçbir dosyası etkilenmez.

## AI Tool Log

| Cycle | Tool | Amaç |
|-------|------|-------|
| Phase A setup | Claude (chat) | Proje iskeleti ve widget entegrasyonu |
| Cycle 1 | Claude Code | HomeScreen buton bug fix |
| Cycle 2 | Claude Code | IdeaDetail layout overflow fix |
| Cycle 3 | Claude Code | Onboarding skip butonu fix |
| Cycle 4 (rollback) | Claude Code | Animasyon denemesi — rollback |

## Human Touch Points: 4

1. **HTP-1** — Phase A: Widget deps nesnesi manuel yazıldı (captureScreen, storage bağlantısı).
2. **HTP-2** — Cycle 1 sonrası: Agent'ın fix'i review edilip merge onayı verildi.
3. **HTP-3** — Cycle 3 sonrası: Agent'ın test çıktısı incelendi, "VERIFY: OK" kararı insanla.
4. **HTP-4** — Cycle 4 rollback: Animasyon fix'inin render'ı bozduğu fark edildi, rollback kararı insanla.

## Decision Log

- **Expo Router** seçildi: `currentScreen`'i `usePathname()` ile beslemek için en temiz API.
- **AsyncStorage** yerine **in-memory mock storage** seçildi: native bağımlılık eklemeden drop-in disiplini korundu. Gerçek projede tek satır swap yeterli.
- **`react-native-view-shot`** peer dependency olarak bırakıldı; widget import etmiyor, host `deps` üzerinden sağlıyor.
- Track A seçildi çünkü drop-in primitive disiplini bu ödev için en ölçülebilir ve en saf kanıt zinciri.

## Teslim Self-Check

- [x] README ilk satırında `Track: A`
- [x] `app/` altında çalışır Expo + TypeScript projesi
- [x] `audit-reports/` altında ≥3 burn-in'li `.md` rapor
- [x] `FORGE.md` ledger: ≥3 başarılı + ≥1 rollback
- [ ] `app-release.apk` — (EAS Build ile üretilecek)
- [x] Decision log + human touch points + AI tool log README'de
- [x] Root dizine dokunulmamış
