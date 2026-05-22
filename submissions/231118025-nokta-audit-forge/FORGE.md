# FORGE Ledger — 231118025-nokta-audit-forge

> Cycle başına 15 dakika kutu. Her cycle bir audit raporu → READ→LOCATE→HYPOTHESIZE→REPAIR→TEST→VERIFY→COMMIT/ROLLBACK.

---

## Cycle Tablosu

| # | Rapor | Hipotez | Sonuç | Değişen Dosyalar | Test | Commit | kg | Human Touches |
|---|-------|---------|-------|-----------------|------|--------|----|---------------|
| 1 | report-homescreen.md | `styles.title` fontSize 17→20, fontWeight bold yap | success | app/app/index.tsx | ✅ | — | 1 | 0 |
| 2 | report-detail.md | `behavior='height'` ile KeyboardAvoidingView wrap yeterli olur | rollback | — | ❌ | — | 0 | 1 |
| 3 | report-detail.md | Platform.OS'a göre `behavior` seç + ScrollView içine al | success | app/app/detail.tsx | ✅ | — | 2 | 0 |
| 4 | report-onboarding.md | `Animated.Value` ile dot width'i interpolate et | success | app/app/onboarding.tsx | ✅ | — | 3 | 0 |

---

## Cycle Detayları

### Cycle 1 — HomeScreen font boyutu
**Rapor:** report-homescreen.md  
**Başlangıç:** 20.05.2026 14:45  
**READ:** Rapor okundu. Sorun: `styles.title` fontSize=17, okunması zor.  
**LOCATE:** `app/app/index.tsx` → `StyleSheet.create` → `title` key.  
**HYPOTHESIZE:** fontSize 17→20 ve fontWeight '700' yapılırsa okunurluk artar.  
**REPAIR:** `fontSize: 17` → `fontSize: 20`, `fontWeight: '600'` → `fontWeight: '700'`  
**TEST:** Expo Go ile HomeScreen açıldı, kartlar okunur hale geldi.  
**VERIFY:** Önceki görüntüyle karşılaştırıldı — başlık metni belirgin şekilde büyüdü. ✅  
**SONUÇ:** success — kg: 1  
**Human touch:** 0

---

### Cycle 2 — DetailScreen klavye (ROLLBACK)
**Rapor:** report-detail.md  
**Başlangıç:** 20.05.2026 15:02  
**READ:** Rapor okundu. Sorun: Kaydet butonu klavyenin arkasında kalıyor.  
**LOCATE:** `app/app/detail.tsx` → ScrollView.  
**HYPOTHESIZE:** ScrollView'i `KeyboardAvoidingView behavior='height'` ile wrap edersek yeter.  
**REPAIR:** ScrollView üstüne `<KeyboardAvoidingView behavior='height'>` eklendi.  
**TEST:** iOS simülatörde test edildi — klavye butonu kapatmaya devam etti, `height` davranışı iOS'ta çalışmıyor.  
**VERIFY:** Buton hâlâ görünmüyor. ❌  
**SONUÇ:** rollback — hipotez yanlıştı, `behavior='height'` iOS'ta etkisiz.  
**Human touch:** 1 (hatayı fark edip Cycle 3'e yönlendirdim)

---

### Cycle 3 — DetailScreen klavye (başarılı)
**Rapor:** report-detail.md  
**Başlangıç:** 20.05.2026 15:18  
**READ:** Cycle 2'nin başarısız hipotezi incelendi. `behavior='height'` iOS'ta çalışmıyor.  
**LOCATE:** `app/app/detail.tsx` → ScrollView.  
**HYPOTHESIZE:** `Platform.OS === 'ios' ? 'padding' : 'height'` ile platform bazlı seçim + `keyboardShouldPersistTaps='handled'` yeterli olmalı.  
**REPAIR:** `KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}` + ScrollView `keyboardShouldPersistTaps='handled'`  
**TEST:** iOS ve Android simülatörde test edildi. Klavye açıkken Kaydet butonu görünür.  
**VERIFY:** Kaydet butonuna tıklanabildi, "✅ Kaydedildi" mesajı göründü. ✅  
**SONUÇ:** success — kg: 2  
**Human touch:** 0

---

### Cycle 4 — OnboardingScreen dot animasyonu
**Rapor:** report-onboarding.md  
**Başlangıç:** 20.05.2026 15:35  
**READ:** Rapor okundu. Sorun: dot indikatör animasyonsuz kesim değişiyor.  
**LOCATE:** `app/app/onboarding.tsx` → `dots` render, `styles.dot` / `styles.dotActive`.  
**HYPOTHESIZE:** Her dot için `Animated.Value` tutup width'i `useEffect` içinde spring animasyonuyla değiştirirsek geçiş yumuşar.  
**REPAIR:** `View` → `Animated.View`, her dot için `animatedWidths` array'i, `Animated.spring` ile step değişiminde tetikleme.  
**TEST:** Expo Go'da onboarding akışı test edildi. Dotlar arasında yumuşak genişleme/daralma animasyonu çalıştı.  
**VERIFY:** 3 adım arasında geçiş yapıldı, her geçişte spring animasyonu gözlemlendi. ✅  
**SONUÇ:** success — kg: 3  
**Human touch:** 0

---

## Özet

- **Toplam cycle:** 4  
- **Başarılı:** 3  
- **Rollback:** 1 (Cycle 2 — yanlış `behavior` prop hipotezi)  
- **Toplam human touch:** 1  
- **Son kg (ratchet):** 3  
- **Kullanılan AI tool:** Claude Code CLI
