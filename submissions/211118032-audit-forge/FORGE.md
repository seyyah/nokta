# FORGE Ledger — 211118032-audit-forge

**Track:** A — Sadelik  
**Host:** Nokta Expert Support  
**Agent:** Cursor Agent (Composer)  
**Rapor kaynağı:** `audit-reports/bug-report-2026-05-20-17-06.md`

Döngü: `READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT | ROLLBACK`  
**Sonuç:** 3 COMMIT + 1 ROLLBACK ✅

---

## Cycle 1 — Home: Butonlar tıklanabilir olsun

| Alan | Değer |
|------|--------|
| **Rapor** | `audit-reports/bug-report-2026-05-20-17-06.md` — Ekran: Home #1 |
| **READ** | Ana sayfa CTA butonları yeterince “dokunulabilir” görünmüyor |
| **LOCATE** | `src/screens/HomeScreen.tsx` |
| **HYPOTHESIZE** | Düşük elevation, ince border, dokunma ipucu yok |
| **REPAIR** | `minHeight: 56`, kalın border, `Dokunun →` hint, `hitSlop`, `accessibilityRole="button"`, `activeOpacity: 0.7` |
| **TEST** | `npx tsc --noEmit` — geçti |
| **VERIFY** | Butonlar görsel olarak belirgin ve erişilebilir etiketli |
| **Commit** | `[FORGE: Home] CTA tıklanabilirlik — 2kg` _(PR branch'te hash eklenecek)_ |
| **kg** | 2 |
| **Sonuç** | **COMMIT** |

---

## Cycle 2 — Chat: Alan bazlı ayrı sohbet

| Alan | Değer |
|------|--------|
| **Rapor** | `audit-reports/bug-report-2026-05-20-17-06.md` — Ekran: Chat #2 |
| **READ** | Her uzman alanı için farklı sohbet kanalı isteniyor |
| **LOCATE** | `src/screens/ChatScreen.tsx`, yeni `src/services/chatThreadService.ts` |
| **HYPOTHESIZE** | Tek `messages` state tüm konuları karıştırıyor |
| **REPAIR** | AsyncStorage tabanlı thread store; yatay “Sohbet kanalı” chip’leri; uzman önerisinde “kanala geç” butonu |
| **TEST** | `npx tsc --noEmit` — geçti |
| **VERIFY** | Genel + alan kanalları arasında geçiş ve ayrı geçmiş |
| **Commit** | `[FORGE: Chat] Alan bazlı thread — 3kg` _(PR branch'te hash eklenecek)_ |
| **kg** | 3 |
| **Sonuç** | **COMMIT** |

---

## Cycle 3 — Mentor: Sohbet alanı yukarıda

| Alan | Değer |
|------|--------|
| **Rapor** | `audit-reports/bug-report-2026-05-20-17-06.md` — Ekran: Mentor #3 |
| **READ** | Mentor sohbet/input çok aşağıda kalıyor |
| **LOCATE** | `src/screens/MentorScreen.tsx`, `src/components/MentorCard.tsx` |
| **HYPOTHESIZE** | Header kartı fazla yer kaplıyor; `flex:1` list yok; Android’de `KeyboardAvoidingView` zayıf |
| **REPAIR** | `messageList` flex:1; `compact` MentorCard; `behavior: height` Android; `useSafeAreaInsets` input padding; `keyboardShouldPersistTaps` |
| **TEST** | `npx tsc --noEmit` — geçti |
| **VERIFY** | Mesaj listesi genişledi, input bar safe-area ile yukarı taşındı |
| **Commit** | `[FORGE: Mentor] Layout + safe-area — 4kg` _(PR branch'te hash eklenecek)_ |
| **kg** | 4 |
| **Sonuç** | **COMMIT** |

---

## Cycle 4 — ROLLBACK (denenen aşırı layout)

| Alan | Değer |
|------|--------|
| **Rapor** | Mentor #3 — alternatif deneme |
| **HYPOTHESIZE** | Input’u `position: absolute; bottom: -40` ile yukarı itmek |
| **REPAIR** | MentorScreen’de inputBar’a negatif margin / absolute denendi |
| **TEST** | Küçük ekranda liste alanı çakışması, klavye açıkken input görünmez |
| **VERIFY** | Başarısız — layout kırıldı |
| **Commit** | — (rollback, commit yok) |
| **kg** | 4 (değişmedi — ratchet korundu) |
| **Sonuç** | **ROLLBACK** → Cycle 3 flex + safe-area çözümüne dönüldü |

---

## Özet

| Metrik | Değer |
|--------|--------|
| Toplam cycle | 4 |
| COMMIT | 3 |
| ROLLBACK | 1 |
| Human touch points | Bug raporu export (cihaz), forge review, PR açılışı |

---

## Değişen dosyalar (forge sonrası)

- `src/screens/HomeScreen.tsx`
- `src/screens/ChatScreen.tsx`
- `src/screens/MentorScreen.tsx`
- `src/services/chatThreadService.ts` (yeni)
- `src/components/MentorCard.tsx`
