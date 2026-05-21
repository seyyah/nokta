# Nokta - Forge Döngüsü Raporu (FORGE.md)

Aşağıda uygulamanın "Idea -> Soru-Cevap -> Spec" (Kıvılcım) döngüsünün test sonuçları ve logları yer almaktadır. Audit raporları sesli olarak (STT) sisteme girilmiş ve yapay zeka agent'ı tarafından işlenmiştir.

---

### [20dk] Cycle 1: Başarılı Döngü (Fitness Asistanı)
* **Girdi (Sesli):** "Kullanıcıların spor salonundaki aletleri kullanırken doğru postürü sağlayıp sağlamadığını kameradan takip eden bir fitness asistanı."
* **AI Soruları:** Hedef kitle, Kamera donanım kısıtlamaları, Veri gizliliği, Temel Özellikler.
* **Kullanıcı Yanıtı:** "Kamera sadece cihazda lokal işleme yapacak, buluta görüntü gitmeyecek. Hedef kitle yeni başlayan sporcular."
* **Sonuç (SUCCESS):** AI yanıtları yeterli buldu. Skor: **85/100**. 
* **Çıktı:** 1 sayfalık detaylı PRD (Product Requirements Document) başarıyla üretildi.

---

### [20dk] Cycle 2: Rollback (Kötü Yanıtlar)
* **Girdi (Sesli):** "Öğrenciler için üniversite kampüsündeki yemekhane menüsünü gösteren basit bir uygulama."
* **AI Soruları:** Veri kaynağı, Kullanıcı etkileşimi, Backend yapısı, Kısıtlamalar.
* **Kullanıcı Yanıtı:** "Bilmiyorum, sadece menü gözüksün. Gerisine gerek yok."
* **Sonuç (ROLLBACK):** AI detayları yetersiz buldu. Skor: **35/100**.
* **Aksiyon:** Avatar ekranda belirip "Cevapların yetersiz kaldı. Lütfen veri kaynağı ve backend yapısı hakkında daha detaylı bilgi ver" diyerek beni önceki ekrana (QuestionsScreen) geri gönderdi.

---

### [20dk] Cycle 3: Başarılı Döngü (Düzeltilmiş Yanıtlar)
* **Girdi:** (Aynı Yemekhane Uygulaması - Rollback Sonrası)
* **Kullanıcı Yanıtı:** "Verileri üniversitenin resmi web sitesinden Node.js ile günde bir kez scrape (kazıyarak) edeceğiz. MongoDB'de tutacağız."
* **Sonuç (SUCCESS):** AI spesifik yanıtları kabul etti. Skor: **78/100**.
* **Çıktı:** Yemekhane menüsü uygulaması için PRD üretildi.

---

### [20dk] Cycle 4: STUCK Durumu ve Uzmana Bağlanma (FailCount >= 2)
* **Girdi (Sesli):** "Kuantum bilgisayarlar için blokzinciri tabanlı merkeziyetsiz bir şifreleme algoritması platformu."
* **AI Soruları:** Kuantum dirençli algoritmalar, Node donanımı, TPS beklentisi, Hedef Kitle.
* **Kullanıcı Yanıtı 1:** "Normal kripto para gibi olacak ama kuantum için." (Skor: 20 - Rollback 1)
* **Kullanıcı Yanıtı 2:** "Bilmiyorum, şifrelesin yeter." (Skor: 15 - Rollback 2)
* **Sonuç (STUCK):** Sistem art arda iki başarısız deneme tespit etti (`failCount = 2`).
* **Aksiyon:** Yapay zeka avatarı "Görünüşe göre bu fikri tanımlamakta zorlanıyoruz. Seni bir Uzman Köprüsü'ne aktarıyorum" uyarısı vererek Jitsi WebRTC arayüzünü (Expert Bridge) başlattı. Görüşme logları `BRIDGE.md` dosyasına kaydedildi.
