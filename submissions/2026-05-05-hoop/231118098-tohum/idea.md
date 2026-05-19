# Tohum

*Ham bir fikri (noktayı), AI destekli rehberli sohbetle slop-free manifestoya büyüten mobil düşünce partneri.*

> Bu belge NOKTA repo standartlarındaki 7-bölüm `idea.md` formatını takip eder. Track A — **Dot Capture & Enrich** için özelleşmiş fikir dosyasıdır. Tohum, NOKTA ekosisteminin en dar dilimini — "nokta → spec" dönüşümünü — üretime sokan tek odaklı bir uygulamadır.

---

## 1. Tez

Bir fikrin değeri onu saklayan nottan çok, ona yöneltilmiş doğru soruların sırasında ortaya çıkar. **Tohum**, ham bir fikri başka hiçbir şey yapmayan; sadece onu görüp, sorgulayıp adım adım manifestoya oturtan tek görevli bir mobil araçtır. Kullanıcının yazdığı fikir kullanıcının kalır — AI onu süslemez, yerine geçmez, yönünü değiştirmez. Sadece sınırları çizer.

---

## 2. Problem

Bireysel yaratıcı her gün Notion'a, WhatsApp'a, sesli notlara onlarca fikir kıvılcımı bırakır. Bu kıvılcımların büyük çoğunluğu orada ölür — çünkü fikri *büyütmek* için gereken disiplinli sorgulama gündelik işlerin arasına sıkışamaz.

Mevcut AI asistanları bu boşluğu açık uçlu chat kutusuyla doldurmaya çalışır ve iki yan etkiyi birden üretir:
- **Boş-sayfa felci** — kullanıcı "nereden başlasam?" sorusuna takılır ve konuşma başlamadan biter.
- **Slop cevap yığını** — asistan genel geçer motivasyon ("harika fikir"), alakasız özellik listeleri, henüz ihtiyaç olmayan teknik mimariler döker. Fikir formdan çıkıp hamurlaşır.

Kullanıcıda iki seçenek kalır: ya kendi başına saatlerce spec yazmaya uğraşır, ya fikri bırakır. Orta yol — *disiplinli bir sorgulayıcı* — bugün yoktur.

---

## 3. Nasıl Çalışır

### Temel İçgörü 1 — Engineering-Guided Konuşma, Açık Uçlu Chat Değil
Tohum her turda **tek bir hedefli soru** sorar; tek bir eksik sinyalin peşine düşer. AI'nın içinde yedi sinyallik bir rubrik bulunur: *tez, problem, nasıl çalışır, ne yapmaz, neden şimdi, kim fayda sağlar, özet*. Konuşma bu rubrik doldurulana kadar sürer. Sabit soru sayısı yoktur — sinyaller yeterli kaliteye ulaştığında AI *kendi* "noktan çekirdeğe ulaştı" der ve üretim onayı ister.

### Temel İçgörü 2 — Öneri Rayı Değil, Opsiyonel İskele
AI, kullanıcının takıldığı yerlerde 2-3 yön önerebilir ("belki 18-25 yaş öğrenciler?"). Kullanıcı dokunursa öneri yazım alanına yapıştırılır; dokunmazsa sessizce kaybolur. **Maksimum her iki turda bir** öneri sunulur — böylece AI fikri yönlendirmez, sadece zihnin sıkıştığı yerlere minik iskele atar. Dayatma, seçim zorlama, çoklu dal yoktur.

### Temel İçgörü 3 — Sabit Çıktı: 7-Bölüm Manifesto
Çıktı serbest JSON veya özensiz markdown değil. AI, NOKTA `idea.md` standardının 7 bölümünü birebir takip eder: *Tez, Problem, Nasıl Çalışır (Temel İçgörüler), Ne Yapmaz, Neden Şimdi, Kim Fayda Sağlar, Özet*. Şablon repodan gelir — taklit değil, uyum. Kullanıcı çıktıyı kopyaladığında dosya doğrudan bir GitHub reposunda `idea.md` olarak durabilecek hâldedir.

