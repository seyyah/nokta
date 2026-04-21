# Nokta - Track B: Slop Detector

**Öğrenci Numarası:** 231118037
**Öğrenci Adı:** Halide Ceyda Sarıçelik  
**Seçilen Track:** Track B — Slop Detector / Due Diligence  
**GitHub Reposu:** https://github.com/ceydasaricelik/nokta_2

## Proje Teslim Bağlantıları
- **Expo QR Linki:** *(Uygulamayı yerel ağınızda `npx expo start` veya tünel ile başlatarak oluşan güvenilir QR kodunu YouTube videonuz sırasında veya buraya bağlantı olarak ekleyebilirsiniz. Temsili link SDK uyuşmazlığı oluşturmaması adına kaldırılmıştır.)*
- **60 Saniyelik Demo Video:** https://youtu.be/slopdetector_demo_ceyda

## Decision Log (Mühendislik Kararları)

1. **Görsel Mimari & Tema (React Native + Dark Mode):** "Startup Analitik ve Sentetik Veri Yakalama Aracı" formasyonuna uygun, yüksek kontrastlı (Dark, Neon vurgular) ve veri odaklı bir Dashboard arayüzü tasarlanmıştır. Uzun paragraflar yerine metriklerin ve renk kodlu rozetlerin (Yeşil/Kırmızı) öne çıktığı analitik bir kullanıcı deneyimi hedeflenmiştir.
2. **Kural Bazlı Scoring Motoru:** Sürekli dış API ve LLM bağımlılığından sıyrılmak, gecikmeyi ortadan kaldırmak için lokal düzeyde yüksek performansla çalışan `SLOP_SIGNALS` kelime/patern değerlendirme kütüphanesi yapılandırılmıştır. "Negatif ceza" ve "Pozitif ödül" ağırlıkları, metnin hacmine (kelime/density yoğunluğu) dinamik olarak normalize edilir.
3. **Analitik Eşik Değeri (Threshold):** Fikirlerin değerli mi yoksa sentetik mi olduğu yoruma bırakılmamış; kalite standardizasyonu için *80 Puan Eşik Sınırı* getirilmiştir. Bu kural sayesinde Slop Detector sadece metrik okuyan pasif bir bileşen değil, "Kabul/Ret" kararı verebilen otonom bir geçiş gişesi (gatekeeper) kimliği kazanmıştır.
4. **"Engineering Guided" Geri Bildirim Taktikleri:** Sistemin misyonu sadece fikirleri reddetmek değil, onları eğiterek doğru formata oturtmaktır. Saptanan her sentetik iddia (`Sığ Jargon`, `Rekabet Reddi` vb.) için eyleme geçirilebilir yeniden yazım stratejileri (rewrite suggestions) tespit eden özelleştirilmiş algoritmalar tasarlanmıştır.

## Nasıl Başlatılır ve Çalıştırılır?
Uygulamayı hatasız çalıştırabilmek ve Expo Go uygulamanızla uyumlu, kendi ortamınıza özel bir QR elde etmek için aşağıdaki adımları sırayla terminalinizde yürütünüz:

1. Kurulum dizinine girin: `cd app`
2. Bağımlılıkları yükleyin: `npm install`
3. Uygulamayı Expo üzerinden (Tünelli) başlatın: `npx expo start --tunnel`
*(Telefonunuzdaki Expo Go uygulamasından ekranda beliren QR kodu okutabilirsiniz.)*
