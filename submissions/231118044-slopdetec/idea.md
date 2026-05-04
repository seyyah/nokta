# Nokta - Track B: Slop Detector / Due Diligence (Fikir Hakemi)

> Bu proje, Nokta ekosisteminin "Yatırımcılar İçin Otonom Due Diligence" modülünü (Track B) mobil bir platform (React Native + Expo) olarak hayata geçirmektedir.

## 1. Tez (Thesis)
Yatırımcıların, fon yöneticilerinin (VC) ve kurumsal istihbarat ekiplerinin radarına her gün yüzlerce "Pitch" (fikir sunumu) düşmektedir. AI çağında kod veya metin jenerasyonu bedavaya yakınsarken asıl değerli olan kıt kaynak yetkin bir fikirdir. Herkesin saniyeler içinde "dünyayı değiştirecek bir süper yapay zeka ürünü" metni oluşturabilmesi nedeniyle, "due-diligence" (pazar ve teknik doğrulama) süreci boğucu, manuel ve masraflı hale gelmiştir. Slop Detector, abartılı vaatleri (Slop) filtreleyip, ayakları yere basan, sınırları (constraints) qa edilmiş (doğrulanmış) ve mühendislik iskeletine oturtulmuş gerçek bir spesifikasyon (artifact) ortaya çıkarmaya yarar.

## 2. Problem
- **Pitch Yorgunluğu:** Değerlendiriciler ve melek yatırımcı ağları; jenerik, analiz edilmemiş ve sadece "buzzword" (popüler kelime) yığınından ibaret yüzlerce "Slop" dosya içinde boğulurlar (Deal Flow yorgunluğu).
- **Gerçek Değerin Kaybolması:** Aslında temeli sağlam olan fakat abartılı iddiaların arasında güvenilirliğini yitiren projeler (tohumlar) reddedilir.
- **Engineering-Guided Red Eksikliği:** Girişimci ekipler; veritabanı maliyeti, API Rate Limitleri veya regülasyonlar (KVKK) gibi sınırları hiç düşünmeden "yapay zeka bunu halleder" vizyonuyla sunum yaparlar, bu da fikri manipülatif ve uygulanmaz kılar.

## 3. Nasıl Çalışır (Nokta Red-Team Yaklaşımı)
Nokta'nın Track B (Slop Detector) modülü otonom bir risk değerlendirme ve kalite duvarıdır:
1. Bir değerleyici veya yaratıcı; yatırım sunumu/pitch paragrafını mobil sisteme yapıştırır.
2. Sistemi arkadaki bir AI ajanı (Red-Team ajanı) pazar iddialarını, rakip istatistiklerini ve teknik sınırları acımasızca sorgular.
3. Fikrin "hayal ürünü" olma veya mantıksız iddiaya dayanma seviyesine göre **0 ile 100 arasında bir Slop Score** belirlenir. (100 = Tamamen Slop, 0 = Tamamen slop-free spesifikasyona hazır).
4. AI ajanı net ve rasyonel bir dille (**reason**) yatırımcıya ya da girişimciye argümandaki delikleri çıkarır.
5. Nihayetinde tohum fikir tamamen anlamsız değilse, Nokta felsefesine sadık biçimde "slopsuz/çöpsüz", teknik bağımlılıkları ve sınırları (constraint) olan, yatırım testini (QA) geçmiş uygulanabilir bir taslağa (**correctedPitch**) dönüştürülür.

## 4. Etki ve Neden Şimdi (Why Now?)
Yapay zekanın üretimi ucuzlattığı  günümüzde doğru fikri filtrelemek en büyük ihtiyaçtır. Slop Detector (Otomatize Due Diligence) ile melek yatırımcılar, masalarına gelen ürünü saniyeler içinde test edip, Nokta'nın onayından geçmemiş ("Slop" skoru yüksek) projelere randevu bile vermeyerek on binlerce dolarlık ar-ge & QA sürecinden tasarruf ederler. Nokta tek başına tarafsız, analitik yıkıcı (disruptive) bir **Yatırım Ön Filtresi (Fikir Hakemi)** olur.

## 5. Nokta Ekosistemindeki Yeri
Bu "Track B" bileşeni, Nokta'nın bütüncül **"Açık İnovasyon"** vizyonunun bir modülüdür. Tek başına bu araç yatırımcı tarafında bir otonom test duvarı gibi çalışsa da, asıl Nokta vizyonunda burayı geçen fikirler, daha sonra departman içi (cross-pollination) ajan testlerinden geçecek ve nihayetinde güvenli tasdik ağlarında (Idea Marketplace) fonlama veya satın almaya (tradeable artifact) dönüşecektir.
