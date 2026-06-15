# 💡 idea.md — Track A Submission

**Proje:** Idea Tracker
**Öğrenci No:** 231118072
**Track:** Track A — Ham Fikir → Engineering Soruları → Tek Sayfa Spec

---

## 1. Ham Fikir

> "Aklımda beliren fikirleri hızlıca bir ürün spesifikasyonuna çevirebileceğim, sorular sorarak beni yönlendiren bir mobil uygulama olsa çok iyi olurdu. Çünkü her fikri not alıyorum ama hiçbirini somutlaştıramıyorum."

**Fikir Özeti:**
Kullanıcının ham bir fikri (1–3 cümle) mobil uygulamaya girmesi, uygulamanın 5 temel mühendislik sorusuyla fikri derinleştirmesi ve sonunda tek sayfalık bir ürün spec belgesi üretmesi.

---

## 2. AI Engineering Soruları & Cevaplar

Aşağıdaki sorular, bir ürün mühendisinin yeni bir fikri değerlendirirken sorduğu standart discovery sorularına dayanmaktadır. Uygulama bu soruları adım adım kullanıcıya sorar.

---

### Soru 1 — Problem Tanımı
**❓ "Bu fikir hangi somut problemi çözüyor? Şu an insanlar bu problemi nasıl çözüyor?"**

**Cevap:**
Yazılım öğrencileri ve genç girişimciler aklındaki fikirleri somutlaştırmakta zorlanıyor. Mevcut araçlar ya çok karmaşık (Notion, Confluence) ya da çok basit (not defteri). Şu an insanlar ya hiç yazmıyor ya da dağınık notlar alıyor ve fikir unutuluyor. Idea Tracker, 5 dakikada yapılandırılmış bir spec çıkaran orta yolu sunuyor.

---

### Soru 2 — Hedef Kullanıcı
**❓ "Bu uygulamayı kim kullanacak? Bu kullanıcının günlük hayatında bu problem ne sıklıkla karşısına çıkıyor?"**

**Cevap:**
**Birincil kullanıcı:** 18–28 yaş arası yazılım mühendisliği öğrencileri ve Jr. developer'lar.
**İkincil kullanıcı:** Hackathon katılımcıları, indie maker'lar.
Problem sıklığı: Haftada 2–5 kez yeni bir fikir beliriyor ama bunların %90'ı somutlaşmadan kayboluyor.
Mobil öncelikli kullanıcı çünkü fikir her yerde çakıyor — yatakta, otobüste, duşta.

---

### Soru 3 — Kapsam (Scope)
**❓ "Bu uygulamanın ilk versiyonu (MVP) tam olarak ne yapacak, ne yapmayacak?"**

**Cevap:**
**MVP YAPAR:**
- Ham fikri metin olarak alır
- 5 sabit engineering sorusu sorar
- Cevapları birleştirerek tek sayfalık spec üretir
- Spec'i cihazda kaydeder (AsyncStorage)

**MVP YAPMAZ:**
- Gerçek AI API çağrısı (sorular hardcoded)
- Ses girişi
- PDF export
- Takım paylaşımı
- Versiyon geçmişi

**Sonraki versiyon:** OpenAI/Gemini entegrasyonu, ses-to-text, PDF export.

---

### Soru 4 — Kısıtlar (Constraints)
**❓ "Bu uygulamayı geliştirirken karşılaşacağın teknik, zaman veya kaynak kısıtları neler?"**

**Cevap:**
- **Zaman:** Ödev teslim süresi 2 hafta → gerçek AI API entegrasyonu mümkün değil
- **API maliyeti:** Öğrenciyim, ücretli API kullanamam → sorular hardcoded
- **Cihaz desteği:** Expo Go ile çalışmalı → native module kullanamam
- **Veri gizliliği:** Kullanıcı fikirleri 3. tarafa gönderilmemeli → offline-first
- **Ekip:** Tek kişilik geliştirme → basit state management

---

### Soru 5 — Çözüm Yaklaşımı
**❓ "Bu problemi çözmek için hangi teknik yaklaşımı benimseyeceksin? Alternatif yaklaşımlarla karşılaştır."**

**Cevap:**
**Seçilen yaklaşım:** Guided structured questioning (Wizard akışı)

Kullanıcı ekran ekran ilerler, her ekranda bir soru yanıtlar. Sonuçlar birleşince spec template'e doldurulur.

**Alternatif 1 — Tek form:** Tüm soruları tek ekranda göster. ❌ Ezici, completion rate düşük.

**Alternatif 2 — AI free-form chat:** Kullanıcı sohbet eder, AI spec çıkarır. ❌ API maliyeti + latency + offline çalışmaz.

**Alternatif 3 — Template seçimi:** Kullanıcı bir template seçer, doldurur. ❌ Boş sayfayla başlamak zor, yönlendirme yok.

**Neden wizard?** Her adımda tek bir bilişsel yük. Completion rate %70+ (literatür). Offline çalışır. Ödev süresi içinde tamamlanabilir.

---

## 3. Tek Sayfalık Spec Çıktısı

---

```
═══════════════════════════════════════════════════════
              IDEA TRACKER — PRODUCT SPEC v1.0
                     Hazırlayan: Zeynep Yardımcı
═══════════════════════════════════════════════════════

ÜRÜN ADI
  Idea Tracker — "Fikrin Var, Şimdi Yap"

PROBLEM
  Yazılım öğrencileri ve genç geliştiriciler fikirlerini
  somutlaştıramıyor. Mevcut araçlar çok karmaşık veya
  çok basit. Fikirler kaybolup gidiyor.

HEDEF KULLANICI
  · Birincil: 18–28 yaş yazılım öğrencileri
  · İkincil: Hackathon katılımcıları, indie maker'lar
  · Kullanım sıklığı: Haftada 2–5 kez
  · Cihaz tercihi: Mobil (iOS & Android)

KAPSAM — MVP
  ✓ Ham fikir metin girişi
  ✓ 5 adımlı engineering soruları (wizard akışı)
  ✓ Otomatik spec belgesi üretimi
  ✓ Cihazda kaydetme (AsyncStorage)
  ✗ AI API (sonraki versiyon)
  ✗ PDF export (sonraki versiyon)
  ✗ Paylaşım (sonraki versiyon)

KISITLAR
  · Expo Go uyumlu (native module yok)
  · Offline-first (sunucu yok)
  · Tek geliştirici, 2 hafta
  · Ücretsiz araçlar

ÇÖZÜM
  5 adımlı wizard akışı:
  Adım 0 → Ham fikir girişi
  Adım 1 → Problem tanımı
  Adım 2 → Hedef kullanıcı
  Adım 3 → MVP kapsamı
  Adım 4 → Kısıtlar
  Adım 5 → Çözüm yaklaşımı
       ↓
  Spec belgesi otomatik üretilir

BAŞARI METRİKLERİ
  · Akışı tamamlama oranı: >%70
  · Akış süresi: <5 dakika
  · Spec okunabilirliği: Kullanıcı "paylaşmaya değer"
    bulmalı

TEKNİK YAPI
  · Expo SDK 51 + React Native
  · TypeScript
  · Expo Router (file-based navigation)
  · AsyncStorage (local persistence)

SONRAKI VERSİYON (v2.0)
  · OpenAI/Gemini API ile dinamik soru üretimi
  · Ses girişi (Expo AV)
  · PDF/Markdown export
  · iCloud/Google Drive sync

═══════════════════════════════════════════════════════
```
