# Nokta — Spec Generator (Track A)

**Öğrenci No:** 231118054  
**Slug:** `idea-spec-ai`  
**Track Seçimi:** Track A — Dot Capture / Spec Generator

Nokta, ham fikirleri alır, onları akıllı mühendislik sorularıyla sorgular, parçalar ve tek sayfalık net bir ürün spesifikasyonuna dönüştürür. “Fikir var ama nereden başlayacağım?” kaosunu mühendislik disiplinine çevirir.

---

## 🎬 Demo & Çalıştırma

| Detay | Bağlantı / Komut |
|---|---|
| **60 sn Demo Video** | [https://www.youtube.com/shorts/1rog89oFXA8](https://www.youtube.com/shorts/1rog89oFXA8) |
| **Uygulama APK Dosyası** | [`./app-release.apk`](./app-release.apk) |

### Yerel Çalıştırma Talimatları

1. Uygulama klasörüne gidin:
   ```bash
   cd app
   ```
2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```
3. API anahtarlarınızı `.env` dosyasına yerleştirin (Gemini veya Groq key'lerinden en az birini girmeniz yeterlidir. Key girilmediğinde uygulama **Mock Demo Modu** ile simüle edilebilir):
   ```env
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_key
   EXPO_PUBLIC_GROQ_API_KEY=your_groq_key
   ```
4. Uygulamayı başlatın:
   ```bash
   npx expo start
   ```
5. Telefonunuzdaki **Expo Go** uygulaması ile ekrandaki QR kodu taratın.

---

## ⚙️ Ana Akış

1. **🟦 Idea Input:** Kullanıcı ham fikrini serbest metin olarak girer.
2. **🟨 Question Engine:** AI, fikri yüzeyden kurtarıp derine çeker ve 5 kritik mühendislik sorusu sorar:
   - Problem ne?
   - Hedef kullanıcı kim?
   - Scope ne?
   - Constraint’ler ne?
   - Bu çözüm neden gerekli?
3. **🟩 Spec Generator:** Tüm girdileri harmanlar ve tek sayfa net bir doküman üretir (Problem, Kullanıcı, Çözüm, Kapsam, Kısıtlar).
4. **🧾 Final Output:** Uygulanabilir bir ürün blueprint'i oluşturulur ve `AsyncStorage` ile yerel olarak kaydedilir.

---

## 🎨 Görsel Dil

- **Açık Arka Plan / Sade UI:** Kullanıcı dikkatini içeriğe odaklayan minimal arayüz.
- **Kart Bazlı Çıktı Yapısı:** Bilgileri gruplandıran ve okumayı kolaylaştıran modern kartlar.
- **Okunabilir Tipografi:** Gürültüsüz, net bilgi akışı sağlayan yazı tipleri.
- **Amaç:** Fikri değil, düşünceyi parlatmak.

---

## 🧱 Teknik Stack

- **React Native + Expo** (Expo Router, Expo SDK 54)
- **TypeScript**
- **AI Text Generation API** (Google Gemini & Groq direct integration)
- **AsyncStorage** (Lokal veri saklama)

---

## 🧠 Decision Log

| # | Karar | Gerekçe |
|---|---|---|
| **1** | **Track A seçildi** | Fikir → ürün dönüşümünü en net gösteren akış. |
| **2** | **Soru üretimi zorunlu** | Direkt output yerine düşünceyi derinleştirmek. |
| **3** | **Tek sayfa spec** | Fazla detay yerine uygulanabilir netlik. |
| **4** | **Yapılandırılmış çıktı** | AI kaosunu azaltmak, tutarlılık sağlamak. |
| **5** | **Minimal UI** | Kullanıcı dikkatini içeriğe odaklamak. |
| **6** | **Lokal veri saklama** | Kullanıcı fikirlerinin gizliliği ve internet bağımsızlığı. |
| **7** | **Chatbot yerine akış** | Açık uçlu sohbet yerine hedef odaklı deneyim. |

---

## ❌ Scope Dışı Bırakılanlar

- Açık uçlu chatbot (odak dağıtmamak adına)
- Multi-user / auth sistemi
- Cloud sync (veri gizliliği ve basitlik)
- Gereksiz UI animasyonları
- **Amaç:** Küçük ama keskin bir ürün üretmek.
