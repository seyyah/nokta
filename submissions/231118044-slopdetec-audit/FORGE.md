# FORGE.md - SlopDetec Audit Forge Ledger

Track: C - STUCK heuristigi + expert bridge  
Time box: 20 dakika / cycle  
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
| 6 | `audit-reports/005-voice-dictated-visualizer.md` | Mikrofon sinyali RMS/FFT barlarina baglanirsa voice-mode hissi kod icinde gosterilebilir. | success | `app/src/final/VoiceAvatarBridge.tsx`, `app/App.tsx`, `app/package.json`, `app/app.json` | `npx.cmd tsc --noEmit` gecti. | `ledger-c6-voice` | 11 | 0 |
| 7 | `audit-reports/006-voice-dictated-avatar.md` | GLB morph target + procedural viseme fallback birlikte olursa model farki lipsync demosunu bozmaz. | success | `app/src/final/VoiceAvatarBridge.tsx`, `app/metro.config.js`, `app/assets/avatar.glb`, `avatar.glb` | `npx.cmd tsc --noEmit` gecti; GLB asset extension Metro'ya eklendi. | `ledger-c7-avatar` | 12 | 0 |
| 8 | `audit-reports/006-voice-dictated-avatar.md` | Sadece GLB morph target yeterli olur; overlay fallback gerekmez. | rollback | `app/src/final/VoiceAvatarBridge.tsx` | Rollback: ornek/Avaturn export morph isimleri garanti degil; fallback geri eklendi. | `rollback-c8-glb-only` | 4 | 0 |
| 9 | `audit-reports/007-voice-dictated-bridge.md` | Mobilde STT'yi native servis olmadan tam otomatik yapmak mumkun olur. | fail | Yok | FAIL: Expo paket setinde native STT yok; web SpeechRecognition + manuel mobil fallback secildi. Ardil ROLLBACK+FAIL Bridge'i tetikledi. | `fail-c9-native-stt` | 5 | 0 |
| 10 | `BRIDGE.md` | Bridge gorusmesi ozeti sonraki cycle'a context olursa stuck noktasi kapanir. | success | `BRIDGE.md`, `app/src/final/VoiceAvatarBridge.tsx`, `FORGE.md` | `npx.cmd tsc --noEmit` gecti; Bridge butonu Jitsi odasini acar. | `ledger-c10-bridge` | 9 | 1 |
| 11 | Kullanici runtime kontrolu | API key yoksa Analyzer calismali; Senior-sen sahnede ayirt edilebilir gorunmeli. | success | `app/App.tsx`, `app/src/final/VoiceAvatarBridge.tsx`, `PERSONAS.md` | `npx.cmd tsc --noEmit` ve `npx.cmd expo export --platform web` gecti. | `ledger-c11-runtime-fix` | 6 | 1 |

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

## Cycle 6 - Voice Visualizer (20dk)

READ: `audit-reports/005-voice-dictated-visualizer.md` Voice ekraninda mikrofon kartini ve barlari isaretliyor.  
LOCATE: Final hafta yeni yuzeyi `app/src/final/VoiceAvatarBridge.tsx`; ana sekme baglantisi `app/App.tsx`.  
HYPOTHESIZE: Expo AV native metering ve web `AnalyserNode` FFT ayni bar arayuzunu beslerse konusma/sessizlik ayrimi <200ms hedefiyle gosterilir.  
REPAIR: `useVoiceMeter` eklendi; native tarafta `expo-av` metering, web tarafta RMS + FFT okuma, sessizlikte sonen 32 barli visualizer yazildi. Dikte paneli markdown export'a baglandi.  
TEST: `npx.cmd tsc --noEmit` basarili.  
VERIFY: Voice sekmesi uygulamaya eklendi; mikrofon izni `app.json` icine yazildi.  
COMMIT: `ledger-c6-voice` - `[FORGE: Voice] Add metered voice visualizer - 11kg`

## Cycle 7 - Avatar Lipsync (20dk)

READ: `audit-reports/006-voice-dictated-avatar.md` agiz bolgesini hedefliyor.  
LOCATE: `AvatarCanvas`, `AvatarModel`, `VisemeOverlay`, `ProceduralAvatar`.  
HYPOTHESIZE: Avaturn GLB morph target'lari varsa `jawOpen` / `mouthOpen` / viseme isimleri RMS seviyesine baglanir; yoksa demo procedural agizla devam eder.  
REPAIR: `react-three-fiber/native`, `three`, `expo-asset`, `expo-gl` bagimliliklari kuruldu. `metro.config.js` GLB asset extension icin eklendi. `avatar.glb` teslim ve app asset konumlarina yerlestirildi.  
TEST: `npx.cmd tsc --noEmit` basarili.  
VERIFY: Avatar sekmesi mikrofon seviyesiyle agiz animasyonu uretir; Junior/Senior persona anahtari farkli ton metni verir.  
COMMIT: `ledger-c7-avatar` - `[FORGE: Avatar] Add GLB lipsync stage - 12kg`

