# PERSONAS.md — Avatar Persona Tanımları

**App:** NOKTA RADAR  
**Track:** A — Sadelik + Visual Quality  
**Avatar Motoru:** SVG tabanlı 2D lipsync (`components/AvatarFace.tsx`)  

---

## Track A Seçim Gerekçesi

Track A: "Voice viz akıcılığı + lipsync senkronu öncelikli. Görsel kalite, gecikme, animasyon akıcılığı puanlanır. 'Sade ama kusursuz' çizgisi."

Bu track seçildi çünkü:
- Latency < 200ms hedefi somut ve ölçülebilir
- SVG tabanlı avatar Expo Go'da native 3D'ye göre çok daha stabil
- "Sade ama kusursuz" ilkesi projenin genel temasıyla (Nokta Radar — minimal, güçlü) örtüşüyor

---

## Aktif Persona: RADAR-AI

| Özellik | Değer |
|---|---|
| **İsim** | RADAR-AI |
| **Görünüm** | Koyu tonlu SVG avatar (dark hologram estetiği) |
| **Renk Paleti** | `#00E5FF` (cyan) + `#00FF88` (yeşil) + `#0d0d18` (arka plan) |
| **Konuşma Tonu** | Direkt, analitik, kısa — "mühendislik rehberliği" |
| **Ses** | TTS `tr-TR`, pitch=1.0, rate=0.9 (expo-speech) |
| **Lipsync** | RMS → 5 viseme (IDLE, A, E, O, M) |
| **Göz Kırpma** | Dinlemede 1.5s, sessizde 3-5s |
| **Baş Hareketi** | Konuşurken subtle bob animasyonu |
| **Kullanım** | VoiceScreen — ses görselleştirici + AI yanıt okuma |

---

## Persona Davranışı

### Sessizlik Modu (IDLE)
```
audioLevel < 0.05
→ Ağız: ince çizgi (IDLE viseme)
→ Barlar: sönük, minimal idle pulsing
→ Göz: 3-5s aralıkla kırpma
→ Glow: %30 opacity
→ Renk: #00E5FF %55 opacity
```

### Dinleme Modu (LISTENING)
```
audioLevel > 0.05
→ Ağız: RMS'e göre açılır (M → E → A viseme)
→ Barlar: cyan/yeşil renk, tam parlaklık
→ Göz: 1.5s aralıkla kırpma (daha aktif)
→ Glow: %80 opacity, hologram halkaları
→ Baş: subtle bob
→ Renk: #00E5FF + #00FF88 alternating
```

### Konuşma Modu (SPEAKING — TTS)
```
simLevel = random(0.3, 0.8) per 80ms
→ Ağız: simüle edilmiş ses seviyesine göre
→ Barlar: yeşil ton (#00FF88)
→ Durum badge: "💬 Avatar konuşuyor"
```

---

## Viseme Haritası

| Ses Seviyesi | Viseme | Açıklama |
|---|---|---|
| < 0.05 | IDLE | İnce çizgi |
| 0.05–0.20 | M | Kapalı dudak |
| 0.20–0.40 | E | Hafif açık |
| 0.40–0.65 | A | Geniş açık |
| > 0.65 | O | Yuvarlak |

---

## Gelecek Persona Önerileri (Track 2 için)

> Track 2 seçilseydi 2+ avatar varyantı gerekecekti. Aşağıdakiler gelecek sürüm için planlandı:

### Junior-RADAR
- Daha açık mavi tonlar (`#4FC3F7`)
- Rate: 1.1 (daha hızlı konuşur)
- Hipotezleri soru formatında sunar
- "Deneyimliyorum" tonu

### Senior-RADAR
- Koyu amber tonlar (`#FF9800`)
- Rate: 0.85 (daha ağır konuşur)
- Direktif, güven veren ton
- "Kesinlikle" odaklı ifadeler

---

## Teknik Notlar

```typescript
// AvatarFace.tsx — Viseme pipeline
function levelToViseme(level: number): Viseme {
  if (level < 0.05) return 'IDLE';
  if (level < 0.2)  return 'M';
  if (level < 0.4)  return 'E';
  if (level < 0.65) return 'A';
  return 'O';
}
```

**Latency profili:**
- expo-av metering → `getStatusAsync()`: ~50ms
- Animated.timing (ağız): ~80ms duration
- Toplam viseme latency: ~130ms (< 200ms hedefi ✅)

**Neden Three.js değil:**
- `react-three-fiber` Expo Go'da GLBLoader ile çalışmaz (WebGL1 kısıtı + WASM)
- SVG avatar: platform-agnostic, Expo Go + bare workflow + web üçünde çalışır
- Animasyon kalitesi SVG + Animated API ile yeterli; morph target sistemi `AnimatedEllipseMouth` ile simüle edildi
