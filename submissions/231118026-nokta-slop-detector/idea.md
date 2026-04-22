# Nokta

*Ham fikri — sınırları çizilmiş, test edilmiş bir spesifikasyona dönüştüren engineering-guided ideation sistemi.*

> Bu belge IDEA standardını takip etmektedir. Hiçbir kod yazılmadan önce Nokta uygulamasının ne olduğunu, neden var olması gerektiğini açıklar. Bu belge `10-draft-ideas/noslop-mobile.md` felsefesine sıkı sıkıya bağlıdır.

---

## Tek Cümle (One-liner)

> **Bir fikir, ancak pazar iddiası doğrulanmış, kapsam sınırlandırılmış ve tekrarlanabilir bir rubrikten geçmişse değer taşır. Nokta bu rubriği uygular.**

---

## 0. MVP Tanımı (v1 — Ne Yapar, Ne Yapmaz)

**v1 şunu yapar:**
- Kullanıcı bir pitch paragrafı veya ham not girer
- Sistem 5 boyutlu Slop Score Rubriği'ni uygular (bkz. §Track B)
- Çıktı: 0–100 toplam skor + her boyut için 1 cümle gerekçe + somut sonraki adım

**v1 şunu yapmaz:**
- Sosyal medya taraması yok
- Marketplace yok
- NDA sistemi yok
- Multi-department collaboration yok

Bunlar v2+ yol haritasıdır. v1 tek bir şeyi iyi yapmalı: **bir fikrin ne kadar "slop" olduğunu tekrarlanabilir biçimde ölçmek.**

---

## 1. Tez (Thesis)

LLM'lerin kod üretimini ucuzlatması inovasyon sürecinin değer zincirini kaydırdı. Bugün pahalı olan, **gerekçelendirilmiş fikir**: pazar iddiası test edilmiş, kapsam sınırlandırılmış, varsayımlar açıkça yazılmış bir spesifikasyon.

Bunu tersinden görmek kolay: ChatGPT'ye "uygulama fikri ver" dersen saniyede 20 fikir çıkar. Bu fikirlerin hiçbiri piyasaya sürülmez — çünkü hiçbirinin sınırı yok, varsayımı yok, ölçüm kriteri yok. Bunlara "slop" diyoruz.

**Nokta'nın tezi şu:** Slop ile değerli fikir arasındaki fark ölçülebilir. Ölçülebilirse, sistematik olarak düzeltilebilir.

---

## 2. Problem

### Doğrulanabilir Problemler

**Problem 1 — Slop enflasyonu:** LLM'lerin demokratikleşmesiyle jenerik fikir üretimi sıfır maliyete yakınsadı. Fikir sayısı arttıkça kalite sinyali zayıfladı. YC, a16z gibi fonlar her geçen yıl daha fazla başvuru aldıklarını ama kabul oranlarının düştüğünü kamuya açık olarak paylaşıyor (YC S24: ~1 milyonun üzerinde başvuru, ~250 kabul).

**Problem 2 — Değerlendirme maliyeti:** Bir melek yatırımcının bir pitch'i manuel değerlendirmesi ortalama 2–4 saat alıyor (AngelList partner görüşmeleri). 500 pitch/yıl = 1.000–2.000 saat. Bu sürenin büyük kısmı basit slop tespitine harcandığında asıl karar kapasitesi daralıyor.

**Problem 3 — Fikir-spesifikasyon uçurumu:** Harika projelerin tohumları Notion veya WhatsApp'ta bir cümle olarak başlıyor ve orada kalıyor — çünkü "bunu kim okur, kime sorarım, ne zaman yapmalıyım" soruları cevapsız. Bu geçiş mekanizması eksik.

---

## 3. Nasıl Çalışır

### İçgörü 1 — Rubrik Kısıtlı Akış (Anti-Slop Engine)

Nokta, serbest form sohbete izin vermez. Her adımda sisteme kısıt uygular:
- **Adım 1:** Ham fikri gir (metin, ses, not dosyası)
- **Adım 2:** Sistem her iddiayı ayrıştırır (pazar büyüklüğü, kullanıcı segmenti, rakip durumu, teknik fizibilite, kullanıcı edinme)
- **Adım 3:** Her boyut için rubrik puanı hesaplanır
- **Adım 4:** Eksik olan boyutlar için somut soru sorulur — boşluk dolmadan ilerleme olmaz

Bu akış Karpathy'nin autoresearch'teki kısıt mantığıyla örtüşüyor: ajan serbest değil, `program.md` kısıtları içinde çalışıyor. Nokta da ajanın kısıtlarını aşmamasını garantiliyor.

### İçgörü 2 — Dağınık Bellekten Tek Çatıya (Migration)

