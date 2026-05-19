# Nokta Draft

## Seçilen Track

**Track C - Migration & Dedup**

## Kısa Açıklama

Nokta Draft, dağınık proje notlarını daha net ve karar vermeye uygun bir proje konsepti taslağına dönüştüren odaklı bir mobil uygulamadır. Uygulamanın ana değeri genel bir özet çıkarma yapmak ya da kullanıcıya kart yığını göstermek değildir. Uygulama, tekrar eden noktaları birleştirmek, çelişkileri görünür kılmak, tanımsız alanları ortaya çıkarmak ve sonucu daha güçlü bir çıktıya dönüştürmek için deterministik bir yerel motor kullanır.

## Uygulama Ne Yapar

- Kopyalanmış sohbetlerden, madde listelerinden veya karışık planlama metinlerinden ham not dökümü alır.
- Bu dökümü küçük parçalara ayırır ve tekrar eden ifadeleri normalize eder.
- Belirgin tekrarları ve örtüşmeleri iç fikir birimlerine indirger.
- Aşağıdaki bölümlerden oluşan yapılandırılmış bir `Distilled Project Concept Draft` üretir:
  - Concept Summary
  - Problem and Intent
  - Core Product Direction
  - Key Features
  - Constraints and Boundaries
  - Contradictions and Tensions
  - Undefined Areas
  - Recommended Next Decisions
- Sonuç ekranı içinde hafif gözden geçirme / iyileştirme etkileşimleri sunar:
  - Sharpen Summary
  - Tighten Scope
  - Mark Decision
- Ek bonus yetenek içerir: kritik seçimler onaylandıktan sonra konsepti daha net bir v1 çıktısına sıkılaştıran karar-kilitli bir handoff özeti üretir.

## Nasıl Çalıştırılır

Repo kök dizininden:

```bash
cd submissions/231118081-idea-distillery/app
npm install
npm run start
```

Geliştirme sırasında kullanılan ek kontroller:

```bash
npm run typecheck
npx expo export --platform web
```

## Expo Linki

Expo Go canlı önizleme / QR linki: `exp://192.168.1.3:8081`

Expo proje sayfası: https://expo.dev/accounts/samsun081/projects/nokta-draft-231118081

## 60 Saniyelik Demo

[Youtube Demo](https://youtube.com/shorts/fzQz6UR1TDY?feature=share)

## APK

APK indirme bağlantısı: https://expo.dev/artifacts/eas/e2F7ST1x4DDZPFjYmZGuF.apk

Yerel dosya: `submissions/231118081-idea-distillery/app-release.apk`

## Karar Günlüğü

- Sadece Track C seçildi ve ürün tek bir dönüşüm akışı içinde tutuldu: ham notlar -> tekrarları ayıklanmış fikir birimleri -> yapılandırılmış konsept taslağı.
- Son taslak ana kullanıcı çıktısı olarak ele alındı; fikir birimleri ise iç yapıda veya sınırlı görünürlükte bırakıldı.
- İlk sürüm, canlı bir AI bağımlılığı olmadan çevrimdışı çalışabilsin diye deterministik ve kural tabanlı bir motorla geliştirildi.
- Arayüz iki ana ekranla sınırlı tutuldu: Input ve Result.
- İyileştirme akışı ayrı bir ürün dalına taşınmadan sonuç ekranı içinde hafif tutuldu.
- Stitch ile üretilen tasarım yönü görsel kaynak olarak kullanıldı: editoryal tipografi, kontrollü yüzeyler, güçlü boşluk kullanımı ve çelişki / belirsizlik alanlarında sıcak vurgu tonları.
- Kilitlenmiş fikir yönünün dışında ama Nokta tezine hizmet eden bonus bir demo yeteneği eklendi: alınan kararlar, daha net bir v1 yönü için handoff özeti ve değişiklik günlüğü üretir.

## AI Araç Günlüğü

- **Codex**: repository incelemesi yaptı, Expo uygulamasını geliştirdi, deterministik motoru kurdu, React Native arayüzünü bağladı ve bu README dosyasını güncelledi.
- **Stitch**: son arayüz hiyerarşisini ve görsel stilini yönlendiren input ve result ekranı tasarım yönünü üretti.
- **GPT-5.4 UI/UX subagent**: brief’i iki ekranlı mobil UX planına ve kapsam disiplini kurallarına dönüştürdü.
- **GPT-5.4 architecture subagent**: uygulama yapısını gözden geçirdi ve v1 için küçük Expo + TypeScript yapısını doğruladı.
- **GPT-5.4 distillation-logic subagent**: kural tabanlı akışı ve çelişki / belirsizlik sezgilerini önerdi.
- **GPT-5.4 README subagent**: submission README yapısını ve zorunlu bölümleri gözden geçirdi.

## Bilinen Sınırlamalar

- Motor deterministik sezgiler kullandığı için yakın tekrar tespiti bilinçli olarak basit tutuldu; embedding tabanlı değil.
- Uygulama şu anda durumu yalnızca bellekte tutuyor. Yerel kayıt, export veya paylaşım akışı henüz yok.
- Çelişkiler açık kural çiftleri üzerinden tespit edildiği için daha ince çatışmalar gözden kaçabilir.
- Başlık üretimi sezgisel olduğu için zayıf girdilerde daha genel kalabilir.
- Karar-kilitli özet yalnızca yerel sentezdir; henüz kalıcı bir handoff çıktısı olarak export edilmez veya kaydedilmez.
- Expo proje linki, demo linki ve APK bağlantısı eklendi; ancak Expo Go için ayrı bir canlı preview linki paylaşılmamıştır.
