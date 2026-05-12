# AGENT.md

## Rol

Bu repo, Nokta fikir kulucka ekosistemine HITL/HOTL/HOOTL yonetisim,
gercek zamanli video gorusme, gorusme transkripti ve wiki writeback katmani
ekleyen `nokta-hoop` urununu gelistirir. Urun bagimsiz bir orkestrasyon
katmanidir; Context Doctor kodlari yalnizca referans kaynak olarak kullanilir.
Her degisiklik net kapsamli, bagimsiz ve test edilebilir olmalidir.

## Gelistirme Kurallari

- Bir phase'i tamamlamadan sonrakine gecme; aktif yon icin root `PLAN.md`
  dosyasini takip et.
- Root `IDEA.md` projenin kanonik urun fikridir. Davranis ve mimari kararlar
  buradan ve root `PLAN.md`den turetilir.
- Root `README.md`, `PLAN.md` ve `IDEA.md` dosyalarini kullanici acikca
  istemedikce degistirme.
- Servis ve paket sahipligi bozulamaz:
  - `hoop-core` policy, MCP orchestration, adapter routing ve writeback
    koordinasyonudur.
  - `hoop-call` video call, session lifecycle ve transcript lifecycle
    katmanidir.
  - `hoop-wiki` uzman yaniti/transkript ozetini markdown wiki'ye ingest,
    reconcile ve query katmanidir.
  - `token-server` Stream token, Mascot decision, escalation ve transcript
    API servisidir.
  - `tts-server` Mascot TTS icin lokal Chatterbox servisidir.
  - `hoop-proxy` MCP/SSE proxy servisidir.
  - `apps/mobile` Expo React Native kullanici uygulamasidir.
- `hoop-call` icine HITL policy, Slack/WhatsApp/Email adapter logic veya wiki
  reconcile mantigi koyma.
- `hoop-core` icine Stream UI, kamera/mikrofon kontrolu veya mobil ekran
  mantigi koyma.
- `hoop-wiki` icine video provider, Stream token veya gorusme odasi lifecycle
  mantigi koyma.
- Context Doctor kodlari kopyalanacaksa yalnizca gerekli video-call pattern'leri
  tasinmali; Tavus/avatar/AI/intake/medical logic alinmamalidir.
- Mevcut calisan uygulama Mascot sohbeti, opsiyonel Groq karari, mentor
  escalation, Stream Video handoff, transcript ve export akisidir.
- Gercek kullanici verisi, secret, API key, Stream secret veya PII commit etme.

## Versiyonlama ve Etiketleme

Her tamamlanan iterasyon sonunda su adimlari uygula:

```bash
# 1. CHANGELOG.md icindeki Unreleased maddelerini yeni versiyon basligina tasi.
# 2. Versiyon artisini sec:
#    kucuk degisiklik = patch artisi, orn. nokta-hoop 0.1.1 -> nokta-hoop 0.1.2
#    buyuk ozellik veya planli degisiklik = minor artisi, orn. nokta-hoop 0.1.0 -> nokta-hoop 0.2.0
# 3. Kullanici acikca istemedikce commit veya tag atma.
```

## CHANGELOG Formati

`CHANGELOG.md` dosyasini Keep a Changelog standardinda tut:

- `### Added` / `### Changed` / `### Fixed` / `### Removed` basliklarini kullan.
- Her release girisi `## [nokta-hoop X.Y.Z] - YYYY-MM-DD` satiriyla
  acilir.
- Unreleased degisiklikler `## [Unreleased]` altinda birikir.
- Commit istenirse once Unreleased maddelerini versiyona tasi, sonra commit al.

---

## Development & Testing Guide

> Bu bolum nokta-hoop icin teknik calisma standardidir. Yeni paket, servis
> veya mobil degisiklikleri bu kurallara uygun ilerlemelidir.

### 1. Infrastructure

| Tool | Purpose |
|------|---------|
| Node.js | Backend servis runtime |
| npm | Workspace script runner |
| TypeScript | Servis, paket ve mobil tip kontrolu |
| Expo React Native | Mobil uygulama |
| Stream Video | Video call ve transcription provider |
| MCP | HITL/HOTL/HOOTL orchestration interface |
| SSE | Escalation ve transcript state event delivery |
| node:test | Backend servis testleri |

Repo yapi ilkesi:

```text
README.md
PLAN.md
IDEA.md
AGENT.md
DESIGN.md
CHANGELOG.md
packages/hoop-core
packages/hoop-call
packages/hoop-wiki
services/token-server
services/tts-server
services/hoop-proxy
apps/mobile
fixtures/
.github/workflows/
```

Bu liste durum raporu degil, ajanlar icin sahiplik ve yerlestirme rehberidir.
Bir klasor bos veya henuz uygulanmamis olabilir; yeni kod eklerken bu sinirlara
uy, ancak yalnizca durum guncellemek icin AGENT.md degistirme.

### 2. Service Naming Convention

Servis veya paket adi klasor adi ile ayni kalmalidir.

