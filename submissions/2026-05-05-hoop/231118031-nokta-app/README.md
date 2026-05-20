# Proje Özeti: Nokta - Siber Güvenlik ve Olay Müdahale Asistanı

## 📝 Submission Bilgileri
- **Öğrenci no:** 231118031
- **Slug:** 231118031-nokta-app
- **Track:** B (Mobil Geliştirme ve AI Entegrasyonu)

## ✅ Checklist
- [x] Yalnızca `231118031-nokta-app` altında değişiklik yaptım.
- [x] README'de Expo QR link var.
- [x] README'de 60 sn demo video linki var.
- [x] `app-release.apk` klasörde mevcut. (Veya Drive linki eklendi)
- [x] README'de decision log yazdım.
- [x] Track seçimim README'de net.

---

### ✨ Öne Çıkan Geliştirmeler ve Özellikler
Bu proje, standart bir asistanın ötesine geçerek siber kriz anlarını yöneten bir "Human-in-the-Loop" simülasyonudur.

- **Nokta Mascot Entegrasyonu:** React Native ortamına uyarlanan animasyonlu asistan arayüzü. Kriz anında (SQL Injection, Hack vb.) görsel olarak "Uzman Modu"na (kırmızı tema) geçiş yapar.
- **Dinamik Alan Tespiti:** Kullanıcıdan gelen teknik terimleri (virus, database, phishing vb.) analiz ederek sorunun hangi siber güvenlik katmanına ait olduğunu otomatik tespit eder ve ilgili uzmana 5 saniye içinde yönlendirir.
- **Sesli Etkileşim (Voice-to-Voice):** Kullanıcıya "Mesaj ile" veya "Konuşarak" destek alma seçeneği sunar. Groq Whisper API ile sesli komutlar metne çevrilir, uzman cevapları ise sesli olarak kullanıcıya okunur.
- **Güvenlik & Role-Play:** Yapay zekanın bir siber güvenlik uzmanı rolünden çıkmasını (Prompt Injection) engelleyen katı sistem yönergeleri uygulanmıştır. Model, kod yazma taleplerini reddeder ve sadece defansif yönlendirmeler yapar.

### 🎥 Demo Videosu
Uygulamanın çalışır haldeki uzman modu geçişini ve sesli etkileşimini buradan izleyebilirsiniz:
**[Demo Videoyu İzle (YouTube)](https://youtube.com/shorts/ge9CWeWHVyY)**

### 📱 Expo QR Kodu
> Proje Expo Go üzerinden test edilebilir. Terminal: `npx expo start -c`

### 🛠 Kullanılan Teknolojiler & AI Araçları
- **Altyapı:** React Native, Expo, React Native Safe Area Context.
- **Yapay Zeka:** Groq API (Llama-3.3-70b), Groq Whisper-v3 (Ses İşleme).
- **Medya:** Expo Speech (TTS), Expo AV (Ses Kaydı).
- **Geliştirme Desteği:** Proje mimarisi, hata ayıklama ve ses modu optimizasyonlarında **Google Gemini (Antigravity AI Agent)** kullanılmıştır.

### 🤖 AI Tool Log
1. **Mimari Kurgu:** Web tabanlı mascot bileşenlerinin React Native'e port edilmesi sürecinde Gemini'dan destek alınmıştır.
2. **Debugging:** iOS/Android cihazlardaki sesin ahizeden çıkma sorunu, `setAudioModeAsync` yapılandırmasıyla AI yardımıyla çözülmüştür.
3. **Prompt Engineering:** Uzman karakterinin rolde kalma güvenliğini test etmek için AI üzerinden prompt optimizasyonu yapılmıştır.

### 📦 Uygulama APK Dosyası
🔗 **[Nokta Uygulamasını İndir (Google Drive)](https://drive.google.com/file/d/1UvqgKWH71D_CgL2AsCQj2mjs_Nuyd_0P/view?usp=sharing)**

### 📝 Decision Log (Tasarım Kararları)
1. **Verimlilik:** Hızlı prototipleme ve çapraz platform desteği için Expo altyapısı seçildi.
2. **Yapay Zeka:** Sektörün en hızlı çıkarım yapan modellerinden biri olduğu için Groq API (Llama 3.3) tercih edildi.
3. **UX Optimizasyonu:** Ses kaydı sırasında yaşanan donanımsal çakışmaları önlemek adına "Bas-Konuş" yerine "Toggle (Dokun-Başlat/Durdur)" sistemine geçildi.
4. **Ses Modu:** Kullanıcının asistanı net duyabilmesi için her AI yanıtı öncesinde sistem zorla hoparlör moduna (Speaker Mode) geçecek şekilde kodlandı.