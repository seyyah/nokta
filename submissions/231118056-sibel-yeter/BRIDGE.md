# BRIDGE.md — Expert Bridge Log

Uygulama içi WebRTC görüntülü görüşme kayıtları. Her giriş `ForgeHeuristicsService.buildBridgeEntry()` ile otomatik üretilir.

---

## Expert Bridge Log — 2026-06-12

| Alan       | Değer                                |
|------------|--------------------------------------|
| Oda ID     | `nokta-expert-1749680400000`         |
| Platform   | Jitsi Meet (meet.jit.si)             |
| Başlangıç  | 2026-06-12T01:25:00+03:00           |
| Bitiş      | 2026-06-12T01:27:30+03:00           |
| Süre       | ~150s (>60s demo şartı ✅)           |
| Katılımcı  | 2 (Sibel + sınıf arkadaşı)          |
| STUCK Konu | `lottie`                             |

### Görüşme Özeti

Lottie animasyon kütüphanesinin React Native 0.81 ile uyumsuzluğu tartışıldı.
Sınıf arkadaşı ekran paylaşımıyla `lottie-react-native` paketinin GitHub Issues sayfasındaki
#2104 numaralı issue'yu gösterdi — bu tam olarak yaşanan crash.

**Önerilen Çözüm**: Lottie bağımlılığını tamamen kaldır, karşılama ekranında
`react-native-reanimated` ile özel bir JSON-driven animasyon yaz.
Bu sayede native crash ortadan kalkar ve bundle boyutu küçülür.

### Ekran Paylaşımı
- Jitsi "Desktop" butonu ile ekran paylaşımı yapıldı ✅
- Nokta uygulaması + GitHub Issues birlikte gösterildi ✅

### Sonraki Cycle için Context

> Cycle #5: Lottie'yi tamamen kaldır, `react-native-reanimated` ile
> `WaveAnimation` bileşeni yaz. Hipotez: Native crash ortadan kalkar,
> FPS düşmez. Test: Android emülatör + web.

---

*BRIDGE.md otomatik olarak `ForgeHeuristicsService.checkAndTriggerBridge()` tarafından yönetilir.*
*Her STUCK tespitinde yeni bir giriş eklenir ve sonraki cycle'a context olarak feed edilir.*
