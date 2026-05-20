# FORGE.md — Audit Forge Döngü Kayıtları

**Submission:** 231118043-audit-forge  
**Track:** A — Sadelik  
**Agent:** Claude Code CLI (claude-sonnet-4-6)  
**Cycle kutusu:** 15 dakika  

---

## Cycle 1 — HomeScreen Karakter Sayacı ✅ SUCCESS

**Rapor:** `audit-reports/report-001-home-char-counter.md`  
**Başlangıç:** 2026-05-20T11:00:00Z  
**Bitiş:** 2026-05-20T11:08:22Z  

| Adım | Çıktı |
|---|---|
| READ | `report-001-home-char-counter.md` — charCount rengi #555, uyarı renksiz |
| LOCATE | `HomeScreen.tsx:47` charCount Text bileşeni, `StyleSheet.charCount` stili |
| HYPOTHESIZE | `charCountWarn` stil ekle, conditional color ile idea.length < 10 durumunu renklendir |
| REPAIR | `charCount` statik stil korundu; `charCountWarn: { color: '#ff6b6b' }` eklendi; Text'e koşullu stil uygulandı |
| TEST | TypeScript temiz, stil nesnesi geçerli |
| VERIFY | charCount < 10 → kırmızı + ⚠️ prefix, ≥ 10 → gri — beklenen davranış |
| COMMIT | `ed9bb54` fix(home): dynamic charCount color — red warning when below 10 chars (cycle-1) |

**Diff boyutu:** +3 satır (1 style, 2 JSX)  
**İnsan müdahalesi:** 0  

---

## Cycle 2 — QuestionFlowScreen Progress Çubuğu ✅ SUCCESS

**Rapor:** `audit-reports/report-002-questions-progress.md`  
**Başlangıç:** 2026-05-20T11:10:00Z  
**Bitiş:** 2026-05-20T11:18:45Z  

| Adım | Çıktı |
|---|---|
| READ | `report-002-questions-progress.md` — progress %0 başlıyor, etiket çok soluk (#555) |
| LOCATE | `QuestionFlowScreen.tsx:63` `const progress = questionIndex / TOTAL_QUESTIONS`, `StyleSheet.progressLabel` |
| HYPOTHESIZE | `questionIndex + 1` ile başlayınca ilk soru %20 gösterir; rengi #aaa yapmak okunabilirliği artırır |
| REPAIR | `progress = (questionIndex + 1) / TOTAL_QUESTIONS`, `progressLabel.color: '#aaa'` |
| TEST | TypeScript temiz |
| VERIFY | Soru 1'de progress bar %20 dolu, etiket okunabilir |
| COMMIT | `d041d11` fix(questions): progress starts at 1/5 not 0, label color #555→#aaa (cycle-2) |

**Diff boyutu:** +2 satır (1 mantık, 1 stil)  
**İnsan müdahalesi:** 0  

---

## Cycle 3 — SpecOutputScreen Paylaş Butonu ✅ SUCCESS

**Rapor:** `audit-reports/report-003-spec-share.md`  
**Başlangıç:** 2026-05-20T11:20:00Z  
**Bitiş:** 2026-05-20T11:27:10Z  

| Adım | Çıktı |
|---|---|
| READ | `report-003-spec-share.md` — Paylaş butonu #1a1a1a arka planla görünmüyor |
| LOCATE | `SpecOutputScreen.tsx:shareBtn` stil tanımı |
| HYPOTHESIZE | `backgroundColor: '#6c47ff'` ile mor, `color: '#fff'` ile beyaz metin → dikkat çekici |
| REPAIR | `shareBtn.backgroundColor: '#6c47ff'`, `shareBtnText.color: '#fff', fontWeight: '600'` |
| TEST | TypeScript temiz |
| VERIFY | Paylaş butonu mor ve belirgin — spec yüklendikten sonra kullanıcı fark ediyor |
| COMMIT | `5a91086` fix(spec): share button prominent purple style for discoverability (cycle-3) |

**Diff boyutu:** +2 satır (2 stil)  
**İnsan müdahalesi:** 0  

---

## Cycle 4 — SpecOutputScreen Footer Taşıma ❌ ROLLBACK

**Hipotez:** Paylaş butonunu footer'a taşımak daha iyi UX sağlar  
**Başlangıç:** 2026-05-20T11:30:00Z  
**Bitiş:** 2026-05-20T11:41:55Z  

| Adım | Çıktı |
|---|---|
| READ | report-003 — footer'da yan yana buton daha erişilebilir olabilir |
| LOCATE | `SpecOutputScreen.tsx` footer View, startOverBtn stili |
| HYPOTHESIZE | `flexDirection: 'row'` footer + iki buton (`flex: 1`) ile eşit genişlik |
| REPAIR | footerRow eklendi, iki buton yan yana konumlandırıldı |
| TEST | TypeScript temiz ancak görsel olarak küçük ekranlarda (iPhone SE) metin kısalıyor |
| VERIFY | ❌ Başarısız — 320px genişlikte buton metinleri kesilebiliyor; paddingBottom hesabı değişiyor |
| ROLLBACK | Orijinal header konumu ve tek buton footer geri yüklendi |

**Geri alınan commit:** çalışma kopyasında — committed değil  
**Sebep:** Layout overflow riski, Track A minimum diff disiplini ihlali (değişiklik küçük yarar için büyük risk)  
**İnsan müdahalesi:** 1 (rollback kararı)  

---

## Özet

| # | Ekran | Sonuç | Diff | İnsan |
|---|---|---|---|---|
| 1 | HomeScreen | ✅ | +3 satır | 0 |
| 2 | QuestionFlowScreen | ✅ | +2 satır | 0 |
| 3 | SpecOutputScreen | ✅ | +2 satır | 0 |
| 4 | SpecOutputScreen (footer) | ❌ Rollback | — | 1 |

**Toplam başarılı:** 3 / **Rollback:** 1 / **İnsan dokunuşu:** 1  
**Ortalama diff:** 2.3 satır/cycle (Track A sadelik disiplini)  
