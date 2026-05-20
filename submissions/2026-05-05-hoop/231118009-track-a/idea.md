# Avox AI: Yapay Zeka Destekli Proje Kuluçka ve Spesifikasyon Analizörü

## 1. Giriş ve Fikrin Doğuşu

Günümüz yazılım endüstrisinde ve girişimcilik ekosisteminde en büyük darboğazlardan biri "Boş Sayfa Sendromu"dur (Blank Page Syndrome). Birçok geliştirici, öğrenci ve ürün yöneticisi harika fikirlerle yola çıkmakta, ancak bu ham fikirleri mühendislik standartlarına uygun, uygulanabilir bir teknik dökümana (Software Requirements Specification) dönüştürürken aylar kaybetmektedir.

Özellikle teknik olmayan kurucular veya projeye yeni başlayan junior/mid-level mühendisler, projenin "Hangi veritabanı tablolarına ihtiyacı var?", "Hangi API uç noktaları (endpoints) yazılmalı?" veya "En büyük güvenlik/uygulanabilirlik riskleri neler?" gibi kritik soruları gözden kaçırmaktadır. Avox AI, bu süreci haftalardan saniyelere indirmek vizyonuyla tasarlanmıştır.

## 2. Çözüm Yaklaşımı: 4 Aşamalı Kognitif Filtre

Avox AI, basit bir "soru-cevap" botu değildir. Fikri alır ve kapsamlı bir mühendislik filtresinden geçirir:

1. **Sorgulama (Interrogation):** Kullanıcının girdiği ham fikri analiz eder ve projenin kör noktalarını bulmak için 3 kritik, projeye özel soru üretir.
2. **Sentez (Synthesis):** Kullanıcının verdiği cevapları orijinal fikirle birleştirerek derinlemesine bir bağlam (context) oluşturur.
3. **Şartname Üretimi (Specification Generation):** Sentezlenen veriyi kullanarak standartlara uygun bir teknik döküman ve "Fikir Olabilirlik Karnesi" (Scorecard) üretir.
4. **İnsan Döngüsü (Human-in-the-Loop):** Yapay zekanın ürettiği çıktıyı nihai doğru olarak kabul etmez. Kullanıcıya dökümanı inceleme, düzenleme ve nihai onayı verme yetkisi sunarak kontrolü her zaman insanda tutar.

## 3. Çekirdek Özellikler ve Değer Önerisi

- **Gerçek Zamanlı İnsan Müdahalesi:** Üretilen dökümanlar statik değildir. Kullanıcı, AI çıktısını doğrudan düzenleyebilir ve ancak onayladıktan sonra sistemde geçerli kılar.
- **Uzman Desteği (Escalation):** Dökümanın yetersiz kaldığı veya daha üst düzey bir onaya ihtiyaç duyulduğu durumlarda, "Uzmana İlet" butonu ile şartname tek tıkla e-posta üzerinden kıdemli bir mühendise/mentora yönlendirilebilir.
- **Dinamik Fikir Karnesi (Scorecard):** Projeyi üç ana metrikte 100 üzerinden puanlar:
  - *Teknik Uygulanabilirlik (Feasibility):* Mevcut donanım/yazılım limitleri dahilinde yapılabilirliği.
  - *Pazar İhtiyacı (Market Need):* Hedef kitlenin bu çözüme olan acil ihtiyacı.
  - *Orijinallik (Originality):* Pazardaki mevcut rakiplere karşı yenilikçilik dozu.
- **Platform Bağımsız Paylaşım:** Üretilen Markdown tabanlı döküman, cihazın native paylaşım yetenekleri kullanılarak anında e-posta, Slack veya WhatsApp üzerinden paylaşılabilir.

## 4. Mühendislik ve Mimari Yaklaşım

Projenin geliştirilme sürecinde modern, ölçeklenebilir ve düşük gecikmeli bir teknoloji yığını (Tech Stack) tercih edilmiştir:

- **Frontend Mimarisi:** Çapraz platform (Cross-platform) destekli, React Native (Expo) altyapısı üzerine kurulmuştur. Kullanıcı arayüzünde modern, minimalist ve "Dark Mode" odaklı bir renk paleti kullanılarak bilişsel yük azaltılmıştır.
- **Yapay Zeka Entegrasyonu:** Doğal dil işleme (NLP) gücü ve yüksek muhakeme yeteneği için **Google Gemini 2.5 Pro** modeli kullanılmıştır. JSON tabanlı kesin veri formatı (Structured Output) kullanılarak uygulamanın stabilitesi garanti altına alınmıştır.
- **Native Sistem Entegrasyonları:** Escalation (Uzmana İletme) mekanizması için cihazın yerleşik e-posta istemcileriyle React Native Linking API üzerinden haberleşen native entegrasyonlar kurulmuştur.

## 5. Pazar Analizi ve Hedef Kitle (Target Personas)

- **Yazılım Mühendisliği ve Bilgisayar Bilimleri Öğrencileri:** Bitirme projeleri veya hackathonlar için hızlıca teknik şartname hazırlamak isteyenler.
- **Bağımsız Geliştiriciler (Indie Hackers):** Hafta sonu projelerinin (side-projects) fizibilitesini ölçmek ve kodlamaya başlamadan önce yol haritası çıkarmak isteyenler.
- **Girişim Kuluçka Merkezleri (Incubators):** Kendilerine gelen yüzlerce startup fikrini hızlıca ön elemeden geçirmek ve objektif bir karne (Scorecard) ile değerlendirmek isteyen yatırımcılar/mentorlar.

## 6. Gelecek Vizyonu ve Ölçeklenebilirlik (Roadmap)

Mevcut MVP (Minimum Viable Product) aşamasından sonra Avox AI için planlanan geliştirmeler:

- **GitHub & Jira Entegrasyonu:** Üretilen spesifikasyonların tek tıkla Jira tasklarına veya GitHub Issues/Projects panolarına otomatik olarak aktarılması.
- **Sektöre Özel Modeller:** Sadece Fintech, Healthtech veya Oyun sektörüne özel, o sektörün regülasyonlarını da dikkate alan spesifik AI prompt yapıları.
- **Geçmiş Dökümanların Bulut Senkronizasyonu:** Firebase entegrasyonu ile kullanıcıların önceki analizlerini saklayabilmesi ve sonradan güncelleyebilmesi.

**Özetle Avox AI:** Sadece bir metin üreticisi değil, fikirleri sağlam temeller üzerine inşa etmeye yardımcı olan dijital bir baş mühendis (Chief Engineer) ve ürün yöneticisidir.