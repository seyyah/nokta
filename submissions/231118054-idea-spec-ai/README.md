Track: A

# Nokta Audit-Forge — 231118054-idea-spec-ai

Nokta, ham fikirlerinizi yapılandırılmış mühendislik sorularıyla rafine eden ve yerel olarak slop-free spesifikasyon dokümanları üreten akıllı bir mobil asistandır.

Bu sürümde, uygulamaya izole edilmiş `@xtatistix/mobile-audit` denetim widget'ı entegre edilmiş ve test süreçleri otonom şekilde yürütülmüştür.

---

## 📽️ Demo & Yayın Bilgileri

* **Demo Video Linki:** [YouTube Demo Videosu](https://www.youtube.com/shorts/1rog89oFXA8)
* **Prebuilt APK Konumu:** [app-release.apk](./app-release.apk)
* **Expo Yayın Adresi:** [expo.dev/@esratkl/nokta-audit](https://expo.dev/@esratkl/nokta-audit)

---

## 🧭 Tercih Edilen Kulvar (Track Selection)

Bu teslimatta **Track: A (Sadelik / Sparsity — Drop-in Isolation Widget)** tercih edilmiştir.
* Proje arayüzü ve akışları minimal, esnek tutulmuş; harici karmaşık paket bağımlılıkları en aza indirilmiştir.
* `@xtatistix/mobile-audit` widget'ı, host uygulamanın sınırlarına saygı duyacak şekilde (host application boundary) drop-in olarak eklenmiş ve tüm yerel dosya sistemi (`expo-file-system`), ekran yakalama (`react-native-view-shot`), paylaşım (`expo-sharing`) ve depolama (`AsyncStorage`) bağımlılıkları widget'a harici olarak (`deps` prop aracılığıyla) enjekte edilmiştir.

---

## 📝 Karar Günlüğü (Decision Log)

### 📌 Karar 1: TypeScript skipLibCheck ve node_modules Exclude Ayarlaması
* **Gerekçe:** `@xtatistix/mobile-audit` paketi raw TypeScript (.tsx) kaynak dosyalarıyla sevk edilmektedir. Proje derleme adımında `StyleSheet.absoluteFill` gibi kütüphane içi bazı tip uyuşmazlıkları derleme hatasına yol açmıştır.
* **Karar:** `tsconfig.json` dosyasında `"skipLibCheck": true` ayarlanmış ve `node_modules` klasörü `exclude` listesine eklenmiştir. Ayrıca widget içindeki ilgili tip uyuşmazlığı olan dosyaya `// @ts-nocheck` enjekte edilerek derleme sorunları aşılmıştır.

### 📌 Karar 2: Yerel Paylaşım API'si Entegrasyonu
* **Gerekçe:** Üretilen spesifikasyonların test edilmesinin ardından dışarıya aktarılması ve kullanıcılarca kolayca kullanılabilmesi için bir paylaşım katmanı eklenmesi gerekiyordu.
* **Karar:** `spec.tsx` (Details Screen) üzerinde React Native'in yerleşik `Share` API'si kullanılarak tek tıkla spec metnini kopyalama ve paylaşma butonu eklenmiştir.

### 📌 Karar 3: Onboarding Geri Dönüş Butonu
* **Gerekçe:** Uygulama ilk açılışta onboarding ekranını gösterip kaydettikten sonra bir daha gösterilmiyordu. Test ekibinin onboarding tasarımını tekrar denetleyebilmesi için ana sayfada bir kılavuz yardım butonu ihtiyacı doğdu.
* **Karar:** Ana sayfa header'ına eklenen `help-circle` ikonu aracılığıyla kullanıcının istediği an onboarding ekranını tekrar açabilmesi sağlanmıştır.