| Directory | Responsibility |
|-----------|----------------|
| `packages/hoop-core` | Policy, MCP runtime, adapters, writeback coordination |
| `packages/hoop-call` | Stream Video integration, call sessions, transcript lifecycle |
| `packages/hoop-wiki` | Markdown wiki ingest, reconcile, query |
| `services/token-server` | Stream token, Mascot decision, escalation, transcript API |
| `services/tts-server` | Local Chatterbox Mascot TTS service |
| `services/hoop-proxy` | MCP proxy and SSE endpoint |
| `apps/mobile` | Expo React Native Mascot and mentor handoff app |

Context Doctor root yapisini veya eski `services/avatar-*` yapisini bu repoya
aynen tasima.

### 3. Standard Script Taxonomy

Root script isimleri app, servis veya paket prefix'i ile baslamalidir:

| Script | Purpose |
|--------|---------|
| `mobile:start` | Expo dev-client Metro |
| `mobile:android` | Android development build |
| `mobile:typecheck` | Mobile TypeScript check |
| `call:typecheck` | `packages/hoop-call` TypeScript check |
| `call:test` | `packages/hoop-call` tests |
| `core:typecheck` | `packages/hoop-core` TypeScript check |
| `core:test` | `packages/hoop-core` tests |
| `wiki:typecheck` | `packages/hoop-wiki` TypeScript check |
| `wiki:test` | `packages/hoop-wiki` tests |
| `server:dev` | Stream token server |
| `server:typecheck` | Token server typecheck |
| `tts:dev` | Local Chatterbox TTS service |
| `tts:install` | Chatterbox Python dependencies |
| `proxy:dev` | Hoop proxy service |
| `proxy:typecheck` | Hoop proxy typecheck |
| `typecheck` | All active typechecks |
| `test` | All active tests |

### 4. Environment And Secrets

- Mobile app only uses `EXPO_PUBLIC_*` values.
- Stream API secret stays in `services/token-server`.
- Stream transcription configuration must not expose secrets to mobile.
- Chatterbox voice prompt files stay local and are referenced by path only.
- `services/hoop-proxy` owns MCP/SSE endpoint secrets when introduced.
- Adapter secrets for Slack, WhatsApp, or Email stay outside mobile code.
- `.env` files with real values must not be committed.
- `.env.example` files should document required variables without secrets.

### 5. API Error Standard

Backend services should return JSON errors:

```json
{ "error": "Human-readable message" }
```

Use clear status codes:

- `400` invalid request
- `404` missing resource
- `409` invalid state or conflict
- `500` local/server error
- `502` upstream provider failure

### 6. Shared Fixtures

Use local fixtures for deterministic tests. Never commit real user transcripts,
meeting recordings, expert answers, secrets, or PII.

Planned fixtures:

```text
fixtures/escalations/
fixtures/policies/
fixtures/wiki-snapshots/
packages/hoop-call/tests/fixtures/
  transcript-ready.json
  transcript-processing.json
  session-completed.json
  session-live.json
```

Fixture-backed transcript and wiki data must be synthetic and safe to share.

### 7. Test Writing Instructions

Run active checks from repo root:

```bash
npm run typecheck
npm run test
```

Service-level checks:

```bash
npm run server:typecheck
npm run call:typecheck
npm run call:test
npm run core:typecheck
npm run core:test
npm run wiki:typecheck
npm run wiki:test
```

Planned hoop-call test categories:

- session-create
- session-join
- session-end
- participant-state
- transcription-start
- transcription-stop
- transcription-ready
- transcription-fetch
- transcript-normalize
- transcript-export-md
- transcript-export-json
- transcript-export-txt
- transcript-not-ready
- provider-error

### 8. Developer Workflow

```text
1. Read root IDEA.md.
2. Read root PLAN.md.
3. Identify the smallest vertical slice.
4. Keep edits inside the responsible app/package/service boundary.
5. Add focused tests for changed behavior.
6. Run relevant typecheck/test commands.
7. Update CHANGELOG.md when a meaningful change is complete.
8. Commit only when the user explicitly asks.
```

### 9. Invariants

1. **Plan structure first.** New code follows the folder structure in root
   `PLAN.md`.
2. **Context Doctor is reference only.** Reuse proven Stream call patterns, not
   the full product surface.
3. **No AI in the call MVP.** The current call assignment is human-to-human
   video meeting plus transcript.
4. **Transcript ownership.** A completed call should produce a readable,
   timestamped transcript that can be listed, viewed, and exported.
5. **Provider isolation.** Stream secrets stay server-side; mobile never sees
   provider secrets.
6. **Boundary discipline.** Call/session code stays in `hoop-call`, policy in
   `hoop-core`, knowledge persistence in `hoop-wiki`.
7. **Zero PII in logs.** Debug output must not expose user-identifiable
   transcript content or participant data.

### 10. Mobile Testing

For local development:

```bash
npm run server:dev
npm run mobile:start
```

Same-Wi-Fi testing uses the development machine LAN IP in `apps/mobile/.env`.
USB testing can use `adb reverse` and `localhost` URLs.

Before changing native dependencies, remember this is an Expo development build,
not Expo Go.

### 11. UI Design & Development Methodology

- The mobile app should remain focused and workflow-first.
- Avoid turning the app into a generic dashboard; the target experience is
  joining or creating a call, ending it, and reading the transcript.
- Keep camera, microphone, switch-camera, leave-call, and transcript controls
  reachable on mobile.
- Do not add large admin UI in the next stage.
- Design changes should respect root `DESIGN.md` when present and current.
