# NOKTA - AI Destekli Not Derleyici ve Fikir Kartları

**Seçilen Track:** 3 (Not dökümünden idea card'lara ayırma)

## Proje Bağlantıları
- **Expo Linki:** [https://youtube.com/shorts/JGGdZsjDPfs](https://youtube.com/shorts/JGGdZsjDPfs)
- **60 Saniyelik Demo Video Linki:** [https://youtube.com/shorts/JGGdZsjDPfs](https://youtube.com/shorts/JGGdZsjDPfs)

---

## Decision Log (Karar Defteri)

Bu bölümde, projenin geliştirme sürecinde alınan kritik mühendislik kararları ve uygulanan teknik stratejiler yer almaktadır:

### 1. Model Seçimi ve AI Entegrasyonu
Sistemin çekirdeğinde **Gemini 2.5 Flash** modeli konumlandırılmıştır. Bu modelin tercih edilme sebebi, karmaşık ve yapılandırılmamış metin verilerini (WhatsApp dökümleri, ham notlar vb.) yüksek doğruluk oranı ve son derece düşük gecikme süresiyle işleyebilmesidir. Prompt mühendisliği katmanında yapılan optimizasyonlar sayesinde, modelin sadece özet çıkarması değil, aynı zamanda bağlamsal çıkarımlar yaparak veriyi yapılandırması sağlanmıştır.

### 2. Dinamik Etiket (Tag) Sistemi
Kullanıcı deneyimini otomatize etmek amacıyla "Context-Aware Tagging" yapısı kurulmuştur. AI promptu üzerinde yapılan güncellemelerle, sistem her notun ana temasını analiz eder ve içeriğe uygun dinamik etiketler üretir. Bu mimari, manuel kategorizasyon ihtiyacını ortadan kaldırarak veritabanı sorgularında ve kullanıcı arayüzündeki filtreleme işlemlerinde büyük bir hız avantajı sağlamıştır.

### 3. UI/UX İyileştirmeleri ve Görsel Hiyerarşi
Uygulamanın arayüzü, "Bilişsel Yükü Azaltma" prensibiyle yeniden tasarlanmıştır. Minimalist bir yaklaşım sergilenerek, ham metin yığınları görsel olarak zengin "Fikir Kartları" (Idea Cards) haline getirilmiştir. Tipografi ve renk paleti, uzun süreli okumalarda göz yorgunluğunu minimize edecek şekilde optimize edilmiştir.

### 4. Native 'Share' API Entegrasyonu
Üretilen fikirlerin ekosistem dışına hızlıca aktarılabilmesi için işletim sisteminin native **Paylaş (Share) API**'si entegre edildi. Bu sayede kullanıcılar, AI tarafından rafine edilen notlarını tek bir dokunuşla profesyonel bir formatta diğer platformlara (mesajlaşma uygulamaları, e-posta, not tutma araçları) aktarabilmektedir.
