# Nokta — Slop Detector (Track B)

Pitch yapıştır → AI yatırımcı gözüyle analiz etsin.

## Track
**Track B — Slop Detector / Due Diligence**

## Demo
- **Video (60sn):** https://www.youtube.com/shorts/KkkGSpYeERU
- **Expo/Rork Link:** https://rork.app/?exp=p_8v05r484abccw5w3g0lqv--expo.rork.live&p=8v05r484abccw5w3g0lqv&app=false

## Akış
Pitch → Autopsy → Skor (0–100) + 5 boyut (Market, Competitor, Evidence, Novelty, Feasibility) + Red Flags + Claims to Verify + Grounded Rewrite. Geçmiş cihazda saklanır, karşılaştırılabilir.

## Stack
Expo SDK 54 · Expo Router · TypeScript · AsyncStorage · React Query · AI JSON servisi

## Decision Log
| # | Karar | Gerekçe |
|---|-------|---------|
| 1 | Track B | Nokta tezinin (anti-slop + due diligence) en saf dilimi. |
| 2 | Chatbot yok | idea.md: "Açık Uçlu Chatbot Değildir". Tek input → yapılandırılmış çıktı. |
| 3 | JSON schema | Halüsinasyonu kesmek için katı şema + fallback. |
| 4 | 5 boyut | Tek skor yetersiz; gerçek due-diligence çok boyutlu. |
| 5 | Grounded Rewrite | Sadece "slop" deme, çıkış yolu sun. |
| 6 | AsyncStorage | Pitch hassas; hiçbir şey sunucuda tutulmaz. |
| 7 | Terminal estetiği | Jenerik purple-gradient "AI slop" görüntüsünden kaçış. |
| 8 | Animated API | Web/Rork preview uyumu + scope disiplini. |

## Kurulum
```bash
bun install && bun run start
```
