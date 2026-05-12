# Nokta - Yapay Zeka Hukuk Danışmanı

Nokta, kullanıcıların hukuki süreçlerini anlamalarına, hukuki dillerini basitleştirmelerine ve vaka özetleri (brif) oluşturmalarına yardımcı olan gelişmiş bir mobil uygulamadır. React Native ve Expo altyapısı ile geliştirilmiştir.

## Özellikler

- **Offline (Çevrimdışı) Hukuk Kütüphanesi:** Sistem, internete veya bir API bağlantısına ihtiyaç duymadan "Miras Hukuku", "Boşanma", "Kira Tahliyesi", "İş Hukuku" gibi birçok temel konuda RAG (Retrieval-Augmented Generation) benzeri akıllı kelime ve bağlam taraması yaparak anında bilgi verir.
- **Güvenli Yönlendirme:** Kullanıcının sorusu sistemde yer almıyorsa veya çok riskli (ceza, büyük tazminat vb.) bir durumu içeriyorsa sistem yanıt vermez, kullanıcıyı doğrudan uzman bir avukata yönlendirir.
- **Vaka Özeti (Brif) Çıkarıcı:** Karmaşık hukuki olayları "Olaylar, Taraflar, Aşama, Deliller, Talep" şeklinde maddelendirir.
- **Premium Işık Teması (Light Mode):** Şık, aydınlık ve kullanıcıyı yormayan "slate ve blue" renk paleti ile ultra modern arayüz tasarımı.

## Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyebilirsiniz:

1. Depoyu klonlayın:
```bash
git clone https://github.com/rabiaozbir7-netizen/Hukuk-dan-man-.git
cd Hukuk-dan-man-
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Expo sunucusunu başlatın:
```bash
npx expo start
```
Uygulamayı Expo Go uygulaması ile telefonunuzda veya web tarayıcınızda görüntüleyebilirsiniz.

## Teknolojiler

- **React Native & Expo:** Mobil uygulama altyapısı.
- **TypeScript:** Tip güvenliği.
- **React Native Reanimated:** Akıcı UI geçişleri ve animasyonlar.
- **Özel Bilgi Veritabanı:** Yerel ortamda RAG mimarisine benzer kelime taramalı hukuk motoru.

## Önemli Not
Uygulama, profesyonel hukuki danışmanlık hizmetinin yerini tutmaz. Uygulamanın temel amacı vatandaşların hukuki süreçlere ön hazırlık yapması ve terimleri daha rahat anlamasıdır.
