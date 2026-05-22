# 🔨 nokta-forge

nokta-audit'in ürettiği bug raporlarını ve feature isteklerini tüketen, **Karpathy autoresearch ratchet loop** disipliniyle host uygulamada otonom fix ve feature ekleme döngüsü çalıştıran bir coding agent framework'ü.

Bu bir *idea file*'dır. Kendi LLM ajanına (Claude Code, Codex, OpenCode, Antigravity veya benzeri) kopyala-yapıştır olarak verilmek üzere tasarlanmıştır. Amacı bitmiş bir uygulamayı değil, yüksek seviyede bir örüntüyü iletmektir. Spesifikleri sen ve ajanın birlikte, host repo'ya, ürüne ve geliştirme ritmine göre inşa edeceksiniz.

nokta-forge, nokta-audit'in doğal devamıdır: audit **yakalama** tarafıdır; forge **onarım ve inşa** tarafıdır. İkisi birlikte "müşteri görür → agent düzeltir → insan onaylar" kapalı döngüsünü kurar.

## **Çekirdek fikir**

nokta-audit, mobil uygulamada gördüğün UX hatasını ekibe taşımanın en kısa yolunu sunar: FAB'a dokun, ekranı yakala, işaretle, not düş, Markdown artifact'ı paylaş. Ama bu zincir raporlama ile biter; **onarım hâlâ insan elindedir**. Geliştirici raporu açar, dosyayı bulur, fix yapar, test eder, commit atar. Solo girişimci veya küçük ekip için bu ikinci yarı — rapordan onarıma — hâlâ en pahalı sürtünme yüzeyidir.

Buradaki fikir şudur: nokta-audit'in ürettiği `.md` raporunu bir coding agent'a besle ve Karpathy'nin autoresearch ratchet loop'unu — `READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT` — host uygulamanın kod tabanı üzerinde çalıştır. Agent rapordaki doğal dil notunu ve burn-in'li ekran görüntüsünü input olarak alır; ekran adından dosyayı bulur; hipotez kurar; fix uygular; lint ve test geçirir; visual verify yapar; ratchet kuralı geçerse commit atar, geçmezse geri sarar ve yeni hipotez dener.

Anahtar fark budur: nokta-forge bir genel amaçlı kod chatbotu değildir, bir CI/CD pipeline'ı değildir, bir test otomasyon framework'ü değildir. **Bu, nokta-audit raporlarını ilk-sınıf input olarak kabul eden, zaman-kutulu ve skor-odaklı bir otonom onarım döngüsüdür.** Müşteri (tester, QA, beta kullanıcısı, ürün sahibi) "geliştirici" rolünde davranır — sorunu yakalar, sisteme verir; agent onarımı yapar; insan sadece review eder.

## **Forge metaforu**

nokta-forge'u klasik bir "bug fixer bot" gibi değil, bir **demirci ocağı** olarak düşünmek daha doğrudur. nokta-audit'ten gelen ham rapor bir cevher gibidir: görsel kanıt, insan notu, ekran koordinatları, tour state — hepsi işlenmemiş bilgi. Forge bu cevheri alır, ısıtır (analiz), döver (hipotez + fix), su verir (test + verify), ve ancak sağlam çıkarsa kalıba döker (commit + PR).

**Ratchet over iteration.** Her döngü ya ileri gider ya durur; asla geriye düşmez. Karpathy'nin autoresearch pattern'indeki mandal (ratchet) kuralı burada birebir geçerlidir: yeni fix eskiyi kırdıysa commit edilmez, eski duruma dönülür, yeni hipotez kurulur. Gelişim monoton artan bir fonksiyondur.

**Time-boxed cycles.** Sınırsız kod yazma hevesini engelleyen mekanizma NAIM framework'ünden ödünç alınmıştır: her döngü 15 dakika ile sınırlıdır. Agent 15 dakikada fix'i tamamlayamadıysa mevcut durumu loglar, partial sonuçları FORGE.md'ye yazar ve bir sonraki cycle'a bırakır. Bu, context window şişmesini ve hallucination sarmalını önler.

