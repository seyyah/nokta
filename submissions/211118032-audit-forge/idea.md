# Fikir — Audit-Forge (Track A: Sadelik)

## Problem

Expert Support uygulamasında UX hataları (layout, metin, akış) manuel testte yakalanıyor ama raporlama yavaş: ekran görüntüsü + açıklama + issue açma sürtünmesi yüksek.

## Çözüm

`@xtatistix/mobile-audit` widget'ını **5 dakikalık drop-in** ile host'a ekle:

- FAB → capture → burn-in seçim → not → Markdown export
- Backend yok; notlar AsyncStorage'da
- `.md` çıktısı coding agent için input (Phase B forge)

## Track A — Sadelik eşleşmesi

| Kriter | Uygulama |
|--------|----------|
| Minimum host değişikliği | Sadece `App.tsx` + 3 küçük modül |
| Widget kaldırılabilir | Audit dosyaları izole; navigator/ekranlar aynı |
| DI disiplini | `createAuditDeps(currentScreen)` — capture/share/storage host'tan |
| Composed mod yok (bilinçli) | Track A: self-contained, ek pipeline yok |

## Scope out

- tour-agent entegrasyonu
- Otomatik GitHub issue oluşturma
- Forge döngüsünü widget içinden tetikleme (host/agent sorumluluğu)

## Sonraki adım

Phase B: `audit-reports/*.md` → agent → `FORGE.md` ledger
