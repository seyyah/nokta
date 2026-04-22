# 🔥 Kıvılcım — Track A: Dot Capture & Enrich

> *Ham fikri alıp mühendislik disipliniyle olgun bir spesifikasyona dönüştüren — ya da dürüstçe söndüren — acımasız ama faydalı bir AI inkübatörü.*

![Kıvılcım Banner](https://via.placeholder.com/1200x400/121212/FF5252?text=KIVILCIM+-+Fikir+%C3%96ld%C3%BCr%C3%BCc%C3%BC+%26+Spesifikasyon+%C3%9Cretici)

## 📌 Track Seçimi
**Track A — Dot Capture & Enrich**  
*(İçerisinde Track B - Due Diligence ve Red Team unsurlarını da barındırır)*

---

## 🚀 Proje Hakkında
Kıvılcım, "harika bir fikrim var" diyen girişimcileri ve yazılımcıları test eden, onları jargonlardan (slop) arındıran ve fikri **"Problem, Kullanıcı, Çözüm, Kısıtlar"** ekseninde somutlaştıran bir mobil/web uygulamasıdır. Fikirleri sadece dinlemez; stres testine sokar, kör noktalarını bulur ve en sonunda eyleme dönüştürülebilir bir spesifikasyon (Spec) üretir. Zayıf fikirleri ise acımasızca "söndürür".

### 💡 Nokta Felsefesi ile Uyumu
- **Anti-Slop:** Uygulama, "blockchain tabanlı AI ekosistemi" gibi jargonları reddeder.
- **Engineering-Guided:** Gerçekçi teknik sınırlar ve kısıtlar (bütçe, zaman) dahilinde çalışır.
- **Dürüstlük:** Her fikri onaylamaz, gerekirse pivot etmesini veya iptal edilmesini söyler.

---

## 🎯 Temel Özellikler (15 Fonksiyon)

| # | Özellik | Açıklama |
|---|---|---|
| 1 | **Anlık Slop Metre** | Fikri yazarken çift eksenli (Belirsizlik + Buzzword) anlık AI analizi. |
| 2 | **Problem/Çözüm Ayrıştırma** | Kullanıcı çözüm anlattığında onu durdurup probleme yönlendirme. |
| 3 | **Constraint-First** | Tasarıma geçmeden önce "zaman, bütçe ve ekip" kısıtlarını saptama. |
| 4 | **Adaptif Soru Pipeline'ı** | Statik form yerine, fikrin zayıf yönlerini deşen dinamik chatbot akışı. |
| 5 | **Blind Spot Tespiti** | KVKK, regülasyon, pazara giriş bariyeri gibi unutulan boyutları bulma. |
| 6 | **Spec + Güven Skorları** | 6 farklı metrikte (Problem, Kullanıcı vb.) güvenilirlik hesaplama. |
| 7 | **Scope Knife (Kapsam Bıçağı)** | Fikri "MVP (Şart)" ve "Sonraki Versiyon" olarak ikiye bölme. |
| 8 | **Red Team** | Fikre rakip, teknik şüpheci ve pazar şüphecisi perspektifinden saldırma. |
| 9 | **Kill Switch** | Verilen cevaplar yetersizse fikri "Söndü" olarak işaretleyip pivot önerme. |
| 10 | **"So What?" Testi** | Fikrin dünyada yaratacağı gerçek etkiyi (bullshit-free) sorgulatma. |
| 11 | **İlk 3 Somut Adım** | "Pazar araştırması yap" gibi soyut sloplar yerine kod/tasarım odaklı adımlar. |
| 12 | **Flame Road UI** | Yukarıdaki süreç ilerledikçe Kıvılcım'ın adım adım ateşe dönüşme animasyonu. |
| 13 | **Evrim Haritası (Log)** | Fikrin ilk halinden son Spec haline nasıl evrildiğinin tarihsel haritası. |
| 14 | **Nokta Skoru** | Tüm süreci tek bir sayıya (0-100) indirgeyen kompozit metrik. |
| 15 | **Kıvılcım Kartı** | Sosyal medyada paylaşılabilir "Spotify Wrapped" tarzı fikir özeti. |

---

## 🛠️ Teknoloji Stack

* **Frontend:** React Native, Expo (SDK 55), Expo Router
* **UI/UX:** Vanilla StyleSheet, Glassmorphism, Özel İkonografi (`react-native-markdown-display`)
* **AI Katmanı:** **OpenRouter API** (Ücretsiz modeller: `llama-3.2-3b`, `qwen3-8b`, `gemma-3`)
* **State Management:** React Hooks (`useState`, `useEffect`)
* **Geliştirici AI:** Antigravity (Claude / Gemini 3.1)

---

## 🏗️ Decision Log (Tasarım Kararları)

1. **Neden OpenRouter?**  
   Google Gemini'nin ücretsiz rate-limitlerine takılmamak ve sistemin sürdürülebilirliğini sağlamak için Llama 3, Qwen gibi açık kaynak modelleri fallback (yedekli) mimarisiyle entegre ettik.
2. **Neden Geri Dönülebilir Akış?**  
   Fikir üretimi doğrusal (lineer) değildir. Kullanıcı Red Team'den yediği bir saldırıdan sonra Problem tanımını değiştirebilmelidir.
3. **Buzzword Dedektörü Neden Önemli?**  
   Slop Metre'yi tek eksenli yerine iki eksenli (Soyutluk + Buzzword) yaptık. "Enterprise-grade blockchain" somut *görünebilir* ama kelime salatasıdır (slop).

---

## 📦 Kurulum ve Çalıştırma

Projeyi yerel bilgisayarınızda veya Expo Go ile telefonunuzda test etmek için:

```bash
# 1. Klasöre gidin
cd submissions/231118025-kivilcim/app

# 2. Bağımlılıkları yükleyin
npm install

# 3. Uygulamayı başlatın (Expo Go için)
npx expo start
```
> **Not:** `src/services/aiService.js` dosyasında OpenRouter API key'i mevcuttur. Eğer limit aşımı hatası alırsanız, dosyaya kendi ücretsiz OpenRouter veya Gemini key'inizi girebilirsiniz.

---

## 📹 Demo Video

<!-- DEMO_LINK_BURAYA -->
*[[Demo video yüklendiğinde link buraya eklenecektir](https://youtu.be/EoVt1Fz1K54)]*

---

## 👤 Katılımcı Bilgileri
- **Öğrenci No:** 231118025
- **MUG Nokta Slug:** kivilcim
