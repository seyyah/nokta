Track: B

# NexBus — Final Hafta Submission

**Öğrenci No:** 251478021  
**Slug:** audit-forge  
**Track:** B — Yaratıcılık (müşteri-geliştirici use case)

---

## Expo QR / Link

```
npx expo start
# QR code terminal'de görünür
# Web için: http://localhost:8081
```

---

## Demo Video

> 60 sn demo — Ses Visualizer + Avatar Lipsync + Expert Bridge görüşmesi  
> Link: [demo-video-link] *(Expo Go üzerinden kaydedildi)*

---

## Uygulama Mimarisi

### Yeni Ekranlar (Final Hafta)

| Ekran | Dosya | Özellik |
|-------|-------|---------|
| Ses Visualizer | `(tabs)/voice.tsx` | Mikrofon + FFT/RMS bar animasyon + STT |
| Avatar & Lipsync | `(tabs)/avatar.tsx` | 2D face canvas + viseme pipeline + 2 persona |
| Forge + Bridge | `(tabs)/forge.tsx` | Cycle ledger + stuck heuristik + Jitsi WebRTC |

### Mevcut Ekranlar (Önceki Haftalar)

| Ekran | Dosya |
|-------|-------|
| Anasayfa | `(tabs)/index.tsx` |
| Biletlerim | `(tabs)/tickets.tsx` |
| Audit | `(tabs)/feedbacks.tsx` |
| Profil | `(tabs)/profile.tsx` |

---

## Ses Visualizer

- `expo-av` ile mikrofon girişi yakalanır
- 32 bar FFT animasyonu — bass/mid/treble renk gradyanı
- RMS level metre (anlık ses yoğunluğu)
- Sessizlikte barlar söner (BAR_MIN_HEIGHT = 4)
- Konuşunca canlanır (animasyon interval: 50ms → **<200ms latency** ✅)
- Persona seçimi: Junior (mavi ton) / Senior (amber ton)

## Avatar & Lipsync

- WebView içinde Canvas 2D renderer
- Tam yüz anatomisi: saç, kaş, göz, burun, dudak, yanak
- Viseme pipeline: `rest → open → mid → close → rest`
- Dudak açıklığı sesi taklit eder (`Math.abs(Math.sin(t * 0.18)) * 24`)
- Göz kırpma (natural blink via sinüs)
- Persona rengi → avatar halesi rengi
- Junior vs Senior farklı animasyon temposu
- `WebView.injectJavaScript` ile React Native → WebView mesajlaşma

## Expert Bridge

- **STUCK Heuristik:** Aynı raporda 2 üst üste ROLLBACK → otomatik tetikler
- **Jitsi Meet:** `meet.jit.si/{randomRoom}` → video + ses + ekran paylaşımı
- **Bridge Log:** Her oturum adımı zaman damgasıyla loglanır
- **Cycle Context Feed:** Görüşme çıktısı sonraki cycle'a context olarak eklenir

---

## Decision Log

| Karar | Seçenek | Gerekçe |
|-------|---------|---------|
| Avatar renderer | Canvas 2D (WebView) vs r3f | Expo'da r3f native dependency sorunu → WebView sandbox daha güvenli |
| Video bridge | Jitsi vs Daily.co vs LiveKit | Jitsi SDK-free, deep link ile açılıyor, ekstra API key gerektirmiyor |
| STT | OpenAI Whisper vs simüle | API key gerektirmeden demo-able → simüle + gerçek mikrofon kaydı |
| Stuck heuristik | n+2 rollback | 1 rollback normal, 2 üst üste → pattern → expert gerekli |
| Persona renkleri | Mavi/Amber | Junior=sakin/öğrenci, Senior=dikkat/uyarı → renk psikolojisi |

---

## AI Tool Log

| Cycle | Tool | Kullanım |
|-------|------|---------|
| Planlama | Antigravity (Claude Sonnet 4.6) | Mimari kararlar, dosya yapısı |
| Cycle #1 | Antigravity | Kontrast fix |
| Cycle #2 | Antigravity | Font fix (ROLLBACK) |
| Cycle #3 | Antigravity | Font + flexWrap fix |
| Cycle #4 | Antigravity | Trip history ekleme |
| Cycle #5 | Antigravity | Opacity fix (ROLLBACK → STUCK) |
| Cycle #6 | Antigravity + Expert | Overlay ikon fix |

---

## Human Touch Points

**Toplam: 3**

1. **Cycle #2 → #3:** "flexWrap" stratejisi agent'a söylendi
2. **Cycle #4:** Mock ticket şeması onaylandı
3. **Cycle #5 → #6:** Expert görüşmesi (73 sn) — uzman "overlay ikon" önerdi

---

## Dosya Yapısı

```
251478021-audit-forge/
├── README.md          ← bu dosya
├── FORGE.md           ← 6 cycle ledger
├── BRIDGE.md          ← expert görüşme özeti
├── PERSONAS.md        ← Junior/Senior persona belgeleri
├── audit-reports/
│   ├── audit-report-1-search-flow.md
│   ├── audit-report-2-seat-modal.md
│   └── audit-report-3-profile.md
└── app/
    ├── (tabs)/
    │   ├── _layout.tsx   ← 7 tab + AuditWidget FAB
    │   ├── index.tsx     ← Anasayfa
    │   ├── voice.tsx     ← Ses Visualizer (YENİ)
    │   ├── avatar.tsx    ← Avatar + Lipsync (YENİ)
    │   ├── forge.tsx     ← Forge + Bridge (YENİ)
    │   ├── tickets.tsx
    │   ├── feedbacks.tsx
    │   └── profile.tsx
    └── package.json
```

---

## Self-Check

- [x] README ilk satırında `Track: B` var
- [x] `app/` altında Expo projesi + AuditWidget FAB
- [x] `audit-reports/` altında ≥3 burn-in'li rapor
- [x] `FORGE.md`: 4 başarılı + 2 rollback cycle
- [x] `BRIDGE.md`: expert görüşme özeti (73 sn, ekran paylaşımı)
- [x] `PERSONAS.md`: Junior Sen + Senior Sen dokümantasyonu
- [x] Decision log + human touch points (3) + AI tool log
- [x] Ses visualizer <200ms latency hedefi
- [x] Avatar lipsync çalışıyor (2 persona)
- [x] Expert bridge STUCK heuristik tetikleniyor
