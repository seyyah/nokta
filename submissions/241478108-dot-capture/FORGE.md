# FORGE.md - Cycle Ledger

| Cycle | Rapor Adı | Hipotez | Sonuç | Değişen Dosyalar | Test Sonucu | Commit Hash | kg | Human Touch Points |
|---|---|---|---|---|---|---|---|---|
| 1 | bug-report-capture-insight.md #1 | "Nokta maskotu görünmüyor" → CaptureScreen'de Animated.View zIndex 999 yetmiyor, elevation ve pointerEvents düzenlenmeli. | SUCCESS | `src/screens/CaptureScreen.js` | Maskot artık tüm overlay'lerin üstünde görünür ve draggable. | - | 1.5kg | 0 |
| 2 | bug-report-graph-assistant.md #1 | "Ağ çizgileri soluk" → NodeGraph edge strokeOpacity 0.3'ten 0.8'e çek, Animated glow efekti ekle. | SUCCESS | `src/components/NodeGraph.js`, `src/screens/CaptureScreen.js` | Çizgiler mor glow ile belirginleşti, nöron bağlantıları okunabilir. | - | 2.5kg | 1 (Glow yoğunluğunu onayladım) |
| 3 | bug-report-capture-insight.md #2 | "Insight ekranı text-heavy" → InsightScreen'i kart bazlı layout'a çevir, her tez/ürün/risk başlığına icon ekle. | SUCCESS | `src/screens/InsightScreen.js` | Uzun metin blokları 3 ayrı glassmorphism kartına bölündü. | - | 3kg | 0 |
| 4 | bug-report-processing-clarify.md #1 | "Klavye açılınca butonlar üst üste" → ProcessingScreen'e KeyboardAvoidingView ekle, SafeArea ile düzenle. | ROLLBACK | `src/screens/ProcessingScreen.js` | KeyboardAvoidingView + SafeArea çakışması nedeniyle fast-refresh loop oluştu. Expo Go'da stabil çalışmadı, değişiklikler geri alındı. | - | 0.5kg | 2 (Loop fark edilip manuel iptal edildi, native davranış araştırıldı) |
| 5 | bug-report-graph-assistant.md #2 | "Assistant modal çok büyük" → presentation: 'modal' yerine yarım yükseklikte (60%) bottom-sheet stili custom modal ekle. | SUCCESS | `src/screens/AssistantScreen.js` | Modal artık ekranın alt yarısını kaplıyor, arkasındaki ağ görünür. | - | 2kg | 0 |
| 6 | Otonom Tema Düzeltmesi | "Renk paleti soluk" → Agent (Gemini) kendi analiz edip glassmorphism + premium dark theme uyguladı. | SUCCESS | `src/screens/ClarifyScreen.js`, `App.js` (theme colors) | İnsan onayı olmadan tema tonları derinleştirildi, blur efektleri eklendi. | - | 0kg | 0 (Tam Otonom) |
| 7 | Nokta Forge Pipeline | "Otonom onarım sistemi" → Express server + Groq API (`llama-3.3-70b-versatile`) ile markdown raporunu al, hedef ekranı tespit et, dosyayı oku, AI'a düzeltme yaptır, dosyaya yaz. | SUCCESS | `forge-server.js`, `src/screens/VisionScreen.js` (Onayla ve Uygula butonu) | Server `/repair` endpoint'i çalışıyor. VisionScreen'den onay verildiğinde Groq API dosyayı yeniden yazar, Fast Refresh değişikliği anında yansıtır. | - | 3.5kg | 1 (Repair prompt'u ve vision-butons tasarımı onaylandı) |

---

## Cycle Notları

### Cycle 1 — Maskot z-index
Maskotun `zIndex: 999` değeri ClarifyScreen gibi `presentation: 'transparentModal'` ile açılan ekranların arkasında kalıyordu. `elevation: 10` (Android) ve `zIndex: 9999` güncellemesi ile sorun çözüldü.

### Cycle 2 — Ağ çizgileri glow
NodeGraph'teki `Animated` line bileşenine `shadowColor: '#a855f7'`, `shadowOpacity: 0.6` eklendi. Ayrıca strokeWidth 1'den 2'ye çıkarıldı. Glow yoğunluğu 0.6 olarak sabitlendi — daha yüksek değerler performansı düşürüyordu.

### Cycle 3 — Insight kartları
InsightScreen'deki tek `ScrollView` içindeki uzun metin, 3 ayrı `BlurView` kartına bölündü: Tez (💡), Ürün (🚀), Risk (⚠️). Her kart Expo Blur ile glassmorphism efekti aldı.

### Cycle 4 — Klavye çakışması (ROLLBACK)
ProcessingScreen'de `KeyboardAvoidingView` eklenmesi, ekrandaki `expo-blur` + `Animated` bileşenleriyle çakıştı. Klavye açılıp kapanırken fast-refresh 3 kere tetiklendi, state kayboldu. React Native'in `KeyboardAvoidingView` + `react-native-reanimated` uyumsuzluğu raporlanmış bir konu. Çözüm: Native `android:windowSoftInputMode="adjustPan"` gerektiriyor — Expo Go sınırlaması. Geri alındı.

### Cycle 5 — Assistant modal boyutu
`react-native-modal` yerine custom `Modal` + `presentationStyle: 'overFullScreen'` + `height: '60%'` kullanıldı. `react-native-gesture-handler` bottom sheet bağımlılığı eklenmedi (drop-in disiplini korundu).

### Cycle 6 — Tam otonom tema
Gemini agent'a "Ethereal theme'i daha premium yap" denildi. Agent kendi `App.js` theme nesnesini ve `ClarifyScreen.js` blur değerlerini değiştirdi. İnsan sadece fast-refresh sonucunu gözlemledi, onay vermedi.

### Cycle 7 — Nokta Forge Pipeline
`forge-server.js` Node.js HTTP server olarak yazıldı. `POST /repair` endpoint'i markdown raporu alıp:
1. Ekran adını regex + harita ile tespit eder (`ClarifyScreen`, `CaptureScreen`, vs.)
2. `src/screens/{Screen}.js` dosyasını okur
3. Groq API'ye system prompt ile yollar: "Sadece düzeltilmiş JS kodunu döndür, açıklama yok, fence yok"
4. AI yanıtındaki markdown fence'leri strip edip dosyaya yazar
5. VisionScreen'de "Onayla ve Uygula" butonu ile kullanıcı onay vermeden kod değişmez.
Test: `test-forge.js` ile ClarifyScreen'e simge ekleme isteği gönderildi, 4807 byte yazıldı, dosya bozulmadı.

---

## Ratchet Kanıtı (kg)

- Toplam kg: **13kg**
- Başarılı cycle'lar: 6 (1.5 + 2.5 + 3 + 2 + 0 + 3.5 = 12.5kg)
- Rollback: 1 (0.5kg — başarısız hipotez değerli veri)
- Human touch: 4 noktada (2 onay + 1 rollback kararı + 1 Forge pipeline onayı)
- Tam otonom: 1 cycle (0kg, 0 touch)

Her cycle bir önceki deneyimden öğrendi:
- Cycle 1'de zIndex öğrenildi → Cycle 5'te modal z-index uygulandı.
- Cycle 4'te KeyboardAvoidingView başarısız olduğu için Cycle 6'da native-bağımsız blur/theme tercih edildi.
- Cycle 7'de Groq API + file-write pipeline kuruldu; ileride tüm cycle'lar bu pipeline üzerinden otonom çalışabilir.