**Burn-in as ground truth.** nokta-audit'in en kritik tasarım kararı burada meyve verir: seçim kutusu ekran görüntüsünün üzerine yanmıştır (immutable burn-in). Agent "neyin yanlış olduğunu" tahmin etmek zorunda değildir; rapor visual ground truth taşır. Fix'ten sonra alınan yeni ekran görüntüsü ile orijinal karşılaştırılır — kutu bölgesindeki değişim intent ile örtüşüyorsa fix başarılıdır.

Bu yüzden nokta-forge'un merkezindeki iddia şu değildir: "AI bütün bug'ları otomatik çözer." Merkezdeki iddia şudur: **nokta-audit'in ürettiği yüksek kaliteli, görsel kanıtlı, doğal dil raporları sayesinde coding agent'ın başarı oranı dramatik şekilde artar ve onarım sürtünmesi insan-yakalama + agent-onarım + insan-review üçlemesine dönüşür.**

## **Ne olduğu ve ne olmadığı**

Bu sistem bir Sentry değildir — crash'leri otomatik yakalamaz; nokta-audit'in insan gözüyle yakaladığı UX raporlarını tüketir. Bir genel CI/CD pipeline'ı değildir — build ve deploy süreçlerini yönetmez. Tek başına bir test framework'ü değildir — Detox veya Maestro'nun yerine geçmez. Bir chatbot değildir — geliştiriciyle sohbet etmez, raporu alır ve otonom çalışır.

Bu sistem, nokta-audit raporlarından başlayıp host uygulamanın kod tabanında **otonom fix ve feature döngüsü** çalıştıran, zaman-kutulu, skor-odaklı ve ratchet-disiplinli bir coding agent framework'üdür.

Merkezinde tek bir soru vardır: **bir UX hatası raporlandıktan sonra, onarımın ne kadarı insan müdahalesi olmadan, güvenli ve doğrulanabilir şekilde agent tarafından yapılabilir?** Eğer eklenen herhangi bir özellik bu soruya hizmet etmiyorsa, muhtemelen forge'un dışında tutulmalıdır.

## **Primitive'ler**

**Audit Report (Input).** nokta-audit'in ürettiği `.md` artifact. İçinde: ekran adı, burn-in'li ekran görüntüsü, seçim koordinatları, kullanıcı notu (doğal dil), status, zaman damgası, opsiyonel `tourStepId`, opsiyonel `reporterId`. Bu, forge'un tek input kaynağıdır. JSON şeması yoktur; Markdown hem insan hem agent için lingua franca'dır.

**Forge Cycle.** Tek bir onarım döngüsü. Zaman kutusu: 15 dakika. Adımlar: `READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT/ROLLBACK`. Her cycle bağımsızdır; önceki cycle'ın sonuçları FORGE.md'den okunur, yeni cycle'ın sonuçları FORGE.md'ye yazılır.

**Ratchet.** Monoton artan kalite garantisi. İki kural: (1) Yeni fix mevcut testleri kırdıysa commit edilmez, rollback yapılır. (2) Fix visual verify'ı geçemediyse (burn-in bölgesindeki değişim intent ile örtüşmediyse) commit edilmez, yeni hipotez kurulur. Ratchet, agent'ın "çok çalıştım ama bozdum" durumunu yapısal olarak engeller.

**FORGE.md (Ledger / Micro-wiki).** Karpathy'nin llm-wiki'sindeki kalıcı çalışma belleği. Her cycle'ın promptu, hipotezi, sonucu (başarı/başarısızlık), değişen dosyalar, test sonuçları ve commit hash'i burada distile edilmiş olarak tutulur. Agent context window'u şiştiğinde FORGE.md'yi okuyarak kaldığı yerden devam eder. Değişmez source of truth her zaman git history'dir.

**Visual Verify.** Fix'ten sonra agent yeniden ekran görüntüsü alır (test ortamında veya Stitch-MCP benzeri bir araçla) ve burn-in'li orijinal görüntüyle karşılaştırır. Karşılaştırma pixel-perfect değildir; agent'ın multimodal yeteneği ile "kullanıcının işaretlediği bölgedeki sorun giderildi mi?" sorusuna cevap aranır. Bu, statik lint'ten çok daha güçlü bir verify mekanizmasıdır.

