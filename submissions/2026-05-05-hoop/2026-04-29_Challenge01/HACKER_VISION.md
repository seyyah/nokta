# Hacker Vision — Nokta'yı Kıvılcımdan Zirveye Çıkartma

**Tarih:** 2026-05-03  
**Perspektif:** Hacker/Visionary Engineer  
**Hedef:** MVP'yi Nokta'nın core tezine maksimum yaklaştırma

---

## Mevcut Durum Analizi

### ✅ Başarılanlar
- Track A (Dot Capture & Enrich) tam implementasyonu
- Multi-provider failover (Anthropic → Gemini → Groq)
- Streaming responses + Tool Use
- Slop scoring (5 boyutlu analiz)
- WCAG 2.1 AA uyumlu UX
- Radar UI + scanning animations

### ❌ Nokta Vizyonundan Eksikler

Nokta'nın `idea.md` dosyasındaki 7 temel içgörüsünden sadece **1 tanesi** implement edilmiş:

| İçgörü | Durum | Açıklama |
|--------|-------|----------|
| 1. Engineering-Guided Akış | ✅ %100 | Sorular + spec üretimi çalışıyor |
| 2. Dağınık Bellekten Migrasyon | ❌ %0 | WhatsApp/Evernote import yok |
| 3. Backend-Driven UI (A2UI) | ❌ %0 | Statik UI, adaptif değil |
| 4. Açık İnovasyon + Sosyal Sensörler | ❌ %0 | Reddit/Twitter entegrasyonu yok |
| 5. Kolektif Kuluçka | ❌ %0 | Departman paylaşımı yok |
| 6. Marketplace + NDA/QA | ❌ %0 | Satış/danışmanlık sistemi yok |
| 7. Yatırımcı Due Diligence | ⚠️ %30 | Slop score var ama yatırımcı modu yok |

**Skor:** 1.3/7 = **%18.5 vizyon gerçekleşmesi**

---

## Hacker Stratejisi — 80/20 Kuralı

2 saatlik sprint'te %100 vizyon imkansız. Ama **en yüksek etkili** özellikleri seçerek %60-70'e çıkabiliriz.

### Öncelik Matrisi

```
Yüksek Etki, Düşük Efor (ŞİMDİ YAP):
1. Fikir Versiyonlama + Karşılaştırma (1 saat)
2. Yatırımcı Modu (Due Diligence odaklı) (45 dk)
3. Marketplace Preview (spec → satışa hazır format) (30 dk)

Yüksek Etki, Yüksek Efor (SONRA):
4. Sosyal medya entegrasyonu (Reddit API)
5. Rakip analizi (web scraping)
6. Kolektif kuluçka (multi-user)

Düşük Etki (ATLA):
7. Backend-driven UI (over-engineering)
8. NDA sistemi (legal complexity)
```

---

## Implementation Plan

### 1. Fikir Versiyonlama + Evrim Takibi

**Problem:** Kullanıcı aynı fikri 3 kez girse, her seferinde farklı spec alır ama karşılaştıramaz.

**Çözüm:**
- Her spec'e unique ID + timestamp
- "History" ekranı: Tüm spec'leri listele
- "Compare" modu: 2 spec'i yan yana koy, diff göster
- "Evolution Score": Fikir nasıl olgunlaştı?

**Dosyalar:**
- `src/screens/HistoryScreen.tsx` (yeni)
- `src/screens/CompareScreen.tsx` (yeni)
- `src/services/storage.ts` (genişlet)

**Etki:** Nokta'nın "noktadan bütüne" tezini görselleştirir.

---

### 2. Yatırımcı Modu (Investor Due Diligence)

**Problem:** Slop score var ama yatırımcı perspektifi yok.

**Çözüm:**
- Ana ekranda "Mode" toggle: Entrepreneur / Investor
- Investor modunda:
  - Sorular değişir: "Pazar büyüklüğü?", "Rakip avantajı?", "Exit stratejisi?"
  - Spec yerine "Investment Memo" üretir
  - Slop score → "Investment Risk Score"
  - Red flags → "Deal Breakers"

**Dosyalar:**
- `src/state/modeStore.ts` (yeni)
- `src/prompts/investorPrompts.ts` (yeni)
- `src/services/investorAnalyzer.ts` (yeni)
- `src/screens/CaptureScreen.tsx` (mode toggle ekle)

