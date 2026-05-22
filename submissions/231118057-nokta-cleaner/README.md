Track: B

# Nokta Cleaner — Audit-Forge Submission

**Öğrenci No:** 231118057
**Slug:** `nokta-cleaner`
**Misyon:** Audit-Forge — müşterinin geliştirici olduğu kapalı döngü
**Track:** B (Yaratıcılık — müşteri-geliştirici use case'i)

---

## Demo

- **APK:** [`app-release.apk`](./app-release.apk) (~67 MB) — Android, bilinmeyen kaynaklara izin ver
- **Expo (web):** [APK alternatifi](https://expo.dev/accounts/cubukcu/projects/expo-template-blank/builds/e38dc81b-9786-439e-989f-dc36d8ab847b)
- **Demo video (≤60 sn):** [YouTube Shorts — Nokta Cleaner demo](https://www.youtube.com/shorts/u0BDMiCYDMk)

---

## Nedir?

Dağınık notları (WhatsApp dışa aktarma, toplantı notları, bullet karışıklığı) yapıştır → Gemini AI temizler, mükerrer fikirleri birleştirir, kategorize eder → uzman onaylar/reddeder/düzenler → onaylı kartlar panoya / `.md` rapora gider.

Bu submission'da uygulamanın **kendisi** değil, **uygulama + AuditWidget kompozisyonu** ön planda. Müşteri (uygulamayı kullanan) ile geliştirici (kodu yazan) **aynı kişi** oluyor: aksaklığı görüyor, audit ile yakalıyor, `.md` raporu agent'a yediriyor, fix merge ediliyor. Detay: [`IDEA.md`](./IDEA.md).

---

## Audit-Forge Akışı (bu submission)

```
Müşteri ekranda aksaklık görür
        ↓
AuditWidget FAB → ekran yakala → sarı kutu çiz → not yaz
        ↓
audit-reports/0X-*.md   (burn-in screenshot + region + source ipuçları + hipotez)
        ↓
Coding agent (Claude Code CLI) ← rapor input
        ↓
READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT / ROLLBACK
        ↓
FORGE.md ledger güncellenir (cycle no, hash, kg)
        ↓
Müşteri sadece review + merge yapar
```

---

## Track B Gerekçesi

Audit raporlarımın hepsi sıradan stil bug'ı değil, **feature-request veya capability mismatch**:

- `01-home-empty-placeholder.md` → "sample data ile başlat" feature isteği (yeni davranış)
- `02-ideacard-actionrow-overflow.md` → layout reorganization + WCAG kontrast (yeni primer/secondary ayrımı)
- `03-sessionreport-export-clipboard-only.md` → "Export" gerçekten dosya export'u olmalı (yeni capability + apk rebuild riski)

Bu üç rapor, müşterinin geliştirici olduğu kompozisyonun **canlı kanıtı**: müşteri "burada X olsa güzel olurdu" diyor, forge cycle yeni davranış doğuruyor.

---

## Decision Log

| # | Tarih | Karar | Gerekçe |
|---|---|---|---|
| 1 | 2026-05-18 | Mevcut Nokta Cleaner (Track C teslimi) iskeleti baz alındı | Sıfırdan minimal Expo kurmak yerine, gerçek state'i olan bir app'te audit kullanmak Track B'nin "kompozisyon" tezini güçlendiriyor |
| 2 | 2026-05-18 | TypeScript yerine JS bırakıldı | Mevcut kod JS; refactor süresi audit-forge döngüsünden çalardı. AuditWidget TS olabilir, host JS — boundary kuralı izin veriyor |
| 3 | 2026-05-20 | 3 audit raporu yazıldı (Phase A) | HomeEmpty / IdeaCardList / SessionReport — 3 farklı state, 3 farklı şikayet tipi (onboarding / layout / capability) |
| 4 | 2026-05-20 | Rapor #3'e ikinci bir "rollback adayı" hipotez gömüldü | Challenge zorunlu rollback şartı için bilinçli yüksek riskli hipotez (expo-sharing native dep) önceden işaretlendi |
| 5 | _TBD_ | Forge cycle 1-4 koşulacak | Sıra: rapor #3 quick → rapor #1 → rapor #2 → rapor #3 extended (rollback) |

---

## Human Touch Points

(Agent durduğu / yönlendirildiği anlar; commit history ile tutarlı olmak zorunda — Track C için kritik, Track B için referans)

| # | Cycle | An | Niye müdahale |
|---|---|---|---|
| 1 | _TBD_ | _Forge cycle koşulduktan sonra doldurulacak_ | _ör. agent yanlış dosyada arama yapıyordu, doğru yolu işaret ettim_ |

> Şu ana kadar sayaç: **0** (sadece Phase A audit raporları yazıldı, henüz forge cycle koşmadı).

---

## AI Tool Log

| Cycle | Tool | Model | Niye o tool |
|---|---|---|---|
| Phase A — raporları yazma | Claude Code (CLI) | Opus 4.7 (1M context) | Mevcut JS kodunu doğrudan okuyup satır numarası verebildiği için |
| Cycle 1 (planned) | _TBD_ | _TBD_ | _Rapor #3 quick fix tek satır → Codex CLI deneyeceğim_ |
| Cycle 2 (planned) | _TBD_ | _TBD_ | _ | 
| Cycle 3 (planned) | _TBD_ | _TBD_ | _ |
| Cycle 4 (planned) | _TBD_ | _TBD_ | _Rollback adayı; backup tool gerekirse buraya yazılacak_ |

---

## Teslim Kontrol Listesi

- [x] `README.md` ilk satırda `Track: B`
- [x] `app/` — Expo projesi (audit widget mount _TBD_ — kullanıcı kendi mount'layacak)
- [x] `audit-reports/` — 3 `.md` rapor (burn-in PNG'ler `assets/` altına eklenecek)
- [x] `IDEA.md` (Track B zorunlu)
- [ ] `FORGE.md` cycle ledger — iskele yazıldı, cycle koştuktan sonra commit hash'leri dolacak
- [x] `app-release.apk` (~67 MB)
- [x] Demo video (≤60 sn) — [YouTube Shorts](https://www.youtube.com/shorts/u0BDMiCYDMk)
- [ ] Burn-in PNG'leri — `audit-reports/assets/*.png` (kullanıcı çekecek)
- [x] Decision log (yukarıda)
- [x] Human touch points iskele (cycle sonrası dolacak)
- [x] AI tool log iskele

---

## Yerel Kurulum

```bash
cd app
npm install
# .env: EXPO_PUBLIC_GEMINI_API_KEY=...
npx expo start --web        # Web
npx expo start --android    # EAS dev build cihazda (view-shot için Expo Go yetmez)
```

Gemini API key: [aistudio.google.com/apikey](https://aistudio.google.com/apikey) (ücretsiz)

---

## Teknoloji

- React Native + Expo SDK 54
- NativeWind v4 (Tailwind RN)
- Google Gemini AI — model fallback zinciri: `gemini-flash-lite-latest` → `gemini-2.5-flash` → `gemini-2.0-flash`
- expo-clipboard
- localStorage (oturum geçmişi, son 5 oturum)
- AuditWidget: `@xtatistix/mobile-audit` (mount _TBD_)
