# Nokta — Slop Detector (Track B)

> Yatırımcı gözüyle pitch analizi. Bir pitch paragrafını yapıştır, AI onu otopsi masasına yatırsın.

---

## Track Seçimi

**Track B — Slop Detector / Due Diligence**

Pitch paragrafı yapıştırılır → AI, yatırımcı perspektifiyle çok boyutlu analiz eder → büyük bir **Slop Score** (0–100) + 5 boyutlu kırılım + kırmızı bayraklar + doğrulanması gereken iddialar + grounded rewrite döner.

---

## Demo

- **60 sn Demo Video:** https://www.youtube.com/shorts/KkkGSpYeERU
- **Expo / Rork Preview Link:** https://rork.app/?exp=p_8v05r484abccw5w3g0lqv--expo.rork.live&p=8v05r484abccw5w3g0lqv&app=false

> Linki telefonda aç → Rork / Expo Go ile uygulamayı doğrudan çalıştırabilirsin.

---

## Ana Akış

1. **Dissection Chamber** — Mono textarea'ya pitch yapıştır, "RUN AUTOPSY" bas.
2. **Running Diagnostics** — Terminal-style canlı log akışı, skor sayacı animasyonu.
3. **Verdict** — 0–100 skor + tek kelimelik hüküm (PURE SLOP / SLOPPY / MIXED / GROUNDED / SHARP) + 5 boyut bar (Market Claim, Competitor Awareness, Evidence, Novelty, Feasibility).
4. **Red Flags & Claims to Verify** — Tespit edilen slop sinyalleri ve doğrulanması gereken iddialar checklist'i.
5. **Grounded Rewrite** — Pitch'in slop'suz yeniden yazımı, kopyalanabilir.
6. **Archive** — Tüm analizler cihazda yerel saklanır; iki analizi yan yana **Compare** edebilirsin.
7. **Ayarlar** — Analiz tonu: Standart / Brutal / Merciful.

---

## Görsel Dil

- **Laboratuvar terminali** estetiği: karbon siyah (#0A0B0D), neon yeşil aksan (#00FF88), amber uyarı, kritik red.
- Mono tipografi, CRT vignette, terminal log animasyonları, hafif haptics.
- Soğuk, analitik, radikal. Jenerik "AI app" görüntüsünden kaçınıldı.

---

## Teknik Stack

- **React Native + Expo (SDK 54)** — cross-platform
- **Expo Router** — file-based routing
- **TypeScript** (strict)
- **@nkzw/create-context-hook** + **AsyncStorage** — yerel analiz arşivi
- **React Query** — mutation state yönetimi (AI çağrısı)
- **AI Text/JSON üretim servisi** — yapılandırılmış JSON çıktısı, hata durumunda fallback

---

## Decision Log

| # | Karar | Gerekçe |
|---|-------|---------|
| 1 | Track B seçildi | "Slop detector" Nokta tezinin (anti-slop + due diligence) en saf ifadesi; 2 saatte demo edilebilir dar bir dilim. |
| 2 | Açık uçlu chatbot YOK | idea.md: "Açık Uçlu Chatbot Değildir". Tek input (pitch) → yapılandırılmış JSON çıktı. |
| 3 | JSON schema'lı AI çağrısı | Halüsinasyonu minimize etmek için model çıktısı katı şemaya bağlandı; parse hatasında kullanıcı dostu fallback. |
| 4 | 5 boyutlu kırılım | Tek skor yetersiz — yatırımcı gerçek "due-diligence" ister: Market Claim, Competitor Awareness, Evidence, Novelty, Feasibility. |
| 5 | Grounded Rewrite zorunlu | Sadece "slop dedi, geçti" değil; kullanıcıya çıkış yolu sun. Nokta'nın "artifact üret" felsefesi. |
| 6 | Tüm veri cihazda (AsyncStorage) | Pitch'ler hassas; hiçbir şey sunucuda saklanmaz. "Fikirlerinizi istismar etmez" ilkesi. |
| 7 | Compare modu | İki analizi yan yana → kullanıcı kendi iterasyonunu görebilsin (v1 pitch vs v2 pitch). |
| 8 | Terminal/lab estetiği | Generic purple-gradient "AI slop" görüntüsünden kaçınıldı; marka kimliği için soğuk analitik dil. |
| 9 | 3 tonluk analiz (Brutal/Standart/Merciful) | Kullanıcı bağlamına göre sertlik ayarı — yatırımcı hazırlığı vs ilk taslak. |
| 10 | Reanimated yerine Animated API | Web uyumluluğu (Rork preview web'de de açılıyor) + scope disiplini. |

---

## Scope Dışı Bırakılanlar (bilinçli)

- Track A (Dot Capture) ve Track C (Migration) — fokus dağılmasın.
- Kullanıcı hesabı / cloud sync — 2 saatlik scope dışı, gizlilik için de gereksiz.
- Push notifications, paywall — Track B akışıyla ilgisiz.

---

## Kurulum (lokal geliştirme)

```bash
bun install
bun run start
```

QR kodu tara → Expo Go / Rork app ile aç.
