# Nokta - Track B: Slop Detector (Düzenli Durum Değerlendirmesi)

## 1. Fikir Özeti (Thesis)
Nokta platformunun kalbi olan "Fikir Pazar Yeri," yalnızca veriyle desteklenen, temellendirilmiş ve sentetik jargondan ("slop") arındırılmış inovasyonların listelenmesine olanak tanıyan özerk bir kuluçka ekosistemidir. Bu vizyon doğrultusunda geliştirilen **Slop Detector**, sisteme giren her yeni girişimi sentetik pazar iddialarından filtrelemek için tasarlanmış entegre bir analitik değerlendirme mekanizmasıdır. Fikrin pazar yerindeki değerini ölçümleyen, eksiklerini raporlayan ve nihai kabul onayını veren otonom kalite kontrol noktasıdır.

## 2. Neden Bu Araç Var (Problem & Çözüm)?
1. **Slop Akışının (Filtrasyon) Yönetimi:** Geliştiriciler ve melek yatırımcılar, temelsiz "Trilyon dolarlık pazar hacmine sahibiz ve doğrudan rakibimiz yok" gibi yüzeysel söylemlere sahip projeler arasında değerli vakit ve odaklarını kaybetmektedir.
2. **Objektif Standardizasyon:** Gelen fikirler subjektif yoruma dayalı algıyla değil; katı analitik sınırlarla değerlendirilerek sayısal bir pazar eşiğine (`Pazar Onayı`, `Geliştirme Bekliyor` vb.) tabi tutulur.
3. **Mühendislik Temelli Yönlendirme ("Engineering Guided"):** Zayıf bir girişimi doğrudan reddetmek yerine; saptanan spesifik yapısal eksiklikler doğrultusunda çözümler önerir (Örn: "Pazar büyüklüğü iddialarında güvenilir kaynak eksik. 5 potansiyel beta kullanıcısıyla görüşerek bulgularını ekle") ve girişimi tekrar olgunlaştırma döngüsüne sokar.

## 3. Otonom İşleyiş ve Metrikler
Slop Detector, "pitch" (ürün/girişim sunumu) metnini 6 farklı negatif ceza sinyali ve çeşitli pozitif kalite sinyalleri üzerinden skorlar:

### Negatif Sinyaller (Slop Cezası - Sentetik Şişirmeler)
- **AI/Blockchain Jargon Yüklemesi:** Teknik bir derinlik sunmadan dönemsel moda/hype kavramları yoğun kullanmak.
- **Doğrulanmamış Pazar Büyüklüğü:** Dış bir kaynağa (örn. analist raporu) dayanmayan fantastik ve hiperbolik büyüme iddiaları.
- **Rakipsizlik Yanılsaması:** "Pazarda rakibimiz yok" veya "Bu alanda tekiz" argümanı. (Sahadaki her gerçek problemin dolaylı da olsa bir alternatifi ve rakibi vardır).
- **Muğlak ve Soyut Çözüm Vaadi:** Ürünün veya teknolojinin nasıl çalıştığını anlatmak yerine; "kullanıcı dostu", "hepsi bir arada platform" gibi genel ifadelere başvurmak.
- **Pasif/Varsayımsal Kullanıcı Algısı:** Doğrulama testleri olmadan "Herkesin bu ürünü kullanacağı" varsayımı.
- **Hokey Sopası (Hockey-Stick) Grafik İddiası:** Herhangi bir tarihsel model veya pazara giriş stratejisi barındırmadan hiper-büyüme öngörmek.

### Pozitif Kalite Sinyalleri (Puan Artıran Unsurlar)
- Somut, oransal ve sayısal verilere atıf yapılması.
- Sektörel veya akademik güvenilir bir rapora/kaynağa açıkça referans verilmesi.
- Erken aşamada gerçekleştirilmiş kullanıcı testlerine ("beta", "müşteri görüşmesi") dair kanıtlar bulunması.
- Uygulanabilirlik açısından Zaman, Efor veya Bütçe (Constraints) kısıtlarının farkında olunması.
- Dolaylı veya doğrudan rakiplerin zayıf/güçlü yönlerine değinen karşılaştırma analizi (Competitor Benchmark).

## 4. Kullanıcı Deneyimi ve Çıktı

Bir fikir taslağı Slop Detector masasına ulaştığında aşağıdaki süreçten geçer:
1. **Veri Analizi:** Girişimci tarafından girilen ürün özeti (pitch), sisteme ham veri olarak aktarılır.
2. **Scoring Engine (Derecelendirme):** Metindeki kalıplar ayrıştırılarak bir Slop Skoru (Örn: 65/100) ve buna bağlı karar rozeti ("Geliştirme Gerekli") oluşturulur.
3. **Detaylı Rapor ve Düzeltme Önerisi:** Negatif sinyaller raporlanarak eksi puanın kök nedeni belirtilir. Sistem, girişimin kalitesini artırabilmesi için metin üzerinden eyleme geçirilebilir iyileştirme tavsiyeleri (rewrite suggestions) sunar.

Slop Detector; kalite kontrolünden geçememiş sunumları ("slop") ayıklayarak hem yatırımcının değerli zamanını koruyan hem de girişimciyi veriye dayalı iş modelleri kurmaya teşvik eden otonom bir "gatekeeper" görevi üstlenir.
