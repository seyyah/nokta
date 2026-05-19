# Nokta Vision: Dot Capture & Enrich — Track A (Final Version)

## 1. Vizyon

Günümüzde yapay zeka destekli araçlar sayesinde kod üretmek ve prototip oluşturmak giderek kolaylaşırken, **gerçekten iyi formüle edilmiş bir fikir** nadir ve değerli bir kaynak olmaya devam ediyor. 

**Nokta Vision**, bu vizyonu bir adım öteye taşıyarak; sevimli bir **Robot Mascot** eşliğinde, kullanıcının sadece metinle değil, sesli komutlar ve **Gözlem (Vision)** moduyla çevresindeki nesnelerden fikir yakalamasını sağlar. Amaç, multimodal AI desteğiyle ham fikir kırıntılarını (noktaları) mühendislik disiplini ile yapılandırılmış "slop-free" spesifikasyonlara dönüştürmektir.

---

## 2. Problem Tanımı

| Problem | Açıklama |
|---------|----------|
| **Fikir Kaybolması** | Günlük akışta doğan fikirler not edilmeden, yapılandırılmadan hafızadan silinir |
| **Sığ Fikirler (Slop)** | Chatbot'lardan alınan jenerik "uygulama fikirleri" — problem tanımı yok, kullanıcı profili yok, kapsam belli değil |
| **Eksik Mühendislik Perspektifi** | Kreatif kişiler mühendislik sorularını sormuyor; mühendisler ise fikirlerini yeterince ifade edemiyor |
| **Değerlendirme Zorluğu** | Bir fikrin "iyi" olup olmadığını anlamak için yapılandırılmış bir çerçeve (framework) eksik |

---

## 3. Track A Akışı: Dot Capture & Enrich

Uygulama, aşağıdaki **dört aşamalı pipeline** ile çalışır:

### Aşama 1 — Dot Capture (Multimodal Giriş)
- **Metin & Ses:** Kullanıcı fikrini yazabilir veya doğrudan Robot Mascot'a sesli olarak anlatabilir.
- **Vision (Gözlem) Modu:** Kamerayı kullanarak fiziksel objeleri veya taslak çizimleri AI'a analiz ettirip fikir tohumu oluşturabilir.

### Aşama 2 — Engineering Questions (AI & Expert Guidance)
Girilen ham fikir Gemini 1.5 Flash AI'a gönderilir. AI, fikri derinleştirmek için kritik sorular sorar.

**Yenilik — Human-In-The-Loop:**
Eğer fikir teknik bir karmaşıklık (mühendislik) veya tıbbi bir hassasiyet içeriyorsa, uygulama otomatik olarak **Hernes Engineering** veya **Uzman Doktor** desteği önerir.

### Aşama 3 — Spec Generation (Yapılandırılmış Çıktı)
Tüm cevaplar toplandıktan sonra AI, aşağıdaki bölümlerden oluşan **tek sayfalık bir teknik spesifikasyon** üretir:

```
📋 ÜRÜN SPESİFİKASYONU
├── Problem Statement
├── Target User Profile
├── Core Value Proposition
├── MVP Feature Set
├── Technical Constraints
├── Differentiation Matrix
└── Trust Score (0-100)
```

### Aşama 4 — Trust Score & History
- Her spesifikasyona bir **Trust Score (Güven Puanı)** atanır (0-100)
- Score, cevapların derinliği, tutarlılığı ve teknik somutluğuna göre hesaplanır
- Üretilen tüm spesifikasyonlar **History** sayfasında saklanır ve tekrar erişilebilir

---

| Katman | Teknoloji | Açıklama |
|--------|-----------|----------|
| **Frontend** | React Native + Expo | Cross-platform mobil uygulama |
| **AI Engine** | Gemini 1.5 Flash | Çok modlu (Vision/Ses) analiz ve zenginleştirme |
| **Mascot Logic** | Three.js / Canvas | İnteraktif robot avatarı ve animasyonlar |
| **UI Framework** | Glassmorphism UI | Premium dark theme ve LayoutAnimation |
| **Expert Bridge** | Human-In-The-Loop | Hernes Engineering & Tıbbi uzman yönlendirme sistemi |

---

## 5. Diferansiyasyon

| Mevcut Araçlar | NisaDot Farkı |
|----------------|---------------|
| ChatGPT / Gemini sohbet | Açık uçlu sohbet → jenerik çıktı | NisaDot → Yapılandırılmış pipeline → slop-free spec |
| Notion / Google Keep | Statik not alma | NisaDot → AI-guided enrichment |
| Pitch deck builder'lar | Sunum odaklı | NisaDot → Mühendislik doğrulaması odaklı |

---

## 6. Uygulama Kullanıcı Hikayesi (User Journey)

1. 🏠 **Ana Ekran:** Kullanıcı "Yeni fikir" butonuna basar
2. 💡 **Fikir Girişi:** Tek cümle/paragraf olarak fikrini yazar
3. ❓ **Soru-Cevap:** AI 5 mühendislik sorusu sorar (wizard formatında)
4. 📄 **Spec Çıktısı:** Yapılandırılmış tek-sayfa spesifikasyon üretilir
5. ⭐ **Trust Score:** Fikrin olgunluk puanı gösterilir
6. 📚 **History:** Tüm geçmiş fikirler ve spesifikasyonlar saklı kalır

---

## 7. Kısıtlar ve Riskler

| Risk | Önlem |
|------|-------|
| AI halüsinasyonu | Prompt engineering ile kısıtlanmış template kullanımı |
| Rate limiting | Gemini API free tier limitleri — fallback mekanizması |
| Kullanıcı terk oranı | Wizard her aşamada ilerleme göstergesi gösterir |

---

*Bu belge [Nokta Ana Tezi](https://github.com/seyyah/nokta/blob/main/idea.md) felsefesiyle, "engineering-guided ideation" prensibiyle hazırlanmıştır.*
