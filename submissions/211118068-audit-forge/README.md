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
npx expo start --clear
```

QR kodu Expo Go ile tara (iOS/Android).

**Expo Proje Linki:** https://expo.dev/accounts/mrkarahann/projects/nokta-audit-forge-211118068

## Demo Video

https://youtube.com/shorts/WQRtY0Sb_Fo?feature=share

---

## Proje Özeti

Minimal bir "fikir takip" uygulaması. Final haftasında Voice Visualizer, R3F Avatar ve Expert Bridge eklendi.

| Ekran | Dosya | Açıklama |
|---|---|---|
| OnboardingScreen | `app/index.tsx` | Karşılama + navigasyon |
| IdeasScreen | `app/(tabs)/ideas.tsx` | Fikir listesi (FlatList) |
| IdeaDetailScreen | `app/idea/[id].tsx` | Fikir detayı |
| StudioScreen | `app/(tabs)/studio.tsx` | Voice viz + R3F avatar + lipsync + rapor |
| SettingsScreen | `app/(tabs)/settings.tsx` | Forge STUCK tespiti + Uzmana Bağlan |
| ExpertBridgeScreen | `app/expert-bridge.tsx` | Jitsi Meet WebRTC görüntülü köprü |

**AuditWidget tek satırda mount:** `app/_layout.tsx:42`

Widget kaldırıldığında: `grep -r 'AuditWidget' app/app/` → yalnızca `_layout.tsx:42` döner.

---

## Decision Log

1. **Track A seçimi:** Drop-in disiplini — widget tek dosyada, tek satırda. Kaldırılabilirlik korunuyor.
2. **Expo Router `usePathname()`:** `currentScreen` prop'u ekstra state olmadan dinamik besleniyor.
3. **AsyncStorage adaptörü:** `auditStorage.ts` — host boundary korunuyor.
4. **R3F native (WebView değil):** model-viewer web worker kısıtlaması Android'de aşılamaz → `AvatarGLB.tsx` ile expo-gl native rendering.
5. **preprocessGlbTextures:** Three.js r160 blob: URL → React Native WebGL dönüşemez → texture'lar önceden `file://` URI'ye çıkarıldı.
6. **LinearToneMapping + exposure=1.8:** expo-gl linear framebuffer → sRGB gamma compensasyonu manuel yapıldı.
7. **ForgeTracker heuristik:** 2 ardışık FAIL → STUCK → Settings'te "Uzmana Bağlan" butonu aktifleşiyor.
8. **Jitsi Meet:** LiveKit/Daily yerine Jitsi — sıfır backend, sabit oda URL'i, WebView ile çalışıyor.
9. **Rollback (Cycle 4):** useState(true) typo → sonsuz spinner — mock data statik olduğu için scope dışı.
10. **Rollback (Cycle 5):** WebView + model-viewer → web worker kısıtlaması — yaklaşım değiştirildi.

---

## Human Touch Points: 2

| # | Adım | Neden |
|---|---|---|
| 1 | Fork + clone + branch oluşturma | Git setup |
| 2 | PR açma + video çekme | GitHub UI + demo |

---

## APK Build

```bash
cd submissions/211118068-audit-forge/app
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

EAS build ID: `ed7eec96` — `app-release.apk` repoda mevcut.

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
- [x] `FORGE.md` ledger: 5 başarılı + 2 rollback cycle
- [x] `app-release.apk` repoda mevcut
- [x] Decision log + human touch points + AI tool log README'de
- [x] Root dizine dokunulmadı
- [x] Demo video: https://youtube.com/shorts/WQRtY0Sb_Fo?feature=share
- [x] `avatar.glb` kendi yüz modeli (Avaturn export)
- [x] `BRIDGE.md` expert köprü özeti
- [x] Voice visualizer + R3F avatar + lipsync çalışıyor
- [x] ForgeTracker STUCK tespiti + Jitsi expert bridge
