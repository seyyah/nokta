# 🩺 Nokta Mascot — Health Support & Human Expert Integration

> **NOKTA ekosistemi için geliştirilen 3D maskot tabanlı sağlık destek uygulaması.**
> Yapay zeka destekli sesli asistan ile insan uzman desteğini tek bir arayüzde birleştiren, Vite + React + Three.js ile geliştirilmiş modern bir web uygulamasıdır.

---

## 📋 Proje Bilgileri

| Alan | Detay |
|------|-------|
| **Öğrenci** | Dilfin Akkurt |
| **Öğrenci No** | 231118035 |
| **GitHub** | [github.com/dilfinakkurt](https://github.com/dilfinakkurt) |
| **Track** | Track B — Mascot + Health Support |
| **Repo** | [seyyah/nokta](https://github.com/seyyah/nokta) |

---

## 🎯 Proje Amacı

Bu proje, NOKTA ekosistemindeki **Mascot** uygulamasını temel alarak aşağıdaki özellikleri entegre etmektedir:

1. **3D Maskot Arayüzü** — `@react-three/fiber` ve `@react-three/drei` ile oluşturulmuş, kullanıcıyla etkileşime giren animasyonlu bir 3D karakter.
2. **Yapay Zeka Destekli Sesli Asistan** — Groq API üzerinden LLM (Large Language Model) tabanlı sohbet desteği. Kullanıcının sağlık sorularına anında yanıt verir.
3. **İnsan Uzman Desteği (Human Expert Support)** — Yapay zekanın yetersiz kaldığı veya kullanıcının doğrudan profesyonel bir görüş almak istediği durumlarda, tek tuşla canlı uzmana bağlanma özelliği.

---

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js (v18+)
- npm

### Adımlar

```bash
# 1. Proje dizinine gidin
cd submissions/DilfinAkkurt/231118035-nokta-expert-mascot

# 2. Bağımlılıkları yükleyin
npm install

# 3. Geliştirme sunucusunu başlatın
npm run dev
```

Uygulama varsayılan olarak `http://localhost:5173` adresinde açılacaktır.

---

## 🏗️ Proje Yapısı

```
231118035-nokta-expert-mascot/
├── public/                  # Statik dosyalar
├── src/
│   ├── App.jsx              # Ana uygulama bileşeni & uzman modu mantığı
│   ├── App.css              # Uygulama stilleri
│   ├── NoktaAvatar.jsx      # 3D maskot bileşeni (Three.js)
│   ├── Brain.js             # Groq API ile AI sohbet mantığı
│   ├── Voice.js             # Sesli asistan / TTS entegrasyonu
│   ├── main.jsx             # React giriş noktası
│   ├── index.css            # Global stiller
│   └── assets/              # Görseller ve medya dosyaları
├── index.html               # HTML giriş dosyası
├── package.json             # Proje bağımlılıkları
├── vite.config.js           # Vite yapılandırması
├── eslint.config.js         # ESLint yapılandırması
├── idea.md                  # Fikir ve konsept dokümanı
└── README.md                # Bu dosya
```

---

## ✨ Özellikler

### 🤖 AI Sohbet Modu
- Groq API üzerinden hızlı LLM yanıtları
- Sağlık konularında bilgilendirici asistan
- Doğal dil işleme ile kullanıcı dostu etkileşim

### 🎓 Canlı Uzman Modu
- Arayüzdeki 🎓 ikonuna tıklayarak aktifleştirme
- Mor gradyan renk temasıyla görsel ayrım
- "Canlı Uzman: Dilfin" durum göstergesi
- Simüle edilmiş uzman bağlantı akışı (hoş geldiniz mesajı, yönlendirme)
- Bağlam kaybı olmadan AI ↔ Uzman geçişi

### 🌐 3D Maskot
- Three.js tabanlı animasyonlu 3D karakter
- Kullanıcı etkileşimine duyarlı hareketler
- Modern ve çekici arayüz deneyimi

---

## 🛠️ Teknoloji Yığını

| Teknoloji | Kullanım Alanı |
|-----------|----------------|
| **React 19** | UI bileşenleri |
| **Vite 8** | Build tool & dev server |
| **Three.js** | 3D maskot render |
| **@react-three/fiber** | React-Three.js köprüsü |
| **@react-three/drei** | Three.js yardımcı bileşenleri |
| **Groq SDK** | LLM API entegrasyonu |
| **ESLint** | Kod kalitesi |

---

## 📖 Konsept: İnsan Destekli Kuluçka

Bu proje, yapay zeka ile insan uzmanlığını harmanlayan bir **hibrit destek modeli** sunar:

- **AI Modu:** Hızlı, 7/24 erişilebilir, genel sağlık bilgilendirmesi
- **Uzman Modu:** Deneyime dayalı, kişiselleştirilmiş, profesyonel rehberlik

Kullanıcı istediği zaman bu iki mod arasında geçiş yapabilir. Gelecekte gerçek uzmanlardan oluşan bir havuz sistemine entegre edilmesi planlanmaktadır.

---

## 📄 Lisans

Bu proje [NOKTA](https://github.com/seyyah/nokta) ekosisteminin bir parçasıdır.

---

**Geliştirici:** Dilfin Akkurt • 231118035 • [github.com/dilfinakkurt](https://github.com/dilfinakkurt)
