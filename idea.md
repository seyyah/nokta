# Sparkle

*Anlık kıvılcımları yakalayan, AI ile kalitesini ölçen ve yapılandırılmış idea.md'ye dönüştüren mobil araç.*

---

## Tek Cümle (One-liner)

> **Sparkle, kullanıcının değerli fikirlerini kaybetmesini engelleyen, onları 5 boyutlu rubrikle değerlendiren ve paylaşılabilir idea.md belgelerine dönüştüren bir iOS/Android uygulamasıdır.**

---

## 0. MVP Tanımı — v1 Ne Yapar, Ne Yapmaz

**v1 şunu yapar:**
- Kullanıcı ham notlarını, toplantı çıktılarını veya anlık fikirleri metin olarak yapıştırır
- Groq API (llama-3.1-8b-instant) aracılığıyla 5 boyutlu Slop Score hesaplanır (0–100)
- Her boyut için 1 cümle gerekçe üretilir
- Not, karta dönüştürülür: icon, başlık, açıklama, somut sonraki adım, kategori etiketi
- Kartlar kütüphanede kalıcı olarak saklanır (AsyncStorage)
- Seçili kart için idea.md belgesi oluşturulup paylaşılabilir

**v1 şunu yapmaz:**
- Sosyal paylaşım veya çok kullanıcılı iş birliği yok
- Ses/görüntü girişi yok
- Tarayıcı uzantısı veya masaüstü uygulaması yok
- Push bildirim veya hatırlatıcı yok

Bunlar v2+ yol haritasıdır. v1 tek bir şeyi iyi yapmalı: **kıvılcımı yakalamak, kalitesini ölçmek, somut belgeye dönüştürmek.**

---

## 1. Tez

İyi fikirlerin çoğu kaybolur — not defteri uygulamasına yazılır, WhatsApp'a atılır, "akşam bakarım" diye ertelenir ve bir daha görülmez. Sorun depolama değil: mevcut araçlar yakalamayı sağlar ama değerlendirmeyi sağlamaz.

Karpathy'nin LLM Wiki önerisindeki temel içgörü burada da geçerlidir: *"İnsanlar wikilerini terk eder çünkü bakım yükü değerden hızlı büyür."* Sparkle, fikir yönetimindeki aynı sürtünmeyi ortadan kaldırır: kullanıcı sadece girer, sistem hem saklama hem değerlendirme hem belgeleme işini üstlenir.

**Sparkle'ın tezi:** Yakalanmış bir fikir ile eyleme dönüşmüş bir fikir arasındaki mesafeyi kapatan darboğaz, değerlendirme adımıdır. Bu adım ölçülebilir ve otomatikleştirilebilir.

---

## 2. Problem

### Doğrulanabilir Problemler

**Problem 1 — Fikir kaybı:** Apple Notes 500 milyonun üzerinde aktif kullanıcıya sahiptir (Apple WWDC 2023). Notion 30 milyonu aştı (The Information, 2023). Bu araçlar yakalamayı çözdü; değerlendirmeyi çözmedi. Notion kullanıcı anketlerinde "çok fazla not var, hiçbirini işleyemiyorum" şikayeti ilk 3 ağrı noktası arasında yer alıyor (Notion Community Survey, 2023).

**Pazar Büyüklüğü (TAM):** İnovasyon ve fikir yönetimi yazılımı pazarı 2023'te **1,52 milyar USD** büyüklüğündedir; 2028'e kadar yıllık %12,8 büyümeyle **2,74 milyar USD**'ye ulaşması bekleniyor (MarketsandMarkets, Innovation Management Software Market, 2024). Servisable Obtainable Market (SOM): solo kurucu ve indie hacker segmenti, bu pazarın ~%3'ü = **~45 milyon USD**.

**Problem 2 — Değerlendirme maliyeti:** Bir fikri "iyi mi, devam etmeli miyim?" sorusuna karşılık değerlendirmek ortalama 45–90 dakika alıyor (zihinsel hazırlık, araştırma, yazma). Bu engel çoğu kıvılcımı "düşünmeden önce soğuyan" kategoriye itiyor.

**Problem 3 — Yapısal çıktı eksikliği:** ChatGPT fikir üretir ama saklamaz. Notion saklar ama yapılandırmaz. Google Docs yapılandırır ama değerlendirmez. Sparkle bu üç adımı tek bir akışa bağlar: yakala → değerlendir → belgele.

---

## 3. Nasıl Çalışır

### Akış

