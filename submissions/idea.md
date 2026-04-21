# Nokta Cleaner — Mühendislik ve Vizyon Belgesi (Track C)

## 🌌 Vizyon ve Problem Tanımı
Günümüzde fikirler genellikle WhatsApp mesajları, ses kayıtları veya dağınık notlar halinde "slop" (veri yığını) olarak kalmaktadır. **Nokta Cleaner**, Andrej Karpathy'nin LLM'leri bir "akıl yürütme işletim sistemi" olarak görme vizyonundan ilham alır. Projenin amacı, bu ham ve gürültülü veri yığınlarını analiz ederek, mükerrer olanları ayıklamak (deduplication) ve her birini profesyonel birer "İdea Kartı" formatına dönüştürerek "çöpsüz veri" (slop-free context) üretmektir.

## 🛠 Teknik Kararlar ve Mimari
1. **Track C Seçimi:** Verinin sadece saklanması değil, migrate edilirken rafine edilmesi gerektiğine inandığım için "Migration & Dedup" yolunu seçtim.
2. **AI Motoru:** Gemini 1.5 Flash kullanıldı. Modelin yüksek bağlam penceresi (context window), uzun ve dağınık notlar arasındaki benzerlikleri (similarity) tespit etmek için optimize edildi.
3. **JSON Extraction:** AI'nın serbest metin çıktılarını (conversational noise) temizlemek için gelişmiş regex ve "Force JSON" prompt teknikleri kullanılarak uygulamanın sadece saf veriyi işlemesi sağlandı.
4. **UI/UX:** Kullanıcının odak noktasını sadece fikre tutmak amacıyla minimalist, yüksek kontrastlı (Siyah-Beyaz) bir tasarım dili benimsendi.

## 🏗 Engineering Trace (Geliştirme Süreci)
- **Aşama 1:** Antigravity (a0.dev) ile temel React Native iskeleti kuruldu ve NativeWind entegrasyonu sağlandı.
- **Aşama 2:** Gemini SDK entegrasyonu sırasında yaşanan 404 (Endpoint mismatch) hatası, doğrudan REST API (fetch) mimarisine geçilerek ve v1 endpoint'leri zorlanarak çözüldü.
- **Aşama 3:** Çoklu not girişi simülasyonları yapılarak, benzer notların tek bir "Master Idea" altında birleştirilmesi sağlandı.
- **Aşama 4:** APK build süreçleri (EAS Build) tamamlanarak uygulamanın fiziksel cihazlarda test edilebilirliği doğrulandı.

## 🚀 Gelecek Vizyonu
Sistem gelecekte Karpathy'nin "Autoresearch" konseptine uygun olarak; temizlenen fikirleri internet üzerinden otomatik araştıran ve bu fikirlerin dünyadaki benzer projelerini (competitor analysis) bulan otonom ajanlarla entegre edilecektir.