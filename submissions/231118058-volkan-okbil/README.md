## Submission

- **Öğrenci no:** 231118058
- **Slug:** volkan-okbil
- **Track:** B

## Checklist

- [x] Yalnızca `submissions/<no>-<slug>/` altında değişiklik yaptım
- [x] README'de Expo QR link var
- [x] README'de 60 sn demo video linki var
- [x] `app-release.apk` klasörde mevcut
- [x] README'de decision log yazdım
- [x] Track seçimim README'de net

---

# OkbilApp - Nokta Audit Forge Mission

## Proje Bilgileri
- **Expo Go Yayını (Update):** [Proje Linki ve QR Kod](https://expo.dev/accounts/231118058/projects/okbilapp/updates/2b2f62ae-f885-444d-917f-7ab591e75a23)
- **APK İndirme Linki:** [app-release.apk İndir](https://expo.dev/accounts/231118058/projects/okbilapp/builds/0222821d-9153-48f9-9387-455d5eaff0c4)
- **Demo Video:** [YouTube Shorts Demo - Nokta Audit Forge](https://youtube.com/shorts/amKW_w7Yock)

## AI Tool Log
- **Kullanılan AI Tool'lar:** Antigravity (Gemini 3.1 Pro High)
- **Süreç & Kullanım Şekli:** Otonom AI asistanı ile uçtan uca *pair-programming* şeklinde çalışıldı. Projedeki hata tespiti, kodlama, UI revizyonları ve bağımlılık yönetimi süreçleri yapay zekanın sağladığı terminal yetkileri ve otonom döngülerle gerçekleştirildi.
- **Human Touch Points (Kritik İnsan Müdahaleleri):** 3
  1. Tasarım kararlarının yönünü belirleme ve arayüzün premium hissiyatına onay verme.
  2. Geliştirme ortamında çöken bir bağımlılık paketinin, projenin canlı durumunu bozmaması için geri alınması (rollback) kararının verilmesi.
  3. Dosya, format ve submission yapılarının son kontrollerle düzenlenmesi.

## Decision Log (Karar Günlüğü)
- **Track B Seçimi:** Uygulamanın UX eksikliklerini ve UI iyileştirmelerini (renk, boyut, layout vb.) hedefleyen raporlar temel alınarak, widget'ın sadece bir hata yakalayıcıdan ziyade "Tasarım Asistanı" olarak kullanılmasına karar verildi. `IDEA.md` detaylarında bu vizyon açıklanmaktadır.
- **Rollback Kararı:** Education ekranındaki (bug2.md 231118063 - Azra Atesoglu- Nokta Idea Processing Submission #5) "videolar açılmıyor" talebi için native modül gerektiren büyük bir güncelleme yapılması denendi. Expo Go geliştirme ortamında crash (çökme) yaşandığı için bu onarım geri alındı (rollback) ve projenin çalışır durumda kalmasına öncelik verildi.
- **Tasarım Dili ve Revizyon:** Kullanıcının "sade kalmış", "rengi hoş değil" şeklindeki doğrudan tasarım taleplerine yanıt olarak, daha premium, modern ve koyu temalı bir görünüm tercih edildi.