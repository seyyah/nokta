Track: A

# 231118033 — audit-forge

## Proje Özeti

Minimal bir Expo + TypeScript nokta klonu uygulamasına `@xtatistix/mobile-audit` widget'ı drop-in olarak mount edilmiştir. 3 farklı ekrandan burn-in'li audit raporları üretilmiş, bu raporlar Claude Code ajanına input verilerek `READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT/ROLLBACK` döngüsü koşturulmuştur.

## Track: A — Sadelik (Drop-in Primitive Disiplini)

Widget host uygulamanın geri kalanından tamamen izole tutulmuştur. `grep -r 'AuditWidget' app/` komutu yalnızca tek bir mount satırı döner (`app/_layout.tsx`). Widget kaldırıldığında uygulama eksiksiz çalışmaya devam eder.

## Expo QR / Link

```
exp://172.20.10.5:8081
```

Proje `app/` klasöründen `npx expo start` ile çalıştırılabilir.

## Demo Video

https://youtube.com/shorts/tUqFHhQsG7I

## Uygulama Ekranları

| Ekran | Route | Açıklama |
|-------|-------|----------|
| HomeScreen | `/` | Fikir listesi |
| IdeaDetailScreen | `/idea/[id]` | Fikir detayı |
| OnboardingScreen | `/onboarding` | Karşılama / onboarding |

## Drop-in Kanıtı

```bash
grep -r 'AuditWidget' app/
# app/_layout.tsx: tek mount satırı
```

Widget kaldırıldığında uygulama eksiksiz çalışır.

## AI Tool Log

| Cycle | Tool | Amaç |
|-------|------|-------|
| Phase A setup | Claude (chat) | Proje iskeleti ve widget entegrasyonu |
| Cycle 1 | Claude Code | HomeScreen buton bug fix |
| Cycle 2 | Claude Code | IdeaDetail layout overflow fix |
| Cycle 3 | Claude Code | Onboarding skip butonu fix |
| Cycle 4 (rollback) | Claude Code | Animasyon denemesi — rollback |

## Human Touch Points: 4

1. **HTP-1** — Phase A: Widget deps nesnesi manuel yazıldı.
2. **HTP-2** — Cycle 1 sonrası: Agent fix'i review edilip merge onayı verildi.
3. **HTP-3** — Cycle 3 sonrası: Test çıktısı incelendi, VERIFY kararı verildi.
4. **HTP-4** — Cycle 4 rollback: Animasyon fix'inin render'ı bozduğu fark edildi, rollback kararı verildi.

## Decision Log

- **Expo Router** seçildi: `currentScreen`'i `usePathname()` ile beslemek için en temiz API.
- **In-memory mock storage** seçildi: native bağımlılık eklemeden drop-in disiplini korundu.
- **`react-native-view-shot`** peer dependency olarak bırakıldı; widget import etmiyor, host `deps` üzerinden sağlıyor.
- Track A seçildi: drop-in primitive disiplini en ölçülebilir ve en saf kanıt zinciri.

## Teslim Self-Check

- [x] README ilk satırında `Track: A`
- [x] `app/` altında çalışır Expo + TypeScript projesi
- [x] `audit-reports/` altında 3 burn-in'li `.md` rapor
- [x] `FORGE.md` ledger: 3 başarılı + 1 rollback
- [x] Expo QR link README'de
- [x] Demo video linki README'de
- [x] Decision log + human touch points + AI tool log README'de
- [x] Root dizine dokunulmamış
