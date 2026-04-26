# idea.md — Track A: Prompt Perfecter

## Fikir

Kullanıcı bir uygulama, ürün veya proje hakkında ham bir fikir cümlesi girer. Yapay zeka (GPT-5.4-mini) bu ham fikri anlamlandırmak için 4 mühendislik sorusu sorar. Kullanıcının cevapları ışığında tam bir "mükemmel prompt" üretir.

## Problem

İnsanlar ne istediklerini tam olarak ifade etmekte zorlanır. Özellikle AI araçlarına prompt yazarken ham düşünceler yetersiz kalır, sonuçlar hayal kırıklığı yaratır. Potansiyel olarak değerli fikirler yeterince detaylandırılamaz ve kaybolur.

## Hedef Kullanıcı

- Girişimciler (hızlı fikir prototipleme)
- Öğrenciler (proje fikirleri geliştirme)
- Tasarımcılar ve ürün yöneticiler (spec hazırlama)
- AI araçlarını kullanan herkes (daha iyi prompt yazma)

## Kapsam (Bu Versiyon)

- Tek ekranlı soru-cevap akışı
- GPT-5.4-mini ile 4 mühendislik sorusu (problem, kullanıcı, kapsam, kısıt)
- Mükemmel prompt üretimi (markdown formatında)
- Prompt kopyalama özelliği

## Kısıtlar

- Sadece metin girişi (ses Track A bonus scope'u — bu versiyonda değil)
- Internet bağlantısı zorunlu (OpenAI API)

## Track A Uyumu

| Track A Gereksinimi | Uygulama |
|---|---|
| Ham fikri alır | ✅ Ana ekran metin girişi |
| 3-5 engineering soru | ✅ 4 Gemini destekli soru |
| Tek sayfa spec üretir | ✅ Mükemmel prompt + görsel çıktı ekranı |

## Çılgın Bonus Capability

Mükemmel prompt üretilirken Gemini ayrıca **"slop score"** hesaplar — yani fikrin ne kadar klişe/jenerik olduğunu 0-10 skalasında değerlendirir ve orijinallik önerileri sunar. Bu Track B'nin slop detector özelliğini Track A çıktısına entegre eden cross-track bir yenilik.
