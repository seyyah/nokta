# NOKTA Spec-Agent v3.0 - Track 1

**Öğrenci:** Utku Uzun  
**Öğrenci No:** 231118062  
**Seçilen Track:** Track A (Spec-Agent)

## 🎥 Demo Videosu
https://youtube.com/shorts/-003udxYV78

## 📱 Expo & APK
- **Expo QR/Project Link:** [Buraya Expo projenin linkini veya 'APK klasörde mevcuttur' ibaresini ekle]
- **Android APK:** `app-release.apk` dosyası aynı klasörde yer almaktadır.

## 📋 Decision Log (Karar Günlüğü)
1. **Model Seçimi:** Ham fikirleri analiz edip mühendislik kısıtlarını (problem, user, scope, constraint) en doğru şekilde çıkarabilmek için akıl yürütme yeteneği yüksek olan **Gemini 3 Flash Preview** modeli tercih edildi.
2. **Mimari:** "Slop" oluşumunu engellemek adına serbest chat yerine, kullanıcıyı adım adım engineering sorularına (3-5 soru) yönlendiren bir **Agentic Workflow** kurgulandı.
3. **UI/UX:** Hızlı prototipleme ve kolay dağıtım için **React Native (Expo)** kullanıldı. Üretilen spec çıktılarının paylaşılabilir olması için Native Share API entegrasyonu sağlandı.
4. **Güvenlik:** API anahtarlarının açıkta kalmaması için `env` yönetimi planlandı ve demo sürümünde anahtarlar maskelendi.

## 📂 Dosya Yapısı
- `app/`: Kaynak kodlar
- `idea.md`: Nokta Ekosistem Spektoskopisi
- `app-release.apk`: Test edilebilir Android çıktısı