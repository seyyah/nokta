# IDEA — nokta-human-dot × nokta-audit
## Track B: Müşteri Geliştirici Use Case'i

**Öğrenci:** 231118004  
**Slug:** human-dot

---

## Keşfedilen Use Case

Bu entegrasyonda fark ettiğim şey şu: nokta-human-dot zaten "müşteri=geliştirici" döngüsünü
Firebase üzerinden kuruyordu — tester bir fikri işleyip spec ürettikten sonra,
uzman ekran karşısında anlık yorum yazabiliyordu. nokta-audit widget'ını eklediğimde bu döngü
tam anlamıyla kapandı.

Artık uzman kişi (ikinci telefon, ExpertScreen üzerinden bağlı) spec'i incelerken bir UX
tutarsızlığı fark ettiğinde — mesela "Spec sekmesinde 'Nokta Skoru' metni çok küçük" ya da
"History ekranında timestamp okunmuyor" — FAB'a dokunuyor, sarı kutuyla işaretliyor,
"bu font-size okunaksız, mobilde min 14px olmalı" diye not düşüyor ve Markdown artifact
export ediyor. Bu rapor hem insanın (öğrenci) okuyabileceği hem de doğrudan coding agent'a
(Antigravity) input olarak verilebilecek formatta çıkıyor.

Klasik "müşteri issue açar → geliştirici backlog'a alır" zinciri yerine şu loop oluştu:
**Uzman yakalar (nokta-audit) → Agent onarır (nokta-forge) → Öğrenci review eder → Merge.**
İnsan müdahalesi yalnızca yakalama ve review noktalarında. Aradaki onarım döngüsü
Antigravity (Forge cycle) tarafından koşturuluyor.

## Neden Bu Use Case Yeni?

Standart audit toolları (Instabug, Shake) müşteriyi pasif bir reporter olarak konumlandırır:
rapor atar, bekler. Burada uzman aynı zamanda fix'i tetikleyen taraf — raporu üretir
üretmez sistem bir coding agent'ı devreye sokabilir. "Müşterinin geliştirici olduğu" değil,
**"müşterinin geliştirme döngüsünü başlattığı"** daha doğru tanım.

nokta-audit'in burn-in'li ekran görüntüsü bu kullanım için kritik: agent sadece metin
açıklamayı değil, sorunun tam olarak ekranda nerede göründüğünü de görsel olarak alıyor.
Bu, "fix neyi hedeflediğini biliyor" garantisi sağlıyor — yoksa agent tahmin yapar,
insan onayı ihtiyacı artar, loop kapanmaz.
