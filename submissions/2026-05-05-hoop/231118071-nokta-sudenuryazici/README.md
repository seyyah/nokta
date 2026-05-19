# 💎 Nokta Canvas: AI-Orchestrated Dashboard Engine

[![Watch the Video](https://img.shields.io/badge/YouTube-Video%20Tan%C4%B1t%C4%B1m%C4%B1-red?style=for-the-badge&logo=youtube)](https://www.youtube.com/shorts/-wjLVqu6ZQs)

---

## 📖 Proje Hakkında: Nokta Canvas ve Harness Engineering

**Nokta Canvas**, "Human-in-the-loop" (İnsan döngüde) prensibiyle çalışan ve **Harness Engineering** yaklaşımını temel alan bir **Human-Oriented Orchestration (HOOP)** platformudur. 

Veriyi sadece yapay zeka ile görselleştirmekle kalmaz; AI'nın yetersiz kaldığı durumlarda, süreci kesintisiz bir şekilde insan uzmanlara devreden (**Rent a Human**) bir köprü görevi görür. 

### 🧠 Yapay Zeka Mimarisi (Neden İki Farklı API?)
Sistem, en yüksek kararlılık ve performans için **Hibrit Yapay Zeka** modeli kullanmaktadır:
1.  **Google Gemini 1.5 Flash (Dashboard Motoru)**: Google Sheets verilerini okur, veri tiplerini analiz eder ve bu verilere en uygun Tailwind CSS kodlarını (JSON formatında) üretir. Dashboard'un teknik mimarisinden sorumludur.
2.  **Groq Llama 3.3 (Nova Brain)**: Asistanın "beyni" olarak görev yapar. Groq'un ultra düşük gecikme süresi sayesinde Nova, kullanıcıyla insansı ve çok hızlı bir şekilde iletişim kurar.

---

## 🛠️ Nasıl Çalışır? (İş Akışı)

Nokta Canvas, veriyi görselleştirmek için şu 4 aşamalı akıllı süreci izler:

1.  **Veri Bağlantısı**: Kullanıcı Google hesabıyla güvenli giriş yapar ve analiz etmek istediği Google Sheet dosyasını seçer.
2.  **Derin Analiz (Metadata Analysis)**: Sistem, tablodaki tüm sütun başlıklarını, veri tiplerini (sayı, tarih, metin) ve satır sayılarını otomatik olarak tarar.
3.  **Yapay Zeka Eşleştirmesi**: Gemini AI, analiz edilen bu verileri alır ve her veri tipine en uygun görsel bileşeni (KPI kartı, grafik, ilerleme çubuğu vb.) seçerek bir **Dashboard Şeması** oluşturur.
4.  **Anlık Üretim ve Revize**: Şema, Tailwind CSS bileşenlerine dönüştürülerek ekrana basılır. Kullanıcı, asistan Nova'ya "Bu tabloyu kırmızı yap" veya "Satışları en üste al" dediğinde, sistem tüm süreci saniyeler içinde baştan koşturarak tasarımı günceller.
5.  **Uzman Desteği (Rent a Human)**: Yapay zekanın yetersiz kaldığı veya profesyonel bir görüşe ihtiyaç duyulan durumlarda, sistem "Human-in-the-loop" prensibiyle veriyi bir insan uzmana aktarır. Bu sayede HOOP (Human-Oriented Orchestration) döngüsü tamamlanmış olur.

---

## ⚙️ Kurulum ve Ortam Değişkenleri (.env)

Projenin çalışabilmesi için `app/canvas/` klasörü içinde bir `.env` dosyası bulunmalıdır. Bu dosyada aşağıdaki anahtarların tanımlı olması gerekmektedir:

```env
# Google Gemini API: Dashboard üretimi ve veri analizi için gereklidir.
VITE_GEMINI_API_KEY=Sizin_Gemini_Keyiniz

# Groq API: Nova asistanın hızlı konuşması ve zekası için gereklidir.
VITE_GROQ_API_KEY=Sizin_Groq_Keyiniz
```

---

## 🛠️ Teknik Özellikler

- **Multi-Perspective Engine**: Veriyi tek seferde 4 farklı tasarım stiliyle sunar.
- **Nova 3D Mascot**: Three.js tabanlı, dudak senkronizasyonu ve mimikleri olan AI asistan.
- **Glassmorphism UI**: Modern, şeffaf ve derinlik hissi veren tasarım dili.
- **Sheet-to-Widget Mapping**: Sütun başlıklarını otomatik tanıyıp KPI, grafik veya liste bileşenlerine bağlar.

---

## 📁 Dosya Yapısı

- **`/app/canvas`**: Kaynak kodlar (React + Vite).
- **`/app/app-debug.apk`**: Uygulamanın mobil cihazda test edilebilmesi için hazır Android paketi.
- **`README.md`**: Şu an okuduğunuz ana tanıtım dosyası.

---

## 🚀 Çalıştırma Talimatı

1. `app/canvas` klasöründe terminali açın.
2. `npm install` komutu ile kütüphaneleri yükleyin.
3. `npm run dev` komutu ile projeyi yerel sunucuda (localhost) başlatın.

---