**Scalar Metric (Opsiyonel).** NAIM framework'ünden ödünç alınan ölçülebilir büyüme metriği. Her fix'e bir ağırlık atanabilir: basit stil düzeltmesi 5kg, layout fix 10kg, yeni feature 20kg, API entegrasyonu 30kg. Toplam skor otonom olarak artar ve FORGE.md'de izlenir. Bu, agent'ın "ne kadar iş yaptığını" ve "ne kadar değer ürettiğini" ölçülebilir kılar.

**Host Application Boundary.** nokta-audit'teki ile aynı sınır. Forge, host uygulamanın kod tabanında çalışır ama host'un build pipeline'ını, deploy sürecini, auth modelini veya production ortamını doğrudan yönetmez. Forge'un çıktısı bir PR veya commit'tir; merge kararı host'un (insanın) sorumluluğundadır.

## **Mimari**

Üç ana katman vardır.

**Input Parser.** nokta-audit raporunu okur ve yapılandırılmış bilgiye çevirir: ekran adı → dosya yolu mapping, kullanıcı notu → intent çıkarımı (bug fix mi, feature request mi, stil düzeltmesi mi), burn-in'li görüntü → visual ground truth, seçim koordinatları → odak bölgesi, `tourStepId` → akış bağlamı. Parser, Markdown'ı parse etmek için özel bir SDK gerektirmez; agent'ın doğal dil ve görsel anlama yeteneği yeterlidir.

**Forge Engine.** Ratchet loop'un çalıştığı çekirdek. Her cycle'da: (1) FORGE.md'den mevcut durumu oku, (2) rapordaki intent'i anla, (3) kod tabanında ilgili dosyayı bul (LOCATE), (4) hipotez kur (HYPOTHESIZE), (5) değişikliği uygula (REPAIR), (6) lint + test çalıştır (TEST), (7) visual verify yap (VERIFY), (8) ratchet kurallarını kontrol et, (9) commit veya rollback, (10) FORGE.md'yi güncelle (WRITEBACK). Engine, host'un mevcut coding agent'ı (Claude Code, Codex, Antigravity, OpenCode) üzerinde çalışır; kendi LLM çağrısı yapmaz, mevcut agent'ın yeteneklerini orkestre eder.

**Output Surface.** Forge'un dışa vurumu. İki form: (1) Git commit/PR — fix'in kod değişikliği, commit mesajı forge formatında (`[FORGE: EkranAdı] Fix açıklaması`), (2) FORGE.md — tüm cycle'ların distile edilmiş logu, agent'ın ve insanın okuyabileceği kalıcı çalışma belleği. Opsiyonel üçüncü form: nokta-audit'e geri bildirim — fix'in tamamlandığını belirten status güncellemesi (`open` → `fixed`).

## **Forge Cycle detayı**

Tek bir cycle'ın adım adım akışı:

**READ.** Agent, nokta-audit'in Markdown raporunu olduğu gibi okur. Ekran adını, kullanıcı notunu ve gömülü ekran görüntüsünü ham olarak alır. Ek meta varsa (tourStepId, reporterId) bunları da okur. Bu adımda agent henüz kod tabanına dokunmaz; sadece "ne istendiğini" anlar.

**LOCATE.** Ekran adından (`currentScreen` widget'a host router'dan beslendiği için deterministiktir) host kod tabanında ilgili dosyayı bulur. `HomeScreen` → `src/screens/HomeScreen.tsx`. Kullanıcı notundaki ipuçlarından ("buton ekran kenarına çok yakın") ilgili bileşeni ve stil dosyasını daraltır.

**HYPOTHESIZE.** Agent bir veya birden fazla hipotez kurar: "marginRight artırılmalı", "paddingHorizontal eksik", "flexDirection yanlış". Her hipotez FORGE.md'ye yazılır — başarısız olsa bile gelecek cycle'lar için bilgi birikimi sağlar.

