# 🐛 nokta-audit

React Native / Expo uygulamalarına tek bileşen olarak gömülen, **sürüklenebilir bir FAB üzerinden ekranı yakalayıp işaretleten, notu insan-okur artifakta çeviren** taşınabilir bir bug-raporlama widget'ı. Backend yok, hesap yok, telemetri yok — host uygulamanın kararıyla yaşar ve host uygulamanın depolama mekanizmasıyla çalışır.

Bu bir *idea file*'dır. Kendi LLM ajanına (Claude Code, Codex, OpenCode veya benzeri) kopyala-yapıştır olarak verilmek üzere tasarlanmıştır. Amacı bitmiş bir uygulamayı değil, yüksek seviyede bir örüntüyü iletmektir. Mevcut paket (`@xtatistix/mobile-audit`) bu örüntünün ilk somut yansımasıdır; spesifikleri sen ve ajanın birlikte, host repo'ya, ürüne ve QA ritmine göre inşa edeceksiniz.

Uygulama ortamı olarak **React Native + Expo + TypeScript** seçilmiştir. Kristalize edilmiş mimari kararlar — widget = tek React bileşeni, storage = host-provided adapter, native yetenekler = host-provided dependency injection, çıktı = human-readable artifact (Markdown / DOCX), state = local in-component state machine — sonraki bölümlerde tek tek açıklanır ve "Not" bölümünde özetlenir.

## **Çekirdek fikir**

Küçük ekiplerin ve solopreneur'lerin mobil ürünlerinde en pahalı görünmez maliyet test edememe değil, **gördüğü bug'ı kaybetmektir**. QA mühendisi, beta kullanıcısı, ürün sahibi veya kurucu uygulamayı kullanırken bir aksaklık görür: bir buton yanlış yerde, bir liste boş kalmış, bir metin taşmış. O an cebindeki şey telefondur; bilgisayar değil, Linear değil, Jira değil. Telefondan çıkıp masaüstüne geçene kadar ne olmuştu, hangi ekrandaydım, hangi adımdan sonra patladıydı — bu bağlam buharlaşır. Geriye sadece "bir şey vardı, bir bug gördüm" hatırası kalır ve bu hatıra ekipte raporlanmaz.

Var olan çözümler bu boşluğu doldurmaya çalışır ama büyük çoğunluğu yanlış katmandan dolar. Sentry crash'leri yakalar; ama görsel UX hatasını yakalamaz. Instabug, BugHerd, Shake gibi araçlar güzel iş yapar — fakat hepsi kendi SaaS backend'ine veri gönderir, hesap açtırır, fiyat alır, GDPR/KVKK çerçevesi ister, ve solo girişimci ya da küçük bir TR startup için bunların hepsi ilk gün gereksiz ağırlıktır. Ekibin "günde yedi kez bug görüyorum" sürtünmesi, "günde yedi kez SaaS portala girip rapor giriyorum" sürtünmesiyle değiştirilir; net iyileşme sıfırdır.

Buradaki fikir şudur: bug raporlamayı bir backend ürünü değil, **bir mobil primitive** olarak ele al. Host uygulamanın içine düşen, host uygulamanın storage'ını kullanan, host uygulamanın paylaşım API'larından çıktı veren, kendi başına hiçbir uzak hizmete bağlı olmayan bir bileşen. Görsel bağlam yakalandığı an immutable hale gelsin (ekran görüntüsü + seçim kutusu "yansın", artık değiştirilmesin), not insan dilinde yazılsın, çıktı insanın okuyabileceği ve paylaşabileceği bir artifakta dönüşsün — Markdown raporu WhatsApp'a yapıştırılabilir, `.docx` rapor müşteri toplantısında ekran paylaşılabilir, e-postaya iliştirilebilir.

Anahtar fark budur: nokta-audit bir bug-tracker değildir, bir crash-reporter değildir, bir SaaS bug platformu değildir. **Bu, bug raporlamanın sürtünme yüzeyini host uygulamanın kendi içine indiren minimal bir widget örüntüsüdür.** Mobilde "fark et + işaretle + not düş + paylaş + agent ile çöz" döngüsünün ekipten bağımsız, backend'siz, hesapsız ve telemetrisiz hali — ve bu döngüde paylaşımın hedefi yalnızca insan değil, raporu okuyup onarımı yapacak bir coding agent da olabilir.

## **Widget metaforu**

nokta-audit'i klasik bir "SaaS bug tool" gibi değil, mobil ekosistemde bir **drop-in primitive** olarak düşünmek daha doğrudur. Benzetme React Native ekosisteminde tanıdıktır: `react-native-gesture-handler` veya `react-native-reanimated` nasıl host uygulamanın içine düşüp orada yaşıyorsa, `@xtatistix/mobile-audit` de aynı şekilde host uygulamanın içine düşer ve orada yaşar. Ürün olarak değil, **primitif olarak** sunulur.

**Single mount, zero ceremony.** Host geliştirici uygulamanın kök ağacına tek bir `<AuditWidget />` koyar. Açıp kapama, hangi ekranda hangi rolün gördüğü, hangi storage'a yazıldığı host'un kararıdır. Widget kendiliğinden bir akış dayatmaz; sadece görünürse FAB çıkar, FAB'a dokunulursa zincir başlar.

