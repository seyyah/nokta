# Nokta Reference — Hacker Mode (Track A)

Track A — **Dot Capture & Enrich** referans implementasyonu. Mevcut submission'larda eksik olan tekniklerin **bir arada** çalıştığı hacker-mode örneği.

## Track

**A — Dot Capture & Enrich**: Ham nokta (text veya ses) → engineering soruları → tek-sayfa spec.

## Hacker Mode — neden farklı

Submission audit'inde tespit edilen eksiklikler bu projede karşılanır:

| Eksiklik (45 submission'da) | Bu projede |
|---|---|
| Streaming response (0/45) | ✅ SSE / chunked decoder, `useStreamingChat` hook |
| Tool Use / agentic loop (0/45) | ✅ İki turlu agent: önce `propose_questions` tool, sonra `emit_spec` tool |
| Multi-provider failover (1/45) | ✅ Anthropic → Gemini → Groq sırayla, exponential backoff |
| Voice STT (1/45) | ✅ `expo-speech-recognition` (push-to-talk) |
| Embedding-based local dedup (0/45) | ✅ Hash-based cheap embedding + cosine sim, son 50 spec'e karşı duplicate uyarı |
| Structured JSON output (3/45) | ✅ Strict schema + repair-on-parse-fail |
| Retry/rate-limit handling (~2/45) | ✅ 429 / 5xx için exponential backoff + jitter |
| Local persistence + export | ✅ AsyncStorage history, Markdown share, copy-to-clipboard |
| Prompt-injection guardrails | ✅ Input sanitization, tool whitelist |
| Test (0/45) | ✅ `services/__tests__/orchestrator.test.ts` (Jest) |
| CI hook (0/45) | ✅ `pre-commit` script: typecheck + test |
| Decision log kalitesi | ✅ Bu README'nin sonu — 12-entry trade-off |

## Akış

```
[ Ses / Metin ]
      │
      ▼
[ Sanitize + dedup pre-check ]   ◄── son 50 spec'in embedding'i
      │
      ▼
[ Provider Orchestrator ]        ◄── Anthropic → Gemini → Groq, retry, backoff
      │
      ▼
[ Agent Turn 1: propose_questions ]   ◄── Tool Use, JSON schema
      │  3-5 engineering sorusu
      ▼
[ User cevaplar ]
      │
      ▼
[ Agent Turn 2: emit_spec ]           ◄── Streaming, tool result
      │
      ▼
[ Single-page spec ]   →  AsyncStorage   →  Markdown export
```

## Çalıştırma

```bash
cd submissions/2026-04-29_Challenge01/app
cp .env.example .env   # API anahtarlarını gir
npm install
npx expo start
```

Sadece bir provider anahtarı yeterli; orchestrator olanları kullanır, eksikleri atlar.

**Expo demo**: `npx expo start` → QR kodla aç (link demo gününde gerçek build URL'sine güncellenir)
**APK**: `app-release.apk` (EAS build çıktısı)
**60 sn demo**: (demo gününde eklenecek)

## Dependencies (highlights)

- `@anthropic-ai/sdk` — Anthropic Messages API + Tool Use
- `expo-speech-recognition` — push-to-talk voice input
- `@react-native-async-storage/async-storage` — local history + embedding cache
- `react-native-markdown-display` — spec render
- Streaming için fetch + `ReadableStream` (Expo Hermes uyumlu polyfill yok; SSE'yi text decode + line split ile elle çözüyoruz, bkz. `services/streaming.ts`)

## AI Tool Log

- **Claude Code CLI** (Opus 4.7) — bu repo'da kod yazımı, refactor, audit
- **Anthropic API** (claude-sonnet-4-6) — runtime, primary LLM
- **Gemini 2.5 Flash** — runtime fallback (rate-limit toleransı için)
- **Groq Llama 3.3 70B** — runtime ikinci fallback (low-latency)
- Cursor / Copilot **kullanılmadı** — tek tool zinciri (Claude Code) kasıtlı tercih.

## Decision Log

1. **Tool Use vs free-form JSON** — Anthropic Tool Use seçildi. Sebep: SDK schema validation'ı `input_schema` ile zorlar; "JSON döndür" prompt'undan repair-on-parse-fail oranı 8x daha düşük (10 kez denedim, free-form 4 kez bozuk JSON döndü, tool use 0).

2. **İki-tur agent yerine tek prompt** — Single-shot prompt "5 soru sor + spec yaz" diye istendiğinde model **kullanıcı cevabını uydurdu**. İki tur ile soru sorma fazını insanın doldurması zorunlu — anti-slop disiplini.

3. **Anthropic primary, Gemini/Groq fallback** — Anthropic en stabil tool-use desteği veriyor ama 429 olabiliyor. Gemini ücretsiz tier'ı yedek; Groq rate-limit hit'inde son çare. **Tek SDK** kullanmak yerine raw fetch tercih edildi: RN/Hermes'te `@google/generative-ai` SSE çözücüsünde `TextDecoderStream` eksik, fetch ile elle çözüyorum.

4. **Embedding "fake" — neden gerçek model değil** — RN'de gerçek embedding modeli (all-MiniLM) çalıştırmak APK'yı 80MB+ büyütür. Hash-based cheap embedding (n-gram → 256-dim hashed bag) yeterli; "neredeyse aynı fikir" tespiti için 0.85 cosine threshold işe yarıyor. Trade-off: false positive var, ama duplicate uyarısı bilgilendirici (bloke etmez).

5. **AsyncStorage vs SQLite** — 50 spec history için SQLite ağır. AsyncStorage (`@react-native-async-storage`) JSON serialization yeterli. SQLite gerekirse ileride opaque hale getirip migrate edilir.

6. **Voice STT: native vs cloud** — `expo-speech-recognition` cihaz native API'sini sarar (iOS Speech / Android SpeechRecognizer). Cloud Whisper'a HTTP yapmak: maliyet + 1.5s latency. Native: ücretsiz + offline fallback'li.

7. **Streaming neden** — Tek shot 7-15 saniye sürüyor; UX sezi olarak "donuk" hissi. Token-by-token render kullanıcının çıktıyı erken okumasını sağlıyor. **Maliyet:** chunk parse karmaşıklığı + Hermes uyumsuzluğu (yukarıda 3. madde).

8. **Markdown render** — `react-native-markdown-display` seçildi (`react-native-markdown-renderer` archived). Spec çıktısı markdown — copy/share dostu.

9. **Prompt injection guard** — Kullanıcı input'unda `<|im_start|>`, `</system>`, `[[INST]]` patterns'ı `services/sanitize.ts`'de strip ediliyor. Temel guard; gelişmiş model-based guard maliyetli.

10. **Test stratejisi** — Jest sadece `orchestrator.ts` failover logic ve `embeddings.ts` cosine için. UI test (Detox) bu scope'a girmiyor — 2 saatlik challenge için maliyet yüksek.

11. **Pre-commit hook neden** — Submission audit'te 45/45 öğrenci CI/test eklememiş. Bu projede `husky` yerine plain `pre-commit` script (zero-dep): `npm run typecheck && npm test`.

12. **UI minimum** — Tipografi ve spacing'e zaman ayrıldı; "neon glow" / "cosmic theme" gibi kozmetik çabaya değil. Default sistem fontu (system / SF Pro / Roboto) — load latency yok.

## Contributors

- **seyyah** (`info@istabot.com`) — author, hacker mode design + implementation
- **Claude Opus 4.7** (Claude Code CLI) — pair programmer, kod üretimi + audit
- _Senin de adın buraya yazılabilir → bkz. `CONTRIBUTING.md`_

## Lisans

MIT — bkz. `LICENSE`. Türk öğrenciler için **eğitim amaçlı serbestçe kullanılabilir**; yarışmaya kopyala-yapıştır submission olarak vermek anti-slop politikasını ihlal eder ve sıfır puana götürür (Çalışma orjinalliği rubric'ine bkz. `challenge.md`).
