# FORGE — Cycle Ledger

**Submission:** 231118057-nokta-cleaner
**Track:** B
**Loop pattern:** `READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT / ROLLBACK`
**Cycle box:** 15 dakika
**Şart:** ≥3 success cycle + ≥1 ROLLBACK loglu

> **Durum:** Phase A bitti (3 audit raporu hazır). Phase B cycle'ları **planlı**; aşağıdaki satırlardaki `<TBD>` alanları her cycle koşulduktan sonra **gerçek değerlerle** değiştirilecek. Asla başarısız hipotez silinmeyecek — ROLLBACK satırı `success` ile aynı görünürlükte kalacak.
>
> **Commit mesaj formatı:** `[FORGE: EkranAdı] Açıklama — Xkg`

---

## Ledger

| # | Rapor | Hipotez | Sonuç | Değişen dosyalar | Test | Commit | kg | Human touch |
|---|---|---|---|---|---|---|---|---|
| 1 | [`03-sessionreport-export-clipboard-only.md`](./audit-reports/03-sessionreport-export-clipboard-only.md) | "Export Full Report" label'ı yalan söylüyor; `App.js:293` label'ı `"Copy Report to Clipboard"` + Alert title `"Report Copied"` olarak değiştir. Tek dosya, 2 string. | `<TBD: success / rollback>` | `app/App.js` | _manual smoke: button → toast metni doğru_ | `<TBD>` | **0.2** | `<TBD>` |
| 2 | [`01-home-empty-placeholder.md`](./audit-reports/01-home-empty-placeholder.md) | `InputSection.js`'e opsiyonel `sampleData: string \| null` prop'u ekle; `isEmpty && sampleData` ise input altında dashed-border "Try sample" chip render et, basınca `setText(sampleData)`. `App.js`'te 1 mock constant (~350 char TR WhatsApp export). | `<TBD>` | `app/src/components/InputSection.js`, `app/App.js` | _manual: chip görünür, basınca text doluyor, analyze çalışıyor_ | `<TBD>` | **0.8** | `<TBD>` |
| 3 | [`02-ideacard-actionrow-overflow.md`](./audit-reports/02-ideacard-actionrow-overflow.md) | `IdeaCard.js:216` action row'unu primary (Approve / Reject / Note / Edit / Copy) + sağ kenara absolute `↑ ↓` olarak ikiye ayır. `actionBtn` `paddingVertical` 8→12 (44pt touch target). Status badge ile çakışma için `right:56` veya pending durumda `right:12`. | `<TBD>` | `app/src/components/IdeaCard.js` | _manual: dar ekran (Pixel 6 portrait) — tek satır, ok'lar sağ kenarda, badge çakışması yok_ | `<TBD>` | **1.2** | `<TBD>` |
| 4 | [`03-sessionreport-export-clipboard-only.md`](./audit-reports/03-sessionreport-export-clipboard-only.md) | **Genişletilmiş hipotez (rollback adayı):** `expo-sharing` + `expo-file-system` ekle; `handleExportReport` text → `.md` dosyası üret → OS share-sheet aç. **Yan etki:** native dep → APK rebuild zorunlu, EAS gerek. | **ROLLBACK** (`<TBD: doğrula>`) | _attempted: `app/package.json`, `app/App.js`_ | _native dep eklendikten sonra Metro bundle hatası beklenir; EAS build hafta-içi kırılgan_ | _no commit (revert)_ | **1.5** (attempted) | `<TBD>` |

---

## Ratchet (kg progression)

```
Cycle 1:  0.2  ━┓
Cycle 2:  0.8  ━┫ monotonik artış (success'ler)
Cycle 3:  1.2  ━┛
Cycle 4:  1.5* ← rollback (kg attempted, success kg değil)
```

Track B'de ratchet zorunlu değil ama 1-2-3 başarılı cycle'larda monoton artış disiplin işareti. Cycle 4 bilinçli risk; "başarısız hipotez de değerli veri" şartına denk geliyor.

---

## Yapıldıktan sonra doldurulacak alanlar

Her cycle bittikten sonra **bu dosyada** güncellenecek:

1. `Sonuç` kolonu: `success` / `rollback`
2. `Commit` kolonu: gerçek hash (örn. `a3f9c21`)
3. `Test` kolonu: ne test ettin, ne gördün (1 satır)
4. `Human touch` kolonu: cycle sırasında agent'ı durdurduğun an varsa **niye** durdurdun (`0` da yazılabilir)
5. README'deki `Human Touch Points` ve `AI Tool Log` tabloları da paralel güncellenecek

---

## Cycle koşma talimatı (kendin için checklist)

- [ ] Cycle başlamadan önce: `git status` temiz mi?
- [ ] Raporu agent'a tek dosya olarak yedir (`audit-reports/0X-*.md`)
- [ ] Agent `LOCATE` adımında doğru dosyayı buldu mu? Bulamadıysa → ipucu ver, **human touch sayacını +1**
- [ ] `REPAIR` sonrası diff'i göz at — "fırsattan istifade refactor" var mı? Varsa reject, sadece skopu yap
- [ ] `VERIFY`: ilgili ekranı tekrar aç, sorun gerçekten gitmiş mi? (Yeni screenshot çek, gerekirse `audit-reports/`'a yeni rapor düş)
- [ ] `COMMIT` mesajı `[FORGE: EkranAdı] Açıklama — Xkg` formatında mı?
- [ ] Cycle 15 dakikayı geçti mi? Geçtiyse → mevcut durumu bu dosyaya yaz, sonraki cycle'a bırak (partial writeback)
- [ ] **ROLLBACK durumunda:** kodu geri al ama satırı **silme** — `Sonuç: rollback` olarak işaretle, niye rollback olduğunu Test kolonuna yaz

---

## Bekleyen risk

- Cycle 1 → 2 → 3 sırasını **bozmama** önemli. Cycle 2 (`sampleData`) Cycle 3 (action row layout)'tan önce gelmeli; aksi halde Cycle 3'ün manual test'inde "boş state" senaryosu artar.
- Cycle 4 (rollback) **en sona** bırakılmalı — başarısız native dep cycle 1-3'ün başarılı diff'lerini lekelemez.
- AuditWidget mount edilmeden Phase B koşulamaz (FAB yoksa `VERIFY` adımı için yeni screenshot çekilemez). Mount → README'de işaret edilmiş "_TBD_".
