# Idea Refiner — Nokta Audit, Lipsync Avatar & Forge Engine Submission (Sibel Yeter — 231118056)

**Idea Refiner**, kurucuların ve ürün tasarımcılarının dağınık ses notlarını anında temiz, eyleme geçirilebilir, standartlaştırılmış tek sayfalık ürün gereksinim belgelerine (PRD) ve denetim raporlarına dönüştüren ses öncelikli (voice-first) yapay zeka destekli mobil bir uygulamadır.

Bu sürümde, otonom kod onarım döngüsü (**Forge Engine**), OpenAI tarzı ses görselleştirici, viseme tabanlı lipsync avatarı, persona parametreleri ve WebRTC tabanlı uzman çağrı mekanizması entegre edilmiştir.

---

## 🌟 Geliştirilen Yeni Özellikler & Çözümler

### 1. Voice Visualizer (Ses Görselleştirici)
* **Real-time Metering**: `expo-av` mikrofonu üzerinden ses genliği (RMS) 30ms gibi aşırı düşük bir gecikmeyle (sub-50ms) gerçek zamanlı sorgulanır.
* **OpenAI Voice Mode Siri-Waves**: WebView içindeki HTML5 Canvas 2D katmanı üzerinde, ses genliğine göre anlık olarak dalgalanan ve genliği değişen Siri tarzı akışkan neon dalgalar render edilir. Sessiz durumlarda yavaşça sönerek sakin pulsing moduna geçer.

### 2. Kişisel Avatar + Viseme Lipsync
* **RPM model.glb**: `avatar.glb` (ve `model.glb`) dosyaları WebView Three.js sahnesinde base64 üzerinden çözümlenerek sıfır CORS hatasıyla render edilir.
* **Viseme-based Lipsync**: Ready Player Me standardındaki 15 farklı sesçil (viseme) blendshape'i (`viseme_aa`, `viseme_O`, `viseme_U`, `viseme_sil` vb.) lipsync koduna bağlanmıştır. 
* **TTS & Mic Sync**: Mikrofon genliği arttıkça ağız şekilleri ses tonuna göre şekillenir. TTS ses sentezinde ise harf/sözcük hızına göre kelimeler ağızla senkronize (viseme cycling) şekilde seslendirilir.

### 3. Persona Sistemi (Junior & Senior Sibel)
* **Junior Sibel**: Tiz ses tonu (`1.30` pitch), hızlı konuşma (`1.15` rate), neon cyan/pembe ışıklandırma, heyecanlı ve panik yapan teknik açıklama stili, gülümseyen avatar ifadesi ve yakın plan kamera odağı.
* **Senior Sibel**: Kalın ses tonu (`0.85` pitch), sakin konuşma (`0.80` rate), warm amber/gold şık stüdyo ışıkları, sakin mimari odaklı açıklama stili, ciddi avatar ifadesi ve geniş plan kamera odağı.

### 4. Audit & Voice Raporlama
* **STT Rapor Üretimi**: Uygulamada mikrofona konuşarak veya senaryo seçerek deşifre tetiklenebilir. Whisper simülasyonu ile kritik Markdown raporları (örn: `voice-report-mic.md`) anında üretilir.
* **Forge Yönlendirmesi**: Üretilen raporlar tek tıkla "Forge Ajanı" ekranına simülasyon girdisi olarak gönderilir.

### 5. Forge Döngüsü & STUCK Heuristiği
* **Simulation Loop**: `READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT/ROLLBACK` döngüsü terminal konsolu ve adım çubuğuyla animasyonlu simüle edilir.
* **STUCK Tespiti**: Ayrı bir servis (`ForgeHeuristicsService.ts`) üzerinden, aynı konuya ait rapor 2 kez üst üste `FAIL` veya `ROLLBACK` alırsa sistem otonom olarak `STUCK` ilan edilir.

### 6. Uzman Köprüsü (WebRTC Expert Bridge)
* **Jitsi Meet**: Sistem STUCK olduğunda arayüzde "Uzmana Bağlan" butonu belirir. Kamera, mikrofon ve ekran paylaşımını destekleyen tam ekran görüntülü konuşma açılır.
* **BRIDGE.md Entegrasyonu**: Görüşme kapatıldığında "Uzman Karar Özeti" girilir. Bu özet hem yerel loga hem de recovery commit döngüsüne veri olarak beslenip stuck durumunu çözer.

---

## 🚀 Hızlı Başlangıç & Çalıştırma Adımları

### 1. Kurulum Komutları
Yerel Metro sunucusunu çalıştırmadan önce bağımlılıkları yükleyin:
```bash
cd submissions/231118056-sibel-yeter/app
pnpm install
```

### 2. Çalıştırma Adımları
Metro Bundler'ı yerel web arayüzünde ayağa kaldırmak için:
```bash
pnpm web --no-dev
```
Tarayıcıda otomatik olarak `http://localhost:8081` adresinde uygulama açılacaktır.

### 3. Demo Video
Uygulamanın çalışır halini (Voice Viz, Lipsync, Stuck Jitsi akışlarını) aşağıdaki videodan izleyebilirsiniz:
[![Demo Video](https://img.youtube.com/vi/_4HO7VpDPpA/0.jpg)](https://youtu.be/_4HO7VpDPpA)

---

## 🛠️ Dosya Yapısı (Üretilen Dosyalar)
1. `submissions/231118056-sibel-yeter/avatar.glb` - Kişisel avatar modeli
2. `submissions/231118056-sibel-yeter/FORGE.md` - Otonom Forge ledger tablosu
3. `submissions/231118056-sibel-yeter/PERSONAS.md` - Persona parametre dokümantasyonu
4. `submissions/231118056-sibel-yeter/BRIDGE.md` - Uzman kararları logu
5. `submissions/231118056-sibel-yeter/app/services/ForgeHeuristicsService.ts` - STUCK tespit servisi
