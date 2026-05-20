Track: B

# OkbilApp - Nokta Audit Forge Mission

## Proje Bilgileri
- **Expo Go Yayını (Update):** [Proje Linki ve QR Kod](https://expo.dev/accounts/231118058/projects/okbilapp/updates/2b2f62ae-f885-444d-917f-7ab591e75a23)
- **APK İndirme Linki:** [app-release.apk İndir](https://expo.dev/accounts/231118058/projects/okbilapp/builds/0222821d-9153-48f9-9387-455d5eaff0c4)
- **Demo Video:** [YouTube Shorts Demo - Nokta Audit Forge](https://youtube.com/shorts/amKW_w7Yock)
- **Kullanılan AI Tool:** Antigravity (Gemini 3.1 Pro)
- **Human Touch Points:** 3 
  - (Tasarım kararlarının yönünü onaylama ve çöken bir bağımlılık paketinde rollback kararı verilmesi durumlarında yapay zeka yönlendirildi)

## Decision Log (Karar Günlüğü)
- **Track B Seçimi:** Uygulamanın UX eksikliklerini ve UI iyileştirmelerini (renk, boyut, layout vb.) hedefleyen raporlar temel alınarak, widget'ın sadece bir hata yakalayıcıdan ziyade "Tasarım Asistanı" olarak kullanılmasına karar verildi. `IDEA.md` detaylarında bu vizyon açıklanmaktadır.
- **Rollback Kararı:** Education ekranındaki (bug2.md #5) "videolar açılmıyor" talebi için native modül gerektiren büyük bir güncelleme yapılması denendi. Expo Go geliştirme ortamında crash (çökme) yaşandığı için bu onarım geri alındı (rollback) ve projenin çalışır durumda kalmasına öncelik verildi.
- **Tasarım Dili ve Revizyon:** Kullanıcının "sade kalmış", "rengi hoş değil" şeklindeki doğrudan tasarım taleplerine yanıt olarak, daha premium, modern ve koyu temalı bir görünüm tercih edildi.