**Dependency injection over assumption.** Widget hiçbir native yeteneği kendi başına çağırmaz: ekran yakalama, dosya yazma, dosya paylaşma, depolama — hepsi `deps` üzerinden host'tan gelir. Bu disiplinin amacı süs değildir; host uygulamanın Expo kurulumu, kendi izin modeli, kendi `expo-file-system` versiyonu, kendi storage tercihi (AsyncStorage, MMKV, SecureStore, custom) ile çatışmadan yaşamasını sağlamaktır. Widget sadece "ne yapması gerektiğini" bilir; "nasıl yapılacağını" host'tan ister.

**Burn-in over layering.** Görsel bağlam yakalandıktan sonra parmakla çizilen sarı seçim kutusu ekran görüntüsünün **üzerine yanar** — yani composite view yeniden capture edilir ve seçim artık görüntünün immutable bir parçası haline gelir. Sonradan kutuyu hareket ettirmek, silmek, başka yere taşımak yoktur. Raw, raw'dur. Bu, klasik "annotation layer"lı araçlardan farklıdır ve kasıtlıdır: raporu okuyan kişi (geliştirici, tasarımcı, müşteri) ayrı bir overlay sistemi olmadan, sadece görüntüye bakarak ne işaretlendiğini anlar.

**Human-readable AND agent-readable artifact over API call.** Çıktı bir JSON payload değildir, bir webhook gönderimi değildir. Çıktı `.md` ve `.docx`'tir — yani 2026'da hâlâ doğrudan WhatsApp'a yapıştırılabilen, Slack'e dosya olarak atılabilen, e-postaya eklenebilen, müşteriye e-mail edilebilen, GitHub issue body'sine kopyalanabilen, Office'te açılıp düzenlenebilen formatlardır. **Aynı `.md` aynı zamanda bir coding agent için ideal input'tur**: agent doğal dili zaten çözümler, gömülü burn-in'li ekran görüntüsünü visual ground truth olarak kullanır, JSON şemasına veya özel SDK'ya ihtiyaç duymaz. Artifact'ın okunabilirliği yalnızca uzun ömrünü değil, en geniş tüketici tabanını da belirler — insan, coding agent, eski araç, gelecek araç. Herhangi bir backend bağımlılığı olmayan formatlar bir altyapı kararının değil, bir özgürlük kararıdır.

Bu yüzden nokta-audit'in merkezindeki iddia şu değildir: "Biz bütün bug tracking ihtiyacını tek bir SaaS'ta topluyoruz." Merkezdeki iddia şudur: **bir mobil uygulamada gördüğün bir UX hatasını ekibe taşımanın en kısa yolu, host uygulamanın kendi içinde başlayıp host uygulamanın kendi paylaşım kanallarında bitmelidir.**

## **Ne olduğu ve ne olmadığı**

Bu paket bir Sentry alternatifi değildir. Bir crash-reporter değildir. Tek başına bir issue-tracker değildir. Bir SaaS bug platform aboneliği değildir. Test-otomasyon framework'ü değildir. Bir analytics SDK'sı değildir.

Bu paket, React Native / Expo geliştiren küçük ekipler için **host uygulamanın içine düşen, görsel bağlamı yakalayıp insan-okur artifakta çeviren, depolama ve dağıtımı host'a bırakan minimal bir bug-raporlama widget'ıdır**. Kullanıcı (tester, QA, ürün sahibi, beta) uygulamayı kullanırken bir aksaklık görür; FAB'a dokunur; ekranı yakalar; sorunu işaretler; not yazar; not yerel olarak host'un seçtiği storage'a düşer. İstediğinde liste açar, notları gözden geçirir, status değiştirir, Markdown veya Word olarak dışa aktarır ve ilgili kanaldan paylaşır.

Merkezinde tek bir soru vardır: **bir kullanıcı mobil uygulamada bir UX hatası gördüğünde, bunu ekibe en az sürtünmeyle nasıl taşır?** Eğer eklenen herhangi bir özellik bu soruya hizmet etmiyorsa, muhtemelen widget'ın dışında — yani host uygulamanın veya başka bir aracın katmanında — tutulmalıdır.

## **Hedef Kitle ve Drop-in Yaklaşım**

Hedef host geliştirici, kendi React Native / Expo uygulamasını gönderen küçük ekip üyesidir ya da solo geliştiricidir. Bu ekibin Sentry'si zaten bağlı olabilir; ama Sentry görsel UX bug'ları yakalamaz. Müşteri toplantısında "burada şu görünüyordu" diye anlatmak yerine `.docx`'i ekran paylaşımında açabilmek ister. Beta kullanıcısı bir kuponun yanlış göründüğünü söylerken "şu ekrandaydım" yerine ekran görüntüsü gönderebilmesini ister. QA mühendisi haftalık testlerin sonunda toplu bir Markdown raporu vermek ister.

Bu yüzden widget'ın entegrasyon yüzeyi **görev odaklı ve minimal**dir. Host geliştirici uzun bir SDK kurulum dokümanı okumaz, ayrı bir hesap açmaz, API key almaz, kendi build pipeline'ını değiştirmez. Bunun yerine:

- Uygulamanın kök bileşeninde tek bir `<AuditWidget deps={...} />` mount eder
- `deps`'i kendi storage ve native API tercihleriyle doldurur
- `currentScreen` prop'unu kendi router'ından besler
- Geri kalan her şey widget içinde yaşar

Bu yaklaşım, "ek bir araç sürtünmesi" eleştirisini doğrudan çözer: kullanıcıdan davranış değişikliği istemek yerine, mevcut uygulamanın kullanım anına bug raporlamayı gömer. Tester uygulamanın içindeyken raporu yazar; davranış değişmez, arayüze bir katman eklenir.

## **Primitive'ler**

