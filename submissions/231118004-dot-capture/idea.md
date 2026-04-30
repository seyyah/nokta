# Nokta — Track A: Dot Capture & Enrich
Öğrenci: 231118004

## 1. Uygulama Fikri
Geliştirdiğim bu mobil uygulama "Track A" kapsamındaki "Dot Capture & Enrich" özelliğine odaklanmaktadır. Kullanıcının elindeki çok ham ve basit bir ürün fikrini (noktayı) alır ve onu profesyonel bir yazılım mühendisliği süzgecinden geçirerek yapısal bir dokümana çevirir.

## 2. Sorun ve Çözüm Yaklaşımı
Çoğu insan parlak fikirlere sahip olduğunu düşünür, ancak fikirler genellikle eksiktir. Özellikle:
- **Hangi probleme çözüm üretiyor?**
- **Oluşturulacak Minimum Uygulanabilir Ürün (MVP) kapsamına neler dahil DEĞİL?**
- **Sistemin teknik fizibilitesi ve kısıtları neler?**

gibi sorular sorulmadığı için fikirler slop (ucuz ve işlevsiz) halde kalır. Bizim uygulamamız, bu sorunları çözmek için "Engineering-Guided" bir yapay zeka röportaj süreci oluşturur. 

## 3. Akış ve Teknolojiler
- **Giriş (Capture):** Kullanıcı fikrini metin olarak tek cümleyle yazar (Örn: "Üniversite öğrencileri için not paylaşım platformu").
- **Enrichment:** Sistem Gemini AI kullanarak sırasıyla Problem, User, Scope, Constraint ve Metric başlıklarında 5 can alıcı mühendislik sorusu sorar.
- **Spec (Specification):** Tüm yanıtlar toparlanarak tek sayfalık "olgunlaşmış iş planı" kartı oluşturulur.
- **Bonus - Nokta Skoru:** Çıkan spesifikasyon üzerinden projenin kalitesi (Orijinallik, Fizibilite, Pazar vs.) yapay zeka tarafından 100 üzerinden oylanarak animasyonlu görsel grafiklerle karneleştirilir.

Çıktı, doğrudan yatırıma hazır hale getirilmiş bir "Artifact"tir.
