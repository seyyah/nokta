# Nokta — 211118085 Ravzanur Erdoğan

## Track Seçimi

**Track B + C Hibrit**

- **Track B (Slop Detector / Due Diligence):** Kullanıcı bir fikir yazar, 4 farklı departman (Pazarlama, Teknik, Finans, Risk) AI ajanları tarafından bağımsız olarak değerlendirilir. Sonunda sentez ajanı kurumsal karar + yatırım skoru üretir.
- **Track C (Migration & Dedup):** Kullanıcı ham metin yapıştırır (WhatsApp logu, bullet listesi, e-posta taslağı). AI fikirleri ayıklar, tekrar edenleri birleştirir, idea card'lara dönüştürür. Oradan doğrudan Track B analizine geçilebilir.

---

## Bağlantılar

- **Demo Video (60 sn):** https://youtube.com/shorts/64Rp4xf4PcQ?feature=share
- **Expo QR / Link:** *(APK ile test edildi, Expo Go linki eklenmedi)*
- **APK:** `app-release.apk` *(build tamamlanınca eklenecek)*

---

## Decision Log

### Neden Track B + C hibrit?

Kodun orijinal Nokta tezine en yakın parçası Migration (Track C) ile departman analizi (Track B) akışının birbirine bağlanmasıdır. Migration'dan çıkan idea card'a tıklanınca doğrudan departman analizine geçiş yapılıyor — bu iki track'i birleştirmek tek başına Track B veya C'den daha güçlü bir Nokta dilimine karşılık geliyor.

### Neden Groq / LLaMA 3.3 70B?

Anthropic API yerine Groq seçildi çünkü Groq'un inference hızı mobil UX için kritik. 4 departman analizinin kullanıcıyı fazla bekletmemesi gerekiyordu. `llama-3.3-70b-versatile` modeli JSON çıktı kalitesi açısından yeterliydi.

### Neden tek `groqCall` soyutlaması?

Her departman ve sentez için ayrı fetch yazmak yerine tek fonksiyon üzerinden system + user prompt geçildi. Bu hem kod tekrarını önledi hem de ileride model değiştirilmek istenirse tek yerden değiştirilmesini sağladı.

### Neden paralel departman analizi değil?

İlk tasarımda kullanıcı her departmana tıklayarak ilerliyor. Bu kasıtlı bir UX kararı: kullanıcının her departmanın sonucunu okuyarak ilerlemesi, süreci daha şeffaf ve "engineering-guided" hissettiriyor. Otomatik paralel akış sonraki iterasyonda düşünülebilir.

### API Key güvenliği

Geliştirme sırasında key açıkta kaldı, fark edilince hemen Groq panelinden invalidate edildi. Teslim dosyasında geçersiz key bulunmaktadır.

### AI Araçları

- Claude (claude.ai) — kod review, prompt mühendisliği, dosya hazırlama
