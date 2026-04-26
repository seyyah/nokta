# Nokta Away Mission — Solo Seferi (Track C)

**Öğrenci No:** 231118057  
**İsim:** Eray Çubukçu  
**Seçilen Track:** Track C — Migration & Dedup

---

## 🎯 Proje Vizyonu
**Nokta Cleaner**, dağınık fikir kırıntılarını (noktaları) analiz ederek; mükerrer kayıtları birleştiren, anlamsız verileri (slop) ayıklayan ve bunları profesyonel "İdea Kartları"na dönüştüren bir mobil kuluçka asistanıdır. Özellikle WhatsApp not dökümleri gibi karmaşık verileri "çöpsüz" bir spesifikasyona dönüştürmek için tasarlanmıştır.

---

## 🚀 Teknik Stack & Teslimat
- **Framework:** React Native + Expo
- **AI Engine:** Google Gemini 1.5 Flash (Metin işleme ve dedup mantığı için optimize edildi).
- **Styling:** NativeWind (Tailwind CSS) & StyleSheet (Minimalist Siyah-Beyaz Tema).
- **Güvenlik:** `.env` (EXPO_PUBLIC_GEMINI_API_KEY) ile API anahtarı yönetimi.

### 🔗 Linkler
- **Expo Go (Link/QR):** https://expo.dev/accounts/cubukcu/projects/expo-template-blank/builds/2eab6f1a-7642-4d09-ad2c-6c5a62e6d97c
- **60 Sn Demo Videosu:** https://www.youtube.com/watch?v=cuMZs3rzhbs
- **APK Dosyası:** `./app-release.apk` (Klasör içerisinde mevcuttur).

---

## 🛠 Decision Log (Mühendislik Kararları)

1. **Neden Track C?** Fikirlerin "slop-free" olması vizyonuna en çok hizmet eden aşamanın temizlik ve birleştirme (migration) olduğuna karar verdim. Dağınık veriyi anlamlı bir yapıya (artifact) dönüştürmek projenin bel kemiğidir.
2. **Mimari:** AI isteklerini bir `Service` katmanına (`GeminiService.js`) ayırarak kodun okunabilirliğini artırdım.
3. **API Hata Yönetimi:** Gemini API'daki 404 (Endpoint mismatch) hatalarını aşmak için kütüphane yerine doğrudan `fetch` (REST) yapısını kullanarak endpoint stabilitesini sağladım.
4. **UI Kararı:** Mobil odaklı bir deneyim için Apple tarzı minimalist, siyah-beyaz yüksek kontrastlı bir tema seçildi. Kullanıcıyı fikirlerden uzaklaştıracak görsel gürültüden kaçınıldı.

---

## 📈 Engineering Trace (Commit Disiplini)
Proje boyunca anlamlı commitlerle ilerlenmiştir:
- `fix: resolve Gemini API 404 error by forcing v1 endpoint`
- `style: fix layout overflow and align component widths`
- `feat: full application build for Track C`

---
