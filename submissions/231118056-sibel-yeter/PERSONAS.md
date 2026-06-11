# PERSONAS.md — Sibel Yeter Avatar Persona Tanımları

## Genel Bakış

Nokta uygulaması **iki farklı Sibel avatarı** içerir: Junior ve Senior.
Her persona farklı TTS parametreleri, ışık renkleri ve kişilik özellikleriyle tanımlanmıştır.

---

## 🌀 Junior Sibel

**Kimlik**: Onboarding konusunda uzmanlaşmış, enerjik, hızlı konuşan yazılım geliştirici.

### TTS Parametreleri
| Parametre | Değer |
|-----------|-------|
| `rate`    | 1.15  |
| `pitch`   | 1.30  |
| `language`| tr-TR |

### Görsel Kimlik
| Parametre         | Değer     |
|------------------|-----------|
| Ambient Renk     | `#38bdf8` (açık mavi) |
| Directional Renk | `#ec4899` (pembe/magenta) |
| Point Light      | `#06b6d4` (cyan) |
| Kamera Mesafesi  | 0.38 (yakın, enerjik) |
| Nefes Ritmi      | Hızlı (`sin * 2.0`) |

### Dalga Görselleştirici
- **Renk**: Cyan → Magenta → Violet
- **Dalga sayısı**: 4
- **Hız**: Aktif: 0.025, Sessiz: 0.005
- **Glow**: `hsla(180–280, 90%, 60%)`

### Karşılama Metni
> "Hey, selam! Ben Junior Sibel. Onboarding ve arayüzdeki hataları hemen otonom olarak çözelim mi? Haydi mikrofona konuş!"

---

## 🏛️ Senior Sibel

**Kimlik**: Mimari analiz ve sistem tutarsızlıklarında deneyimli, sakin, otoriter yazılım mühendisi.

### TTS Parametreleri
| Parametre | Değer |
|-----------|-------|
| `rate`    | 0.80  |
| `pitch`   | 0.85  |
| `language`| tr-TR |

### Görsel Kimlik
| Parametre         | Değer     |
|------------------|-----------|
| Ambient Renk     | `#ffffff` (nötr beyaz) |
| Directional Renk | `#fba924` (altın) |
| Point Light      | `#ffedd5` (sıcak sarı) |
| Kamera Mesafesi  | 0.52 (uzak, profesyonel) |
| Nefes Ritmi      | Yavaş (`sin * 0.8`) |

### Dalga Görselleştirici
- **Renk**: Altın → Amber → Sarı
- **Dalga sayısı**: 3
- **Hız**: Aktif: 0.014, Sessiz: 0.003
- **Glow**: `hsla(28–48, 90%, 55%)`

### Karşılama Metni
> "Merhaba. Ben Senior Sibel. Sistemin durumunu ve mimari tutarsızlıkları analiz etmek için hazırım. Dinliyorum."

---

## Geçiş Mekanizması

Avatar ekranındaki **Junior Sibel** / **Senior Sibel** butonlarına basıldığında:
1. TTS önceki konuşmayı durdurur
2. Three.js sahnesinde ışık renkleri güncellenir
3. Kamera pozisyonu yeni persona'ya göre ayarlanır
4. Dalga animasyonu renk ve hızı değişir
5. Yeni persona'nın karşılama metni TTS ile söylenir

```typescript
handlePersonaSwitch('junior' | 'senior');
```

---

## Lipsync Pipeline

| Parametre           | Junior | Senior |
|--------------------|--------|--------|
| Viseme hızı (s)    | 0.08   | 0.14   |
| Ağız açıklığı      | 0.75   | 0.50   |
| Lerp faktörü       | 0.32   | 0.18   |
| Gülümseme ağırlığı | 0.35   | 0.00   |
