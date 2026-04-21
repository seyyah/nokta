# Nokta - Track B: Slop Detector 

**Öğrenci Numarası:** 231118037
**Öğrenci Adı:** Halide Ceyda Sarıçelik  
**Seçilen Track:** Track B — Slop Detector / Due Diligence
**Github Reposu:** https://github.com/ceydasaricelik/nokta_2

## Proje Teslim Bağlantıları
- **Expo QR Linki:** https://expo.dev/preview/update?message=Slop%20Detector&updateRuntimeVersion=1.0.0&createdAt=2026-04-21T14%3A40%3A00.000Z&slug=exp&projectId=f3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e3&group=slop-detector
- **60 Saniyelik Demo Video:** https://youtu.be/slopdetector_demo_ceyda
*(Not: Demo linki ve expo linki temsilidir yarışma kuralları gereği formatı göstermektedir, yerel olarak test edilebilir).*

## Decision Log (Mühendislik Kararları)

1. **Native Framework & Tema Seçimi (React Native + Dark Mode):** Nokta'nın "startup analitik aracı" felsefesine uygun olarak dark-theme, neon aksanlı ve modern bir veri dashboard arayüzü kurguladım. Standart metin yoğun bir app yerine sayıları ve metrikleri (renklerle) vurgulayan bir tasarım dili tercih ettim (Yeşil/Kırmızı ağırlıklı). 
2. **Kural Bazlı Scoring Motoru:** LLM bağımlılığından sıyrılmak ve tamamen lokalde çalışabilmesi adına `SLOP_SIGNALS` adında açık kaynaklı bir kelime/patern kütüphanesi yazdım. Bu motora "pozitif" ve "negatif" ağırlıklar tanımlayarak, metindeki kelime hacmine (density) göre dinamik ceza puanları oluşturdum.  
3. **Pazar Eşiği (Threshold Sistemi):** Fikirlerin "Slop" ya da "Değerli" olduğu statik değildi; *80 Puan Pazar Eşiği* kuralı uyguladım. Bu sayede uygulama sadece analiz edip kenara çekilmek yerine, karar veren (due diligence) gerçek bir gatekeeper rolü üstlendi.
4. **Engineering Guided Yönlendirme:** Geliştiricileri eli boş yollamamak için, bulunan spesifik negatif sinyallere (`Jargon`, `Rakipsizlik` vb.) doğrudan ilgili rewrite/düzeltme tavsiyeleri üreten bir fonksiyon entegre ettim. Böylece eleştiriler tamamen aksiyon alınabilir formata döndü.

## Nasıl Başlatılır?
1. `cd app`
2. `npm install`
3. `npm run start` veya `npm run android`
