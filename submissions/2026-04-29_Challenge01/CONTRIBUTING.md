# Katkı Rehberi

Bu klasör Nokta challenge için **referans implementasyon**. Submission'ını ayırmak için **kendi klasörünü** aç (`submissions/<öğrenci-no>-<slug>/`). Buraya doğrudan PR atma — bu repo'yu **fork** et veya kendi submission'ında bu projeyi kaynak olarak gösterip türev üret.

## Türetirken Anti-Slop Disiplini

Bu projeyi **olduğu gibi** kopyalarsan similarity ≥ 0.80 yakalanır → **-%35 ceza**. Bunun yerine:

1. **Bir tekniği** seç (örn. tool use, streaming, embedding dedup) → **kendi tarzında** yeniden yaz
2. Decision log'una **neden bu tekniği** seçtiğini yaz, kopyaladığını belirt — referans göster (`Inspired by submissions/2026-04-29_Challenge01`)
3. **UI/UX'i tamamen değiştir** — bu projede minimal kullandım; sen "lab", "cosmic", "terminal" tema yapabilirsin
4. **Provider'ı değiştir** — Claude yerine OpenRouter / Mistral / Together.ai dene

## Geliştirme

```bash
npm install
npm run typecheck   # tsc --noEmit
npm test            # jest
npm run lint        # eslint
npx expo start      # metro
```

## PR Açarken (bu projeye)

Bu klasöre doğrudan PR genel olarak **kabul edilmez** (bu bir referans, öğrenci ödevi değil). İstisna:
- Açık bir bug fix (örn. orchestrator.ts'deki retry logic'te off-by-one)
- Daha güvenli prompt-injection sanitization

PR template:
- Hangi sorunu çözüyor? (kısa)
- Test eklendi mi?
- Submission audit'inden alınan bir gözleme dayanıyor mu?

## Style

- TypeScript strict mode açık
- Yorum **az**: niyeti açıkla, ne yaptığını değil
- Servis fonksiyonları **pure** olmalı; React hook'ları sadece UI'da
- Dosya başına ~150 satır limit; daha fazlası modülerleştir

## Kod Yapısı

```
app/
├── App.tsx                    # entry, navigation
├── src/
│   ├── screens/
│   │   ├── CaptureScreen.tsx  # text/voice input
│   │   ├── QuestionsScreen.tsx # 3-5 soru
│   │   └── SpecScreen.tsx     # streaming spec
│   ├── components/
│   ├── services/
│   │   ├── orchestrator.ts    # provider failover
│   │   ├── anthropic.ts       # tool use
│   │   ├── gemini.ts          # fallback
│   │   ├── groq.ts            # 2nd fallback
│   │   ├── streaming.ts       # SSE decoder
│   │   ├── embeddings.ts      # cheap hash embedding
│   │   ├── storage.ts         # AsyncStorage wrapper
│   │   └── sanitize.ts        # prompt injection guard
│   ├── prompts/
│   │   └── system.ts          # Track A system prompt
│   ├── hooks/
│   │   ├── useStreamingChat.ts
│   │   └── useVoiceInput.ts
│   └── types/
│       └── index.ts
├── package.json
├── app.json
├── tsconfig.json
├── .env.example
└── pre-commit                 # hook script
```
