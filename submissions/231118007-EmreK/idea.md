# Özelleştirilmiş Fikir - Track 1

## Konsept
Bu proje, kullanıcıların ham fikirlerini alarak onları bir ürüne dönüştürme yolculuklarını hızlandıran bir mobil aracı hedefler. Kullanıcı bir fikri metin olarak yazar. Yapay Zeka (AI) bu fikri analiz eder ve fikri daha sağlam temellere oturtmak için eksik kalan parçaları (Problem, User, Scope, Constraint) bulmak adına 3-5 mühendislik veya iş sorusu sorar. Kullanıcının bu sorulara verdiği cevaplar üzerinden son aşamada tek sayfalık net bir ürün spesifikasyon (Spec) dokümanı oluşturulur.

## Kullanım Senaryosu (User Flow)
1. **Girdi Aşaması:** Kullanıcı uygulamaya girer ve "Bir fikrim var..." ekranına aklındaki projeyi yazar (örn: "Öğrencilerin kampüs içinde eşyalarını alıp satabileceği bir uygulama").
2. **AI Analizi & Soru Aşaması:** Uygulama fikri alır ve asenkron olarak arka planda AI ile işler. Ekrana şu tarz sorular getirir:
   - "Ana problem kimin problemi? Sadece üniversite öğrencileri mi?"
   - "Ödeme sistemi uygulama içinde mi olacak, elden teslim mi?"
   - "En büyük kısıt (constraint) güvenlik mi, lojistik mi?"
3. **Cevaplama Aşaması:** Kullanıcı bu sorulara kısa kısa yanıtlar verir.
4. **Spec Üretimi:** AI son bir işlemle kullanıcının cevaplarını sentezler ve "Tek Sayfa Ürün Spec" (One-Pager Spec) üretir. Bu belge vizyonu, temel özellikleri ve kullanıcı profillerini barındırır.

## Yapay Zeka (AI) Entegrasyon Modeli
- **Prompt Mühendisliği:** AI servisine gönderilen ana komut, fikri "problem, hedef kitle, kapsam ve kısıtlamalar" çerçevesinde ele alacak sorular üretmesi için özelleştirilmiştir.
- **Spec Promptu:** İkinci aşamada ise tüm konuşma geçmişi (fikir + sorular + cevaplar) gönderilerek Markdown formatında yapılandırılmış bir Spec belgesi üretmesi istenir.

Bu özellik, fikirlerin soyutluktan çıkarılıp harekete geçilebilir bir iş planına dönüşmesini sağlar.
