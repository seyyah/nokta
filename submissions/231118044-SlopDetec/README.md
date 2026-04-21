# Nokta - Track B (Slop Detector & Due Diligence)

## Proje Hakkında
Bu proje, Nokta ekosisteminin "Yapay Zeka" (Gemini) destekli bir değerlendirme aracıdır. Başlangıç seviyesindeki yatırım sunumlarını veya sosyal medyadan/akıldan fırlamış rastgele "fikir" metinlerini alır, analiz eder. Analiz sonucunda fikrin ayakları yere basan özelliklerine veya abartılı/buzzword ("Slop") kullanımına göre 0'dan 100'e kadar bir "Slop Score" oluşturur. Nokta ilkelerine göre fikri kısıtlamaları netleştirilmiş bir mühendislik ürününe dönüştürür.

## Karar Defteri (Decision Log)
1. **Mimari**: Hızlı prototipleme, mobil kullanılabilirlik ve Nokta'nın "ekosistem" tabanına rahat oturabilmesi için `React Native` ve `Expo` kullanılmasına karar verilmiştir.
2. **AI Modeli**: Hızlı ve maliyetsiz yanıt için `Gemini-1.5-Flash` modeli tercih edildi. Prompt zorlaması (strict JSON constraint) ile Gemini'nin doğrudan JSON formatında `slopScore`, `reason` ve `correctedPitch` dönmesi sağlandı.
3. **Ekstra Güvenlik**: API anahtarlarının Github üzerinde ifşa olmasını önlemek için `.env` ve `.gitignore` stratejisi kullanılmıştır. Projenin açık kaynak halinde sadece `.env.example` bulunmaktadır.
4. **UI/UX Tasarım**: Karanlık mod "due-diligence / yatırım platformu" hissiyatı vermek adına kullanıldı. Siyah, koyu gri ve kırmızı/yeşil neon detaylar üzerinden minimal bir arayüz geliştirildi.
5. **AI Araç Kullanımı (Tool Log)**: Geliştirme süreci boyunca Cursor, Copilot ve yerel Gemini Agent (Antigravity) araçlarından faydalanıldı. Şimdilik herhangi bir API Rate Limit aşımı yaşanmamıştır; yaşanması durumunda yerel LLM veya yedek anahtarla bir fallback planlanmıştır.

## Demo / Teslim Linkleri
- **Expo Projesi (Github):** `app/` dizininde kaynak kod bulunmaktadır. İstendiği zaman `npm install && npm run start` yapılarak Expo Go ile taranabilir.
- **Expo QR / Link:** https://expo.dev/accounts/yilmazurn/projects/app/updates/0c6d5771-5041-4913-8eff-d3fc0dc03857
- **60 Saniyelik Demo Video:** https://youtube.com/shorts/rezwkDU4qrg?feature=share
- **APK Dosyası**: `app-release.apk` kök dizinde mevcuttur.

## Kurulum ve Çalıştırma
Projeyi yerel ortamınızda ayağa kaldırmak için:

1. `app` dizinine girin: `cd app`
2. Bağımlılıkları yükleyin: `npm install`
3. API Key'i ayarlayın: `app/.env` dosyası oluşturup (örneği `app/.env.example` içinde mevcuttur) içine Gemini API anahtarınızı koyun:
   `EXPO_PUBLIC_GEMINI_API_KEY=AIzaSyA...`
4. Projeyi başlatın:
   `npx expo start` veya `npm run start`

## APK Nasıl Üretilir (Eğitmen Notu)
*(Teslim öncesi projede APK üretmek için `app/` kalsörü içinde `npx expo build:android` veya `eas build -p android --profile preview` komutlarını çalıştırıp APK'yı `app-release.apk` ismiyle ana klasöre çıkarınız.)*