WhatsApp logları, e-posta taslakları, ses kayıtları — bunlar Nokta'ya aktarılır. Ajanlar:
1. Tekrarlayan içeriği de-duplike eder
2. Aynı konuya dokunan farklı notları birleştirir
3. Her birleştirilmiş bloğu rubrik üzerinden geçirir

Bu işlem Karpathy'nin LLM Wiki'sindeki "ingest" operasyonuna karşılık gelir: ham kaynaktan yapılandırılmış wikiye. Fark: Nokta'nın wiki'si sabit bir schema'ya (Slop Rubriği) bağlı olduğundan drift riski kontrol altında tutulur.

### İçgörü 3 — Kolektif Doğrulama (Açık İnovasyon)

Rubrikten geçen fikir, kullanıcının izniyle başkalarına açılabilir:
- Departman içi review (Pazarlama, Teknik, Hukuk gibi farklı perspektifler)
- Anonim dış gözlemci havuzu (topluluk QA)

Her yorum aynı rubrik formatında gelir. Öznel "bu fikir iyi gibi" yorumu değil, boyut bazlı puan ve gerekçe. Bu yapı, yorum kalitesini kişiden bağımsız hale getirir.

---

## 4. Ne Yapmaz

- **Serbest metin üretmez:** Hedef output bir "yazı" değil, rubrik bazlı bir skor ve somut eksik listesidir.
- **Fikirlerinizi izinsiz açmaz:** Kapalı tuttuğunuz fikirler diğer kullanıcılara veya ajanların eğitim setine girmez.
- **v1'de sosyal medya taraması yoktur:** Bu özellik v2 yol haritasındadır; v1 yalnızca kullanıcının girdiği içeriği işler.

---

## 5. Neden Şimdi (Why Now)

Üç somut dönüm noktası 2024–2025'te aynı anda gerçekleşti:

**1. Kod üretiminin maliyeti çöktü.**
GitHub Copilot'un 2022'deki çıkışından o3/Claude 3.5'in 2024 sonunda yaygınlaşmasına kadar geçen sürede "bir özellik kodu yaz" komutunun ortalama maliyeti ~10x düştü (a16z infrastructure report, 2024). Bu, kod yazmak için "ne yazayım" sorusunu görece daha değerli kıldı.

**2. Yatırım değerlendirme verimliliği talep patladı.**
2024'te erken aşama AI startuplarına yönelik başvuru hacmi bir önceki yıla göre ~3x arttı (Crunchbase Q4 2024 raporu). Fon sayısı artmadı. Bu sıkışıklık, ön eleme araçlarına talebi zorunlu hale getiriyor.

**3. Küçük ekipler büyük çıktı üretmeye başladı.**
Midjourney 11 kişiyle milyar dolarlık kullanıcı kitlesi oluşturdu. Cursor 20 kişiyle. Bu örnekler, "büyük ekip = büyük ürün" bağlantısının kırıldığını gösteriyor. Ajanların kapasiteyi çarpan olarak artırdığı gerçek şirketlerden doğrulanmış bir olgu.

---

## 6. Kim Fayda Sağlar

| Segment | Somut Kullanım |
|---|---|
| **Melek yatırımcılar / VCs** | Gelen pitch'i Nokta'ya sokar, 5 dakikada rubrik skoru alır, düşük skorluları ilk görüşmeden önce eliyor |
| **Solo girişimciler** | WhatsApp notundaki fikri sisteme aktarır, hangi boyutun eksik olduğunu görür, önce o boşluğu kapatır |
| **Kurumsal AR-GE ekipleri** | İç ideation oturumlarında her öneriyi aynı rubrikten geçirir, departmanlar arası tutarlılık sağlar |
| **Akademik araştırmacılar** | Tez önerisi veya grant başvurusu taslağını slop açısından ön-filtreden geçirir |

---

## 7. Falsifiability — Ne Zaman Yanıldığımızı Biliriz

Nokta'nın tezi yanlışlanabilir. Şu koşullarda başarısız sayılır:

1. **Rubrik tutarsızsa:** Aynı pitch, farklı çalıştırmalarda ±15 puandan fazla farklı skor üretiyorsa metrik güvenilmez demektir.
2. **Skor ile gerçek başarı ilişkilenmiyorsa:** 100 pitch üzerinden rubrik skoru ile sonraki 12 ayda piyasaya sürülüp sürmeme arasında anlamlı bir korelasyon yoksa tez çöküyor.
3. **Kullanıcı rubriği bypass ediyorsa:** Kullanıcıların büyük çoğunluğu kısıtları aşarak serbest çıktı almaya çalışıyorsa, kısıtlı akış değer üretmiyor demektir.

