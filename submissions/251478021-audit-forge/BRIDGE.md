# BRIDGE.md — Uzman Görüşme Özeti

## Oturum Bilgileri

| Alan | Değer |
|------|-------|
| **Tarih** | 2026-05-28 |
| **Saat** | 11:55 – 12:14 |
| **Süre** | ~73 saniye aktif görüşme + ~11 dk hazırlık |
| **Platform** | Jitsi Meet (meet.jit.si/nexbus-expert-k3x9q) |
| **Katılımcılar** | Rabia (öğrenci) + Sınıf arkadaşı (uzman rolü) |
| **Özellikler** | ✅ Video · ✅ Ses · ✅ Ekran Paylaşımı |
| **Tetikleyici** | Otomatik — Cycle #5 STUCK heuristiği |

---

## Neden Tetiklendi?

Forge döngüsü `audit-report-2-seat-modal.md` için **iki üst üste ROLLBACK** üretti:

- **Cycle #2:** `fontSize 12→14` → layout overflow
- **Cycle #5:** `opacity 0.3→0.5 + borderStyle dashed` → state ayrımı bozuldu

Agent aynı raporda ikinci kez başarısız olunca heuristik şartı doldu ve uygulama içindeki **"Uzmana Bağlan"** butonu otomatik olarak görüşme modalını açtı.

---

## Görüşme Akışı

### 0:00 – 0:15 | Sorun Aktarımı
Ekran paylaşımıyla koltuk seçim modalı gösterildi. İki rollback nedeninin log'u uzmanla paylaşıldı.

**Uzman'ın ilk tepkisi:**
> "Bakıyorum da sorun opacity değil — `occupied` ve `selected` state'lerini görsel olarak yeterince ayırt etmiyorsun. Renk + opacity yetmez, doku ya da ikon eklemen lazım."

### 0:15 – 0:45 | Analiz & Öneri
Uzman, React Native'de "occupied" koltuk için iki strateji önerdi:

1. **Overlay yaklaşımı:** Koltuk görünümünün üzerine yarı-saydam `X` ikonu overlay
2. **Strikethrough pattern:** CSS/StyleSheet ile çapraz çizgi

Tartışma sonunda **Overlay yaklaşımı** seçildi — React Native'de daha temiz implement edilir.

**Uzman'ın önerisi:**
```jsx
// Occupied koltuk üzerinde Ionicons 'close-circle' overlay
{isOccupied && (
  <View style={styles.occupiedOverlay}>
    <Ionicons name="close-circle" size={20} color="#EF4444" style={{ opacity: 0.7 }} />
  </View>
)}
```

### 0:45 – 1:13 | Onay & Kapanış
Uzman, agent'ın 2 cycle'da neden tıkandığını da yorumladı:

> "Agent her seferinde tek bir değişken üzerinde gidip geliyor. Problem o değildi — semantik fark sorunuydu. Bir sonraki stuck'ta agent'a 'semantic distinction' sorusunu sormasını öğret."

Öneri BRIDGE.md ve bir sonraki cycle'ın context'ine eklendi.

---

## Görüşme Çıktıları

### Doğrudan Uygulanan Değişiklik
- Cycle #6'da `OccupiedOverlay` bileşeni eklendi
- `seatOccupied` stili sadeleştirildi (opacity:0.4, border kaldırıldı)
- Görsel A11y testi geçti: Empty/Selected/Occupied net ayrımı ✅

### Öğrenilen Ders (Sonraki Cycle Context'i)
```
STUCK Pattern Analizi:
- Agent iki kez aynı metric'i (opacity) manipüle etti
- Asıl sorun: semantik ayrım (semantic distinction)
- Çözüm heuristiği: "Bu değişken görsel kategoriyi mi, yoksa yoğunluğu mu temsil ediyor?"
- Next cycle için: stuck durumunda agent önce "semantic vs visual" sorusunu sorucak
```

---

## Ekran Paylaşımı Notu

Görüşme sırasında:
- NexBus uygulaması Expo Go üzerinde canlı çalışıyordu
- Koltuk seçim modalı ekranda açık tutuldu
- Uzman kendi telefonunda aynı URL'yi açarak karşılaştırmalı inceledi

---

## Sonuç

Expert bridge mekanizması, agent'ın 2 üst üste ROLLBACK ürettiği anda devreye girdi ve **73 saniye** içinde sorunu çözdü. Cycle #6'da elde edilen commit bu görüşmenin doğrudan ürünüdür.

**Bridge → Forge geri beslemesi çalıştı. ✅**