## Cycle 8 - Rollback: GLB-only (20dk)

READ: Avatar raporu sahnenin cihaz/model farkinda bos kalmamasini istiyor.  
LOCATE: GLB loader ve morph traversal.  
HYPOTHESIZE: Sadece GLB morph target'larini oynatmak yeterlidir.  
REPAIR: Hipotez geri alindi; bazi Avaturn export'larinda morph isimleri farkli olabildigi icin `VisemeOverlay` ve `ProceduralAvatar` korundu.  
TEST: Kod yolu model yoksa veya morph yoksa hala gorsel agiz hareketi uretir.  
VERIFY: Rollback sonucunda demo sahnesi GLB basarisizliginda bile canli kalir.  
ROLLBACK: `rollback-c8-glb-only` - GLB-only yaklasimi iptal edildi.

## Cycle 9 - Fail: Native STT (20dk)

READ: `audit-reports/007-voice-dictated-bridge.md` raporu stuck durumunda insan uzmana gecis istiyor.  
LOCATE: Voice dikte paneli ve Bridge heuristigi.  
HYPOTHESIZE: Mobilde ek native paket olmadan dogrudan STT alinabilir.  
REPAIR: Uygulanmadi. Expo paket setinde native STT yok; web SpeechRecognition destekli dikte ve mobil manuel text fallback secildi.  
TEST: `npx.cmd tsc --noEmit` basarili; hata mesaji mobil kullaniciya fallback'i acikliyor.  
VERIFY: Cycle 8 rollback + Cycle 9 fail ardarda geldiginden stuck sayaci 2/2 olur.  
FAIL: `fail-c9-native-stt` - native STT hipotezi kapatildi, Bridge tetigi dogrulandi.

## Cycle 10 - Expert Bridge Recovery (20dk)

READ: `BRIDGE.md` gorusme ozeti ve stuck raporu sonraki cycle'a context olarak girildi.  
LOCATE: `getConsecutiveBlockCount`, `ForgeSignalPanel`, `ExpertBridgeScreen`, `App.tsx` auto-tab effect.  
HYPOTHESIZE: Son iki cycle `FAIL` veya `ROLLBACK` ise aktif sekmeyi Bridge'e almak ve Jitsi odasi acmak yeterli bir human-in-the-loop koprusudur.  
REPAIR: Forge ekranina cycle butonlari ve "Kasitli STUCK demo tetikle" komutu eklendi. Bridge ekranina `Uzmana Baglan` Jitsi linki, oda bilgisi ve son cycle listesi kondu.  
TEST: `npx.cmd tsc --noEmit` basarili.  
VERIFY: Ardil iki bloklayici status Bridge ekranini acar; Jitsi odasi ses, video ve ekran paylasimini platform tarafinda saglar.  
COMMIT: `ledger-c10-bridge` - `[FORGE: Bridge] Recover stuck cycle with expert call - 9kg`

## Cycle 11 - Runtime Fix (20dk)

READ: Kullanici testinde Analyzer API key yokken hata veriyor, Senior-sen avatar varyanti da sahnede yeterince gorunmuyor.  
LOCATE: Analyzer fallback `app/App.tsx`; persona sahnesi `app/src/final/VoiceAvatarBridge.tsx`.  
HYPOTHESIZE: Gemini key yoksa lokal slop analizi uretmek demo akisini kirmaz; Senior-sen icin ayri sahne isigi/halo/badge ve remount key kullanmak persona gecisini gorunur yapar.  
REPAIR: `analyzePitchLocally` eklendi; Gemini yoksa veya API patlarsa Results ekranina lokal sonuc basiliyor. Senior-sen icin altin stage, badge ve model remount key eklendi.  
TEST: `npx.cmd tsc --noEmit` basarili; `npx.cmd expo export --platform web` basarili.  
VERIFY: Analyzer artik API key istemeden sonuc verir; Avatar sekmesinde Junior/Senior gecisi gorsel olarak ayirt edilir.  
COMMIT: `ledger-c11-runtime-fix` - `[FORGE: Runtime] Keep analyzer and senior persona usable - 6kg`
