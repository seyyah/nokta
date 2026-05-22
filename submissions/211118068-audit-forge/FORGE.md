# FORGE.md — Cycle Ledger

**Submission:** 211118068-audit-forge  
**Track:** A — Sadelik  
**Agent:** Claude Code (claude-sonnet-4-6)  
**Toplam cycle:** 7 (5 success + 2 rollback)  
**Toplam kg:** 16  
**Human touch points:** 2 (repo setup + PR açma)

---

## Cycle Tablosu

| # | Rapor | Hipotez | Sonuç | Değişen Dosya | Test | Commit | kg | HTP |
|---|---|---|---|---|---|---|---|---|
| 1 | report-02-ideas.md | `ListEmptyComponent` eksik — `<EmptyState />` ekle | ✅ success | `app/(tabs)/ideas.tsx` | EmptyState görünüyor ✓ | `e498644` | 2 | 0 |
| 2 | report-01-onboarding.md | Route typo: `/(tabs)/idea` → `/(tabs)/ideas` | ✅ success | `app/index.tsx` | Buton navigate ediyor ✓ | `b54d547` | 1 | 0 |
| 3 | report-03-detail.md | `numberOfLines={2}` + `ellipsizeMode="tail"` yeterli | ✅ success | `app/idea/[id].tsx` | Başlık 2 satırda kesiliyor ✓ | `3fa2be7` | 1 | 0 |
| 4 | report-02-ideas.md | `RefreshControl` ekle — ek UX iyileştirmesi | ❌ rollback | `app/(tabs)/ideas.tsx` | Sonsuz spinner ✗ | `5987b3d` | 3 | 0 |
| 5 | studio-avatar-render | WebView + model-viewer ile GLB render — CDN bağımsız | ❌ rollback | `components/AvatarModelViewer.tsx`, `lib/avatar3DHtml.ts` | `type="module"` inline Android WebView'de çalışmıyor ✗ | — | 3 | 0 |
| 6 | studio-avatar-render | R3F native + `preprocessGlbTextures` — blob URL sorununu kes | ✅ success | `lib/loadAvatarGlb.ts`, `components/AvatarPresenter.tsx` | Model render oluyor, geometri görünüyor ✓ | — | 3 | 0 |
| 7 | studio-avatar-colors | `outputColorSpace` + `LinearToneMapping` ile renk kalibrasyonu | ✅ success | `components/AvatarGLB.tsx`, `lib/patchExpoTextures.ts` | Renkler kabul edilebilir seviyeye geldi ✓ | — | 3 | 0 |

---

## Detaylı Cycle Logları

### Cycle 1 — IdeasScreen: Boş Liste Sessiz Kalıyor

```
Rapor    : audit-reports/report-02-ideas.md
Ekran    : IdeasScreen
Süre     : 00:00 → 08:14 (8dk 14sn)
Sonuç    : ✅ SUCCESS
Commit   : e498644
kg       : 2
HTP      : 0
```

**READ:** `report-02-ideas.md` — fikir listesi boş olduğunda ekran tamamen boş.  
**LOCATE:** `app/(tabs)/ideas.tsx:19` → `<FlatList ... />` — `ListEmptyComponent` prop yok.  
**HYPOTHESIZE:** React Native `FlatList`, `data=[]` olduğunda `ListEmptyComponent` gösterir. Prop hiç verilmemiş → boş ekran.  
**REPAIR:** `EmptyState` bileşeni + `ListEmptyComponent={<EmptyState />}` prop eklendi (+15 satır)  
**TEST:** `mockIdeas = []` → "Henüz fikir yok" mesajı görünüyor ✓  
**VERIFY:** `mockIdeas` dolu iken EmptyState gizli ✓

---

### Cycle 2 — OnboardingScreen: Başla Butonu Navigasyon Yapmıyor

```
Rapor    : audit-reports/report-01-onboarding.md
Ekran    : OnboardingScreen
Süre     : 00:00 → 05:42 (5dk 42sn)
Sonuç    : ✅ SUCCESS
Commit   : b54d547
kg       : 1
HTP      : 0
```

**READ:** `report-01-onboarding.md` — "Başla" butonuna basınca hiçbir şey olmuyor.  
**LOCATE:** `app/index.tsx:35` → `router.push('/(tabs)/idea' as never)`  
**HYPOTHESIZE:** `/(tabs)/idea` route'u mevcut değil; `/(tabs)/ideas` olmalı (1 karakter eksik).  
**REPAIR:** `'/(tabs)/idea'` → `'/(tabs)/ideas'`  
**TEST:** Butona dokunuldu → `IdeasScreen` açıldı ✓  
**VERIFY:** Geri tuşuyla `OnboardingScreen`'e dönüş ✓

---

### Cycle 3 — IdeaDetail: Uzun Başlık Layout'u Bozuyor

```
Rapor    : audit-reports/report-03-detail.md
Ekran    : IdeaDetailScreen
Süre     : 00:00 → 06:58 (6dk 58sn)
Sonuç    : ✅ SUCCESS
Commit   : 3fa2be7
kg       : 1
HTP      : 0
```

**READ:** `report-03-detail.md` — 80+ karakter başlık 3-4 satıra yayılıyor.  
**LOCATE:** `app/idea/[id].tsx:27` → `<Text style={styles.title}>{idea.title}</Text>`  
**HYPOTHESIZE:** `numberOfLines={2}` + `ellipsizeMode="tail"` başlığı 2 satırda sabit tutar.  
**REPAIR:** Her iki prop eklendi (3 satır değişiklik)  
**TEST:** ID=3 (uzun başlık) → 2 satırda `…` ✓  
**VERIFY:** ID=1, ID=2 etkilenmedi ✓

---