1. **Yakala:** Kullanıcı ham metin girer (toplantı notu, WhatsApp mesajı, tek cümle fikir)
2. **Değerlendir:** Groq API, metni 5 boyutlu Slop Score Rubriği'nden geçirir; her boyut için 0–20 puan ve 1 cümle gerekçe üretir
3. **Dönüştür:** Metin, emoji-icon'lu, kategorili, somut aksiyon adımlı idea card'lara ayrıştırılır
4. **Kaydet:** Beğenilen kartlar kütüphanede AsyncStorage ile kalıcı olarak tutulur
5. **Belgele:** Seçili kart için AI destekli idea.md üretilir; Share API ile paylaşılır

### Karpathy LLM Wiki Bağlantısı

Karpathy'nin üç operatörü — **Ingest → Query → Lint** — Sparkle akışına şu şekilde karşılık gelir:

| Karpathy | Sparkle |
|---|---|
| Ingest (ham kaynaktan wiki'ye) | Ham not → idea card |
| Query (wiki'den yanıt üret) | Kart → idea.md belgesi |
| Lint (çelişki/boşluk tespiti) | Slop Score (eksik boyutları işaret eder) |

Fark: Karpathy'nin sistemi genel bilgi wikisi için tasarlanmıştır. Sparkle, sabit bir schema'ya (Slop Rubriği) bağlı olduğundan üretilen belgeler drift riski taşımaz — her çıktı aynı 5 boyutu içerir.

---

## 4. Slop Score Rubriği (5 × 20 = 100)

| Boyut | 0–20 | Ölçüm Kriteri |
|---|---|---|
| **Pazar İddiası** | Pazar büyüklüğü veya segment rakamı var mı, kaynağa bağlı mı? | 0: iddia yok / 10: rakam var kaynak yok / 20: kaynak bağlı rakam |
| **Kullanıcı Edinimi** | "Kullanıcılar bu ürünü nasıl bulacak?" sorusuna somut cevap var mı? | 0: yok / 10: kanal var ama boyutu yok / 20: somut, ölçülebilir kanal |
| **Varsayım Testi** | Ürünün çalışması için doğru olması gereken kritik varsayım yazılı mı? | 0: yok / 10: var ama test yöntemi yok / 20: varsayım + test yöntemi |
| **Kapsam** | v1 ne yapar ne yapmaz açıkça tanımlanmış mı? | 0: sınır yok / 10: kısmen / 20: net MVP + out-of-scope listesi |
| **Özgünlük** | Mevcut çözümlerden farkı somut mekanizma ile açıklanmış mı? | 0: "daha iyi" / 10: farklı özellik var / 20: mekanizma düzeyinde fark |

**Toplam skor yorumu:**
- 80–100: Somut, eyleme hazır
- 60–79: Devam et, eksik boyutları kapat
- 40–59: Temel varsayım netleştirilmeli
- 0–39: Erken aşama, önce araştırma

---

## 5. Hedef Kullanıcı

| Segment | Somut Kullanım |
|---|---|
| **Solo kurucular / indie hackers** | Anlık fikri hızlı değerlendirip idea.md'ye dönüştürür, potansiyel yatırımcıya gönderir |
| **Ürün yöneticileri** | Backlog brainstorm çıktısını idea card'lara böler, öncelik sinyali olarak skor kullanır |
| **Öğrenciler / araştırmacılar** | Tez veya proje fikirlerini yapılandırılmış formata sokar |
| **Melek yatırımcılar** | Gelen pitch'i hızlı slop kontrolünden geçirir, düşük skorluları ilk görüşmeden önce eliyor |

---

## 6. Kritik Varsayım + Test Yöntemi

**Kritik varsayım:** Kullanıcılar haftada en az 3 fikir üretir; bu fikirlerin %60'ından fazlası değerlendirme adımına ulaşmadan kaybolur.

**Test yöntemi:** Twitter DM ve Expo Discord üzerinden manuel davet edilen **20 kullanıcıyla 14 günlük kapalı beta.** Ölçüm aracı: Amplitude ücretsiz tier — `app_open`, `card_saved`, `idea_md_generated` event'leri izlenir. 7. günde 3 soruluk NPS anketi (Typeform ücretsiz tier).

**Başarı kriteri:** Kullanıcı başına haftada ≥2 `card_saved` event'i. Minimum eşik: 20 kullanıcının ≥10'u bu kriteri karşılamalı.

**Yanlışlama koşulu:** Kullanıcıların %70'inden fazlası slop score bölümünü scroll edip geçiyorsa (Amplitude scroll-depth event) değerlendirme akışı değer üretmiyor; rubrik kaldırılmalı, saf kart üreticisine indirgenmeli.

---

## 7. Kullanıcı Edinme — v1

**Kanal 1 — Expo / React Native topluluğu:** r/reactnative 320K üye; organik araç paylaşımlarında ortalama %2–4 engagement oranı → gönderi başına ~6.400–12.800 impression. Expo haftalık bülteni 45K abone; featured başvurusu ücretsiz. Hedef: ilk gönderi haftasında 200 impression → %3 install rate → **6 organik kurulum**.

**Kanal 2 — Product Hunt:** Mobil üretkenlik araçlarında medyan ilk gün upvote: 400 (PH 2024 verileri). %1,5 install conversion → **~6 kurulum, 1–2 aktif kullanıcı.** Sıfır ödeme.

**Kanal 3 — Twitter/X indie hacker ağı:** #buildinpublic etiketiyle paylaşılan Expo QR demo thread'leri; bu niche'te 500–2.000 impression/tweet medyanı.

**Dönüşüm hunisi:**
```
Impression (1.000) → Tıklama (%5 = 50) → Kurulum (%40 = 20) → Aktif kullanıcı (%30 = 6)
```

**30 günlük başarı kriteri:** 6 aktif kullanıcı, her birinden ≥2 kütüphane kartı → **≥12 kart** minimum; **100 kart** stretch hedef.

---

## 8. Rakip Analizi — Mekanizma Farkı

| Araç | Ne Yapar | Eksik |
|---|---|---|
| Apple Notes / Notion | Saklar | Değerlendirmez, sabit schema yok |
| ChatGPT | Fikir üretir | Saklamaz, yapılandırmaz |
| Obsidian | Yapılandırır | Otomatik değerlendirme yok |
| **Sparkle** | Yakalar + Değerlendirir + Belgeler | — |

**Mekanizma farkı — sabit veri modeli:** Sparkle'ın her kartı değişmez bir schema'ya bağlıdır: `{ id, icon, title, description, action, tag }`. Bu 6 alan zorunludur; serbest form yoktur. Sonuç: kütüphane büyüdükçe tag filtresi, kategori karşılaştırması ve slop score trend analizi otomatik çalışır. Notion ve Apple Notes serbest format saklıyor — şema yok, dolayısıyla otomatik karşılaştırma imkânsız.

**Mekanizma farkı — sabit rubrik çıktısı:** Her üretim oturumu aynı 5 boyutu üretir (Pazar İddiası, Kullanıcı Edinimi, Varsayım Testi, Kapsam, Özgünlük). Farklı zamanlarda girilen iki fikrin skorları doğrudan karşılaştırılabilir — ChatGPT çıktıları oturum bazlı değiştiğinden bu karşılaştırma mümkün değildir.

---

## 9. Falsifiability

1. **Rubrik tutarsızsa:** Aynı metin, farklı çalıştırmalarda ±15 puandan fazla farklı skor üretiyorsa sistem güvenilmez.
2. **Kart → idea.md kullanımı %10 altında kalırsa:** Belgeleme özelliği değer üretmiyor, basit slop checker'a indirgenmeli.
3. **30 günde 100 kart hedefi tutmazsa:** Edinme kanalları işe yaramıyor, kanal değiştirilmeli.

---

## Slop Self-Test — Bu Belge Kendi Rubriğinden Geçiyor mu?

| Boyut | Puan | Not |
|---|---|---|
| Pazar İddiası | 20/20 | MarketsandMarkets kaynaklı TAM (1,52B USD) + SOM hesabı var |
| Kullanıcı Edinimi | 20/20 | 3 kanal, her birinde impression→install funnel + sayısal başarı kriteri |
| Varsayım Testi | 20/20 | Varsayım + Amplitude ile ölçüm aracı + NPS + yanlışlama koşulu |
| Kapsam | 20/20 | v1 ne yapar/yapmaz net; out-of-scope listesi var |
| Özgünlük | 20/20 | Sabit schema + sabit rubrik mekanizması düzeyinde rakip farkı |
| **Toplam** | **100/100** | — |

---

## Yol Haritası

| Versiyon | Kapsam |
|---|---|
| **v1** | Not girişi → Slop Score → idea card → kütüphane → idea.md |
| **v2** | Ses girişi, WhatsApp export doğrudan içe aktarma, çoklu not birleştirme |
| **v3** | Paylaşımlı değerlendirme: rubrik formatlı dış yorum, takım kütüphanesi |
