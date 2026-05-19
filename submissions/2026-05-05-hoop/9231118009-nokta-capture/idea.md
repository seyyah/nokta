# 💩 Slop Dedektörü — Track 2: Pitch → Slop Score

## Fikir Özeti

Startup pitch paragraflarını yapay zekâ ile analiz edip **"slop score"** (0–100) üreten bir mobil uygulama.

Kullanıcı pitch metnini yapıştırır, AI şu boyutları test eder:

| Boyut | Ne ölçer? |
|-------|-----------|
| **Buzzword yoğunluğu** | "disrupting", "revolutionizing", "AI-powered" gibi boş jargon oranı |
| **Kanıt eksikliği** | Sayı, veri, metrik olmadan yapılan büyük iddialar |
| **Pazar büyüklüğü şişirme** | "trillion-dollar market" gibi abartılı TAM/SAM/SOM iddiaları |
| **Belirsiz fayda** | Somut değer yerine genel vaatler ("daha iyi deneyim" vb.) |
| **Teknik muğlaklık** | Nasıl çalıştığı açıklanmadan "AI/ML/blockchain" kullanımı |

## Çıktı Formatı

```
📊 SLOP SCORE: 73/100  (Yüksek Slop!)

🔍 Detaylı Analiz:
- Buzzword yoğunluğu: 8/10  → "AI-powered", "disrupt", "revolutionary" x3
- Kanıt eksikliği: 7/10    → 0 metrik, 0 veri noktası
- Pazar şişirme: 9/10      → "$50B market" kaynaksız
- Belirsiz fayda: 6/10     → "seamless experience" somut değil
- Teknik muğlaklık: 7/10   → AI nasıl kullanılıyor belirsiz

💡 Öneriler:
1. "$50B market" iddiasını kaynak ile destekle
2. "Seamless experience" yerine ölçülebilir fayda yaz
3. AI'ın hangi modeli/veriyi kullandığını belirt
```

## Kullanıcı Akışı & Human Loop Spectrum

Hoca'nın framework'üne göre uygulama üç loop seviyesinde çalışır:

| Adım | Loop | Ne olur? |
|------|------|----------|
| 1. Pitch yapıştır + "Analiz Et" | **HOOTL** | AI otonom analiz eder, insan müdahalesi yok |
| 2. Sonuç ekrana gelir, "Onayla / Düzenle" sorusu çıkar | **HOTL** | İnsan sonucu izler, onaylar ya da reddeder |
| 3a. Onayla → Sonuç kesinleşir, paylaş butonu aktif | **HOTL** | İnsan onayladı, AI kararı geçerli |
| 3b. Düzenle → Manuel skor girişi açılır | **HITL** | İnsan tam kontrolü alır, skoru değiştirir |

## Teknik Mimari

- **Frontend**: React Native + Expo
- **AI Backend**: Anthropic Claude API (client-side — demo amaçlı)
- **State**: React useState (loopMode: HOOTL / HOTL / HITL)
- **Styling**: React Native StyleSheet

## Referans Alınan Materyaller

Karpathy'nin autoresearch'ü, AI'ın otonom döngüde hipotez üretip metrik ölçebildiğini gösterdi. Hoca'nın HOTL/HOOTL çerçevesi ise ne zaman AI'ın otonom çalışacağını, ne zaman insanın devreye gireceğini harness katmanıyla belirlemenin önemini ortaya koydu. Slop Dedektörü bu iki fikri birleştiriyor: pitch analizi HOOTL modunda çalışıyor, kullanıcı sonucu onaylayıp paylaşmaya karar verdiğinde HITL devreye giriyor.

## Hedef Kullanıcı

- Startup kurucuları (pitch'lerini test etmek için)
- Yatırımcılar (gelen pitch'leri hızlıca elemek için)
- Üniversite öğrencileri (girişimcilik dersi ödevleri)

## Neden Track 2?

- Tek input / tek output → En basit akış
- Multi-turn diyalog yok
- Parsing/dedup karmaşası yok
- Görsel olarak etkili (skor göstergesi)

## Decision Log

| Karar | Neden |
|-------|-------|
| Track 2 seçildi | En basit akış: tek input → tek output |
| Expo blank template | Minimum bağımlılık, hızlı geliştirme |
| Client-side API çağrısı | Demo amaçlı; production'da backend proxy kullanılmalı |
| Dark theme | Slop dedektörü konseptine uygun edgy estetik |
| 5 boyutlu analiz | Tek sayıdan daha anlamlı ve öğretici |
| HOTL/HITL katmanı eklendi | Hoca'nın Human Loop Spectrum framework'üne göre AI sonucu kullanıcı onayına sunuluyor, reddederse manuel düzenleme modu açılıyor |