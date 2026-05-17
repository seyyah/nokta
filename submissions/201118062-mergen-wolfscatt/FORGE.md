# FORGE Ledger

- Official Track: `B`
- Tool used: `Codex`
- Autonomy layer: `Track C-style human touch point tracking`
- Human touch points so far: `2`
- Input reports:
  - `audit-reports/01-home-burada-fikri-hizli-sil.md`
  - `audit-reports/02-questions-bu-kisimda-ust-uste.md`
  - `audit-reports/03-result-bu-son-ekranda-ozeti.md`
- Screenshot folder: `audit-reports/screenshots/`
- Rollback policy: Eger bir hipotez kapsamdan cikiyor, birden fazla ekrani genis capta etkiliyor veya gorunur faydasina gore fazla dosyaya yayiliyorsa degisiklik geri alinmali ya da kod degistirmeden reddedilmelidir.

| Cycle | Report | Hypothesis | Result | Changed Files | Test Result | Commit Hash | kg | Human Touch Points |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Cycle 1 | `01-home-burada-fikri-hizli-sil.md` | HomeScreen uzerinde fikir alaninin yakinina kucuk bir temizleme aksiyonu eklemek, nottaki hizli sil beklentisini minimum diff ile karsilar. | Success | `app/screens/HomeScreen.js` | No `lint`, `test`, or `typecheck` scripts. Static review done; manual Expo verification required. | `TODO` | `1kg` | `2` |
| Cycle 2 | `02-questions-bu-kisimda-ust-uste.md` | QuestionsScreen icindeki ust uste iki progress gorunumunden, bar benzeri olan `ProgressDots` kaldirilirsa tek ve yeterli ilerleme bilgisi kalir. | Success | `app/screens/QuestionsScreen.js` | No `lint`, `test`, or `typecheck` scripts. Static review done; manual Expo verification required. | `TODO` | `2kg` | `2` |
| Cycle 3 | `03-result-bu-son-ekranda-ozeti.md` | ResultScreen uzerine kucuk bir paylasma aksiyonu eklemek ve sonucu secilebilir yapmak, yeni bagimlilik eklemeden rapordaki copy/share istegini en kucuk guvenli sekilde karsilar. | Success | `app/screens/ResultScreen.js` | No `lint`, `test`, or `typecheck` scripts. Static review done; manual Expo verification required. | `TODO` | `3kg` | `2` |
| Cycle 4 | `rollback cycle` | Tum ekranlari kapsayan merkezi theme/style refactor, bu raporlarin tekil beklentilerine daha hizli cevap vermeyi kolaylastirabilir. | Rollback: considered and rejected before code change | `-` | No code change. Decision review only. | `-` | `0kg` | `2` |

## Cycle Notes

### Cycle 1

- READ: HomeScreen raporu, fikir metnini hizlica temizleyebilecek bir aksiyon istiyor.
- LOCATE: Giris alani ve onun etrafindaki UI [HomeScreen.js](app/screens/HomeScreen.js) icinde tutuluyor.
- HYPOTHESIZE: Metin doluyken gorunen kucuk bir `Fikri Temizle` aksiyonu, mevcut akisi bozmadan beklentiyi karsilar.
- REPAIR: Input altina, yalnizca deger varken gorunen ufak bir temizleme dugmesi eklendi.
- TEST: Script yok. Kod yolu statik olarak incelendi.
- VERIFY: Expo Go'da metin yazip `Fikri Temizle` ile alani sifirlayarak kontrol edilmeli.

### Cycle 2

- READ: QuestionsScreen raporu, ust uste iki progress/bar benzeri gosterimin fazla oldugunu soyluyor.
- LOCATE: Fazla gorunen bar, [ProgressDots](app/components/ProgressDots.js) cagrisi olarak [QuestionsScreen.js](app/screens/QuestionsScreen.js) icinde yer aliyor.
- HYPOTHESIZE: `Soru 2/4` rozetini koruyup `ProgressDots` kullanimini kaldirmak, sorunun hedefledigini minimum diff ile cozer.
- REPAIR: QuestionsScreen icindeki `ProgressDots` kullanimi kaldirildi; soru akisi ve butonlar korunuyor.
- TEST: Script yok. Kod yolu statik olarak incelendi.
- VERIFY: Expo Go'da soru ekranina gidip sadece tek ilerleme gosterimi kaldigi gorulmeli.

### Cycle 3

- READ: ResultScreen raporu, olusan ozeti kopyalama veya paylasma yolu istiyor.
- LOCATE: Son eylem karti ve tum sonuc metni [ResultScreen.js](app/screens/ResultScreen.js) icinde bulunuyor.
- HYPOTHESIZE: Yeni paket eklemeden `Share` ile paylasma ve metni `selectable` yapma, copy/share beklentisini en guvenli kucuk diff ile karsilar.
- REPAIR: `Ozeti Paylas` aksiyonu eklendi, sonuc metinleri secilebilir hale getirildi, metin yardim satiri guncellendi.
- TEST: Script yok. Kod yolu statik olarak incelendi.
- VERIFY: Expo Go'da sonuc ekraninda `Ozeti Paylas` ile native share sheet acilmali; metinler basili tutularak secilebilmeli.

### Rollback Cycle

- READ: Sonraki kolaylik icin merkezi bir stil refactor fikri dusunuldu.
- LOCATE: Theme, button, field ve screen seviyesinde birden fazla dosyaya yayiliyor.
- HYPOTHESIZE: Bu refactor tekil rapor difflerini kucultmek yerine buyutur.
- REPAIR: Kod degisikligi yapilmadi.
- TEST: Gerekmedi.
- VERIFY: `0kg` rollback olarak ledger'a kaydedildi.

## Commit Commands

Git staging izni bu oturumda onaylanmadigi icin gercek hash uretilmedi. Commit atmak istersen asagidaki komutlari repo kokunde calistir:

```powershell
git add -- submissions/201118062-mergen-wolfscatt/app/screens/HomeScreen.js
git commit -m "[FORGE: HomeScreen] Add quick idea clear action — 1kg"

git add -- submissions/201118062-mergen-wolfscatt/app/screens/QuestionsScreen.js
git commit -m "[FORGE: QuestionsScreen] Remove duplicate progress bar — 2kg"

git add -- submissions/201118062-mergen-wolfscatt/app/screens/ResultScreen.js
git commit -m "[FORGE: ResultScreen] Add summary copy action — 3kg"
```

## Manual Verification Checklist

- HomeScreen uzerinde metin yazip `Fikri Temizle` ile alan sifirlandi.
- QuestionsScreen uzerinde duplike progress bar kaldirildi ve soru akisi bozulmadi.
- ResultScreen uzerinde `Ozeti Paylas` calisti ve sonuc metni secilebilir kaldı.
- `AuditWidget` mount noktasi tek kaldı.
- Rapor dosyalari ve screenshotlar korunup uzerine yazilmadi.
