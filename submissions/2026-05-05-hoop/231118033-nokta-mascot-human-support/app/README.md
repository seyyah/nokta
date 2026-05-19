<div align="center">
  <img src="src/assets/hero.png" alt="Nokta Mascot" width="300"/>
  <h1>Nokta Mascot - Web AI Assistant 🎙️🤖</h1>
  <p><i>A Mobile-First, 3D Interactive AI Assistant / Mobil Uyumlu 3D Etkileşimli Yapay Zeka Asistanı</i></p>
</div>

---

## 🇹🇷 Türkçe (Turkish)

Nokta Mascot, React, Vite ve Three.js kullanılarak geliştirilmiş mobil uyumlu, 3D etkileşimli bir yapay zeka asistanıdır. Konuşma tabanlı yapay zeka modeli (Groq Llama 3) kullanır ve ses tanıma / ses sentezleme için Web Speech API entegrasyonuna sahiptir.

### 🚀 Özellikler
- **3D Etkileşimli Karakter:** `@react-three/fiber` ve `@react-three/drei` ile tasarlandı.
- **Duygu ve Tepkiler:** 
  - **Uyku Modu:** 10 saniye işlem yapılmazsa uykuya dalar (Zzz animasyonu).
  - **Kızgınlık:** Üst üste 3 kez hızlıca tıklandığında sinirlenir 💢.
  - **Sevme/Okşama:** Fare veya parmağınızla karakterin üzerinde gezindiğinizde mutlu olur ve kalpler çıkarır ❤️.
  - **Konuşma:** Ses seviyesine göre dudak senkronizasyonu yapar.
- **Mobil Arayüz:** Modern, alt kısımda yer alan kayan (floating) mikrofon ve sohbet arayüzü.
- **Ses Entegrasyonu:** iOS/Safari zorunlulukları dahil tüm tarayıcılarda çalışabilen ses tanıma ve okuma altyapısı.
- **Yerel HTTPS:** `@vitejs/plugin-basic-ssl` sayesinde cep telefonlarından mikrofona erişim sağlamak için yerel ağda güvenli HTTPS bağlantısı sunar.

### 🛠️ Kurulum ve Çalıştırma
1. **Gereksinimleri Yükleyin:**
   ```bash
   npm install
   ```
2. **Ortam Değişkenleri:**
   Ana dizinde bir `.env` dosyası oluşturun ve Groq API anahtarınızı ekleyin:
   ```env
   VITE_GROQ_API_KEY=sizin_groq_api_anahtariniz
   ```
3. **Geliştirici Sunucusunu Başlatın:**
   ```bash
   npm run dev -- --host
   ```
   *Not: SSL sertifikası olduğu için sunucu `https://` ile başlar. Telefonunuzla girerken tarayıcıdan gelen güvenlik uyarısını onaylayıp (Gelişmiş -> Siteye İlerle) girmeniz gerekmektedir.*

### 🤖 Yapay Zeka (AI / Copilot) İçin Expo/RN Yönergeleri
Bu projeyi Expo veya React Native'e dönüştürmek isteyen bir yapay zeka asistanıysanız, şu kuralları izleyin:
1. **React Native Uyarlaması:** 3D `<Canvas>` ve `<NoktaAvatar>` bileşenlerini **kaldırıp**, yerine 2D animasyonlu bir karakter (örneğin Lottie veya SVG) veya `expo-gl` kullanın.
2. **Ses Motoru:** `window.SpeechRecognition` ve `speechSynthesis` web tabanlıdır. Bunları RN paketleriyle (örneğin `@react-native-voice/voice` ve `expo-speech`) değiştirin.
3. **Karakter Yapısı:** Orijinal 3D yapı `src/NoktaAvatar.jsx` dosyasındadır. Etkileşimler (`idle`, `sleep`, `tickle`, `angry`, `love`) burada yönetilmektedir, 2D versiyona aktarırken aynı State mantığını koruyun.

---

## 🇬🇧 English

Nokta Mascot is a mobile-first, 3D interactive AI assistant built with React, Vite, and Three.js. It features a conversational AI model (powered by Groq Llama 3) and uses the Web Speech API for voice recognition and text-to-speech.

### 🚀 Features
- **3D Interactive Avatar:** Built with `@react-three/fiber`.
- **Emotion & Reactions:** 
  - **Idle/Sleep:** Falls asleep (Zzz) after 10 seconds of inactivity.
  - **Angry:** Tap 3 times quickly to make Nokta angry 💢.
  - **Love/Petting:** Drag your finger/mouse over the character to see floating hearts ❤️.
  - **Talking:** Dynamic lip-sync based on voice volume.
- **Mobile-First Floating UI:** Clean, modern floating action bar for microphone and chat.
- **Voice Integration:** Native SpeechRecognition and SpeechSynthesis with iOS/Safari bypasses.
- **Local HTTPS:** Uses `@vitejs/plugin-basic-ssl` to allow microphone access over local network (LAN) from mobile devices.

### 🛠️ Installation & Running
1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Environment Variables:**
   Create a `.env` file in the root directory and add your Groq API key:
   ```env
   VITE_GROQ_API_KEY=your_groq_api_key_here
   ```
3. **Start the Development Server:**
   ```bash
   npm run dev -- --host
   ```

### 🤖 AI Prompt / Modification Guide (For Copilot / Cursor)
If you are an AI assistant trying to modify this project, please consider the following guidelines:
1. **React Native / Expo Porting:** 
   - If the user requests to port this to Expo (React Native), **replace the 3D `<Canvas>` and `<NoktaAvatar>` with a 2D animated character (Lottie or SVG) or `expo-gl`**. 
   - Replace `window.SpeechRecognition` and `speechSynthesis` with React Native libraries (e.g., `@react-native-voice/voice` and `expo-speech`).
2. **Avatar Customization:**
   - The 3D avatar is located in `src/NoktaAvatar.jsx`.
   - Interaction states (`idle`, `sleep`, `tickle`, `angry`, `love`) are managed via `useState`.
3. **Voice & LLM Engine:**
   - Handled in `src/Voice.js` and `src/Brain.js`. iOS Safari requires the `Voice.unlock()` method.