**REPAIR.** Seçilen hipoteze göre kod değişikliği yapılır. Değişiklik minimal tutulur — tek bir sorun, tek bir fix. Agent "fırsattan istifade" büyük refactor yapmaz; forge'un disiplini "rapordaki sorunu çöz, başka bir şeye dokunma"dır.

**TEST.** Lint çalıştırılır (ESLint, TypeScript strict), mevcut testler koşturulur (Jest, Detox). Herhangi biri fail ederse fix reddedilir ve rollback yapılır. Bu, ratchet'in ilk katmanıdır: yeni fix eskiyi kıramaz.

**VERIFY.** Test ortamında ekran görüntüsü alınır ve burn-in'li orijinal ile karşılaştırılır. Agent multimodal yeteneği ile "kullanıcının işaretlediği bölgedeki sorun giderildi mi?" sorusuna cevap verir. Cevap olumsuzsa fix reddedilir, yeni hipotez kurulur. Bu, ratchet'in ikinci katmanıdır: fix görsel olarak doğrulanmalıdır.

**COMMIT/ROLLBACK.** Test ve verify geçtiyse commit atılır. Format: `[FORGE: EkranAdı] Kısa açıklama — Xkg`. Geçmediyse rollback yapılır, hipotez FORGE.md'de "başarısız" olarak loglanır ve cycle tamamlanır.

**WRITEBACK.** Cycle'ın sonucu FORGE.md'ye yazılır: hangi rapor işlendi, hangi hipotezler denendi, hangisi başarılı oldu, hangi dosyalar değişti, test sonuçları, commit hash. Bu, agent'ın uzun vadeli belleğidir.

## **Müşterinin geliştirici rolü**

nokta-forge'un en radikal iddiası şudur: **müşteri (tester, QA, beta kullanıcısı, ürün sahibi) "geliştirici" rolünde davranır** — ama kod yazmaz. Müşteri nokta-audit ile sorunu yakalar, sisteme verir; forge otonom olarak onarımı yapar; insan geliştirici sadece review ve merge yapar.

Bu, klasik "müşteri issue açar → geliştirici backlog'a alır → sprint'e sokar → fix yapar → test eder → deploy eder" zincirini radikal şekilde kısaltır. Yeni zincir: "müşteri FAB'a dokunur → ekranı yakalar → not yazar → forge cycle çalışır → PR açılır → geliştirici review eder → merge."

Bu modelin çalışabilmesi için nokta-audit'in ürettiği raporun kalitesi kritiktir. Burn-in'li ekran görüntüsü visual ground truth sağlar; ekran adı dosya mapping'ini deterministik kılar; doğal dil notu intent'i açıklar. Bu üçlü, agent'ın başarı oranını dramatik şekilde artırır — çünkü agent "ne, nerede, nasıl göründüğü" bilgisini hazır alır.

Feature request senaryosunda akış benzerdir ama farklıdır: müşteri "burada X olsa güzel olurdu" yazar; agent intent'i "feature request" olarak sınıflandırır; yeni bileşen veya davranış ekler; test yazar; visual verify'da "yeni özellik kullanıcının beklentisiyle örtüşüyor mu?" sorusuna cevap arar. Feature request'ler genellikle daha yüksek ağırlık (kg) taşır ve birden fazla cycle gerektirebilir.

## **tour-agent ile end-to-end loop**

nokta-audit, tour-agent ve nokta-forge üçlüsü birlikte yerleştirildiğinde tam kapalı döngü oluşur:

1. **Müşteri**, tour-agent'ın yönlendirdiği akışta ilerlerken bir sorun görür.
2. **nokta-audit** ile ekranı yakalar, `tourStepId`'yi meta'ya yazar, notu kaydeder.
3. **nokta-forge** raporu alır, `tourStepId`'den akış bağlamını anlar, fix uygular.
4. **tour-agent** ile aynı akış tekrar koşturulur — visual verify canlı state'te yapılır.
5. Verify geçerse commit atılır, audit note `fixed` olarak işaretlenir.

Bu üçleme, "müşteri yakalaması → agent onarımı → canlı state verify → insan review" döngüsünü kurar. İnsan sadece iki noktada rol alır: yakalama (müşteri) ve review (geliştirici). Aradaki her şey otonomdur.