Sistemi doğru kurmak için bazı kavramlar widget'ın çekirdeğinin parçası, bazıları ise host uygulamanın sorumluluğunda kalan dış kabuktur.

**FAB (Floating Action Button).** Widget'ın tek görünür yüzü. 52×52 piksel, kırmızı, gölgeli, sürüklenebilir. Ekran üzerinde serbestçe konumlandırılır ve host uygulamanın UI'sını mümkün olduğunca az engeller. Tek dokunuş yakalama akışını başlatır; çift dokunuş not listesini açar. Sürükleme ile tap ayrımı 6 piksel eşiğiyle çözülür; çift dokunuş 280ms penceresinde yakalanır.

**Screenshot + selection burn-in.** Görsel bağlamın immutable hali. Yakalama anında ekran görüntüsü alınır; tam ekran selector'da kullanıcı parmağıyla bir dikdörtgen çizer; "Devam"a basıldığında composite view (ekran görüntüsü + sarı kutu) yeniden capture edilir. Bu noktada işaret artık bir overlay değil, görüntünün kendisidir. Bu kasıtlı kayıptır: annotation'ı geri almak yerine, raporun bütünlüğünü korumak öncelenir.

**Audit note.** Bir bug raporunun atomik birimi. İçinde ne tutar: id, ekran adı, ekran görüntüsü URI'si (veya base64 data URI), seçim koordinatları (geri-render için saklanır ama immutable burn-in zaten görüntüde mevcuttur), kullanıcı notu, status (`open` | `fixed`), zaman damgası (ISO 8601), opsiyonel raporlayan kimliği. Notlar — host'un seçtiği storage'da — koleksiyon olarak yaşar; ekrana göre gruplanır, status'a göre sayılır, zaman akışında dizilir.

**Storage adapter.** Widget ile host arasındaki tek persistence sözleşmesi. İki metot taşır: `loadNotes()` ve `saveNotes(notes)`. Host bu interface'i AsyncStorage, MMKV, SQLite, hatta bir bellek mock'u ile implement edebilir. Widget storage'ın "nerede" olduğunu bilmez ve bilmek zorunda da değildir. İzolasyon böyle korunur: notlar host uygulamanın egemenlik alanında kalır.

**Deps (dependency bundle).** Native yeteneklerin host-provided versiyonu. `captureScreen` ve `captureRef` (ekran/view görüntüsü), `writeFile` ve `writeFileBinary` (dosya yazma), `shareFile` (paylaşım intent'i), `storage` (yukarıdaki adapter), `currentScreen` (host router'dan beslenen aktif ekran adı), opsiyonel `reporterId`, görsel olarak özelleştirilebilir `BugIcon`. Widget bunlardan hiçbirini içeriden seçmez; çünkü Expo versiyonu, izin modeli ve tercih edilen kütüphaneler host'tan host'a değişir.

**Artifact.** Notların dışa vurulmuş hali. İki form: Markdown (`buildMarkdown`) ve Word (`buildDocx`). Her ikisi de pure fonksiyondur; notlar listesi ve rapor meta'sını alır, string (veya base64) döndürür. Çıktı ekran bazlı gruplanır, status'a göre renklenir, ekran görüntüleri gömülür, zaman damgaları yerelleştirilir. Artifact "son ürün" değildir; substrate'in (yani notların) belirli bir andaki dışa vurumudur. Notlar değişirse artifact eski kalır; bu doğaldır.

**State machine.** Widget'ın hayat döngüsü. Beş durum: `idle` (FAB görünür), `capturing` (ekran yakalanıyor), `selecting` (alan seçici tam ekran açık), `annotating` (not yazma bottom-sheet'i), `list` (modal not listesi). Akış lineardır: idle → capturing → selecting → annotating → idle. Çift dokunuş kestirmesi: idle → list → idle. Bu sadelik bilinçlidir; daha fazla durum eklemek widget'ı bir uygulamaya dönüştürür.

**Host application boundary.** Widget'ın dış sınırı. Her şey bu sınırın iç tarafındadır; sınırın dış tarafında host uygulamanın kendi navigation'ı, kendi auth modeli, kendi storage seçimi, kendi paylaşım pipeline'ı, kendi analytics'i yaşar. Widget bu sınırı ihlal etmemelidir; aksi halde drop-in olmaktan çıkıp ortak ortağa dönüşür.

## **Mimari**

Üç ana katman vardır.

**Orchestrator.** `AuditWidget` bileşeni. State machine'i taşır, FAB'ı render eder, sürükleme ve dokunma davranışını yönetir, alt bileşenleri durum geçişlerinde mount/unmount eder, `NoteManager` üzerinden CRUD'u tetikler, export fonksiyonlarını çağırır. Klasik bir controller mantığıyla çalışır: kullanıcı niyetini alır, doğru bileşeni gösterir, doğru servise yönlendirir.

**UI bileşenleri.** `AuditSelector` tam ekran alan seçici; `AuditOverlay` bottom-sheet not yazma yüzeyi; `AuditNoteList` modal liste ekranıdır. Her biri tek sorumluluklu kalır ve birbirini doğrudan tanımaz — iletişim orchestrator üzerinden, prop callback'leri ile gerçekleşir. UI bileşenlerinin storage veya native API ile doğrudan teması yoktur; her şey orchestrator'dan akar.

