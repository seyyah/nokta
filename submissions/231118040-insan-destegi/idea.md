# Nokta Human Assist

## 1. Identity

Nokta Human Assist, Nokta Mascot fikrinin mobil uyumlu bir Track A yorumu olarak tasarlanmıştır. Kullanıcıdan ham fikir veya voice transcript alır, 5 engineering sorusuyla belirsizliği azaltır, kısa bir ürün spec'i üretir ve güven seviyesi yeterli değilse insan desteğine devir paketi hazırlar.

Bu ürün genel amaçlı sohbet botu değildir. Esas işi, fikir netleştirme ve gerektiğinde doğru anda insan müdahalesi önermektir.

## 2. Problem

Ham fikirler çoğu zaman konuşma içinde dağılır; problem, kullanıcı ve kapsam aynı paragrafta birbirine karışır. Sadece AI ile devam eden akışlarda kullanıcı bazen yanlış güven hissi yaşar ve zayıf bir fikri build etmeye başlar.

Bu yüzden ürün iki şeyi aynı anda yapmalıdır:

- fikri hızlıca yapılandırmak
- güven düşükse insan desteğini görünür biçimde devreye almak

## 3. Core Flow

1. Kullanıcı text idea veya voice transcript ile giriş yapar.
2. Uygulama problem, user, scope, constraint ve success signal için 5 soru sorar.
3. Cevaplardan tek sayfa spec oluşturulur.
4. Confidence orta seviyedeyse veya kullanıcı isterse human support handoff ekranı açılır.
5. Handoff ekranı, insan inceleyiciye gidecek kısa özet, neden, aksiyon ve notları üretir.

## 4. Human Support Principle

İnsan desteği burada bir fallback değil, güven mekanizmasıdır. AI spesifikleşmeyi hızlandırır; insan ise yanlış scope, yanlış kullanıcı veya zayıf validation sinyalini son kez sorgular.

## 5. Non-Goals

- gerçek zamanlı canlı ajan altyapısı
- CRM entegrasyonu
- tam speech-to-text pipeline
- üretim backend'i
- çoklu kullanıcı işbirliği

## 6. Success Metric

Bir kullanıcı tek oturumda ham fikirden okunabilir bir spec'e geçebilmeli ve gerekirse aynı ekrandan insan desteği devir paketi oluşturabilmelidir.

## 7. Why This Slice

Bu dilim, Nokta tezine sadık kalır: önce fikir netleşir, sonra yapım kararı verilir. Ek olarak insan desteği katmanı, AI'nin sınırını dürüstçe göstererek ürünü sadece "maskotlu asistan" olmaktan çıkarır.
