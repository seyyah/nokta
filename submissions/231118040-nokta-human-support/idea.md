# Nokta Human Support - Uzman Destegi

## Problem

Nokta AI hizli cevap verebilir, fakat bazi kararlar tek basina AI ciktisina birakilamaz. Kullanici fikri belirsiz anlattiginda, konu hassas oldugunda veya AI guveni dusuk kaldiginda insan uzman devreye girmelidir.

## Hedef

Nokta'nin AI yanitini "son karar" olmaktan cikarip gerektiginde insan uzman kontrolune baglanan guvenli bir karar akisi kurmak.

## Kullanici

- Fikrini hizlica netlestirmek isteyen ogrenci veya girisimci
- AI cevabindan emin olamayan kullanici
- Teknik, urun, UX veya alan uzmani gorusune ihtiyac duyan kullanici

## Ana Capability

**AI + Human Handoff**

Nokta kullanicinin metnini analiz eder ve su ciktilari uretir:

- AI guven puani
- Alan siniflandirmasi
- Risk bayraklari
- Onerilen uzman tipi
- Oncelik ve donus suresi
- Insan uzmana aktarilacak kisa ozet

## Uzman Profilleri

- UX Uzmani: akis, ekran metni, kullanilabilirlik
- Urun Mentoru: MVP kapsami, oncelik, roadmap
- Teknik Uzman: API, veri, mimari, build riski
- Alan Uzmani: hukuk, saglik, finans, kisisel veri gibi hassas alanlar

## Demo Akisi

1. Uygulama acilir ve Nokta canli destek durumunu gosterir.
2. Kullanici ornek fikri yazar: "Nokta AI cevap versin ama guven dusukse insan uzmana devretsin."
3. "AI degerlendir" butonuna basilir.
4. Uygulama guven puani, oncelik, SLA ve risk bayraklarini gosterir.
5. "Insan uzmana aktar" butonuna basilir.
6. Destek bileti acilir ve uygun uzman secilir.
7. "Uzman yaniti al" ile insan uzman notu konusma kaydina eklenir.
8. Ticket kapatilir.

## Basari Olcutleri

- Kullanici tek ekrandan AI ve insan uzman modlari arasinda gecebilir.
- Hassas veya belirsiz taleplerde uzman aktarimi gorunur olur.
- Insan uzmana gonderilecek ozet otomatik hazirlanir.
- Kullanici uzman yanitini konusma kaydinda gorebilir.

## Riskler

- Gercek insan destek sistemi backend gerektirir; bu prototipte ticket akisi simule edilmistir.
- AI guven puani kural tabanlidir; gercek model entegrasyonunda ayrica rubric veya denetim katmani gerekir.
- Hassas alanlarda uygulama karar verici degil, yonlendirici olmalidir.
