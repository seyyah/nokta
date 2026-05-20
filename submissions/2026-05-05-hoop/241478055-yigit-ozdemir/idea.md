# Nokta - Track A: Dot Capture & Enrich

## 1. Misyon
Nokta projesinin kalbi, "ham fikri (noktayı) yakalamak ve onu slop'tan arındırılmış bir bütüne (spec) çevirmektir". Bu doğrultuda Track A, kullanıcıların akıllarına gelen dağınık, ham ve yüzeysel fikirleri (text veya ses formatında) saniyesinde yakalayan; ancak bu fikrin "ucuz bir jenerasyona" (slop) dönüşmesine izin vermeden otonom bir ajanla kuluçkalayan ana giriş kapısıdır.

## 2. Problem
Girişimciler ve üretici zihinler fikirlerini çoğunlukla WhatsApp kendime mesaj, Evernote veya Apple Notes gibi ortamlara "tek cümle" olarak atarlar. Ancak bu fikirler hiçbir zaman mühendislik süzgecinden geçmez, sınanmaz ve ölü bir metin yığını olarak kalır. Eğer bu fikri basit bir LLM'e sorarsanız, size saniyeler içinde ayağı yere basmayan, "slop" (çöp/yığın) dolu uzun jenerik metinler verir. Ortada gerçek bir "spesifikasyon" yoktur.

## 3. Nasıl Çalışır (Engineering-Guided Akış)
Track A bu sürtünmeyi şu şekilde çözer:
1. **Capture (Yakalama):** Kullanıcı fikrini ister yazarak ister sesli (Whisper AI destekli) olarak Nokta'ya bırakır.
2. **Enrich (Zenginleştirme & Kuluçka):** Nokta, fikri anında onaylayıp sahte bir coşku yaratmak yerine, uzman bir ürün yöneticisi / baş mühendis gibi davranır. Kullanıcıya hedef odaklı 3-5 adet kısıtlayıcı soru sorar:
   - *Problem tam olarak kimin için çözülüyor?*
   - *Bu çözümün temel kısıtlamaları (constraint) nelerdir?*
   - *Kapsam (scope) nereye kadar uzanıyor?*
3. **Artifact (Otonom Tasdik):** Kullanıcının verdiği cevaplar bağlamında, Nokta artık havada uçuşan o fikri tek sayfalık, yapılandırılmış, slop-free ve yatırıma/geliştirmeye hazır bir "Artifact" (Spesifikasyon) haline getirir.

## 4. Orijinallik ve "Anti-Slop" Felsefesi
Bu modül, basit bir "chatbot" arayüzü değildir. Girdiği her etkileşimde amacı sohbeti uzatmak değil, fikri sınırlandırmak ve somutlaştırmaktır. Açık uçlu diyaloglardan kaçınır, kullanıcıyı doğrudan bir mimari taslak inşa etmeye zorlar. Bu sayede üretilen sonuç, herhangi bir yatırımcının veya mühendislik ekibinin "due-diligence" (değerlendirme) yapabileceği kalibrede bir ürün spesifikasyonu olur.
