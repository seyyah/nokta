# Nokta Mascot - Human Expert Support

## Submission

- **Öğrenci no:** 231118033
- **Slug:** nokta-mascot-human-support
- **Track:** A - Dot Capture & Enrich

---

## Proje Özeti

Bu teslimde Nokta Mascot projesi çalıştırılmış ve projeye **insan / uzman desteği talebi** özelliği eklenmiştir.

Nokta Mascot; React, Vite ve Three.js ile geliştirilmiş, mobil uyumlu, 3D etkileşimli bir yapay zeka asistanıdır. Projede Groq Llama 3 tabanlı yapay zeka cevapları, Web Speech API ile ses tanıma ve sesli cevap özellikleri kullanılmaktadır.

Eklenen özellik sayesinde kullanıcı yapay zeka asistanı ile konuşurken ihtiyaç duyduğu anda **Uzman** butonuna basarak insan desteği talebi oluşturabilir.

---

## Track Seçimi

Seçilen track:

**Track A - Dot Capture & Enrich**

Bu track seçilmiştir çünkü proje, kullanıcıdan gelen fikirleri veya sorunları yapay zeka destekli bir etkileşimle anlamaya, yapılandırmaya ve gerektiğinde insan uzman desteğine yönlendirmeye odaklanmaktadır.

---

## Eklenen Özellik: İnsan / Uzman Desteği

Projeye alt menüde görünen **Uzman** butonu eklenmiştir.

Kullanıcı bu butona bastığında sistem otomatik olarak bir uzman destek talebi oluşturur ve sohbet ekranına aşağıdaki bilgileri ekler:

- Talep numarası
- Talep durumu
- Görüşmenin uzman tarafından incelenmek üzere hazırlandığı bilgisi

Örnek çıktı:

```text
Insan uzman destegi talebiniz olusturuldu.
Talep No: 1778449238191
Durum: Beklemede
Gorusme ozeti bir uzman tarafindan incelenmek uzere hazirlandi.

Bu özellik gerçek zamanlı canlı destek sistemi yerine MVP düzeyinde bir uzman destek talebi akışı olarak tasarlanmıştır.

Klasör Yapısı
submissions/
└── 231118033-nokta-mascot-human-support/
    ├── README.md
    ├── idea.md
    └── app/
        ├── package.json
        ├── package-lock.json
        ├── vite.config.js
        ├── index.html
        ├── public/
        └── src/
            ├── App.jsx
            ├── App.css
            ├── Brain.js
            ├── Voice.js
            ├── NoktaAvatar.jsx
            ├── index.css
            └── main.jsx
Kullanılan Teknolojiler
React
Vite
Three.js
@react-three/fiber
@react-three/drei
Groq Llama 3
Web Speech API
Local HTTPS / Vite SSL
Kurulum
cd submissions/231118033-nokta-mascot-human-support/app
npm install
Ortam Değişkeni

app klasörü içinde .env dosyası oluşturulmalıdır.

VITE_GROQ_API_KEY=your_groq_api_key_here

Not: .env dosyası güvenlik nedeniyle GitHub'a yüklenmemelidir.

Çalıştırma
npm run dev -- --host

Tarayıcıdan açmak için:

https://localhost:5173/

Mobil cihazdan test etmek için terminalde görünen Network adresi kullanılabilir.

Örnek:

https://192.168.x.x:5173/

	Demo Video  

60 saniyelik demo video linki:https://youtube.com/shorts/ncLvycU009A



Demo videosunda gösterilenler:

Projenin çalıştırılması
3D Nokta karakterinin açılması
Yapay zeka cevabının alınması
Yazılı / sesli etkileşim
Uzman butonuna basılarak insan desteği talebinin oluşturulması

Test Edilen Özellikler
3D Nokta karakteri çalışıyor.
Yapay zeka cevapları çalışıyor.
Sesli asistan çalışıyor.
Mobil arayüz çalışıyor.
Karakter etkileşimleri çalışıyor.
Uyku modu çalışıyor.
Kızgınlık tepkisi çalışıyor.
Sevme / kalp efekti çalışıyor.
Uzman desteği talebi oluşturulabiliyor.
Uzman Desteği Akışı
Kullanıcı Nokta ile konuşur.
Kullanıcı ihtiyaç duyarsa Uzman butonuna basar.
Sistem bir talep numarası oluşturur.
Sohbet alanına uzman desteği talep mesajı eklenir.
Talep durumu Beklemede olarak gösterilir.
Decision Log
Nokta Mascot projesi React + Vite web uygulaması olarak çalıştırıldı.
Groq API anahtarı .env dosyasında tutuldu.
Güvenlik nedeniyle .env dosyası GitHub'a eklenmedi.
node_modules klasörü GitHub'a eklenmedi.
Hocanın istediği insan desteği şartı için MVP düzeyinde Uzman Desteği Talebi akışı eklendi.
Gerçek zamanlı canlı destek için backend, kullanıcı hesabı, uzman paneli ve veritabanı gerektiğinden bu sürümde arayüz üzerinden talep oluşturma yaklaşımı tercih edildi.
Uzman desteği butonu App.jsx içerisine eklendi.
Kullanıcı butona bastığında sohbet alanında talep numarası ve bekleme durumu gösterilecek şekilde akış tasarlandı.
AI Tool Log

Kullanılan araçlar:

ChatGPT: Kurulum adımlarını takip etmek, hata çözmek, uzman / insan desteği akışını tasarlamak, README.md ve idea.md içeriklerini hazırlamak için kullanıldı.
Groq API: Nokta Mascot içerisindeki yapay zeka cevapları için kullanıldı.
Git / GitHub: Fork, commit, push ve pull request süreci için kullanıldı.
Vite Dev Server: Projeyi yerel ortamda test etmek için kullanıldı.
Chrome DevTools: Hata kontrolü ve tarayıcı konsolu üzerinden debug işlemleri için kullanıldı.
Checklist
 Yalnızca submissions/231118033-nokta-mascot-human-support/ altında değişiklik yaptım
 README'de Expo QR link alanı var
 README'de 60 sn demo video linki var
 app-release.apk için beklenen konum README'de belirtildi
 README'de decision log yazdım
 Track seçimim README'de net