### Temel İçgörü 4 — Üretim Sahibi Kullanıcıdır
Tohum'un hiçbir adımı kullanıcının yazdığını değiştirmez. AI yalnızca **sorar** ve **önerir**. Final manifestodaki her tez cümlesi, her "ne yapmaz" maddesi kullanıcının kendi onayladığı bir karardır. AI yardımcı, kullanıcı yazar.

---

## 4. Ne Yapmaz

- **Sonsuz sohbete çıkmaz.** Tohum "anlatmaya devam et" demez; her turda ya sorar, ya önerir, ya kapanış işaretler.
- **Fikri sahiplenmez.** Çıktı üslubu kullanıcıdan gelir; AI kendi tarzını veya retoriğini dayatmaz.
- **Motivasyonel slop üretmez.** "Harika fikir!", "Kesinlikle başarılı olur", "İnanılmaz potansiyel" gibi övgü dolgularına prompt seviyesinde yasak vardır.
- **Teknoloji yığınına, zaman tahminine veya rakip analizine girmez.** Bunlar fikrin değil, ürünleştirmenin konusudur — Tohum'un kapsamı dışıdır.
- **Kullanıcının fikrini sunucuya kaydetmez.** Tüm içerik cihazda kalır; cloud senkronizasyon, paylaşım, marketplace entegrasyonu yoktur.
- **Çoklu kullanıcı, hesap, giriş yönetimi taşımaz.** Tek cihaz, tek kullanıcı, tek odak.

---

## 5. Neden Şimdi

Solo girişimci ve indie hacker sayısı son iki yılda AI ile ivmelendi; aynı ivme boş spec havuzlarını da büyüttü. Her gün binlerce yapay zeka sekmesi *"bir fikrim var, nereden başlasam"* yazımıyla açılıyor ve cevap yine aynı açık uçlu öneriyle kapanıyor.

Form doldurma ile serbest konuşma arasındaki boşluk — **kısıtlı, dar kapsamlı, engineering-guided sorgulayıcı** — hâlâ yok. NOKTA ekosistemi bunu büyük ölçekte çözmeye girişiyor; Tohum, ekosistemin en ucundaki saf `nokta → spec` dönüşümünü cebe taşıyıp bireyin hayatına bugün yerleştirir.

---

## 6. Kim Fayda Sağlar

- **Solo girişimciler ve indie hacker'lar:** Fikrin sahibi ve kritiği aynı kişi olduğunda dışsal disiplin eksikliği; Tohum AI'ı tarafsız sorgulayıcıya dönüştürür.
- **Akademik araştırmacılar ve tez yazarları:** Bir makale veya tez konusu için ilk kapsamı çizerken "ne yapılmayacağını" belirlemek en pahalı adımdır — Tohum'un "Ne Yapmaz" zorunluluğu bu maliyeti emer.
- **Bitirme projesi hazırlayan öğrenciler:** Danışmana götürmeden önce fikri manifesto seviyesine getirerek değerli geri bildirim almak için.
- **Erken keşif aşamasındaki ürün yöneticileri:** Stakeholder'lara götürmeden önce iç disiplinli bir spec önizlemesi üretmek için.
- **"Aklıma şu geldi, uçmasın" diyen her yaratıcı:** WhatsApp notundaki kıvılcımı bir günün sonunda manifestoya dönüştürmek isteyen herkes.

---

## 7. Özet

Tohum, bir fikri kıvılcımdan (nokta) manifestoya götüren dar kapsamlı bir mobil düşünce partneridir. WhatsApp ritminde konuşur, engineering-guided sorular sorar, arada opsiyonel yönler önerir; sonunda NOKTA repo standardına uyumlu bir 7-bölüm `idea.md` üretir. AI yardımcı araçtır, fikrin sahibi ve yazarı her zaman kullanıcıdır. Süslemez, yargılamaz, kendi tezini dayatmaz — sadece sınırları çizer ve noktayı olgunlaştırır. Çıktı kullanıcının elinde repo-konformu bir manifestodur; o manifesto ertesi gün bir git commit'ine, bir danışman toplantısına veya bir yatırım konuşmasına girebilir.
