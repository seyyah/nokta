# NOKTA Uzay Görevi - Track A

## Track Seçimi
**Track A — Dot Capture & Enrich**

## Kullanılan AI
**Groq (Llama-3-70b-8192)** - **Modül:** AI Architect / Engineering Validator  
- **Parametreler:** Temperature: 0.3 (Deterministik ve teknik tutarlılık için)

## Proje Özeti: Nokta Gönüllü Ağı
Bu proje, yaşlı bireylerin (65+) market ihtiyaçlarını mahallelerindeki gönüllü gençlerle buluşturan dijital bir güven köprüsüdür. Projenin odak noktası, teknolojiyi yaşlılar için bir engel olmaktan çıkarıp erişilebilir bir dayanışma aracına dönüştürmektir.

## Karar Günlüğü
1. **AI Motoru Değişimi:** Fikirlerin "slop-free" ve mühendislik standartlarına uygun olması için başlangıçta Grok planlanmıştı. Ancak mobil platformdaki düşük gecikme süresi (low latency) gereksinimi ve yüksek akıl yürütme kapasitesi nedeniyle **Groq (Llama-3-70b)** API altyapısına geçiş yapıldı.
2. **Erişilebilirlik (A11y):** Hedef kitlenin fiziksel kısıtları göz önüne alınarak UI/UX tasarımı **WCAG 2.1 AA** standartlarını sağlayacak şekilde kurgulandı. Minimum 18pt font büyüklüğü, 48x48dp dokunmatik alanlar ve yüksek kontrastlı renk paleti tercih edildi.
3. **Veritabanı ve Performans:** Real-time senkronizasyon ve çevrimdışı destek için **Google Cloud Firestore** mimarisi seçildi. Konum tabanlı (Geo-query) sorgular için gerekli indeksleme yapılandırması yapılarak performans optimizasyonu sağlandı.
4. **Windows Derleme Optimizasyonu:** Windows platformundaki **MAX_PATH (260 karakter)** sınırı nedeniyle yaşanan C++ derleme (PCH) hataları, proje dizini geçici olarak kök dizine (`C:\n`) taşınarak ve `.cxx` cache temizliği yapılarak aşıldı. Bu süreç sonunda telefon mimarisine uygun (arm64-v8a) imzalı release APK üretildi.

## Demo Video ve APK Teslimatı

- **Proje APK Çıktısı:** [submissions/241478013-nokta-engineer-ai/app-release.apk](./app-release.apk)  
  *(Not: Expo Go linkleri yerine stabilite ve jüri test kolaylığı için Android Studio üzerinden alınmış imzalı Release APK sunulmuştur.)*
- **Demo Video Linki:** https://youtu.be/ybJ4fdFr8ik

## Projeyi Çalıştırma (Geliştiriciler İçin)
1. `.env` dosyanızı `EXPO_PUBLIC_GROQ_API_KEY=YOUR_API_KEY` şeklinde yapılandırın.
2. Projeyi Windows'ta derleyecekseniz, dosya yolu hatalarını önlemek için klasörü `C:\n` gibi kısa bir dizine taşıyın.
3. Bağımlılıkları yükleyin: `npm install`
4. Metro Bundler'ı başlatın: `npx expo start`
5. Native derleme için: `npx expo run:android --variant release`