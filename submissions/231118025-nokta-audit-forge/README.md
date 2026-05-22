Track: A

# 231118025 — nokta-audit-forge

**Track:** A — Sadelik (drop-in primitive disiplini)

---

## Proje Özeti

Minimal Expo + TypeScript uygulaması. `@xtatistix/mobile-audit` paketi tek satır mount ile kök bileşene eklenmiştir. 3 ekran (HomeScreen, DetailScreen, OnboardingScreen) üzerinde bug raporları üretilmiş, Claude Code ile forge döngüsü koşturulmuştur.

## Ekranlar

- `/` — HomeScreen: Fikir listesi
- `/detail` — DetailScreen: Fikir detayı ve not alma
- `/onboarding` — OnboardingScreen: 3 adımlı karşılama akışı

## AuditWidget Mount

```
grep -r 'AuditWidget' app/
```
→ Tek sonuç: `app/app/_layout.tsx` — drop-in prensibi korunmuştur. Widget kaldırıldığında uygulama çalışmaya devam eder.

## Audit Raporları

| Rapor | Ekran | Sorun |
|-------|-------|-------|
| report-homescreen.md | HomeScreen | Kart başlık font boyutu küçük |
| report-detail.md | DetailScreen | Kaydet butonu klavye arkasında kalıyor |
| report-onboarding.md | OnboardingScreen | Dot indikatör animasyonsuz değişiyor |

## Forge Özeti

- 4 cycle koşturuldu: 3 başarılı + 1 rollback
- Son kg: 3 (monoton artan ratchet)
- Detay: [FORGE.md](./FORGE.md)

## Human Touch Points: 1

Cycle 2'de `behavior='height'` iOS'ta çalışmadığı görülünce agent durduruldu, Cycle 3'e yönlendirme yapıldı.

## AI Tool Log

| Cycle | Tool | Notlar |
|-------|------|--------|
| 1 | Claude Code CLI | fontSize fix |
| 2 | Claude Code CLI | Yanlış hipotez → rollback |
| 3 | Claude Code CLI | Platform bazlı KeyboardAvoidingView |
| 4 | Claude Code CLI | Animated dot indikatör |

## Decision Log

- Widget sadece `_layout.tsx`'e mount edildi. Ekran bazlı tekrar mount denenmedi — drop-in prensibi.
- `currentScreen` için `usePathname()` kullanıldı; manuel ekran adı string'i yazılmadı.
- Rollback cycle (Cycle 2) silinmedi, FORGE.md'de korundu — başarısız hipotez değerli veridir.
- AsyncStorage seçildi: en yaygın, swap için tek satır yeterli.
