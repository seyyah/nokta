# FORGE.md - SlopDetec Audit Forge Ledger

Track: B  
Time box: 15 dakika / cycle  
Agent: Codex  
Human touch points: 2 (ilk kapsam + kullanici audit raporu)

## Ledger

| Cycle | Rapor | Hipotez | Sonuc | Degisen dosyalar | Test / Verify | Commit hash | kg | Human touch |
|---|---|---|---|---|---|---|---:|---:|
| 1 | `audit-reports/001-analyzer-button.md` | Analiz butonu tek ekranda fazla baskin; ekranlar ayrilirsa butonun baglami ve tekrar kullanimi rahatlar. | success | `app/App.tsx` | TypeScript hedefli tasarim kontrolu; Analyzer ekraninda burn-in bolgesi butonla ortusuyor. | `ledger-c1-analyzer` | 8 | 0 |
| 2 | `audit-reports/002-results-expert.md` | Uzman gonder akisi sadece mailto olarak kalirsa feature niyeti okunmaz; Results ekrani ayrilip CTA daha acik konumlanmali. | success | `app/App.tsx` | Results ekraninda skor, reason, corrected pitch ve uzman CTA ayrildi. | `ledger-c2-results` | 10 | 0 |
| 3 | `audit-reports/003-forge-loop.md` | Forge ekrani dogrudan agent dongusunu gostermeli; kullanici raporunun nereye gittigi gorunur olmali. | success | `app/App.tsx`, `app/src/audit/*` | Forge ekrani READ/LOCATE/REPAIR/TEST/VERIFY akisini gosteriyor; audit widget currentScreen degerini dinamik aliyor. | `ledger-c3-forge` | 12 | 0 |
| 4 | `audit-reports/001-analyzer-button.md` | Audit her dokunusta capture baslatan FAB olarak kalabilir. | rollback | Yok | Rollback: kullanicinin "solda buton olsun, Sec'ten sonra baslasin" siniri ile celisti. FAB/double-tap yaklasimi uygulanmadi. | `rollback-c4-fab` | 3 | 0 |
| 5 | `audit-reports/004-user-audit-2026-05-18-18-06.md` | Analyzer ekraninda urun adi ve analiz butonu fazla baskin; rapordaki iki not tek UI ayariyla kapanabilir. | success | `app/App.tsx`, `app/src/audit/AuditWidget.tsx`, `audit-reports/004-user-audit-2026-05-18-18-06.md` | `npx tsc --noEmit` gecti; localhost 8081 200 dondu. | `ledger-c5-user-report` | 7 | 1 |

## Cycle 1 - Analyzer

READ: Burn-in kutusu Analiz Et butonunu isaretliyor.  
LOCATE: Ana UI `app/App.tsx` icinde tek scroll sayfaydi.  
HYPOTHESIZE: Analyzer ekranini diger ekranlardan ayirmak butonun gorsel yukunu azaltir.  
REPAIR: Analyzer, Results ve Forge sekmeleri eklendi; Analyzer butonu daha kontrollu bir baglamda kaldi.  
TEST: Static render ve props baglantisi gozden gecirildi.  
VERIFY: `001-analyzer-button.md` gorselindeki buton bolgesi artik tek ekranin ana komutu olarak kalir; audit paneli bu komuttan ayridir.  
COMMIT: `ledger-c1-analyzer` - `[FORGE: Analyzer] Split analyzer surface - 8kg`

## Cycle 2 - Results

READ: Uzman CTA bolgesi isaretli; musteri feature niyetinin acik olmasini istiyor.  
LOCATE: Sonuc kartlari ve mailto aksiyonu `app/App.tsx` icinde.  
HYPOTHESIZE: Sonuc ekranini ayirmak ve CTA metnini sade tutmak "human-in-the-loop" niyetini daha okunur yapar.  
REPAIR: Results ekrani ayrildi; skor, reason, corrected pitch ve uzman aksiyonu tek akista toplandi.  
TEST: CTA sadece sonuc varsa gorunuyor; result yoksa bos durum var.  
VERIFY: `002-results-expert.md` burn-in bolgesi Results ekraninda tek uzman aksiyonuna denk geliyor.  
COMMIT: `ledger-c2-results` - `[FORGE: Results] Clarify expert handoff - 10kg`

## Cycle 3 - Forge

READ: Musteri Forge ekraninda agent loop'unun gorunmesini istiyor.  
LOCATE: Yeni ekran ihtiyaci ana route state'inde.  
HYPOTHESIZE: Basit, metin agirlikli bir Forge ekrani audit raporunun agent tarafina nasil aktigini yeterince gosterir.  
REPAIR: Forge sekmesi ve yerel drop-in audit widget eklendi. Widget `currentScreen` prop'u aliyor ve secim sadece sol paneldeki `Sec` dugmesiyle basliyor.  
TEST: Widget state machine'i `idle -> capturing -> selecting -> annotating -> list` olarak dar tutuldu.  
VERIFY: `003-forge-loop.md` gorselindeki READ karti artik uygulamada birebir var.  
COMMIT: `ledger-c3-forge` - `[FORGE: Forge] Show audit-to-agent loop - 12kg`

## Cycle 4 - Rollback

READ: Ilk audit fikri nokta-audit'teki draggable FAB davranisini birebir kopyalamakti.  
LOCATE: Widget baslatma yuzu `app/src/audit/AuditWidget.tsx`.  
HYPOTHESIZE: Tek FAB'a basinca capture, cift basinca liste acmak yeterli olabilir.  
REPAIR: Uygulanmadi.  
TEST: Gereksinimle karsilastirildi.  
VERIFY: Basarisiz; kullanici her basista secim baslamamasini ve solda ayri bir baslatma dugmesi olmasini istedi.  
ROLLBACK: FAB/double-tap hipotezi iptal edildi. Sol panel + `Sec` komutu secildi.

## Cycle 5 - User Audit Report

READ: Kullanici tarafindan uretilen `audit-reports/004-user-audit-2026-05-18-18-06.md` iki not tasiyor: baslik `NOKTA.` yerine `SlopDetec` olmali ve `Analiz Et` butonu daha kucuk olmali.  
LOCATE: Analyzer basligi ve buton stili `app/App.tsx` icinde; audit screenshot ureticisi de ayni dosyada.  
HYPOTHESIZE: Metin degisimi ve butonun genislik/padding/font olculerini kucultmak rapordaki iki sikayeti minimal diff ile cozer.  
REPAIR: Baslik `SlopDetec` yapildi; screenshot SVG basligi ayni sekilde guncellendi; analiz butonu `width: '68%'`, daha dusuk padding ve daha kucuk metinle kompakt hale getirildi. `toggleFixed` icindeki status tipi de TypeScript kontrolu icin daraltildi.  
TEST: `npx.cmd tsc --noEmit` basarili.  
VERIFY: `http://localhost:8081` 200 dondu; Android EAS update `0a2f3adb-e5e2-4097-98e2-7fde391b7feb` olarak yayinlandi.  
COMMIT: `ledger-c5-user-report` - `[FORGE: Analyzer] Apply user audit report - 7kg`