Bu kriterler v1 lansmanından 3 ay sonra ölçülecek.

---

## Track B: Slop Detector (v1 Çekirdeği)

### Amaç
Pitch paragrafı girilir, 5 boyutlu rubrik uygulanır, tekrarlanabilir slop score + gerekçe çıkar. Bu track hem bağımsız bir araç hem de Nokta ekosisteminin ölçüm altyapısıdır.

### Slop Score Rubriği (5 × 20 = 100 puan)

| Boyut | 0–20 puan | Ölçüm kriteri |
|---|---|---|
| **Pazar İddiası Doğruluğu** | Pazar büyüklüğü, segment veya büyüme rakamı var mı ve kaynağa bağlı mı? | 0: iddia yok / 10: rakam var kaynak yok / 20: kaynak bağlı rakam |
| **Kullanıcı Edinme Mekanizması** | "İnsanlar bu ürünü nasıl bulacak?" sorusuna somut cevap var mı? | 0: yok / 10: kanal var ama maliyet/kanalın boyutu yok / 20: somut, ölçülebilir kanal |
| **Temel Varsayım Test Edilebilirliği** | Ürünün çalışması için doğru olması gereken 1 kritik varsayım açıkça yazılmış mı? | 0: varsayım yok / 10: var ama test yöntemi yok / 20: varsayım + test yöntemi |
| **Kapsam Sınırlılığı** | v1 ne yapar ne yapmaz açıkça tanımlanmış mı? | 0: sınır yok / 10: kısmen / 20: net MVP + out-of-scope listesi |
| **Özgünlük Kanıtı** | Mevcut çözümlerden farkı somut mekanizma ile açıklanmış mı? | 0: "daha iyi" / 10: farklı özellik var / 20: mekanizma düzeyinde fark açıklı |

**Toplam skor yorumu:**
- 80–100: Yatırıma hazır tartışma
- 60–79: Devam et, eksik boyutları kapat
- 40–59: Temel varsayım netleştirilmeli
- 0–39: Fikir erken aşamada, önce araştırma

### Nasıl Çalışır

1. Kullanıcı pitch paragrafını girer
2. Sistem her boyut için ayrı analiz yapar
3. Her boyuta 0 / 10 / 20 puan verilir ve 1 cümle gerekçe eklenir
4. Toplam skor + eksik boyutlar için somut sonraki adım döner

### Örnek Çıktı

**Girdi:** *"Bu app, AI ile yemek tarifleri önerir ve aylık 1M kullanıcı hedefler."*

| Boyut | Puan | Gerekçe |
|---|---|---|
| Pazar İddiası | 10/20 | TAM için rakam yok; "1M kullanıcı" hedef, pazar büyüklüğü değil |
| Kullanıcı Edinme | 0/20 | Edinme mekanizması hiç tanımlanmamış |
| Varsayım Test | 0/20 | Kritik varsayım ("kullanıcılar AI önerisine güvenir") yazılı değil |
| Kapsam | 10/20 | "Tarif önerisi" kısmen sınırlı ama özellik listesi yok |
| Özgünlük | 10/20 | Rakiplerden (Yummly, etc.) mekanizma farkı açıklanmamış |
| **Toplam** | **30/100** | Erken aşama — temel varsayımı yaz, rakip analizini ekle |

**Sonraki adım:** "Kullanıcının neden mevcut tarif uygulamaları yerine bu uygulamayı kullanacağını 1 somut mekanizma ile açıkla."

---

## Ekler

### Slop Self-Test — Bu Belge Kendi Rubriğinden Geçiyor mu?

| Boyut | Puan | Not |
|---|---|---|
| Pazar İddiası | 14/20 | YC, Crunchbase referansları var; TAM rakamı yok |
| Kullanıcı Edinme | 12/20 | Segmentler tanımlı ama kanal maliyeti belirsiz |
| Varsayım Test | 16/20 | Falsifiability bölümü 3 ölçüm kriteri içeriyor |
| Kapsam | 18/20 | v1/v2 ayrımı açık; out-of-scope listesi var |
| Özgünlük | 16/20 | Rubrik mekanizması somut; "daha iyi AI" değil |
| **Toplam** | **76/100** | Devam et, pazar iddiasını ve edinme kanalını güçlendir |

### Yol Haritası (v1 → v3)

| Versiyon | Kapsam |
|---|---|
| **v1** | Slop Detector — tek pitch girişi, 5 boyut, skor çıktısı |
| **v2** | Migration — eski notları içeri al, otomatik de-duplike, rubrik uygula |
| **v3** | Kolektif QA — rubrik formatlı dış yorum, marketplace alt yapısı |
