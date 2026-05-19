# Nokta — kişiselleştirilmiş fikir notu (Track A)

Bu submission referans implementasyon olduğu için "öğrenci kişiselleştirmesi" yerine **Nokta tezinin Track A'ya bakan kesitine** odaklanır.

## Problem

Yeni bir fikir doğduğunda — duşta, otobüste, bir konuşma kıyısında — beynin bunu **9 saniye** içinde elden kaçırır. Not aldığın anda bile fikir hâlâ **eksik** doğmuştur: kim için, hangi sınırla, neyi başarınca "tamam" denecek?

Mevcut not araçları (Apple Notes, Notion, WhatsApp self-chat) **stenograf**'tır — kelimeyi yakalar, **iskeleti** kuramaz. Sonra fikirler birbirine yapışıp slop'a dönüşür.

## Track A dilimi: Dot Capture & Enrich

Sadece **bir nokta**yı al, AI'ı bir **engineering muhabbeti** gibi konuştur, **tek sayfalık spec**'e dönüştür. Tam sistem değil — bir dilimi.

### Tasarım kararı: AI niye soru sorsun?

İki seçenek vardı:
- **(a) Generative**: ham fikri al → spec yaz. Risk: model uydurur, kullanıcının zihnindeki kısıtı ıskalar.
- **(b) Socratic**: ham fikri al → 3-5 soru sor → cevaplarla spec yaz. Risk: kullanıcı yorulur.

Track A challenge'ı (b)'yi seçmiş — bu doğru tercih. Sebebi: **fikrin sahibi kullanıcı**; AI sadece **iskelet düzeltici**. Generative path slop üretir; Socratic path **disiplin** üretir.

### Soru tipleri (system prompt'taki taksonomi)

1. **Problem** — "kimin hangi acısı?"
2. **User** — "ilk 10 kullanıcın kim, isim ver"
3. **Scope** — "MVP'de neyi YAPMAYACAKSIN?"
4. **Constraint** — "tek bir teknik kısıt seç"
5. **Success** — "bir hafta sonra hangi gözlem 'işe yaradı' der?"

Beş soru, ikisi opsiyonel. Daha fazlası → kullanıcı vazgeçer.

### Spec çıktı şablonu

```
# <başlık — fikrin 3-5 kelime özeti>

## Problem (kim için ne)
## Hedef kullanıcı (ilk 10)
## MVP scope (1 hafta)
## NE YAPMAYACAĞIZ
## Tek teknik kısıt
## Başarı sinyali (1 hafta sonra)
## Risk (1 paragraf)
## Bir sonraki adım (somut, bugün)
```

Sekiz başlık. Her biri **çıkış kriteri** olan bir bölüm. Spec **yarın hâlâ okunabilir** olsun diye tasarlandı — submission'larda yaygın "AI text dump" şablonu reddedildi.

## Anti-slop kuralları (system prompt'a gömülü)

- "Asla **uydur**ma — kullanıcının söylemediği bir kullanıcı, sayı, teknoloji yazma"
- "**Generic** ifadeler yasak: 'kullanıcı dostu', 'modern', 'çığır açan'"
- "Cevap vermek için yeterli bilgi yoksa **ek soru sor**, spec yazma"
- "Spec'in her bölümü **somut bir cümle** ile başlasın"

## Ölçü: bu spec ne kadar **anti-slop**?

Demo gününde: kullanıcı specsini başkasına gösterip "bu kimin için, neyi yapacak?" diye sorduğunda **5 saniyede** cevap verebiliyorsa **iyi**. Veremiyorsa spec slop.
