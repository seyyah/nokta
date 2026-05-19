# 🚀 CanvasSheet: AI-Powered Dynamic Dashboard Engine

CanvasSheet, Google Sheets verilerinizi saniyeler içinde büyüleyici, modern ve interaktif dashboard'lara dönüştüren, AI destekli bir görselleştirme motorudur. Hiçbir backend ihtiyacı duymadan, doğrudan tarayıcı üzerinden Gemini AI ve Google Cloud API'lerini kullanarak çalışır.

## ✨ Öne Çıkan Özellikler

- 🤖 **AI-Orchestrated UI**: Gemini 1.5/2.0 modelleri tarafından anlık olarak üretilen, veriye özel Tailwind CSS bileşenleri.
- 📊 **Google Sheets Entegrasyonu**: E-tablolarınızdaki meta verileri otomatik olarak okur ve anlamlandırır.
- 💎 **Premium Estetik**: Deep Navy teması, Glassmorphism (cam efekti), neon gradyanlar ve akıcı mikro-animasyonlar.
- ⚡ **Sıfır Backend**: Tamamen frontend tabanlı mimari; verileriniz güvenle sizinle kalır.
- 🔄 **Survivor AI Engine**: Kota veya yoğunluk durumunda otomatik model değiştirme ve yedekleme mekanizması.
- 📱 **Responsive Tasarım**: Her cihazda kusursuz görünen esnek grid yapısı.

## 🛠️ Teknoloji Yığını

- **Core**: React 18, Vite
- **AI**: Google Gemini API (1.5 Flash, 1.5 Pro, 2.0 Flash)
- **Styling**: Tailwind CSS
- **Auth**: Google Identity Services (OAuth2)
- **Icons**: Lucide React & Inline SVGs

## 🚀 Hızlı Başlangıç

### 1. Kurulum
Repoyu klonlayın ve bağımlılıkları yükleyin:
```bash
git clone https://github.com/kullaniciadi/canvas-sheet.git
cd canvas-sheet
npm install
```

### 2. Ortam Değişkenleri
`.env.example` dosyasını `.env` olarak kopyalayın ve gerekli anahtarları ekleyin:
```env
VITE_GOOGLE_CLIENT_ID=G-Cloud-Client-ID
VITE_GEMINI_API_KEY=AI-Studio-Key
VITE_GEMINI_MODEL=gemini-1.5-flash
```

### 3. Çalıştırma
```bash
npm run dev
```

## 🧠 Nasıl Çalışır?

1. **Bağlantı**: Google hesabınızla giriş yapın ve bir Sheet seçin.
2. **Analiz**: Sistem, sütun başlıklarını ve veri tiplerini analiz eder.
3. **Prompt**: AI'ya nasıl bir dashboard istediğinizi söyleyin (Örn: "Satışlarımı bölge bazlı analiz et").
4. **Üretim**: Gemini, veriye en uygun Tailwind bileşenlerini (HTML + JSON) anlık üretir ve ekrana basar.

## 🤝 Katkıda Bulunma
Her türlü katkıya açığız! Lütfen bir Issue açarak veya Pull Request göndererek destek olun.


