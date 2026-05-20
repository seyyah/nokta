## Proje Özeti: Nokta - Yapay Zeka Tabanlı Sağlık ve Psikoloji Asistanı

Bu proje, kullanıcıları dinleyen, anlayan ve gerektiğinde stres durumlarına göre doğrudan bir "Uzman Desteği"ne yönlendirerek yapay zeka ile insan etkileşimini birleştiren interaktif bir mobil sağlık asistanıdır.

### ✨ Öne Çıkan Geliştirmeler ve Özellikler
- **Nokta Mascot Entegrasyonu:** Kullanıcıyla doğrudan sesli etkileşime giren, duygulara göre tepki veren (Idle, Sleep vb.) animasyonlu ve interaktif 3D/2D asistan altyapısı React Native ortamına entegre edildi.
- **Human-in-the-Loop (Uzman Desteği):** Maskot asistanın sınırlarını aşan veya kriz tespit edilen durumlarda, kullanıcıyı "Uzm. Psk. Ayşe Yılmaz" profiline aktaran, anlık mesajlaşma ve görüntülü arama simülasyonu sunan özel bir modül geliştirildi.
- **Dinamik AI Orkestrasyonu (Groq & Llama 3.3):** Uzman profili sabit cevaplar vermek yerine, Groq API üzerinden anlık, içeriğe uygun ve empatik cevaplar üretecek şekilde özel Prompt Engineering teknikleriyle donatıldı.
- **LLM Evaluation Harness (Güvenlik ve Test):** Psikolog karakterinin güvenliğini ve rolde kalma durumunu otomatik olarak test etmek için özel bir arka plan test scripti yazıldı. Yapay zekanın kod yazmak gibi rol dışı eylemleri reddetmesi sağlanarak güvenlik %100'e çıkarıldı.
- **Native Android Build:** Proje, Expo altyapısı kullanılarak başarıyla derlendi ve kullanıma hazır `app-release.apk` dosyası oluşturuldu.

### 🎥 Demo Videosu
Uygulamanın çalışır haldeki 60 saniyelik demo videosunu aşağıdan izleyebilirsiniz:
**[Demo Videoyu İzle (YouTube)](https://youtu.be/s4YS0m5d3N4)**

### 📱 Expo QR Kodu
> Proje Expo Go üzerinden de yerel ağda çalışabilmektedir.

### 🛠 Kullanılan Teknolojiler & AI Araçları
- **Altyapı:** React Native, Expo, TypeScript
- **Yapay Zeka:** Groq API (Llama-3.3-70b-versatile), Expo Speech Recognition
- **Geliştirme Desteği:** Bu projenin kodlanması, hata ayıklaması (debugging), Native APK derleme süreçleri ve LLM Test mekanizmalarının kurulmasında **Google Gemini (Antigravity AI Agent)** kullanılmıştır.

### 📦 Uygulama APK Dosyası
Projenin Android için derlenmiş çalışabilir APK dosyasına aşağıdaki bağlantıdan ulaşabilirsiniz (GitHub boyut sınırları nedeniyle harici link verilmiştir):
🔗 **[Nokta Uygulamasını İndir (Google Drive)](https://drive.google.com/file/d/1Lgh_tJwHrfNH3DbEjfCOez3vCdThNjxr/view?usp=sharing)**

### 📝 Decision Log (Tasarım Kararları)
1. **Verimlilik:** Expo altyapısı seçilerek hızlı prototipleme sağlandı.
2. **Yapay Zeka:** Hız ve kalite dengesi için Groq API (Llama 3.3) tercih edildi.
3. **Güvenlik:** Rol dışına çıkılmasını engellemek için LLM Test Harness geliştirildi.

