# Nokta: Dot Capture & Enrich — Track A

## 1. Vizyon

Günümüzde yapay zeka destekli araçlar sayesinde kod üretmek ve prototip oluşturmak giderek kolaylaşırken, **gerçekten iyi formüle edilmiş bir fikir** nadir ve değerli bir kaynak olmaya devam ediyor. İnsanlar günlük yaşamlarında — yürürken, duş alırken, metroda beklerken — sayısız fikir üretir; ancak bunların büyük çoğunluğu not edilmeden kaybolur. Not edilenler ise genellikle "yapay zeka ile bilmem ne uygulaması yap" seviyesinde kalarak hiçbir zaman uygulanabilir bir forma kavuşamaz.

**NisaDot**, bu boşluğu kapatan bir mobil aracıdır. Kullanıcının ham fikir kırıntısını (noktayı) yakalayıp, onu mühendislik disiplini ile adım adım yapılandırılmış bir ürün spesifikasyonuna dönüştürür. Amaç "vibe coding" değil, **"engineering-guided ideation"** sağlamaktır.

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

### Aşama 1 — Dot Capture (Ham Giriş)
- Kullanıcı, fikir kırıntısını **metin kutusu** aracılığıyla girer
- Giriş kasıtlı olarak minimalisttir: sadece bir cümle veya kısa paragraf
- Amaç: düşünce sürecini kesmeden, anlık ilhamı yakalamak

### Aşama 2 — Engineering Questions (AI Sorgulaması)
Girilen ham fikir Gemini AI'a gönderilir. AI, fikri derinleştirmek için **5 kritik mühendislik sorusu** sorar:

1. **Problem (Acı Noktası):** Bu fikrin çözdüğü spesifik sorun nedir?
2. **User (Kullanıcı):** Bu çözümü kimin kullanacağını, hangi bağlamda kullanacağını tanımla
3. **Scope (Kapsam):** MVP sınırları nerede başlıyor, nerede bitiyor?
4. **Constraints (Kısıtlar):** Teknik, finansal veya operasyonel limitler neler?
5. **Differentiation (Farklılaşma):** Mevcut çözümlerden farkı nedir?

Her soru **tek seferde değil**, birer birer wizard (adım adım) formatında sorulur. Kullanıcı her soruyu okuyup düşünerek cevap verir.

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

## 4. Teknik Mimari

| Katman | Teknoloji | Açıklama |
|--------|-----------|----------|
| **Frontend** | React Native + Expo | Cross-platform mobil uygulama |
| **AI Engine** | Groq (Llama 3.3) | Yüksek hızlı soru üretimi ve spec generation |
| **State Management** | AsyncStorage | Lokal idea history saklama |
| **UI Framework** | Custom Glassmorphism Components | Premium dark theme tasarım |
| **Navigation** | React Navigation | Screen transitions ve modal yönetimi |

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
