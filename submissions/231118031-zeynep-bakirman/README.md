# Nokta - Track A Submission

**Öğrenci:** Zeynep Bakırman (231118031)
**Seçilen Track:** Track A — Dot Capture & Enrich

## 🔗 Linkler
- **Expo QR Linki:** [EAS İndirme Sayfası](https://expo.dev/accounts/zeynepbakirman/projects/app/builds/b3bc9060-6889-4c61-8524-ed9f5f021363)
- **60 Sn Demo Video:** [YouTube Demo İzle](https://youtu.be/oAl6NrlqfjM?si=P95ElvC_hiEpGV0E)

## 🛠 Decision Log (Karar Defteri)
1. **Framework:** Hızlı geliştirme ve Android/iOS uyumluluğu için React Native ve Expo kullanıldı.
2. **UI Tasarımı:** Kullanıcının odağını dağıtmamak adına, koyu mor detaylara sahip, backend-driven (AI'dan gelen sorulara göre şekillenen) temiz ve minimal bir form yapısı tercih edildi.
3. **AI Seçimi:** OpenAI yerine Google Gemini 2.5 Flash API kullanıldı. Sebebi: Rate limitlere daha az takılması ve JSON/Metin ayrıştırmasındaki (prompt engineering) hızı.
4. **Anti-Slop Önlemi:** AI'a "katı bir sistem mimarı" rolü verilerek jenerik cevaplar engellendi. Gelen spec raporu Markdown formatında (`react-native-markdown-display` kütüphanesi ile) render edilerek kurumsal bir doküman hissiyatı verildi.