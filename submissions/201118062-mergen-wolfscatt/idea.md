# Nokta Capture

## Seçilen Track

**Track A - Dot Capture & Enrich**

Bu proje, Nokta fikrinin en temel ve uygulanabilir dilimine odaklanır: kullanıcının ham bir ürün fikrini alıp kısa bir soru-cevap akışıyla daha net, tek sayfalık bir ürün özetine dönüştürmek.

## Problem Tanımı

Bir fikir ilk ortaya çıktığında genelde çok ham oluyor: "şöyle bir uygulama olsa iyi olur" seviyesinde kalıyor. Sorun fikrin olmaması değil, fikrin problem, hedef kullanıcı, kapsam ve kısıtlar açısından yeterince netleşmemesi. Bu yüzden insanlar iyi görünen ama ne yaptığı tam belli olmayan fikir notları biriktiriyor.

Bu da iki pratik probleme yol açıyor:

- Fikir hızlıca ürünleşemiyor çünkü neyin yapılacağı net değil.
- İlk heyecan geçince fikir değersizleşiyor çünkü yazılı ve düzenli bir çerçeveye oturmamış oluyor.

Nokta Capture bu problemi küçük bir akışla çözüyor: kullanıcıdan ham fikri alıyor, onu yönlendiren 4 kısa ürün sorusu soruyor ve sonunda tek sayfalık, okunabilir bir ürün özeti üretiyor.

## Hedef Kullanıcılar

- Aklına sık sık uygulama veya girişim fikri gelen ama bunları toparlamakta zorlanan öğrenciler
- Hızlıca MVP çerçevesi çıkarmak isteyen solo maker / indie hacker profili
- Bir fikri sunmadan önce kendine netleştirmek isteyen erken aşama girişimci

Bu challenge kapsamında ana kullanıcı profili, telefonundan hızlıca fikir notu alan ve uzun form doldurmak istemeyen bireysel kullanıcıdır.

## Ana Kullanıcı Akışı

1. Kullanıcı uygulamayı açar.
2. Kısa bir metin alanına ham fikrini yazar. Örnek: "öğrenciler için ortak ders çalışma planlama uygulaması".
3. Uygulama bu fikre göre 4 takip sorusu sorar.
4. Sorular sırasıyla şu başlıklara odaklanır:
   - Hangi problemi çözüyor?
   - Kim için yapılıyor?
   - İlk sürümde hangi temel özellik olmalı?
   - En önemli kısıt veya sınır ne?
5. Kullanıcı kısa cevaplar verir.
6. Uygulama cevapları işleyip tek sayfalık bir ürün özeti üretir.
7. Kullanıcı bu özeti okuyabilir, kopyalayabilir ve sonraki adımlar için kullanabilir.

## MVP Kapsamı

Bu submission'da yapılacak MVP bilinçli olarak dar tutulmuştur:

- Ham fikir girişi için tek ekran
- 4 adet takip sorusu akışı
- Kısa cevap girişleri
- Cevaplardan üretilen tek sayfalık ürün özeti
- Sonuç ekranında okunabilir spec formatı

Teknik olarak AI davranışı gerçek API yerine local/mock mantık ile simüle edilebilir. Buradaki amaç kusursuz üretkenlik değil, Track A akışını çalışan bir mobil deneyim olarak göstermek.

Üretilecek spec içinde en az şu alanlar bulunur:

- Ürün fikri özeti
- Problem
- Hedef kullanıcı
- MVP özellikleri
- Kısıtlar / notlar

## Non-Goals

Bu proje özellikle şunları yapmayı hedeflemez:

- Tam Nokta platformunu kurmak
- Ses kaydı, speech-to-text ve gelişmiş AI altyapısı eklemek
- Çok adımlı onboarding, hesap sistemi veya proje geçmişi yapmak
- Pazar analizi, rakip analizi veya doğrulama motoru eklemek
- Çok sayfalı detaylı PRD üretmek

Bu submission'ın amacı "fikir yakalama + netleştirme + tek sayfa spec" dilimini temiz şekilde sunmaktır.

## Kısıtlar / Varsayımlar

- Kullanıcı girişleri kısa metinler olarak varsayılır.
- Takip soruları sabit bir ürün mantığıyla oluşturulabilir; tam dinamik LLM kalitesi bu submission için zorunlu değildir.
- Spec çıktısı tek sayfaya sığan, hızlı okunabilir bir formatta tutulacaktır.
- Kullanıcı hesabı olmadan, lokal durum yönetimi ile çalışan bir demo yeterlidir.
- Ana başarı ölçütü, ham bir fikrin daha net ve paylaşılabilir hale gelmesidir.

## Örnek Kullanıcı Senaryosu

Üniversite öğrencisi Elif'in aklına şu fikir geliyor: "kampüste boş sınıf bulmayı kolaylaştıran bir uygulama".

Elif uygulamaya bu fikri tek cümleyle giriyor. Uygulama ona 4 soru soruyor:

- Kullanıcının yaşadığı temel sorun ne?
- Bu uygulamayı en çok kim kullanacak?
- İlk sürümde mutlaka olması gereken özellik ne?
- En büyük kısıt ne?

Elif kısa cevaplar veriyor: öğrenciler boş sınıf ararken zaman kaybediyor, hedef kullanıcı kampüsteki öğrenciler, ilk sürümde bina ve saat bazlı uygun sınıf listesi olmalı, veri güncelliği en büyük kısıt.

Uygulama bunun sonunda tek sayfalık bir özet üretiyor. Böylece Elif'in elinde artık sadece bir fikir cümlesi değil; problemi, kullanıcıyı, MVP sınırını ve riskini tanımlayan düzenli bir ürün notu oluyor.

## Bu Dilimin Neden Seçildiği

Bu dilim seçildi çünkü Nokta'nın en anlaşılır çekirdeğini temsil ediyor: ham fikri alıp daha işe yarar bir ürüne dönüştürmek. Aynı zamanda hem mobilde gösterilebilir bir akış sunuyor hem de "AI destekli netleştirme" fikrini abartmadan ispatlıyor.

Daha büyük vizyondaki marketplace, migration, due diligence veya çok ajanlı yapı gibi parçalar ilginç olsa da bu süre içinde ya yüzeysel kalacaktı ya da ürün odağını dağıtacaktı. Nokta Capture ise tek bir kullanıcı problemini net çözüyor ve Track A'nın beklentisini doğrudan karşılıyor.
