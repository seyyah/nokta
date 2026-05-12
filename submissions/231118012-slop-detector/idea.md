# Nokta — Slop Detector & Due Diligence (Track B)

*Ham fikirlerin "slop" (yığın) mı, yoksa "engineered" (mühendislik ürünü) bir yapı mı olduğunu analiz eden otonom denetim ajanı. Nokta ekosisteminin "Yatırım Ön Filtresi" ve "Kalite Duvarı" modülü.*

> Bu belge IDEA standardını takip etmektedir. Hiçbir kod yazılmadan önce Nokta Slop Detector’ın ne olduğunu, neden var olması gerektiğini ve ana Nokta pipeline’ına nasıl entegre edileceğini açıklar. Bu belge `10-draft-ideas/noslop-mobile.md` felsefesine ve ana Nokta idea.md dosyasına sıkı sıkıya bağlıdır.

---

## 1. Tez (Thesis)

İnternet, temellendirilmemiş, içi boş, sadece ilgi çekmeye yönelik “slop” (çöp) fikirlerle doludur.  
**Nokta Slop Detector**, bir fikir metnini alır, onu rasyonel, pazar verisine dayalı ve teknik olarak uygulanabilir olup olmadığına göre skorlar. Amacımız gürültüyü (noise) eler, sinyali (signal) ortaya çıkarır ve her fikri ana Nokta Engineering-Guided Pipeline’ına hazır hale getirir.

Slop Detector, Nokta’nın kalite duvarıdır: pazar yerine veya yatırımcı masasına sadece %85+ skorlu, ayağı yere basan artifact’ler ulaşır.

---

## 2. Problem

- **Yatırımcı Yorgunluğu:** Melek yatırımcılar ve VC’ler, teknik olarak doğrulanmamış binlerce yüzeysel pitch-deck arasında asıl fırsatları kaçırıyor.
- **Fikir Enflasyonu:** AI ile her saniye binlerce jenerik “uygulama fikri” üretilebiliyor ancak bunların %99’u uygulanabilirlikten uzak.
- **Doğrulanmamış İddialar:** Bir girişimci “Pazarım X büyüklüğünde, sistemim Y teknolojisiyle çalışıyor” dediğinde, bu iddianın ne kadar gerçekçi olduğunu ölçen bağımsız, hızlı ve tekrarlanabilir bir “Güven Filtresi” yok.
- **Pazar Yeri Kirlenmesi:** Olgunlaşmamış fikirler marketplace’e sızarsa tüm ekosistemin güven skoru düşer.

---

## 3. Nasıl Çalışır (How It Works)

### Temel İçgörü 1 — Engineering-Guided Slop Detection Pipeline
Slop Detector, açık uçlu LLM sorgularına izin vermez. Giriş metnini katı, adım-adım, metrik odaklı bir pipeline’dan geçirir (ana Nokta pipeline’ının Aşama 2’sine doğrudan entegre olur).

### Temel İçgörü 2 — 4 Boyutlu Skorlama Motoru
Her fikir **Slop Score (0-100)** alır. Skor ne kadar düşükse o kadar “slop”tur.  
Skor, 4 paralel ajan tarafından hesaplanır ve ağırlıklı ortalamayla birleştirilir.

### Temel İçgörü 3 — Red-Flag Raporu + Pivot Önerisi
Sadece puan vermekle kalmaz; “Neden slop?” sorusuna teknik gerekçeli liste ve “Bu fikri ayağı yere basan hale getirmek için 3 mühendislik kısıtı” önerir.

### Temel İçgörü 4 — Ana Nokta Ekosistemi ile Tam Entegrasyon
Slop Detector, Nokta’nın Agent Swarm’ının bir parçasıdır. Skor < 85 ise fikir otomatik olarak “Kişisel Kuluçka” modunda kalır ve pazar yerine düşmez.

---

## 4. Ne Yapmaz (What It Does Not Do)

- **Hype Üretmez:** “Bu harika bir fikir!” gibi subjektif yorumlar yapmaz. Sadece veriye dayalı, tekrarlanabilir skor verir.
- **Fikri Çalmaz veya İstismar Etmez:** Analiz tamamen client-side encryption ile başlar; sonuçlar sadece kullanıcı izniyle paylaşılır.
- **Yerine Karar Vermez:** İnsan-onay gate’i zorunludur. Slop Detector “red flag” koyar, nihai kararı kullanıcı veya departman verir.

---

## 5. Neden Şimdi (Why Now)

AI ile fikir üretimi bedavalaşırken, doğrulama hâlâ manuel ve yavaş. 2026 itibarıyla Slop Detector, Nokta’nın “slop-free” taahhüdünün en kritik bileşenidir ve yatırımcıların deal-flow’unu saniyelere indirir.

---

## 6. Kim Fayda Sağlar (Who Benefits)

- **Melek Yatırımcılar & VC’ler:** Binlerce pitch-deck’i <10 saniyede filtreleyip sadece yüksek skorlu olanlara zaman ayırırlar.
- **Girişimciler & Solo-Founders:** Fikirlerini göndermeden önce kendi kendilerine “due diligence” yapıp zayıf noktaları görürler.
- **Kurumsal İnovasyon Ekipleri:** İç fikir havuzlarını otomatik kalite duvarından geçirirler.
- **Nokta Marketplace Kullanıcıları:** Sadece %85+ skorlu artifact’lerle karşılaşırlar.

---

## 7. Özet (Summary)

Nokta Slop Detector, ham fikri alır, 4 mühendislik boyutuyla skorlar, red-flag raporu ve pivot önerisi verir. Ana Nokta pipeline’ına entegre olarak ekosistemin kalite duvarını oluşturur. Böylece “fikir enflasyonu” çağında gerçek sinyal ortaya çıkarılır ve sadece engineered artifact’ler pazar yerine veya yatırımcı masasına ulaşır.

---

## 8. Engineering-Guided Process — Detaylı Akış ve Metrikler (v0.1)

**Aşama 0 → Input Normalization** Giriş (metin, pitch-deck paragrafı, ses transkripti) → zorunlu 9 metadata alanı (ana Nokta ile aynı).

**Aşama 1 → Parallel Agent Swarm** 4 ajan eş zamanlı çalışır:

| Ajan | Sorumluluk | Kullandığı Veri Kaynağı |
| :--- | :--- | :--- |
| Tech-Depth Agent | Mimari iskelet var mı? | RAG + kod örneği karşılaştırma |
| Market-Rationality Agent | Pazar iddiaları gerçekçi mi? | Kamu veri setleri + trend RAG |
| Feasibility Agent | Mevcut teknolojiyle üretilebilir mi? | Tech stack benchmark’ları |
| Originality Agent | Bilindik slop kalıplarıyla benzerlik? | Embedding cosine similarity |

**Aşama 2 → Skorlama ve Raporlama** **Slop Score** formülü:  
\[ \text{Slop Score} = 100 - (0.3 \cdot T + 0.3 \cdot M + 0.2 \cdot F + 0.2 \cdot O) \]  
(T = Tech-Depth eksikliği, M = Market-Rationality eksikliği, F = Feasibility eksikliği, O = Originality eksikliği; her biri 0-100 arası)

---

## 9. Risk Matrisi ve Mitigasyon Stratejileri

| Risk | Olasılık | Etki | Mitigasyon (Mühendislik Katmanı) |
| :--- | :--- | :--- | :--- |
| Yanlış pozitif | Orta | Yüksek | Human-in-the-loop approval gate |
| Embedding bias | Orta | Yüksek | Sürekli RAG güncellemesi |
| Veri gizliliği | Düşük | Kritik | Client-side encryption |

---

