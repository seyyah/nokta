# ANALYSIS_HUD_v1.0 (Slop Detector)

**Track Seçimi:** Kapsam 1 -> GenAI & Ajan Tabanlı Araçlar 

Nokta ekosistemi için tasarlanmış, sisteme girilen "slop" (düşük eforlu, aşırı hype veya halüsinasyon içeren) girişim fikirlerini filtreleyen, Parallel Audit Swarm altyapısına sahip klinik değerlendirme aracı. Tasarımı doğrudan **The Clinical Architect** Design System üzerine kuruludur.

---

## 🎥 Deneyim Videosu
[👉 60 Saniyelik Demo Videosu İçin Tıklayın](https://youtube.com/shorts/GX7u2pqKkMw?si=QdwJZhQhCzljDjD2)

---

## 📱 Expo ile Canlı Test
Expo Go uygulamanız üzerinden veya Expo sunucusuyla projeyi anında test edebilirsiniz.

[👉 Expo Proje Sayfası](https://expo.dev/accounts/mustafa1299/projects/231118012-slop-detector)

**Expo Proje URL QR Kodu:**
![Expo QR](https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://expo.dev/accounts/mustafa1299/projects/231118012-slop-detector)

*(Uygulama APK formatında oluşturulmuştur, detayları build panelinden inceleyebilirsiniz.)*

**Lokalde Çalıştırmak İçin:**
```bash
npm install
npm start
```
*(Not: Kendi Gemini API anahtarınızı oluşturacağınız `.env` dosyasında `EXPO_PUBLIC_GEMINI_API_KEY` olarak atamanız gereklidir.)*

---

## 🛠 Decision Log & Mimari Seçimler

Uygulamanın geliştirme sürecinde ürünün kalitesini ve hızını artırmak üzere aldığımız tasarım/mühendislik kararları (Decision Log):

1.  **AI Engine & Chunking Strategy (Mental Model Bölünmesi)**
    *   *Problem:* Yüksek karakterli girişim metinlerinin kaba bir şekilde Gemini'a gönderilmesi JSON parse hatalarına ve bağlam kaybına (token limit) yol açıyordu.
    *   *Karar:* String dizisi 400 karakterlik "Chunk" bloklarına ayırıldı (`maxChunk: 5`). Otonom ajan (Parallel Audit Swarm) bu parçaları sırayla işliyor ve sonuçların ortalamasını çıkarıyor.
2.  **Klinik Ekran (No-Line & Tonal Architecture)**
    *   *Problem:* Klasik bir mobil uygulama tasarımı bu "mühendislik" odaklı denetleyici hissini vermiyordu.
    *   *Karar:* `design.txt` referans alınarak **"The Clinical Architect"** teması uygulandı. Border'lar yerine Radial Glow, Glassmorphism ve Tonal Surface hiyerarşisi kullanıldı.
3.  **Tekli Skordan Multi-Parametrik Derecelendirmeye Geçiş**
    *   *Problem:* Sadece 0-100 arası tek skor, girişimin hangi açıdan yetersiz olduğunu söylemiyordu.
    *   *Karar:* Ajan promptu parçalandı ve veri katmanları `Tech-Depth`, `Market-Rationality`, `Feasibility`, ve `Originality` olarak ilerleme çubukları ile HUD arayüzüne işlendi. 
4.  **Hata Toleransı Mekanizması**
    *   *Problem:* API istekleri ağ limitasyonlarında çökebiliyordu.
    *   *Karar:* `try/catch` içerisine error fırlatıldığında `KRİTİK HATA` dönecek şekilde Safe-Fallback mekanizması yazıldı. Uygulama çökmek yerine HUD üzerinden sistem kapandı uyarısı veriyor.
