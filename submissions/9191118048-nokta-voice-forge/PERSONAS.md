# 👥 PERSONAS.md — Avatar Persona Dokümantasyonu

Uygulama içinde kullanıcı ile etkileşime giren, farklı ruh halleri ve görsel/işitsel ipuçları barındıran iki ayrı persona (Avatar) mevcuttur.

## 1. Junior-Sen (Enerjik & Meraklı)
- **Tasarım Dili**: Yuvarlak hatlar (Round Face), büyük gözler.
- **Renk Teması**: Enerjik Gradient (Turuncu/Sarı), Primary Color: `#FF9F43`.
- **Animasyon Hızı**: Yüksek intensity. Ağız hareketleri hızlı ve heveslidir. Göz kırpma sıklığı fazladır.
- **Davranış**: Denetim raporlarını yorumlarken motive edicidir, hata bulduğunda telaşlanır ama çabuk çözüm arar.
- **Dudak Senkronizasyonu**: Mikrofon genliğine (`amplitude`) çok hızlı tepki verir.

## 2. Senior-Sen (Analitik & Sakin)
- **Tasarım Dili**: Köşeli hatlar (Angular Face), standart gözler.
- **Renk Teması**: Sakin ve Profesyonel Gradient (Mor/Koyu Mavi), Primary Color: `#9B59B6`.
- **Animasyon Hızı**: Düşük intensity. Hareketleri daha kontrollü ve yavaştır. Mimikler oturaklıdır.
- **Davranış**: Sistem analizi yaparken mantık çerçevesinde kalır. STUCK olduğunda dahi paniklemez, metodik olarak uzmana bağlanmayı önerir.
- **Dudak Senkronizasyonu**: Mikrofon genliğini daha yavaş bir lerp (linear interpolation) fonksiyonuyla takip eder, yumuşak geçişler yapar.
