# FORGE.md — Otonom Onarım Döngüsü Ledger'ı

**Uygulama:** Slop Dedektörü  
**Track:** B — Yaratıcılık  
**Tarih:** 20.05.2026  

Döngü spesifikasyonu: `READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT/ROLLBACK`  
Her cycle ≤15 dakika. Input: nokta-audit `.md` raporları.

---

## Cycle 1 — InputScreen: Minimum karakter uyarısı ✅ COMMIT

**Süre:** 12 dk  
**Rapor:** `report-01-input-screen.md`

| Adım | Çıktı |
|------|-------|
| **READ** | Pitch çok kısaysa API'ye gidiyor, anlamsız sonuç dönüyor |
| **LOCATE** | `App.js` → `handleAnalyze()` → `if (!pitch.trim()) return;` satırı |
| **HYPOTHESIZE** | `pitch.trim().length < 50` kontrolü ekle, uyarı göster |
| **REPAIR** | `handleAnalyze`'a minimum karakter kontrolü eklendi; 50 char altında kırmızı banner gösteriliyor |
| **TEST** | 10 char pitch ile "Analiz Et" → banner görünüyor, API çağrısı yapılmıyor ✅ |
| **VERIFY** | 60 char pitch → normal akış çalışıyor ✅ |
| **COMMIT** | `fix: add minimum character validation (50 chars)` |

**Değişiklik:**
```js
// handleAnalyze içine eklendi
if (pitch.trim().length < 50) {
  setError('Pitch çok kısa — en az 50 karakter gerekli.');
  return;
}
```

---

## Cycle 2 — ResultsScreen: Bar animasyonu reset ✅ COMMIT

**Süre:** 8 dk  
**Rapor:** `report-02-results-screen.md`

| Adım | Çıktı |
|------|-------|
| **READ** | İkinci analizde `ScoreGauge` bar animasyonu çalışmıyor |
| **LOCATE** | `ScoreGauge` komponenti → `useRef(new Animated.Value(0))` → `useEffect` |
| **HYPOTHESIZE** | `score` prop değiştiğinde `anim` sıfırlanmıyor; `anim.setValue(0)` çağrısı eksik |
| **REPAIR** | `useEffect`'e `anim.setValue(0)` önceden eklendi |
| **TEST** | İki farklı pitch art arda analiz edildi → her ikisinde de animasyon çalışıyor ✅ |
| **VERIFY** | Üçüncü analizde de tutarlı ✅ |
| **COMMIT** | `fix: reset gauge animation on each new score` |

**Değişiklik:**
```js
useEffect(() => {
  anim.setValue(0); // reset önce
  Animated.timing(anim, { toValue: score, duration: 1200, useNativeDriver: false }).start();
}, [score]);
```

---

## Cycle 3 — HotlScreen: HITL'de geri butonu ✅ COMMIT

**Süre:** 10 dk  
**Rapor:** `report-03-hotl-screen.md`

| Adım | Çıktı |
|------|-------|
| **READ** | HITL ekranında geri dönüş yok, kullanıcı mahsur kalıyor |
| **LOCATE** | `App.js` → HITL UI bloğu → `approveBtn` tek buton |
| **HYPOTHESIZE** | "← Geri" butonu ekle, `setLoopMode('HOTL')` çağırsın |
| **REPAIR** | HITL UI'na ikinci buton eklendi |
| **TEST** | HITL'e girip "← Geri"ye basıldı → HOTL ekranına döndü ✅ |
| **VERIFY** | Geri döndükten sonra "Onayla" çalışıyor ✅ |
| **COMMIT** | `fix: add back button in HITL mode` |

**Değişiklik:**
```jsx
{/* HITL butonları */}
<View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
  <TouchableOpacity style={s.rejectBtn} onPress={() => setLoopMode('HOTL')}>
    <Text style={s.rejectBtnText}>← Geri</Text>
  </TouchableOpacity>
  <TouchableOpacity style={s.approveBtn} onPress={handleHitlConfirm}>
    <Text style={s.approveBtnText}>✅ Onayla</Text>
  </TouchableOpacity>
</View>
```

---

## Cycle 4 — ResultsScreen: Share butonu boş sonuçta çöküyor ⏪ ROLLBACK

**Süre:** 14 dk  
**Rapor:** Manuel keşif (audit widget'sız)

| Adım | Çıktı |
|------|-------|
| **READ** | Share butonuna result yokken basılıyor → undefined error |
| **LOCATE** | `handleShare` → `result.slop_score` → result null ise crash |
| **HYPOTHESIZE** | Guard clause zaten var (`if (!result) return`) — ama buton görünüyor |
| **REPAIR** | Share butonunu `result && (...)` ile koşullu render yapmayı denedim |
| **TEST** | Share butonu gizlendi ✅ ama paylaş sonrası sonuçlar da kayboluyor ❌ |
| **VERIFY** | State yönetiminde yan etki — `result` state'i sıfırlanıyor |
| **ROLLBACK** | Değişiklik geri alındı. Gerçek sorun share sonrası `setResult(null)` çağrısı değil, ayrı bir oturumda incelenecek. |

---

## Özet

| Cycle | Ekran | Sorun | Sonuç |
|-------|-------|-------|-------|
| 1 | InputScreen | Min. karakter yok | ✅ COMMIT |
| 2 | ResultsScreen | Bar animasyonu reset | ✅ COMMIT |
| 3 | HotlScreen | HITL geri butonu | ✅ COMMIT |
| 4 | ResultsScreen | Share crash | ⏪ ROLLBACK |