**Çekirdek (core) ve export.** `NoteManager` (CRUD), `AuditStorage` (interface), `generateId` (id üretimi), `buildMarkdown` ve `buildDocx` (artifact üretimi). Bu katman saf TypeScript'tir; React'tan ve React Native'den bağımsızdır. Test edilebilirliği ve değiştirilebilirliği koruyan budur. `NoteManager` bir storage adapter alır ve onun üzerinden çalışır; storage'ın AsyncStorage mı yoksa in-memory mock mu olduğunu bilmez.

Bu mimari katı görünse de amaç esneklik değil, **drop-in olmayı mümkün kılan sadelik**tir. Her yeni özellik bu üç katmandan birine yerleşebilmelidir. Yerleşemiyorsa — özellikle host application boundary'sini ihlal ediyorsa — muhtemelen widget'a değil, host uygulamaya veya ayrı bir komşu modüle aittir.

## **Drop-in prensibi**

nokta-audit ekosistemindeki her host entegrasyonu iki disiplinle çalışmalıdır.

**Self-contained mod.** Widget kendi başına, host uygulamanın geri kalanını bilmeden, kendi state machine'i ve kendi storage adapter'ı ile çalışır. Host uygulamanın navigation'ına müdahale etmez; sadece pasif olarak `currentScreen` prop'unu okur. Host uygulamanın auth sistemini bilmez; opsiyonel olarak `reporterId` alır ama bunu yorumlamaz. Host uygulamanın analytics'iyle konuşmaz; çıktı host'un kendi paylaşım API'sından gider.