### Cycle 4 — ROLLBACK: Pull-to-Refresh Sonsuz Spinner

```
Rapor    : report-02-ideas.md (ek UX)
Ekran    : IdeasScreen
Süre     : 00:00 → 11:33 (11dk 33sn)
Sonuç    : ❌ ROLLBACK
Commit   : 5987b3d
kg       : 3
HTP      : 0
```

**HYPOTHESIZE:** `RefreshControl` + `useState(false)` ile pull-to-refresh ekle.  
**REPAIR (BAŞARISIZ):** `useState(true)` yazıldı — sonsuz spinner.  
**ROLLBACK KARARI:** Mock data statik → pull-to-refresh gerçek ihtiyaç değil → scope dışı.

---

### Cycle 5 — ROLLBACK: WebView + model-viewer ile 3D Avatar

```
Rapor    : studio-avatar-render (Studio ekranı)
Ekran    : StudioScreen
Süre     : 00:00 → 18:30 (18dk 30sn)
Sonuç    : ❌ ROLLBACK
kg       : 3
HTP      : 0
```

**READ:** Studio ekranında avatar görünmüyor — GLB dosyası mevcut.  
**LOCATE:** `AvatarModelViewer.tsx` → WebView + model-viewer CDN yaklaşımı.  
**HYPOTHESIZE:** model-viewer lokal asset ile yüklense CDN bağımsız çalışır.  
**REPAIR:** `fetch(scriptAsset.uri)` ile script içeriği indirilip HTML'e gömüldü. HTML dosyaya yazılıp `file://` URI ile yüklendi.  
**TEST:** `customElements.get('model-viewer')` hiç truthy olmuyor → `fail:script` ✗  
**ROOT CAUSE:** model-viewer web workers kullanıyor; `file://` context'te worker URL çözümlenemiyor.  
**ROLLBACK KARARI:** WebView + model-viewer yaklaşımı Android'de yapısal olarak kısıtlı — farklı yol gerekiyor.

---

### Cycle 6 — SUCCESS: R3F Native + preprocessGlbTextures

```
Rapor    : studio-avatar-render (Studio ekranı)
Ekran    : StudioScreen
Süre     : 00:00 → 14:20 (14dk 20sn)
Sonuç    : ✅ SUCCESS
kg       : 3
HTP      : 0
```

**READ:** Cycle 5 ROLLBACK log — WebView yaklaşımı başarısız.  
**LOCATE:** `AvatarGLB.tsx` — mevcut R3F native implementasyonu. `loadAvatarGlb.ts` — `preprocessGlbTextures` adımı eksik.  
**HYPOTHESIZE:** Three.js r160 GLTFLoader embedded texture'lar için `blob:` URL üretiyor. React Native'de `blob:` URL → WebGL texture dönüşemiyor → gri model. `preprocessGlbTextures` texture'ları önceden `file://` URI'ye çeviriyor.  
**REPAIR:**
- `AvatarPresenter` → `AvatarGLB` (R3F native) kullanacak şekilde değiştirildi
- `loadAvatarGlb.ts`'e `preprocessGlbTextures` adımı geri eklendi
- `resolveAvatarLoaderUri` → `FileSystem.downloadAsync` (Asset.downloadAsync Metro URL'ini desteklemiyor)

**TEST:** Studio açıldı → 13MB GLB indirildi → preprocessing → model render oldu ✓  
**VERIFY:** Geometri görünüyor, morph targetlar aktif, lipsync çalışıyor ✓

---

### Cycle 7 — SUCCESS: Renk Kalibrasyonu (outputColorSpace)

```
Rapor    : studio-avatar-colors (Studio ekranı)
Ekran    : StudioScreen
Süre     : 00:00 → 12:00 (12dk)
Sonuç    : ✅ SUCCESS
kg       : 3
HTP      : 0
```

**READ:** Model görünüyor fakat gri/renksiz.  
**LOCATE:** `AvatarGLB.tsx` `onCreated` → `outputColorSpace = 'srgb'`; `patchExpoTextures.ts` → metalness/roughness değerleri agresif kırpılıyor.  
**HYPOTHESIZE:** expo-gl linear framebuffer sunar, sRGB değil. `outputColorSpace = 'srgb'` Three.js'in fazladan gamma dönüşümü yapmasına yol açıyor → yanlış renkler. `LinearSRGBColorSpace` + `LinearToneMapping` + `exposure=1.8` ile dengelenir.  
**REPAIR:**
- `outputColorSpace = 'srgb-linear'`
- `toneMapping = THREE.LinearToneMapping`, `toneMappingExposure = 1.8`
- `tuneLoadedMaterials` → metalness/roughness kırpması kaldırıldı, yalnızca colorSpace ayarı kaldı

**TEST:** Renkler görünür hale geldi ✓  
**VERIFY:** Lipsync devam ediyor, performans stabil ✓

---

## Ratchet Durumu

| Cycle | kg | Kümülatif kg | Durum |
|---|---|---|---|
| 1 | 2 | 2 | ✅ |
| 2 | 1 | 3 | ✅ |
| 3 | 1 | 4 | ✅ |
| 4 | 3 | 7 | ❌ rollback |
| 5 | 3 | 10 | ❌ rollback |
| 6 | 3 | 13 | ✅ |
| 7 | 3 | 16 | ✅ |

---

## AI Tool Log

| Cycle | Tool | Model | Kullanım |
|---|---|---|---|
| 1-4 | Claude Code CLI | claude-sonnet-4-6 | READ/LOCATE/REPAIR/VERIFY tüm adımlar |
| 5-7 | Claude Code CLI | claude-sonnet-4-6 | Avatar render pipeline geliştirme |
| — | @xtatistix/mobile-audit | v0.1.0 | Audit report üretimi |
