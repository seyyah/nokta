# Nokta Human Support - Uzman Desteği

## Problem

Nokta AI hızlı cevap verebilir, fakat bazı kararlar tek başına AI çıktısına bırakılamaz. Kullanıcı fikri belirsiz anlattığında, konu hassas olduğunda veya AI güveni düşük kaldığında insan uzman devreye girmelidir.

## Hedef

Nokta'nın AI yanıtını "son karar" olmaktan çıkarıp, gerektiğinde insan uzman kontrolüne bağlanan güvenli bir karar akışı kurmak.

## Kullanıcı

- Fikrini hızlıca netleştirmek isteyen öğrenci veya girişimci
- AI cevabından emin olamayan kullanıcı
- Teknik, ürün, UX veya alan uzmanı görüşüne ihtiyaç duyan kullanıcı

## Ana Capability

**AI + Human Handoff**

Nokta kullanıcının metnini analiz eder ve şu çıktıları üretir:

- AI güven puanı
- Alan sınıflandırması
- Risk bayrakları
- Önerilen uzman tipi
- Öncelik ve dönüş süresi
- İnsan uzmana aktarılacak kısa özet

## Uzman Profilleri

- UX Uzmanı: Akış, ekran metni, kullanılabilirlik
- Ürün Mentoru: MVP kapsamı, öncelik, roadmap
- Teknik Uzman: API, veri, mimari, build riski
- Alan Uzmanı: Hukuk, sağlık, finans, kişisel veri gibi hassas alanlar

## Demo Akışı

1. Uygulama açılır ve Nokta canlı destek durumunu gösterir.
2. Kullanıcı örnek fikri yazar: "Nokta AI cevap versin ama güven düşükse insan uzmana devretsin."
3. "AI değerlendir" butonuna basılır.
4. Uygulama güven puanı, öncelik, SLA ve risk bayraklarını gösterir.
5. "İnsan uzmana aktar" butonuna basılır.
6. Destek bileti açılır ve uygun uzman seçilir.
7. "Uzman yanıtı al" ile insan uzman notu konuşma kaydına eklenir.
8. Ticket kapatılır.

## Başarı Ölçütleri

- Kullanıcı tek ekrandan AI ve insan uzman modları arasında geçebilmeli.
- Hassas veya belirsiz taleplerde uzman aktarımı görünür olmalı.
- İnsan uzmana gönderilecek özet otomatik hazırlanmalı.
- Kullanıcı uzman yanıtını konuşma kaydında görebilmeli.

## Riskler

- Gerçek insan destek sistemi backend gerektirir; bu prototipte ticket akışı simüle edilmiştir.
- AI güven puanı kural tabanlıdır; gerçek Groq entegrasyonunda model confidence yerine değerlendirme rubric'i kullanılmalıdır.
- Hassas alanlarda uygulama karar verici değil, yönlendirici olmalıdır.
