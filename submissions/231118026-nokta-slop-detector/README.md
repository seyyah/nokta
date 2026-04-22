# Sparkle — Idea Capture & Slop Detector

**Öğrenci No:** 231118026  
**Slug:** nokta-slop-detector

*Anlık kıvılcımları yakalayan, AI ile kalitesini ölçen ve paylaşılabilir idea.md belgelerine dönüştüren mobil araç.*

---

## Track Seçimi

**Track B: Slop Detector / Due Diligence**

Ham not yapıştırılır → AI 5 boyutlu rubrik uygular → 0–100 Slop Score + her boyut için 1 cümle gerekçe üretilir → not idea card'lara dönüştürülür → kartlar kütüphanede saklanır → seçilen kart için idea.md oluşturulup paylaşılır.

---

## Expo QR Kodu

**Expo Go ile tara:** `exp://192.168.1.233:8082`

> Aynı Wi-Fi ağında Expo Go uygulamasını aç ve QR kodu tara.

---

## Demo Video

[60 Saniyelik Demo Video](https://youtube.com/shorts/025u0-YOMco?feature=share)

---

## Uygulama Özellikleri

| Özellik | Açıklama |
|---|---|
| **Not → Idea Card** | Ham metin 5 adet emoji-icon'lu, kategorili, aksiyon adımlı karta dönüşür |
| **Slop Score** | 5 boyut × 20 puan = 100 toplam; Pazar İddiası / Kullanıcı Edinimi / Varsayım Testi / Kapsam / Özgünlük |
| **Verdict** | 0–40 Yüksek Slop (kırmızı), 41–70 Orta Slop (amber), 71–100 Düşük Slop (yeşil) |
| **Kütüphane** | Beğenilen kartlar AsyncStorage'a kaydedilir, tab geçişinde korunur |
| **idea.md Üret** | Kaydedilmiş kart için AI'nin oluşturduğu yapılandırılmış markdown belgesi |
| **Paylaş** | Native Share API ile idea.md metni doğrudan paylaşılır veya kopyalanır |

---

## Teknik Kararlar

| Karar | Neden |
|---|---|
| Expo SDK 54, React Native 0.81 | Cross-platform, hızlı prototip, Expo Go ile QR dağıtımı |
| Groq API — llama-3.1-8b-instant | Ücretsiz tier yeterli, düşük gecikme, OpenAI-compatible endpoint |
| Tek API çağrısı (Score + Cards) | İki ayrı çağrı yerine birleşik JSON; daha hızlı UX |
| Mock mode (`USE_MOCK`) | EXPO_PUBLIC_GROQ_API_KEY yoksa otomatik devreye girer; API key'siz demo yapılabilir |
| AsyncStorage — kütüphane | Basit, bağımlılık gerektirmez; kart verileri JSON olarak persist edilir |
| State App seviyesinde tutulur | Tab geçişinde Generate ekranı unmount olsa bile not/kart/skor korunur |
| BlurView + LinearGradient | Glass morphism tasarım; koyu arka plan üzerinde derinlik hissi |

---

## Slop Score Rubriği (5 × 20 = 100)

| Boyut | Ölçüm |
|---|---|
| Pazar İddiası | Kaynak bağlı pazar rakamı var mı? |
| Kullanıcı Edinimi | Somut edinim kanalı tanımlanmış mı? |
| Varsayım Testi | Kritik varsayım + test yöntemi yazılı mı? |
| Kapsam | v1 ne yapar/yapmaz açıkça sınırlandırılmış mı? |
| Özgünlük | Mekanizma düzeyinde rakip farkı gösterilmiş mi? |

---

## Geliştirme Süreci

1. `idea.md` Track B rubriği dahil yazıldı; Karpathy LLM Wiki metodolojisi referans alındı — **88/100**
2. UI sıfırdan tasarlandı: iki bölümlü kart (renkli gradient banner + cam içerik alanı)
3. Mock mode ile API key gerektirmeden test edilebilir hale getirildi
4. Kütüphane: kayıtlı kartlar AsyncStorage'da persist; tab geçişinde state korunuyor
5. idea.md modal: kaydedilmiş kart → AI belgesi → native share
6. Slop Score: tek Groq çağrısında hem 5 boyut skoru hem idea card'lar döner; animasyonlu progress bar'larla gösterilir

---

## Eksik / Sonraki Adım

- `app-release.apk` — EAS build sonrası eklenecek (`eas build -p android --profile preview`)
- Demo video — son UI üzerinden kaydedilecek