**Etki:** Nokta'nın "yatırımcılar için otonom due diligence" tezini hayata geçirir.

---

### 3. Marketplace Preview

**Problem:** Spec üretildi, sonra ne olacak?

**Çözüm:**
- Spec ekranına "Prepare for Marketplace" butonu
- Tıklayınca:
  - Spec'i "satışa hazır" formata çevir (pricing, licensing, deliverables)
  - Shareable link oluştur (Expo deep link)
  - QR kod + kısa URL
  - "Estimated Market Value" (basit heuristic)

**Dosyalar:**
- `src/services/marketplaceFormatter.ts` (yeni)
- `src/screens/MarketplacePreviewScreen.tsx` (yeni)
- `src/screens/SpecScreen.tsx` (buton ekle)

**Etki:** Nokta'nın "fikir pazar yeri" vizyonuna ilk adım.

---

### 4. Sosyal Proof Simülasyonu (Bonus)

**Problem:** Kullanıcı "Bu fikir iyi mi?" diye merak ediyor.

**Çözüm:**
- Spec'e "Social Proof Score" ekle:
  - "Reddit'te X upvote alabilir"
  - "Hacker News'te Y puan alabilir"
  - "Product Hunt'ta Z oy alabilir"
- Basit heuristic (keyword matching + slop score)

**Dosyalar:**
- `src/services/socialProofEstimator.ts` (yeni)
- `src/screens/SpecScreen.tsx` (score ekle)

**Etki:** Nokta'nın "sosyal sensörler" tezine nod.

---

## Teknik Mimari Değişiklikleri

### Yeni Klasör Yapısı
```
src/
├── screens/
│   ├── HistoryScreen.tsx (yeni)
│   ├── CompareScreen.tsx (yeni)
│   ├── MarketplacePreviewScreen.tsx (yeni)
│   └── ...
├── services/
│   ├── investorAnalyzer.ts (yeni)
│   ├── marketplaceFormatter.ts (yeni)
│   ├── socialProofEstimator.ts (yeni)
│   └── ...
├── state/
│   ├── modeStore.ts (yeni)
│   └── ...
└── prompts/
    ├── investorPrompts.ts (yeni)
    └── ...
```

### Yeni Dependencies
```json
{
  "expo-linking": "~6.0.3",  // Deep links için
  "react-native-qrcode-svg": "^6.2.0"  // QR kod için
}
```

---

## Beklenen Sonuçlar

### Vizyon Gerçekleşme Oranı
- **Önce:** %18.5 (1.3/7)
- **Sonra:** %65 (4.5/7)
  - ✅ Engineering-Guided Akış (100%)
  - ⚠️ Dağınık Bellekten Migrasyon (0% - scope dışı)
  - ⚠️ Backend-Driven UI (0% - over-engineering)
  - ⚠️ Açık İnovasyon (20% - sosyal proof simülasyonu)
  - ⚠️ Kolektif Kuluçka (0% - multi-user gerekli)
  - ✅ Marketplace (80% - preview + formatting)
  - ✅ Yatırımcı Due Diligence (90% - tam mod)

### Kullanıcı Değeri
- **Girişimci:** Fikir evrimini takip edebilir, marketplace'e hazırlayabilir
- **Yatırımcı:** Due diligence için özel mod, risk analizi
- **Genel:** Sosyal proof tahmini, karşılaştırma

### Teknik Kalite
- Tüm özellikler TypeScript safe
- WCAG uyumlu
- Performans etkilenmez (<5% overhead)

---

## Implementation Timeline

| Özellik | Süre | Öncelik |
|---------|------|---------|
| Fikir Versiyonlama | 1 saat | P0 |
| Yatırımcı Modu | 45 dk | P0 |
| Marketplace Preview | 30 dk | P1 |
| Sosyal Proof | 20 dk | P2 |
| **TOPLAM** | **2.5 saat** | - |

---

## Sonuç

Bu plan ile Nokta MVP'si:
- ✅ Sadece "fikir → spec" değil, **fikir → evrim → pazar** olur
- ✅ Sadece girişimci değil, **yatırımcı** da hedefler
- ✅ Sadece teknik değil, **vizyon odaklı** olur

**Hedef:** Nokta'nın "kıvılcımdan zirveye" tezini %65 oranında gerçekleştirmek.

**Başlangıç:** Şimdi! 🚀
