# Audit Raporu #1 — Arama Akışı UX Sorunları

**Rapor No:** AR-001  
**Ekran:** Anasayfa / Arama  
**Persona:** Junior Sen 🎓  
**Tarih:** 2026-05-28 09:12  
**Kayıt Süresi:** 0:42  
**Durum:** ✅ İşlendi (Cycle #1)

---

## 🎙️ Ses Transkripsiyonu

> *"Ana ekranda bilet arama alanı biraz karmaşık görünüyor. Nereden ve nereye alanlarının daha belirgin olması gerekiyor. Özellikle dark arka plan üzerinde gri placeholder metin çok zor okunuyor. Tarih seçici de mobilde kullanımı zor — bir date picker olsa çok daha iyi olur. Ayrıca 'Bileti Bul' butonu ile input alanları arasındaki boşluk fazla, scroll ettirmeye gerek kalmamalı."*

---

## 🔴 Tespit Edilen Sorunlar

### Sorun 1 — Düşük Kontrast (CRITICAL)
- **Konum:** `searchCard` → input placeholder metni
- **Mevcut:** `placeholderTextColor="#94A3B8"` — kontrast oranı 3.1:1
- **Gerekli:** WCAG AA minimum 4.5:1
- **Etki:** Düşük ışıkta veya görme güçlüğü olan kullanıcılar okuyamaz

```
Burn-in Bölgesi: Input placeholder alanı
Koordinat: searchCard > inputWrapper > TextInput
```

### Sorun 2 — Date Input (HIGH)
- **Konum:** Gidiş tarihi input alanı
- **Mevcut:** Serbest metin girişi (`type="text"`)
- **Gerekli:** Native date picker entegrasyonu
- **Etki:** Kullanıcı format hatası yapıyor (gg.aa.yyyy mi, yyyy-mm-dd mi?)

### Sorun 3 — Layout Boşluğu (MEDIUM)
- **Konum:** `searchBtn` ile `inputGroup` arası
- **Mevcut:** `marginTop: 10` — buton fold altında kalıyor
- **Gerekli:** Scroll olmadan tüm form görünür olmalı

---

## 📸 Ekran Görüntüsü

```
┌─────────────────────────────────┐
│  NexBus              [Giriş Yap]│
├─────────────────────────────────┤
│  Yolculuğunu Keşfet             │
│  En konforlu seferler...        │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ NEREDEN                     │ │
│ │ [📍] İstanbul          ░░░ │ │ ← KONTRAST DÜŞÜK
│ ├─────────────────────────────┤ │
│ │ NEREYE                      │ │
│ │ [➜] Ankara             ░░░ │ │ ← KONTRAST DÜŞÜK  
│ ├─────────────────────────────┤ │
│ │ GİDİŞ TARİHİ               │ │
│ │ [📅] 17.05.2026        ░░░ │ │ ← DATE PICKER YOK
│ │                             │ │
│ │      [Bileti Bul]           │ │ ← SCROLL GEREKİYOR
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
   ↑ BURN-IN ALANI: tüm input bölgesi
```

---

## 💡 Önerilen Çözümler

1. `placeholderTextColor` → `#CBD5E1` (kontrast 5.2:1 → WCAG AA ✓)
2. Gidiş tarihi için `DateTimePicker` entegrasyonu
3. `searchCard` padding azaltılarak buton fold içine alınmalı

---

## Forge Cycle Çıktısı

**Cycle #1** bu raporu aldı ve Sorun 1'i çözdü:
- `placeholderTextColor: '#94A3B8'` → `'#CBD5E1'` ✅
- Commit: `[FORGE: Anasayfa] Input contrast fix — 1kg`

Sorun 2 ve 3 backlog'a eklendi.