**Composed mod.** Host uygulama widget'ı kendi pipeline'ına bağlar: `currentScreen`'i kendi router middleware'inden besler, `reporterId`'yi kendi auth state'inden çeker, `storage`'ı kendi global storage stratejisiyle uyumlu hale getirir, export butonlarına ek pre/post hook'lar takar (örneğin Markdown çıktısını paylaşmadan önce Slack webhook'una da gönderir), notların `status`'unu kendi issue-tracker'ından senkronize eder. Bu mod widget'ın temel kontratını bozmadan host-spesifik birikim üretir.

Bu yapının amacı host lock-in'i engellemektir. Bir geliştirici sadece manuel test sırasında widget'ı görünür yapmak isteyebilir; production build'de tamamen tree-shake edip kaldırabilir. Veya tam tersine, beta dağıtımında her kullanıcıda görünür tutup notları kendi backend'ine periyodik olarak push edebilir. Widget bu iki uçtan birini dayatmaz; sadece minimal kontrat sunar.

Self-contained mod, composed modun "fakir versiyonu" değildir. Self-contained mod kendi başına değerli ve kullanılabilir olmalıdır — bir geliştirici beş dakikada paketi kurup tek bir mount ile çalışan bir bug raporlama akışına sahip olmalıdır. Composed mod, self-contained'in yapamadığı şeyleri ekler: ekip akışına bağlanma, issue tracker senkronizasyonu, otomatik dağıtım, cross-session birikim.

## **Operasyonlar**

Çekirdekte birkaç temel operasyon vardır. Her biri bağımsız çağrılabilir ve test edilebilir.

**Capture.** FAB'a dokunulduğunda host'tan gelen `captureScreen` ile ekran görüntüsü alınır. Görüntü URI'si veya base64 data URI olarak döner. Bu noktada widget kendi modunu `capturing` → `selecting`'e çevirir; selector tam ekran açılır ve görüntüyü arka plan olarak gösterir.

**Select.** Kullanıcı parmağıyla ekran üzerinde bir dikdörtgen çizer. Minimum 10×10 piksel altındaki seçimler kabul edilmez (kazara dokunmaları filtrelemek için). "Devam"a basıldığında composite view (görüntü + sarı kutu) `captureRef` ile yeniden yakalanır ve elde edilen URI artık "annotated screenshot" olarak akar. Seçim koordinatları da ayrıca saklanır — gerekirse önizleme ekranında küçük gösterim için kırmızı kutu olarak yeniden render edilir.

**Annotate.** Bottom-sheet açılır; kullanıcı sorunu kendi dilinde anlatır. Ekran adı ve raporlayan kimliği meta olarak gösterilir, değiştirilemez. Boş not kabul edilmez. "Kaydet" basıldığında `NoteManager.add` çağrılır ve not — id, timestamp, default `open` status ile birlikte — storage'a düşer.

**List + edit + delete.** Çift dokunuş veya akış sonu sonrası kullanıcı not listesini açabilir. Her not bir kart olarak görünür: thumbnail, status rozeti, ekran adı, not metni, zaman damgası, düzenle/sil butonları. Düzenleme yalnızca not metni içindir; ekran görüntüsü ve seçim immutable kalır (burn-in disiplininin doğrudan sonucu). Silme onay diyaloğu ile yapılır.

**Export.** `buildMarkdown` ve `buildDocx` notları artifact'a çevirir. Markdown ekran bazlı gruplanır, emoji statuslar (🔴 / ✅), tarih lokalizasyonu, ekran görüntüsü embed'leri içerir. DOCX aynı yapıyı Word formatında üretir; ekran görüntüleri base64'ten gömülür, en-boy oranı `screenshotAspect` ile korunur. Çıktı host'un `writeFile` / `writeFileBinary` ile diske yazılır, ardından `shareFile` ile sistem paylaşım diyaloğu açılır. Geri kalanı (e-posta, WhatsApp, Slack, Drive) host işletim sisteminin sorumluluğudur.

## **Solo geliştirici için ilk kullanım**

İlk sürüm doğrudan solo React Native / Expo geliştiricisi ve küçük QA ekibi bağlamı için düşünülmelidir. Çünkü sorun burada en çıplak haliyle görünür: tek kişi hem geliştirici, hem tester, hem ürün sahibi, hem müşteri destek temsilcisi gibi davranır. Bug görür, ama saatler sonra bilgisayar başına geçtiğinde detayı unutur.

Bu kullanıcı için ideal kurulum şudur: tek bir AsyncStorage adapter'ı, Expo'nun standart `expo-file-system` ve `expo-sharing` paketleri, `react-native-view-shot` ile ekran yakalama, ve uygulamanın kök bileşenine eklenen tek bir `<AuditWidget />`. Başlangıçta `currentScreen` Expo Router'ın aktif route'undan dinamik olarak beslenir; `reporterId` sabit bir string olabilir ("qa-team" veya developer'ın adı).

Kullanıcı (geliştirici kendisi veya beta tester) örneğin yeni bir özellik test ederken bir butonun yanlış konumlandığını fark eder, FAB'a dokunur, ekranı yakalar, butonu sarı kutuyla çevreler, "Buton ekran kenarına çok yakın" yazar ve kaydeder. Bir saat sonra üç-beş not biriktiğinde liste açılır, Markdown export alınır, geliştiricinin kendi Slack kanalına veya GitHub issue'una yapıştırılır. Süreç böylece kapanır.

Buradaki değer "yeni bir bug tracker'a sahip oldum" değildir. Değer, **bug görme anı ile bug raporlanma anı arasındaki sürtünmenin saniyelere indirilmiş olmasıdır**. Bağlam kaybolmaz; çünkü kaybolmasına izin verecek dakikalar geçmemiştir.

## **Coding agent ve auto-repair loop**

`.md` formatının insan-okur olmasının ilk ve en görünür sonucu paylaşılabilirliğidir. Ama 2026'da bu formatın **en kritik tüketicisi insan değil, coding agent'tır**. Claude Code, Codex, OpenCode veya benzeri bir geliştirici ajanı nokta-audit'in ürettiği rapora beş adımlı bir zincir uygulayabilir ve bu zincir widget'ın varlık sebebinin doğal devamıdır.

**Read.** Agent Markdown raporu olduğu gibi okur. Ekran adını, status'u, kullanıcı notunu ("Buton ekran kenarına çok yakın") ve gömülü ekran görüntüsünü ham olarak alır. Format pure metindir; SDK gerektirmez, dönüşüm gerektirmez, doğal dilde gelir.

**Locate.** Ekran adından ve not içeriğinden hangi bileşenin hangi dosyada olduğunu çıkarır. `currentScreen` widget'a host router'dan beslendiği için bu zincir host kod tabanında deterministik olarak izlenebilir — agent kaynak ağacında `HomeScreen` aramasını yapar ve doğru dosyaya iner.

**Repair.** Hipotez kurar (örneğin `marginRight` artırılmalı, `paddingHorizontal` eksik), değişikliği yapar, lint ve test'leri geçirir. Klasik bir code-edit cycle — ama bu cycle artık doğal dilde gelen ve görsel kanıt taşıyan bir input'tan başlatılmıştır.

**Visual verify.** Düzeltmeden sonra agent yeniden ekran görüntüsü alır (otomatik test ortamında, geliştiricinin lokalinde widget'ı tetikleyerek veya host'un sağladığı bir replay mekanizmasıyla) ve elde edilen yeni görüntüyü orijinal raporun gömülü ekran görüntüsüyle karşılaştırır. **Burn-in'li sarı kutu bu noktada kritik bir rol oynar**: kutu raporun içine gömülü olduğu için agent "neyin yanlış olduğunu" tahmin etmek zorunda değildir; rapor visual ground truth taşır. Düzeltme, kutunun işaretlediği bölgenin insan notuyla örtüşür hale gelmesi demektir.

**Close loop.** Karşılaştırma intent'le örtüşürse rapor `fixed` olarak işaretlenir, PR açılır, commit atılır. Örtüşmezse zincir baştan çalışır; agent yeni hipotez kurar, yeni fix uygular, yeniden verify eder.

Bu yüzden nokta-audit'in artifact formatı seçimi rastlantısal değildir: Markdown hem insanın hem ajanın aynı dosyayı okuyabildiği **lingua franca**'dır. JSON payload bir backend için optimaldir; bir agent için gereksizdir çünkü agent zaten doğal dili çözümler ve burn-in'li ekran görüntüsü ona ihtiyaç duyduğu en yoğun bağlam paketini sunar.

Buradaki disiplin şudur: nokta-audit tek başına auto-repair loop'unu çalıştırmaz; bu host'un (veya host'un eklediği bir CI pipeline'ının, veya bir Claude Code komutunun) sorumluluğudur. Ama widget'ın ürettiği artifact bu loop için **ilk-sınıf bir input**'tur. Composed modda host uygulama export edilen `.md`'yi otomatik olarak bir agent komutuna besleyebilir; agent onarımı yapıp PR açar; insan sadece review eder.

Pratik anlamı: bug raporlama → onarım → visual verify zinciri, küçük bir ekipte tek bir kişinin manuel emeği olmaktan çıkıp **insan-yakalama + agent-onarım + insan-review** üçlemesine dönüşür. Sürtünme yalnızca raporlama tarafında değil, onarım tarafında da düşer. Solo girişimci için anlamı net: bir UX bug'ı görüp not düştükten sonra onarımın büyük kısmı gece çalışan bir agent tarafından kapatılabilir; sabahleyin geliştirici sadece review eder.

## **tour-agent ile bidirectional replay**

nokta-audit kendi başına bir bug-raporlama primitif'idir; ama cerebra ekosistemindeki **tour-agent ile birlikte yerleştirildiğinde** ortaya tek başına ürettiklerinin toplamından fazlası çıkar: aynı kullanıcı akışının iki uçtan replay edilebilmesi.

tour-agent (cerebra'nın `10-draft-ideas/tour-agent.md` dosyasında tanımlanan ürün adaptasyon ajanı) ürünün kendi bileşenlerine gömülü context marker'ları okuyarak kullanıcıyı belirli bir akışta gezdirir; tasarım değiştiğinde self-heal eder; her adımda kullanıcının gerçek state'inden çalışır. Yani tour-agent için bir "adım" sadece bir tooltip değil, **tanımlı bir UI state'inde, tanımlı bir bileşene odaklanan, replay edilebilir bir koordinat**'tır.

nokta-audit ile entegrasyon noktası şudur: yakalama anında widget `currentScreen`'e ek olarak host'un sağladığı bir `tourStepId` (veya benzeri tour state işaretçisi) okuyabilir ve bunu audit note'un meta'sına yazabilir. Böylece her bug raporu yalnızca "hangi ekranda" değil, "tour'un hangi adımındayken, hangi context'te" sorusunun cevabını da taşır. Bu meta'nın açtığı kapı bidirectional replay'dir.

**Müşteri tarafı.** Kullanıcı tour-agent'ın yönlendirdiği adaptasyon akışında ilerler — örneğin onboarding'in üçüncü adımındadır. Bir yanlış metin veya yanlış konumlanmış buton görür. FAB'a dokunur, ekranı yakalar, sarı kutuyla işaretler, "Bu fiyat yanlış görünüyor" yazar, kaydeder. Audit note hem müşterinin gördüğü görseli, hem tour state'ini, hem insan yorumunu tek bir artifakta birleştirir.

**Geliştirici tarafı.** Geliştirici export edilen Markdown raporu açar; gömülü meta'dan tour adımını okur; lokalinde tour-agent'ı aynı `tourStepId`'den başlatır; tour-agent kendi self-healing mekanizmasıyla ürünü o adıma getirir; geliştirici müşterinin gördüğü ekrandan **birebir aynı state'te** durur. Aradaki tek fark veridir; akış birebirdir. "Müşterinin garip data'sıyla mı tetikleniyor" yoksa "her durumda mı oluşuyor" sorusu artık tahmin değil, ölçümdür.

Daha güçlü senaryo: önceki bölümdeki coding agent zinciri ile bu kompozisyon birleşir. Coding agent raporu okur, tour-agent ile bug ekranına replay eder, fix yapar, tour-agent ile aynı akışı tekrar koşar, visual verify'ı bu kez **gerçek tour state'inde** yapar. Statik ekran görüntüsü karşılaştırması yerine canlı state karşılaştırması. tour-agent + nokta-audit + coding agent üçlemesi böylece **end-to-end auto-repair loop**'u kurar; insan sadece müşteri yakalamasında ve son review'da rol alır.

Bu kompozisyon nokta-audit'e zorla bağlı değildir — widget tour-agent yokken de tek başına çalışır. Ama tour-agent bir host uygulamada zaten varsa, audit note'a tek bir prop (`tourStepId`) eklemek bidirectional replay yeteneğini açar. Bu, drop-in primitif olmanın gerçek anlamıdır: küçük bir kontrat genişlemesi büyük bir kompozisyon kapısı açabilir. Widget kendi sınırını korur; ekosistem kompozisyonu host'un kararıyla devreye girer.

## **İzolasyon ve gizlilik**

Widget'ın hiçbir uzak servise veri göndermemesi tesadüf değil, tasarım kararıdır. Mobil uygulamalarda ekran görüntüsü çok hassas bir artifakttır: kullanıcı verisi, kişisel bilgi, müşteri sırrı, finansal detay, sağlık bilgisi içerebilir. Bu yüzden nokta-audit'in default davranışı şudur: notlar host uygulamanın seçtiği yerel storage'da kalır; export tetiklenmediği sürece hiçbir veri uygulamanın dışına çıkmaz; export tetiklendiğinde de hedef host'un seçtiği paylaşım kanalıdır (sistem share sheet) — yani kullanıcının açıkça onayladığı hedef.

Host uygulama isterse bunun üstüne ekstra disiplinler bina edebilir: hassas ekranlarda widget'ı tamamen gizlemek, ekran görüntüsünde belirli bölgeleri host tarafında bulanıklaştırmak (örneğin TextInput'lardaki kart numaralarını), notları belirli süre sonra otomatik silmek, sadece belirli rollerde widget'ı görünür yapmak. Widget bu disiplinleri dayatmaz ama hiçbirine engel de olmaz.

Kural nettir: bir widget'ın uslu olmasına güvenilmez. İzolasyon mimarisel olarak host'a bırakılmıştır. Widget sadece kendi sınırları içinde minimal davranır.

## **Diğer modüllerle ilişki**

nokta-audit tek başına bütün QA ihtiyacını yutmak zorunda değildir; hatta bunu yapmamalıdır. Mobil ekosistemdeki diğer araçlar burada komşu sistemler olarak yaşamaya devam edebilir.

**Crash reporting.** Sentry, Bugsnag, Firebase Crashlytics widget'ın yerine geçmez; widget de bunların yerine geçmez. Crash reporter'lar runtime exception'ları otomatik yakalar; nokta-audit ise insan gözünün yakaladığı UX hatalarını manuel olarak raporlar. İki katman birbirini dışlamaz; aynı uygulamada paralel çalışabilir.

**Issue tracking.** GitHub Issues, Linear, Jira, Trello widget'ın yerine geçmez. Widget bir issue tracker değildir; üretilen Markdown veya DOCX artifact'ı issue tracker'a bir input olabilir. Composed modda host uygulama bu köprüyü kurabilir (örneğin export butonuna basıldığında otomatik olarak GitHub'da yeni issue açan bir GitHub Action'ı tetikleyebilir); ama bu widget'ın değil, host'un sorumluluğudur.

**Analytics.** PostHog, Amplitude, Mixpanel widget'ın yerine geçmez. Analytics davranış akışını ölçer; widget belirli bir anın görsel kanıtını yakalar. İki katman birbirini tamamlar.

**Test otomasyonu.** Detox, Maestro, Appium widget'ın yerine geçmez. Otomasyon araçları regression'ı yakalar; widget ise insan gözünün yeni keşfettiği aksaklıkları yakalar. Otomasyon scripted'tir; widget ad-hoc'tur.

Bu modüller nokta-audit'in yerine geçmez; nokta-audit de onların işini tek başına üstlenmez. Her biri kendi sınırları içinde değer üretir. Widget'ın görevi bütün QA ihtiyacını merkezileştirmek değil, **mobil insan gözüyle UX bug yakalama akışına özel bir primitive sunmak**tır.

İki modül ise yer-değiştirme ilişkisinde değil, **kompozisyon ilişkisindedir** ve bu yüzden ayrı bölümlerde derinleştirilmiştir:

- **Coding agent** (Claude Code, Codex, OpenCode) — widget'ın ürettiği `.md` raporun en kritik tüketicisidir. Auto-repair loop için bkz. "Coding agent ve auto-repair loop" bölümü.
- **tour-agent** (cerebra ekosistemi) — widget ile birlikte müşteri ve geliştirici tarafında aynı kullanıcı akışının replay edilebilmesini sağlar. Bkz. "tour-agent ile bidirectional replay" bölümü.

Bu iki kompozisyonun ortak özelliği şudur: widget'ın drop-in sınırını ihlal etmeden, host'un kendi entegrasyonuyla devreye girerler ve widget'ın temel kontratını genişletmek yerine zenginleştirirler.

## **Değerlendirme**

Bir değişikliğin iyi olup olmadığını anlamak için tek soru "daha çok özellik ekledi mi?" değildir. Daha doğru sorular şunlardır:

1. Bir tester veya geliştirici, paketi kurduktan sonra ek bir doküman okumaya gerek duymadan FAB'ı görüp doğru kullanabiliyor mu?
2. Aynı host uygulama widget'ı kaldırdığında uygulamanın geri kalanı bozulmadan çalışmaya devam ediyor mu? (Drop-in olmanın tersinden testi.)
3. Bir bug görüldükten kaç saniye sonra not kaydedilmiş oluyor? Bu süre artıyor mu, azalıyor mu?
4. Ekran görüntüsü ve seçim kutusu raporu okuyan kişiye bağlamı tek başına aktarıyor mu, yoksa ek metin açıklaması gerekiyor mu?
5. Notlar host uygulamanın seçtiği storage'da gerçekten kalıcı olarak duruyor mu? Uygulama kapatılıp tekrar açıldığında notlar yerinde mi?
6. Export edilen Markdown veya DOCX rapor, ek bir araç olmadan WhatsApp / Slack / e-posta / GitHub'a doğrudan yapıştırılabiliyor veya iliştirilebiliyor mu?
7. Widget host uygulamanın gerçek UI'sını ne kadar engelliyor? FAB sürüklenebilir olduğu için kullanıcı engelden kaçınabiliyor mu?
8. Hassas bir ekranda host uygulama widget'ı kolayca gizleyebiliyor mu (örneğin `<AuditWidget />`'ı koşullu render ile)? Bu gizleme çalışıyor mu?
9. Storage adapter'ı değiştirildiğinde (AsyncStorage'dan MMKV'ye, MMKV'den SQLite'a) widget'ın geri kalanı tek satır değiştirilmeden çalışıyor mu?
10. Üç ay sonra paketi tekrar bir projeye eklerken, geliştirici eski entegrasyonun aynısını kolayca yeniden kurabiliyor mu, yoksa SDK ezberi mi gerekiyor?

Eşit koşullarda daha sade olan tercih edilmelidir. Görkemli görünen ama host application boundary'sini ihlal eden, host'un mevcut altyapısıyla çatışan veya widget'ı bir SaaS ürüne dönüştüren her özellik, kısa vadede etkileyici olsa bile uzun vadede zararlıdır.

## **Neden işe yarar**

Bugünün çoğu mobil bug raporlama iş akışı **stateless** ve **out-of-context**'tir. İyi crash reporter'lar var, iyi issue tracker'lar var, iyi analytics'ler var; ama bir tester telefon ekranında bir UX hatası gördüğü an ile o bug'ın bir issue olarak ekibe ulaştığı an arasında kalan dakikalarda bağlam çok yüksek oranda kayboluyor. Bu boşluk küçük gibi görünür ama küçük ekiplerde feedback loop'unu doğrudan kırar.

Boşluğun ikinci yüzü onarım tarafıdır. Bug raporlandıktan sonra bile, raporu okuyan geliştiricinin ne olduğunu anlaması, hangi dosyayı açacağını bulması, ne değiştireceğine karar vermesi ve fix'i visual olarak doğrulaması zaman alır. 2026'da bu zincirin büyük kısmı coding agent'ların yapabileceği bir iştir — eğer rapor onların okuyabileceği formatta ve içinde visual ground truth taşıyarak gelirse. Burn-in'li ekran görüntüsü + insan dilinde not, bir agent için JSON şemasından daha yoğun bir bağlam paketidir.

nokta-audit bu sorunu doğrudan hedefler. FAB'ı tek dokunuşa indirir, ekran görüntüsünü yakaladığı anda seçimi immutable hale getirir, notu insan dilinde tutar, çıktıyı insan-okur ve paket-bağımsız bir artifakta çevirir ve host uygulamanın kendi paylaşım kanalından dışarı verir. Bu zincirin her halkası **ek bir araç, ek bir hesap veya ek bir backend gerektirmemek üzere** tasarlanmıştır.

Solo geliştirici için anlamı şudur: tek başına gönderdiği bir uygulamada, kendi gözüyle veya beta kullanıcısının gözüyle yakalanan UX hatalarını kaybetmemek için pahalı bir SaaS aboneliğine ihtiyacı yoktur. Mevcut Expo kurulumuna tek bir paket ekler, kök ağaca tek bir bileşen koyar, geri kalanı host olarak kendi yönetir. Küçük QA ekibi için anlamı şudur: haftalık test turunun sonunda toplu bir Markdown veya `.docx` raporu geliştiriciye yollar; rapor bir SaaS portalda kilitli değildir, basit bir dosyadır, herkesin makinesinde açılır.

Burada anlatılan şey, bu sürtünme indirgemesini mümkün kılan minimal widget örüntüsüdür.

## **Not**

Bu doküman kavramsal katmanı tanımlar; implementasyon detaylarını dayatmaz. Ancak şu kararlar kristalize edilmiş ve artık "spesifike bırakılmış" değil, kesinleşmiş kararlardır:

- **Uygulama ortamı:** React Native + Expo + TypeScript (strict mode).
- **Widget formu:** Tek React bileşeni (`<AuditWidget />`), kök ağaca mount edilir; alt bileşenler (`AuditSelector`, `AuditOverlay`, `AuditNoteList`) yalnızca state machine üzerinden mount/unmount edilir.
- **Dependency injection:** Tüm native yetenekler (`captureScreen`, `captureRef`, `writeFile`, `writeFileBinary`, `shareFile`) ve storage host tarafından `deps` üzerinden enjekte edilir; widget kendi içinde hiçbir native paketi `import` etmez.
- **Storage soyutlama:** `AuditStorage` interface'i (`loadNotes` + `saveNotes`) — AsyncStorage, MMKV, SQLite veya custom backend ile implement edilebilir.
- **State management:** Yalnızca local React state (`useState`, `useRef`); harici state kütüphanesi (Redux, Zustand, jotai) yok ve gerekmiyor.
- **Selection burn-in:** Seçim kutusu ekran görüntüsünün üzerine "yanar" (composite view re-capture); annotation overlay yok.
- **Output formats:** Markdown ve DOCX; her ikisi de pure fonksiyon, base64 / string döndürür, dosyaya yazma host sorumluluğunda.
- **Agent-readable artifact:** Markdown formatı bilinçli olarak hem insan hem coding agent tüketicisi için optimize edilmiştir. JSON şeması ve özel SDK yok; gömülü burn-in'li ekran görüntüsü visual ground truth olarak yeterlidir.
- **Composability hook'ları:** `currentScreen` host router'dan beslenir; ek state işaretçileri (`tourStepId` gibi) ileride audit note meta'sına eklenebilir — widget'ın drop-in sınırı bozulmadan ekosistem kompozisyonu (tour-agent + coding agent) etkinleşir.
- **Backend:** Yok. Auth yok, telemetri yok, uzak senkron yok, hesap yok.
- **UI dili:** Türkçe (v0.1); ileride i18n eklemek host application boundary'sini ihlal etmediği sürece açık.
- **State machine:** Beş durum — `idle`, `capturing`, `selecting`, `annotating`, `list`; lineer akış ve çift dokunuş kestirmesi.
- **FAB davranışı:** Sürüklenebilir, ekran kenarlarına clamp'li; tek dokunuş yakalama, çift dokunuş (280ms penceresi) liste; sürükleme eşiği 6 piksel.

Bu kararların ardındaki gerekçe tektir: widget'ı **host uygulama için en az yük taşıyan, en kolay kaldırılabilen, en kolay genişletilebilen primitive** olarak tutmak. Her sapma bu yükü artırır ve drop-in vaadini zayıflatır.

Bu dokümanı LLM ajanına ver, mevcut repo state'ini (`src/`, `package.json`, `README.md`) okut, ve birlikte küçük ama yüksek etkili bir sonraki dilimi seç: ya host application boundary'sini güçlendiren bir ek (örneğin opsiyonel `onNoteSaved` callback hook'u), ya selection deneyimini iyileştiren bir disiplin (örneğin çoklu seçim kutusu yerine kararlı bir tek-kutu UX'i), ya da artifact kalitesini coding agent için artıran bir döngü (örneğin Markdown çıktısında auto-repair'a yardımcı olacak ekran metadata'sı veya bileşen path hint'leri), ya da composability'yi açan minimal bir genişleme (örneğin `tourStepId` gibi opsiyonel state işaretçisini audit note meta'sına eklemek). Çekirdek küçük kalırsa widget büyüyebilir; çekirdek büyürse widget en baştan ağırlaşır ve drop-in olmaktan çıkar.
