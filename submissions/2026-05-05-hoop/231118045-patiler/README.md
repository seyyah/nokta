# 🐾 Patiler — Evcil Hayvan Asistanı

<div align="center">
  <h3>Sevimli 3D maskotunuz Pati ile evcil hayvanlarınız hakkında her şeyi sorun!</h3>
  <p><i>React + Vite + Three.js ile geliştirilmiş, insan destekli evcil hayvan danışmanlık uygulaması</i></p>
</div>

---

## 👤 Submission Bilgileri

| Alan | Değer |
|------|-------|
| **Öğrenci No** | 231118045 |
| **Slug** | yagmurtprkl-patiler |
| **Track** | A (Web Uygulaması) |
| **Teknoloji** | React + Vite + Three.js |

---

## 🎬 Demo Video

> 📹 **Demo Video:** [▶️ YouTube'da İzle](https://youtu.be/aP4nDCNCnkA)

[![Demo Video](https://img.youtube.com/vi/aP4nDCNCnkA/0.jpg)](https://youtu.be/aP4nDCNCnkA)

---

## 💡 Proje Fikri

**Patiler**, evcil hayvan sahiplerinin kedi, köpek ve diğer hayvanları hakkındaki sorularını 3D sevimli bir maskot (Pati) ile yanıtlayan bir web uygulamasıdır.

Uygulama aynı zamanda **Human-in-the-Loop (HOOP)** entegrasyonu sunmaktadır: Pati ciddi bir durum tespit ettiğinde, anında **Veteriner Zeynep Hanım**'ı devreye alır ve kullanıcıya uzman tavsiyesi iletir.

---

## ✨ Özellikler

- 🐱 **3D Sevimli Maskot (Pati):** `@react-three/fiber` ve Three.js ile hayata geçirilmiş interaktif karakter
- 🎤 **Sesli Asistan:** Web Speech API ile mikrofon desteği (konuşarak soru sorma)
- 👩‍⚕️ **Human-in-the-Loop:** Ciddi durumlarda Veteriner Zeynep Hanım devreye girer (kadın sesi ile)
- 📋 **Ana Ekran (Dashboard):** Evcil hayvan profili kartları ve faydalı bilgi makaleleri
- 💬 **Sohbet Ekranı:** Pati ile metin veya sesli sohbet
- 🎨 **Modern UI:** Canlı renkler, blur efektleri, smooth animasyonlar

---

## 🚀 Kurulum ve Çalıştırma

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

Tarayıcıda `http://localhost:5173` adresine git.

> **Not:** Uygulama API anahtarı gerektirmeden (offline/mock mod) çalışır.

---

## 🏗️ Teknik Mimari

```
src/
├── App.jsx          → Ana uygulama (Dashboard + Chat görünümleri)
├── NoktaAvatar.jsx  → 3D sevimli hayvan maskotu (Three.js)
├── Brain.js         → Yapay zeka beyin motoru (HOOP simülasyonu)
├── Voice.js         → Ses motoru (SpeechRecognition + SpeechSynthesis)
└── index.css        → Global stiller
```

---

## 🤝 Human-in-the-Loop (HOOP) Entegrasyonu

Nokta ekosisteminin temel özelliği olan **insan desteği**, bu projede şu şekilde çalışır:

1. Kullanıcı evcil hayvanının **ciddi bir sağlık sorununu** anlatır
2. **Pati** durumu algılar ve kullanıcıyı bilgilendirir
3. Ekranda **"Veteriner Zeynep yazıyor..."** bildirimi belirir
4. ~4 saniye sonra **Veteriner Zeynep Hanım** kadın sesiyle uzman tavsiyesini iletir

---

## 📝 Decision Log

| Karar | Gerekçe |
|-------|---------|
| Web uygulaması (Track A) seçildi | Expo/React Native yerine Three.js 3D mascot daha iyi çalışıyor |
| Groq API yerine mock/offline AI | API anahtarı gerektirmeden herkes test edebilsin |
| Sadece evcil hayvan odaklı | Bitki kısmı kaldırılarak konu derinleştirildi |
| Kadın sesi için pitch ayarı | Web Speech API'de garantili kadın sesi seçimi |
| Maskoton yukarı kaydırma animasyonu | Sohbet açıkken maskoton görünür kalması için |

---

## 🤖 AI Tool Log

| Araç | Kullanım |
|------|---------|
| **Antigravity (Google DeepMind)** | UI tasarımı, 3D maskot, Brain.js, Voice.js, HOOP entegrasyonu, tüm geliştirme süreci |
