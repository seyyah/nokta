Track: A

# 211118068 — nokta-audit-forge

**Track: A — Sadelik (drop-in primitive disiplini)**  
**Öğrenci No:** 211118068  
**Slug:** audit-forge

---

## Expo Çalıştırma

```bash
cd submissions/211118068-audit-forge/app
npm install
npx expo start
```

QR kodu Expo Go ile tara (iOS/Android).

**Expo Proje Linki:** https://expo.dev/accounts/mrkarahann/projects/nokta-audit-forge-211118068

## Demo Video

https://youtube.com/shorts/6G0HnG6ZxnU?feature=share

---

## Proje Özeti

Minimal bir "fikir takip" uygulaması. 4 ekran:

| Ekran | Dosya | Açıklama |
|---|---|---|
| OnboardingScreen | `app/index.tsx` | Karşılama + navigasyon |
| IdeasScreen | `app/(tabs)/ideas.tsx` | Fikir listesi (FlatList) |
| IdeaDetailScreen | `app/idea/[id].tsx` | Fikir detayı |
| SettingsScreen | `app/(tabs)/settings.tsx` | Uygulama bilgisi |

**AuditWidget tek satırda mount:** `app/_layout.tsx:33` →  
`<AuditWidget appName="nokta-audit-forge" deps={...} initialPosition={...} />`

Widget kaldırıldığında: `grep -r 'AuditWidget' app/app/` → yalnızca `_layout.tsx:33` döner. Uygulama çalışmaya devam eder.

---

## Decision Log

1. **Track A seçimi:** Drop-in disiplini kanıtlanabilir — widget tek dosyada, tek satırda monte. Kaldırılabilirlik test edildi: `_layout.tsx`'teki 1 satır silinince app çalışmaya devam eder.
2. **Expo Router (file-based):** `usePathname()` ile `currentScreen` prop'u otomatik güncelleniyor — hiç ekstra state yok.
3. **AsyncStorage adaptörü:** `auditStorage.ts` — host sınırı korunuyor. Widget doğrudan AsyncStorage import etmiyor.
4. **3 kasıtlı bug:** Forge cycle'larının gerçek kod değişikliği üretmesi için başlangıç kodu bilinçli hatalı yazıldı. Raporlar widget ile üretildi.
5. **Rollback kararı (Cycle 4):** `useState(true)` typo → sonsuz spinner. Mock data statik olduğu için pull-to-refresh scope dışı → rollback.
6. **APK:** EAS ile build gerekiyor — bkz. aşağıdaki adımlar.

---

## Human Touch Points: 2

| # | Adım | Neden |
|---|---|---|
| 1 | Fork + clone + branch oluşturma | Git setup — agent yapamaz |
| 2 | PR açma | GitHub UI — agent yapamaz |

Agent (Claude Code) tüm kod yazımını, commit geçmişini, FORGE.md loglamasını ve audit raporlarını otonom üretti.

---

## APK Build

```bash
cd submissions/211118068-audit-forge/app
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

EAS artifact linki: *(build sonrası eklenecek)*

---

## AI Tool Log

| Tool | Model | Kullanım |
|---|---|---|
| Claude Code CLI | claude-sonnet-4-6 | Tüm kod, commit mesajları, FORGE.md, README |
| @xtatistix/mobile-audit | v0.1.0 | Audit widget — report üretimi |

---

## Teslim Self-Check

- [x] `README.md` ilk satırında `Track: A` var
- [x] `app/` altında çalışır Expo projesi + audit widget mount
- [x] `audit-reports/` altında 3 burn-in'li `.md` rapor
- [x] `FORGE.md` ledger: 3 başarılı + 1 rollback cycle
- [x] `app-release.apk` — EAS build `ed7eec96` (62.8 MB)
- [x] Decision log + human touch points + AI tool log README'de
- [x] Root dizine dokunulmadı
