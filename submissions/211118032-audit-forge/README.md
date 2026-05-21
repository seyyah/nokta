Track: A

# Nokta Expert Support + Audit Widget — Track A Teslimi

**Geliştirici:** Beyza Gül Demir (211118032)  
**Slug:** audit-forge

## Proje özeti

Mevcut **Nokta Expert Support** host uygulamasına `@xtatistix/mobile-audit` **drop-in** olarak eklendi. `App.tsx` üzerinden `<AuditWidget />` mount edildi; `currentScreen` React Navigation state'inden beslenir. Phase B forge: Home, Chat, Mentor düzeltmeleri — [`FORGE.md`](./FORGE.md).

## Demo video (≤60 sn)

**Link:** https://youtube.com/shorts/XZeCNn_0aNI?feature=share

YouTube Shorts — audit widget (🐛 FAB, bug capture) ve Phase B forge sonrası Home / Chat / Mentor ekranları.

## Expo

```bash
cd app
npm install
npx expo start
```

Expo hesabı: `@beyzaguldemirr` / proje: `nokta-expert-support`

## APK

Dosya: [`app-release.apk`](./app-release.apk) (submission kökünde, zorunlu)

Build komutu:

```bash
cd app
npx eas build --platform android --profile preview
```

Son build: https://expo.dev/accounts/beyzaguldemirr/projects/nokta-expert-support/builds/2774bf8b-c0a9-4bf4-90d2-b2a11f5cba3a

`app-release.apk` bu klasör kökünde mevcut (EAS `preview` profili).

## Teslim checklist

| Öğe | Durum |
|-----|--------|
| `Track: A` (bu dosya, satır 1) | ✅ |
| `app/` + audit widget | ✅ |
| `audit-reports/` ≥3 bug (tek export, 3 ekran) | ✅ |
| `FORGE.md` ≥3 COMMIT + ≥1 ROLLBACK | ✅ |
| `app-release.apk` | ✅ |
| Demo video linki (yukarı) | ✅ |
| PR → `seyyah/nokta:main` | ❌ **son adım — fork + push + PR** |

## Phase A — Audit

- [x] `app/` — Expo + TS + `<AuditWidget />`
- [x] `audit-reports/bug-report-2026-05-20-17-06.md` — Home, Chat, Mentor (burn-in)

## Phase B — Forge

- [x] 3 COMMIT + 1 ROLLBACK → [`FORGE.md`](./FORGE.md)

## Drop-in kararları (decision log)

| Karar | Gerekçe |
|-------|---------|
| Widget yalnızca `App.tsx`'te | Host ekranlarına minimum müdahale |
| `auditDeps` ayrı modül | DI: capture/share/storage host'tan |
| `expo-file-system/legacy` | Expo SDK 54 uyumu |
| `nokta_audit_notes` AsyncStorage key | Mentor verisi ile karışmaz |
| Forge fix'leri ayrı ekran dosyalarında | Track A: tek sorun → tek dosya odaklı diff |

## Human touch points

1. Cihazda audit widget ile 3 ekranda bug yakalama + Markdown export  
2. Export dosyasını `audit-reports/` altına yerleştirme  
3. Forge cycle review (agent çıktısını kontrol)  
4. Demo video çekimi + README linki  
5. EAS APK build + dosyayı submission köküne koyma  
6. Fork'a push + PR açma  

**Sayı:** 6

## AI tool log

| Aşama | Araç | Ne yaptı |
|-------|------|----------|
| Audit entegrasyonu | Cursor Agent | `AuditWidget`, `auditDeps`, `auditStorage`, navigation `currentScreen` |
| Phase B forge | Cursor Agent (Composer) | `FORGE.md` döngüleri; Home/Chat/Mentor kod düzeltmeleri |
| Teslim düzenleme | Cursor Agent | `audit-reports/` yolları, README (video link, checklist) |

## Pull Request

Branch: `submission/211118032-audit-forge`  
Hedef: `seyyah/nokta:main`  
Sadece `submissions/211118032-audit-forge/` altı commit'lenmeli.
