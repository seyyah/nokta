# Audit Raporu #2 — Koltuk Seçim Modalı

**Rapor No:** AR-002  
**Ekran:** Koltuk Seçim Modalı  
**Persona:** Senior Sen 💼  
**Tarih:** 2026-05-28 09:28  
**Kayıt Süresi:** 0:38  
**Durum:** ✅ İşlendi (Cycle #2 ROLLBACK + Cycle #3 SUCCESS + Cycle #5 ROLLBACK + Cycle #6 SUCCESS)

---

## 🎙️ Ses Transkripsiyonu

> *"Koltuk seçim ekranında birden fazla kritik sorun var. Birincisi, koltuk numaraları 12 piksel — bu okunamaz. İkincisi, dolu koltuklar kırmızı ve yüzde otuz opacity — bu görme engelli kullanıcılar için WCAG'yi karşılamıyor. Üçüncüsü, selected ve occupied koltuklar aynı boyuta sahip, sadece renk farkı var. Renk körlüğü olan kullanıcılar ayırt edemez. Bu üç sorun öncelikli."*

---

## 🔴 Tespit Edilen Sorunlar

### Sorun 1 — Font Boyutu (HIGH)
- **Konum:** `styles.seatText` — fontSize: 12
- **Mevcut:** 12px
- **Gerekli:** Minimum 14px (mobile erişilebilirlik standardı)
- **Etki:** Koltuk numaraları okunaksız, özellikle uzaktan bakışta

### Sorun 2 — Occupied State Kontrast (CRITICAL)
- **Konum:** `styles.seatOccupied` — opacity: 0.3
- **Mevcut:** `opacity: 0.3` → efektif kontrast ~1.8:1
- **Gerekli:** En az 3:1 (non-text WCAG AA)
- **Etki:** Dolu koltuklar göze çarpmıyor, kullanıcı yanlışlıkla tıklamayı deniyor

### Sorun 3 — Semantic Distinction (CRITICAL)
- **Konum:** Tüm seat state'leri
- **Mevcut:** Yalnızca renk farkı (beyaz/kırmızı/mavi)
- **Gerekli:** Renk + şekil/ikon ayrımı
- **Etki:** Renk körü kullanıcılar state'leri ayırt edemiyor

---

## 📸 Ekran Görüntüsü (Burn-in)

```
┌─────────────────────────────────┐
│  Metro Turizm                [X]│
│  İstanbul → Ankara              │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │  ÖN                    🚗  │ │
│ ├─────────────────────────────┤ │
│ │  [1]   |   [2]  [3]        │ │ ← FONT 12px KÜÇÜK
│ │  [4]   |   [5]  [6]        │ │
│ │  [7]   |  ███   [9]        │ │ ← OCCUPIED SOLUK (opacity 0.3)
│ │  [10]  |  [11] [12]        │ │   BURN-IN: Bu alan
│ │  [13]  |  [14] [15]        │ │
│ │  ■■■   |  [17] [18]        │ │ ← SEÇİLİ (mavi)
│ │  [19]  |  [20] [21]        │ │   RENK KÖRÜ AYIRT EDEMEZ
│ │  [22]  |  [23] [24]        │ │
│ └─────────────────────────────┘ │
│ Seçilen: 1  Toplam: 650 TL      │
│              [Bileti Al →]      │
└─────────────────────────────────┘
   BURN-IN: Koltuk numaraları + occupied state
```

**Legend sorunları:**
- `[n]` = Boş (beyaz) 
- `███` = Dolu (kırmızı, opacity:0.3 — SOLUK) ← SORUN
- `■■■` = Seçili (mavi) ← Renk körü için ayırt edilemez

---

## 💡 Önerilen Çözümler

```jsx
// Sorun 1: Font
seatText: { fontSize: 14 } // 12 → 14

// Sorun 2 + 3: Occupied overlay
{isOccupied && (
  <View style={occupiedOverlay}>
    <Ionicons name="close-circle" size={18} color="#EF4444" opacity={0.7} />
  </View>
)}

// Sorun 3: Shape distinction için
seatSelected: { backgroundColor: '#3B82F6', borderWidth: 3, borderColor: '#93C5FD' }
```

---

## Forge Cycle Geçmişi

| Cycle | Hipotez | Sonuç | Not |
|-------|---------|-------|-----|
| #2 | fontSize 12→14 | ❌ ROLLBACK | Layout overflow |
| #3 | fontSize 14 + flexWrap | ✅ SUCCESS | Sorun 1 çözüldü |
| #5 | opacity 0.3→0.5 + dashed | ❌ ROLLBACK | State ayrımı bozuldu |
| #6 | Overlay ikon (uzman önerisi) | ✅ SUCCESS | Sorun 2+3 çözüldü |

> Bu rapor 4 cycle tetikledi — 2 başarılı, 2 rollback. Cycle #5 STUCK heuristiğini tetikleyerek uzman görüşmesine yol açtı.
