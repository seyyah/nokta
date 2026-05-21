# 🐛 Audit Raporu — nokta-audit-forge

**Uygulama:** nokta-audit-forge  
**Ekran:** IdeaDetailScreen  
**Tarih:** 2026-05-19  
**Raporlayan:** karahan-qa  
**Widget:** @xtatistix/mobile-audit v0.1.0

---

## 📱 IdeaDetailScreen

### 🔴 Açık — Not #3

**Not:** Uzun başlıklı fikirlerde detay ekranı bozuluyor. Başlık metni birden fazla satıra yayılarak altındaki meta bilgilerini (tarih, durum badge'i) ve açıklama bölümünü aşağıya itiyor. Küçük ekranlarda içerik görünür alanın dışına taşıyor.

**Alan:** Fikir başlığı — `Text` bileşeni üst bölüm

![Ekran görüntüsü — Başlık metni taşıyor](./screenshots/03-detail-title-overflow.png)

> *Sarı kutu: Başlık `Text` bileşeninin overflow alanını gösteriyor — 3+ satıra yayılıyor, layout bozuluyor.*

**Bağlam:**
- Platform: Android (Pixel 6 emulator)
- Expo SDK: ~53.0.0
- Test fikri: ID=3, ~80 karakterlik başlık
- Adım: Listeden 3. fikre dokunuldu → detay açıldı

**Beklenen:** Başlık en fazla 2 satırda gösterilmeli; taşan kısım `…` ile kesilmeli  
**Gerçekleşen:** Başlık sınırsız genişliyor, 3-4 satır kaplıyor, meta alanını/açıklamayı sıkıştırıyor

**Kod bağlamı:**
```tsx
// idea/[id].tsx — numberOfLines ve ellipsizeMode eksik
<Text style={styles.title}>{idea.title}</Text>
// ↑ BUG-003: numberOfLines={2} ellipsizeMode="tail" gerekli
```

**Etkilenen cihazlar:** Tüm ekranlar; küçük ekranlarda (< 390px) daha belirgin

---

## Özet

| Metrik | Değer |
|---|---|
| Toplam not | 1 |
| 🔴 Açık | 1 |
| ✅ Düzeltildi | 0 |
| Ekran | IdeaDetailScreen |

---

*Üretildi: nokta-audit-forge / karahan-qa / 2026-05-19 09:31*
