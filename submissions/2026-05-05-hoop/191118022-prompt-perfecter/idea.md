# idea.md — Track A: Prompt Perfecter

## Fikir

Kullanici bir uygulama, urun veya proje hakkinda ham bir fikir cumlesi girer veya bunu sesiyle anlatir. Yapay zeka (GPT-5.4-mini) bu ham fikri anlamlandirmak icin 4 muhendislik sorusu sorar. Kullanicinin cevaplari isiginda tam bir "mukemmel prompt" uretir.

## Problem

İnsanlar ne istediklerini tam olarak ifade etmekte zorlanır. Özellikle AI araçlarına prompt yazarken ham düşünceler yetersiz kalır, sonuçlar hayal kırıklığı yaratır. Potansiyel olarak değerli fikirler yeterince detaylandırılamaz ve kaybolur.

## Hedef Kullanıcı

- Girişimciler (hızlı fikir prototipleme)
- Öğrenciler (proje fikirleri geliştirme)
- Tasarımcılar ve ürün yöneticiler (spec hazırlama)
- AI araçlarını kullanan herkes (daha iyi prompt yazma)

## Kapsam (Bu Versiyon)

- Tek ekranli soru-cevap akisi
- GPT-5.4-mini ile 4 muhendislik sorusu (problem, kullanici, kapsam, kisit)
- Mukemmel prompt uretimi (markdown formatinda)
- Prompt kopyalama ozelligi
- Gercek cihazda sesli fikir girisi

## Kisitlar

- Sesli giris cihazin mikrofon ve speech recognition destegine baglidir
- Internet baglantisi zorunlu (OpenAI API)

## Track A Uyumu

| Track A Gereksinimi | Uygulama |
|---|---|
| Ham fikri alır | ✅ Ana ekran metin ve ses girişi |
| 3-5 engineering soru | ✅ 4 GPT-5.4-mini destekli soru |
| Tek sayfa spec üretir | ✅ Mukemmel prompt ciktisi |

## Çılgın Bonus Capability

Mükemmel prompt üretilirken Gemini ayrıca **"slop score"** hesaplar — yani fikrin ne kadar klişe/jenerik olduğunu 0-10 skalasında değerlendirir ve orijinallik önerileri sunar. Bu Track B'nin slop detector özelliğini Track A çıktısına entegre eden cross-track bir yenilik.
