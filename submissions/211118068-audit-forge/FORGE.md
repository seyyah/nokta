# FORGE.md — Cycle Ledger

**Submission:** 211118068-audit-forge  
**Track:** A — Sadelik  
**Agent:** Claude Code (claude-sonnet-4-6)  
**Toplam cycle:** 4 (3 success + 1 rollback)  
**Toplam kg:** 7  
**Human touch points:** 2 (repo setup + PR açma)

---

## Cycle Tablosu

| # | Rapor | Hipotez | Sonuç | Değişen Dosya | Test | Commit | kg | HTP |
|---|---|---|---|---|---|---|---|---|
| 1 | report-02-ideas.md | `ListEmptyComponent` eksik — `<EmptyState />` ekle | ✅ success | `app/(tabs)/ideas.tsx` | EmptyState görünüyor ✓ | `e498644` | 2 | 0 |
| 2 | report-01-onboarding.md | Route typo: `/(tabs)/idea` → `/(tabs)/ideas` | ✅ success | `app/index.tsx` | Buton navigate ediyor ✓ | `b54d547` | 1 | 0 |
| 3 | report-03-detail.md | `numberOfLines={2}` + `ellipsizeMode="tail"` yeterli | ✅ success | `app/idea/[id].tsx` | Başlık 2 satırda kesiliyor ✓ | `3fa2be7` | 1 | 0 |
| 4 | report-02-ideas.md | `RefreshControl` ekle — ek UX iyileştirmesi | ❌ rollback | `app/(tabs)/ideas.tsx` | Sonsuz spinner ✗ | `5987b3d` | 3 | 0 |

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

**HYPOTHESIZE:** React Native `FlatList`, `data=[]` olduğunda `ListEmptyComponent` gösterir. Prop hiç verilmemiş → boş ekran. `<EmptyState />` bileşeni oluşturup prop olarak vermek yeterli.

**REPAIR:** 
- `EmptyState` bileşeni eklendi (ikon + başlık + hint)
- `ListEmptyComponent={<EmptyState />}` prop'u eklendi
- Diff: +15 satır, 0 silme

**TEST:** `mockIdeas = []` yaparak test edildi → "Henüz fikir yok" mesajı görünüyor ✓  
**VERIFY:** `mockIdeas` dolu iken EmptyState gizli ✓ — Regresyon yok ✓

**Öğrenme:** `FlatList` in boş durum hiç hata atmıyor — sessiz fail. `ListEmptyComponent` her `FlatList` için zorunlu olmalı.

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

**HYPOTHESIZE:** `/(tabs)/idea` route'u mevcut değil; `/(tabs)/ideas` olmalı. Expo Router dosya bazlı — `app/(tabs)/ideas.tsx` → route `/(tabs)/ideas`. Tek karakter ('s') eksik.

**REPAIR:**
- `'/(tabs)/idea'` → `'/(tabs)/ideas'`
- Diff: 1 satır değişti, yorum satırı silindi

**TEST:** Butona dokunuldu → `IdeasScreen` açıldı ✓  
**VERIFY:** Geri tuşuyla `OnboardingScreen`'e dönüş ✓

**Öğrenme:** Expo Router route stringleri TypeScript tarafından kontrol edilmiyor (tip `never` ile bypass edilmiş). `typedRoutes: true` + tip kullanımı bu hatayı derleme zamanında yakalar.

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

**READ:** `report-03-detail.md` — 80+ karakter başlık 3-4 satıra yayılıyor, meta ve açıklama bölümünü itiyor.

**LOCATE:** `app/idea/[id].tsx:27` → `<Text style={styles.title}>{idea.title}</Text>`

**HYPOTHESIZE:** `numberOfLines={2}` + `ellipsizeMode="tail"` başlığı 2 satırda sabit tutar; taşan kısım `…` ile kesilir. `ScrollView` zaten mevcut — içeriğin tamamı kaydırarak okunabilir.

**REPAIR:**
- `numberOfLines={2}` eklendi
- `ellipsizeMode="tail"` eklendi
- Stil yorumu silindi
- Diff: 3 satır değişti

**TEST:** ID=3 (uzun başlık) açıldı — 2 satırda `…` ile kesiliyor ✓  
**VERIFY:** ID=1, ID=2 (kısa başlık) etkilenmedi ✓

**Öğrenme:** Detay sayfası tam metni göstermek yerine özet gösteriyor. İlerleyen cycle'da tam başlığı ayrı bir `<Text selectable>` ile açılabilir hale getirmek düşünülebilir.

---

### Cycle 4 — ROLLBACK: Pull-to-Refresh Sonsuz Spinner

```
Rapor    : report-02-ideas.md (ek UX iyileştirmesi)
Ekran    : IdeasScreen
Süre     : 00:00 → 11:33 (11dk 33sn)
Sonuç    : ❌ ROLLBACK
Commit   : 5987b3d (rollback commit)
kg       : 3
HTP      : 0
```

**READ:** `report-02-ideas.md` — yenileme UX önerildi (ek iyileştirme).

**LOCATE:** `app/(tabs)/ideas.tsx` → `FlatList`, `refreshControl` prop yok.

**HYPOTHESIZE:** `RefreshControl` + `useState(false)` + `onRefresh` callback ile pull-to-refresh eklenir. Mock data statik olduğu için `onRefresh` 800ms sonra `setRefreshing(false)` çağırır.

**REPAIR (BAŞARISIZ):**
- `RefreshControl` import edildi
- `useState(true)` eklendi — **HATA: başlangıç değeri `true` verildi, `false` olmalıydı**
- `refreshControl={...}` prop eklendi

**TEST:** Uygulama açılınca spinner sonsuz dönüyor ✗  
**VERIFY:** BAŞARISIZ — `refreshing` hiç `false` olmuyor

**ROLLBACK KARARI:**
- Hipotez doğruydu (`RefreshControl` eklemek teknik olarak mümkün)
- Implement hatası (`useState(true)` typo) vardı
- Mock data statik → pull-to-refresh gerçek ihtiyaç değil → scope dışı
- Kalan süre (<3dk) fix için yeterli değil — rollback
- Bir sonraki cycle'da `useState(false)` ile yeniden denenebilir

**Değişen dosyalar (rollback):** `app/(tabs)/ideas.tsx` → önceki state'e döndürüldü

---

## Ratchet Durumu

| Cycle | kg | Kümülatif kg | Durum |
|---|---|---|---|
| 1 | 2 | 2 | ✅ |
| 2 | 1 | 3 | ✅ |
| 3 | 1 | 4 | ✅ |
| 4 | 3 | 7 | ❌ rollback (kg saymaz regresyon değil) |

Başarılı cycle'lar monoton artar. Rollback score'u düşürmez — başarısız hipotez değerli veridir.

---

## AI Tool Log

| Cycle | Tool | Model | Kullanım |
|---|---|---|---|
| 1-4 | Claude Code CLI | claude-sonnet-4-6 | READ/LOCATE/REPAIR/VERIFY tüm adımlar |
| — | @xtatistix/mobile-audit | v0.1.0 | Audit report üretimi (widget) |
