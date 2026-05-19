# Nokta Analyzer 🚀

Nokta Analyzer, modern startup sunumlarındaki ve projelerindeki "Slop" (aşırı mühendislik, içi boş buzzword yığınları) salgınıyla savaşmak için özel olarak tasarlanmış, yapay zeka destekli premium bir Due Diligence aracıdır. Web3 ve AI gibi altı doldurulmamış trend kavramları tarayarak dinamik bir 3D risk değerlendirmesi sunar ve duruma göre vizyoner bir mühendis mentoru ya da acımasız bir Y-Combinator yöneticisi rolünü üstlenir.

## Seçilen Track
**Track B - Slop Detector**
Bu yarışmada doğrudan yalınlığı, yüksek sadakatli (high-fidelity) UX pratiklerini ve çoklu yapay zeka personalarını merkeze alarak bu track'i seçtik. Projemizin temel odağı girişimcilik ekosistemindeki "slop" kavramına son vermektir.

## Karar Günlüğü (Decision Log)
"God Mode" seviyesinde, premium bir son kullanıcı deneyimi sunmak adına geliştirme sürecinde aşağıdaki spesifik mühendislik kararları alınmıştır:
- **3D Dairesel Skor için Reanimated:** Geleneksel ve hareketsiz düz grafikler yerine, risk skorlarını havada süzülen, neon parlaklığında 3D bir yapıya dönüştüren özel bir `react-native-reanimated` mimarisi inşa edildi.
- **Fikri Kurtar / Slop Detoks Özelliği:** Yalnızca zayıf fikirleri eleştirmekle kalmayıp, ikincil bir AI endpoint'i üzerinden "buzzword çorbasına" dönmüş projeleri ayrıştıran ve onları algoritma ile en uygulanabilir, ucuz, saf bir MVP formuna indirgeyen Slop Detoks motoru entegre edildi.
- **WhatsApp Paylaşımı için ViewShot:** Nihai sonuçların düz bir metin değil, yüksek görsel albeniye sahip bir DD (Due Diligence) raporu olarak WhatsApp ve Instagram'da paylaşılabilmesi amacıyla `react-native-view-shot` ve `expo-sharing` entegre edildi. 3D Skor görseli Native işletim sistemi seviyesinde paylaşıma hazır hale getirildi.

## Gereksinimler
Projenin jüri ve katılımcılar tarafından detaylıca incelenebilmesi için gerekli çıktılar aşağıda sunulmuştur:
- **Expo QR Linki:** "https://expo.dev/accounts/suedaknl/projects/sueda-nokta-solo/builds/84ddf828-0f86-4254-b597-1ea061191129"
- **Demo Video Linki:** (https://youtube.com/shorts/6MmNQCD3aOI)
- **APK Dosyası:** [Uygulamayı İndir (APK)](./app-release.apk)

## Kurulum
Nokta Analyzer'ı kendi lokal ortamınızda ayağa kaldırmak ve "Y-Combinator" modunun acımasızlığını bizzat test etmek için aşağıdaki talimatları izleyebilirsiniz:

1. **Bağımlılıkları Yükleyin:**
   Sisteminizde Node.js ve `npm` paket yöneticisinin kurulu olduğundan emin olun, ardından proje ana dizininde şu komutu çalıştırın:
   ```bash
   npm install
   ```

2. **Expo Geliştirme Sunucusunu Başlatın:**
   ```bash
   npx expo start
   ```

3. **Uygulamayı Test Edin:**
   - Ekranda beliren QR kodu fiziksel cihazınızdaki Expo Go uygulaması (`Android` veya `iOS`) aracılığıyla okutun.
   - Veya lokal gelişim için terminalde `i` tuşu ile iOS simülatörünü, `a` tuşu ile Android emülatörünü başlatın.
