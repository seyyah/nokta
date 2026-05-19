# Nokta - Track A: Dot Capture & Enrich

## 📌 Track Seçimi
**Track A — Dot Capture & Enrich:** Ham fikri (text veya ses) alır, AI ile 3-5 engineering soru sorar (problem, user, scope, constraint), tek sayfa spec üretir.

## 🔗 Linkler
- **Expo Linki:** `exp://172.20.97.23:8081`
- **Demo Video:** [YouTube Demo](https://youtube.com/shorts/MDW0IxGdGB0)

## 🏗 Decision Log
- **Framework & Ortam:** Uygulama hızlı ve cross-platform geliştirme sağlaması amacıyla React Native ve Expo kullanılarak geliştirilmiştir.
- **AI & LLM Entegrasyonu:** Hızlı ve yüksek kaliteli "engineering-guided" sorular ve artifact üretimi için Groq API (LLaMA 3.3 70B modeli) kullanılmıştır.
- **Sesle Fikir Yakalama (Voice-to-Text):** Kullanıcıların akıllarına gelen fikirleri anında kaydedebilmesi için `expo-av` ile ses kaydı alınmış ve Groq'un Whisper API'si ile metne çevrilmiştir.
- **UI/UX Tasarımı:** Uygulamanın modern, karanlık mod (dark mode) ağırlıklı ve profesyonel bir hissiyat vermesi amaçlanmıştır. `Capture`, `Enrich` ve `Artifact` adımları pürüzsüz bir akışla birbirine bağlanmıştır.
- **Dil & Yerelleştirme:** Sistem promptları ve arayüz tamamen Türkçe olarak kurgulanmış, soruların bağlama uygun olması sağlanmıştır.
- **Slop Engelleme:** AI sadece açık uçlu sohbet etmek yerine, kesin kurallara dayalı bir ajan gibi davranarak kullanıcıyı yönlendirir ve kısıtlayıcı/yönlendirici mimari metrikler (problem, hedef kitle, kapsam, kısıtlamalar) üzerinden fikri olgunlaştırır.

## 🚀 Kurulum ve Çalıştırma
Projeyi yerelde çalıştırmak için:
```bash
cd Nokta
npm install
npx expo start
```