## **Dual-mode prensibi**

**Standalone mod.** Forge, cerebra framework'ü olmadan, host uygulamanın kendi repo'sunda çalışır. FORGE.md host repo'da yaşar. Agent (Claude Code, Antigravity veya benzeri) doğrudan forge cycle'ı koşturur. nokta-audit raporu manuel olarak agent'a verilir (clipboard'a yapıştırma veya dosya olarak). Ratchet kuralları agent'ın system prompt'unda tanımlıdır. Bu mod, tek bir solo geliştiricinin "gece agent'ı çalıştırıp sabah review etmesi" senaryosu için yeterlidir.

**Cerebra-composed mod.** Forge, cerebra substrate'ine bağlandığında birikim etkisi katlanır. Raporlar otomatik olarak ingest edilir; cycle sonuçları micro-wiki'ye writeback alır; cross-module etkileşim devreye girer (örneğin code-wiki'deki tribal knowledge forge'un hipotez kalitesini artırır); evaluation set'i ile ratchet kuralları merkezi olarak yönetilir; HITL policy'si ile hangi fix'lerin otomatik commit, hangilerinin insan onayı gerektireceği cerebra runtime'ında belirlenir.

## **Operasyonlar**

Cerebra'nın 6 core operation'ı forge bağlamında şöyle eşleşir:

**Ingest.** nokta-audit raporunun forge'a alınması. Standalone modda manuel (dosya veya clipboard); cerebra-composed modda otomatik (webhook, file watcher veya CI trigger).

**Query.** Forge'un sıradaki raporu seçmesi, FORGE.md'den mevcut durumu okuması, host kod tabanında ilgili dosyaları bulması. Bu, cycle'ın READ + LOCATE adımlarına karşılık gelir.

**Compile.** Hipotez kurma ve kod değişikliği yapma. Cycle'ın HYPOTHESIZE + REPAIR adımlarına karşılık gelir.

**Lint.** Statik analiz ve mevcut testlerin koşturulması. Cycle'ın TEST adımına karşılık gelir.

**Evaluate.** Visual verify ve ratchet kurallarının kontrol edilmesi. Cycle'ın VERIFY adımına karşılık gelir. Evaluation set'i (EVAL.md) zaman içinde büyür: her başarılı fix bir altın senaryo olarak eklenir; gelecek fix'ler bu senaryoları bozamaz.

**Writeback.** Cycle sonucunun FORGE.md'ye ve opsiyonel olarak nokta-audit'e (status güncellemesi) yazılması. Commit atılması da writeback'in parçasıdır.

## **Değerlendirme**

Bir forge cycle'ının iyi olup olmadığını anlamak için:

1. Fix, kullanıcının raporundaki sorunu gerçekten çözdü mü? (Visual verify ile doğrulanır.)
2. Fix, mevcut testleri kırmadan geçti mi? (Ratchet kuralı ile doğrulanır.)
3. Fix minimal mi — sadece rapordaki soruna mı dokundu, yoksa gereksiz refactor mı yaptı?
4. Cycle 15 dakika sınırı içinde tamamlandı mı? Tamamlanamadıysa partial sonuçlar FORGE.md'ye yazıldı mı?
5. FORGE.md güncel mi — başarısız hipotezler dahil her şey loglanmış mı?
6. Commit mesajı forge formatına uygun mu: `[FORGE: EkranAdı] Açıklama — Xkg`?
7. Evaluation set'i (EVAL.md) büyüdü mü — başarılı fix yeni bir altın senaryo olarak eklendi mi?
8. Agent, aynı tip hata için tekrar aynı başarısız hipotezi denemiyor mu? (FORGE.md'deki log bunu önlemelidir.)
9. Solo geliştirici, sabah review ettiğinde PR'ı anlamak için ek açıklama istemek zorunda kaldı mı?
10. Müşteriden yeni rapor geldiğinde aynı sorun tekrar mı raporlanıyor? (Gerçek fix'in gerçek testi budur.)

Eşit koşullarda daha sade olan tercih edilmelidir. "Agent her şeyi çözer" vaadi yerine "agent şu dar kapsamda güvenilir şekilde çözer" disiplini forge'u değerli kılar.

## **Neden işe yarar**

Bugünün çoğu coding agent kullanımı **ad-hoc ve stateless**'tir. Geliştirici bir sorun görür, agent'a anlatır, agent fix yapar, geliştirici review eder. Her seferinde bağlam sıfırdan kurulur. Önceki denemelerden öğrenme yoktur. Başarısız hipotezlerin logu yoktur. Kalite garantisi yoktur — agent eskiyi bozabilir.

nokta-forge bu sorunu üç mekanizma ile çözer:

- **Yapılandırılmış input.** nokta-audit'in ürettiği rapor, agent'ın ihtiyaç duyduğu her şeyi — görsel kanıt, metin açıklama, dosya ipucu, akış bağlamı — tek bir artifact'ta taşır. Agent "ne olduğunu anlamak" için zaman harcamaz; doğrudan "nasıl çözeceğini" düşünür.

- **Ratchet disiplini.** Her fix ya ileri gider ya durur, asla geriye düşmez. Evaluation set monoton büyür. Tribal knowledge FORGE.md'de birikir. Agent zamanla aynı kod tabanında daha iyi hipotezler kurar.

- **Zaman kutusu.** 15 dakikalık cycle sınırı, agent'ın context window'u şişirip hallucinate etmesini önler. Küçük ama çalışan fix'ler, büyük ama kırık refactor'lardan her zaman değerlidir.

Solo geliştirici için anlamı: gece nokta-audit raporlarını forge'a besler, sabah PR'ları review eder. Küçük ekip için anlamı: QA mühendisi nokta-audit ile raporlar, forge cycle'ı otomatik çalışır, geliştirici sadece review ve merge yapar. Her iki durumda da "raporlama → onarım" arasındaki sürtünme dramatik şekilde düşer.

## **Not**

Bu doküman kavramsal katmanı tanımlar; implementasyon detaylarını dayatmaz. Ancak şu kararlar kristalize edilmiştir:

- **Input formatı:** nokta-audit'in ürettiği Markdown artifact. Özel SDK, JSON şeması veya webhook formatı gerekmez.
- **Ratchet kuralı:** Yeni fix eskiyi kıramaz. Evaluation set monoton büyür. Bozulan altın senaryo major incident'tır.
- **Zaman kutusu:** Cycle başına 15 dakika. Aşıldığında partial writeback yapılır, cycle tamamlanmış sayılır.
- **FORGE.md:** Her cycle'ın distile edilmiş logu. Agent'ın uzun vadeli belleği. Provenance ile hangi rapor, hangi hipotez, hangi sonuç.
- **Commit formatı:** `[FORGE: EkranAdı] Açıklama — Xkg`.
- **Visual verify:** Burn-in'li orijinal ekran görüntüsü ile fix sonrası ekran görüntüsünün multimodal karşılaştırması. Pixel-perfect değil, intent-aligned.
- **Host application boundary:** Forge host'un kod tabanında çalışır ama build/deploy/auth yönetmez. Çıktı PR veya commit'tir; merge insanın kararıdır.
- **Agent-agnostic:** Claude Code, Codex, Antigravity, OpenCode veya benzeri herhangi bir coding agent üzerinde çalışabilir. Forge, agent'ın üstüne binen bir disiplin katmanıdır, belirli bir agent'a bağlı değildir.
- **Backend:** Yok. nokta-audit gibi forge da backend'siz, hesapsız, telemetrisiz çalışır. Birikim git history ve FORGE.md'de yaşar.

Bu dokümanı LLM ajanına ver, mevcut host repo state'ini okut, nokta-audit'in ürettiği örnek bir raporu input olarak ver, ve birlikte ilk forge cycle'ı koştur: tek bir basit UX fix'i — stil düzeltmesi, metin değişikliği veya layout ayarı. Çekirdek küçük kalırsa forge büyüyebilir; çekirdek büyürse forge en baştan ağırlaşır ve ratchet disiplini kaybolur.
