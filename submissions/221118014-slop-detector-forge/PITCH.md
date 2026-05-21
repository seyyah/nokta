# Slop Detector — Pitch & Market Analysis

Bu doküman, Track B (Slop Detector / Due Diligence) gereklilikleri kapsamında, uygulamanın kendi iş fikrinin pazar analizini, asansör sunumunu (elevator pitch) ve kendi slop-score değerlendirmesini içerir.

---

## 1. Elevator Pitch (Asansör Sunumu)

> **"Slop Detector; yatırımcılar, hızlandırıcı programlar ve hackathon jürileri için sunum dosyalarındaki (pitch decks) şişirilmiş ve temelsiz iddiaları (slop) saniyeler içinde süzgeçten geçiren yapay zeka tabanlı bir mobil durum tespiti (due diligence) asistanıdır."**

---

## 2. Market Analysis (Pazar Analizi)

### Hedef Kitle (Target Market)
- **Erken Aşama Yatırımcıları:** Melek yatırımcılar, tohum öncesi (pre-seed) ve tohum (seed) aşamasındaki VC (Venture Capital) analistleri.
- **Değerlendirme Komiteleri:** Hızlandırma programları (accelerators), kuluçka merkezleri ve hackathon jüri üyeleri.
- **Girişimciler:** Sunumlarını yatırımcılara göndermeden önce metinlerindeki abartı seviyesini düşürmek ve daha gerçekçi kılmak isteyen kurucular.

### Pazar Açığı ve Fırsatlar (Market Gap)
*   **Zaman Kısıtı:** Bir VC analisti günde ortalama 20-30 arası pitch incelemektedir ve her bir sunuma ayrılan ortalama süre **2.5 dakikadır**. Bu sürenin büyük kısmı altı boş vaatleri ve süslü kelimeleri (buzzwords) temizlemekle geçer.
*   **Mevcut Çözümlerin Yetersizliği:** PitchBook, Crunchbase veya Dealroom gibi dev veri tabanları finansal veriler, geçmiş yatırım turları ve kurucu geçmişine odaklanır. Metin tabanlı mantıksal tutarsızlıkları (logic gaps) ve abartıları süzebilen erken aşama bir araç yoktur.
*   **Yapay Zeka Fırsatı:** Dil modellerinin metin analizi ve muhakeme yeteneği, sunumlardaki abartılı pazar payı iddialarını veya temelsiz teknolojik vaatleri yakalamak için biçilmiş kaftandır.

### Rakipler
1.  **Geleneksel Veri Sağlayıcılar (Crunchbase, PitchBook):** Finansal veri odaklıdırlar. Erken aşama (pre-seed) sunumları için veri barındırmazlar.
2.  **Slayt Tasarım Yapay Zekaları (Beautiful.ai, Tome):** Sadece sunum tasarımı ve görsel yerleşime odaklanırlar; metin analitiği yapmazlar.
3.  **AI Pitch Deck Değerlendiricileri (Slidebean AI):** Slayt yapısını ve finansal tabloların varlığını kontrol ederler. Slop Detector ise doğrudan "anlatının gerçekliğini" hedefler.

---

## 3. Self Slop Score Evaluation (Kendi Kendini Puanlama)

Uygulamanın kendi iş fikrini Slop Detector algoritmasına sokarak iki farklı senaryoda test ettik.

### Senaryo A: Şişirilmiş (High Slop) Sunum
*   **Pitch Metni:** 
    > *"Slop Detector, yapay zeka destekli devrimsel mobil platformuyla melek yatırımcıların deal-flow süreçlerini kökten bozarak (disrupt) milyar dolarlık pazar fırsatlarını sarsıyor ve garanti pasif gelir sağlıyor. Web3 ve yapay zeka sinerjisi ile unicorn olmaya aday bir game-changer girişim."*
*   **Analiz Skoru:** **%95 Slop** (Aşırı Şişirilmiş)
*   **VC Değerlendirmesi:** 
    *   *Tespit Edilen Buzzword'ler:* Yapay zeka destekli, devrimsel, disrupt, milyar dolarlık, garanti pasif gelir, web3, sinerji, unicorn, game-changer.
    *   *Gerekçe:* Girişimin sunduğu somut hiçbir çözüm belirtilmemiş, sadece yatırımcıyı cezbetmek için trend kelimeler arka arkaya sıralanmıştır. "Garanti pasif gelir" iddiası finansal olarak imkansızdır ve kırmızı bayraktır (red flag).

### Senaryo B: Gerçekçi ve Ayakları Yere Basan (Low Slop) Sunum
*   **Pitch Metni:**
    > *"Slop Detector, melek yatırımcıların erken aşama sunumlardaki abartılı pazar iddialarını ve sektörel buzzword'leri süzmesini sağlayan bir mobil prototiptir. İlk aşamada kural tabanlı ve LLM tabanlı metin analitiği ile ilk eleme sürelerini %30 azaltmayı hedefler."*
*   **Analiz Skoru:** **%10 Slop** (Güvenilir)
*   **VC Değerlendirmesi:**
    *   *Gerekçe:* Metin son derece net, abartıdan uzak ve ölçülebilir bir hedef sunuyor ("ilk eleme sürelerini %30 azaltmak"). Mobil prototip olduğu açıkça belirtilmiş ve gerçekçi limitler çizilmiştir.
