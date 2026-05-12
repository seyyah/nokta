# nokta-hoop

*Fikir kulucka surecine HITL/HOTL/HOOTL yonetisim katmani, gercek zamanli
video/avatar danismanlik ve Karpathy llm-wiki bilgi birikimi ekleyen otonom
orkestrasyon platformu. Mobil uygulama uzerinden canli video gorusmeleri
baslatan, katilimcilari ayni gorusme odasinda bulusturan, gorusme sonrasinda
okunabilir transkript cikaran ve uzman geri bildirimini kalici bilgi tabanina
yazan bagimsiz bir urundir.*

> Bu belge IDEA standardini takip eder. Kod yazmadan once nokta-hoop'un ne
> oldugunu, neden var olmasi gerektigini ve hangi teknik kararlar etrafinda
> sekillenecegini aciklar. Nokta (seyyah/nokta) fikir kulucka ekosisteminin,
> context-hoop (HITL MCP orkestrasyon) ve context-doctor (mobil video gorusme)
> bilesenleriyle sentezlenmis halidir.

---

## 1. Tez (Thesis)

Nokta ekosisteminde fikirler PR-tabanli asenkron bir dongude olgunlasir: ogrenci
fikir yazar, CI degerlendirir, puan verir. Ancak gercek dunyada fikirlerin
olgunlasmasi icin **uzman geribildiriminin yapilandirilmis bir sekilde alinmasi**
ve bu geribildirimin **kalici bilgi tabanina yazilmasi** gerekir.

Bu urunun temel iddiasi:

```text
Fikir kulucka sureci, asenkron PR akisindan ibaret olmamalidir.
Uzman eskalasyonu, gercek zamanli gorusme ve bilgi birikimi (writeback)
tek bir platform uzerinden yonetilmelidir.
```

Ayrica bir video gorusmesinin degeri yalnizca canli konusma aninda degil,
gorusme sonrasinda tekrar incelenebilir olmasinda ortaya cikar. Konusulanlari
elle not almak zorunda kalmak dikkati boler ve kritik detaylar kaybolur.

nokta-hoop uc katmani birlestirir:

1. **Hoop (Dongu Yonetisimi):** HITL/HOTL/HOOTL risk modlarina gore uzman
   eskalasyonu, MCP tabanli adapter-agnostic kanal yonetimi (Slack, WhatsApp,
   Email).
2. **Call (Gercek Zamanli Gorusme):** Stream Video ile mobil video gorusme,
   Tavus AI avatar bridge ile yapay zeka destekli danismanlik, gorusme
   transkripti.
3. **Wiki (Bilgi Birikimi):** Karpathy llm-wiki pattern ile uzman cevaplarinin
   yapilandirilmis markdown wiki'ye yazilmasi, ayni sorunun bir daha
   eskalasyona yol acmamasi.

---

## 2. Problem

### 2.1 Asenkron PR-Only Akisin Siniri

Nokta'nin mevcut modeli tek yonludur: ogrenci PR atar, CI skorlar. Uzman geri
bildirimi icin yapilandirilmis bir mekanizma yoktur. Fikir sahibi "bir sonraki
adim" icin gunlerce bekleyebilir.

### 2.2 Uzman Feedback Darbogazi

Danismanlar/mentorlar randevu veremez, feedback gecikir. Eskalasyon
mekanizmasi olmadigi icin hangi fikirlerin acil uzman incelemesi gerektirdigi
belirsizdir.

### 2.3 Gorusme Sonrasi Bilgi Kaybi

Canli gorusmelerde konularin ne zaman gectigi, kimin ne soyledigi ve hangi
kararlarin alindigi hatirlanmayabilir. Elle not alma gorusmenin akisini bozar.

### 2.4 Writeback Eksikligi

Uzman bir kez gorsu bildirdikten sonra bu bilgi kaybolur. Ayni soru bir
sonraki fikir sahibi tarafindan tekrar sorulur. Bilgi birikmez, her seferinde
sifirdan baslanir.

### 2.5 Gorusme Arsivi Dagilir

Gorusme linkleri, dosya kayitlari ve not dokumanlari zamanla birbirinden kopar.
Gorusme, katilimci, tarih, transkript ve eskalasyon karari ayni oturum kaydi
altinda toplanmalidir.

---

## 3. Nasil Calisir (How It Works)

### Temel Icgoru 1 — Uc Dongu Modu (HITL / HOTL / HOOTL)

Risk seviyesine gore farkli insan katilim modlari:

- **HOOTL (Human-Out-of-the-Loop):** Dusuk riskli islemler. Fikir taslagi
  olusturma, transkript export, arsiv listeleme. Insan mudahalesine gerek yok.
- **HOTL (Human-On-the-Loop):** Orta riskli islemler. Fikir skorlama, slop
  tespiti, transkript ozetleme. Sistem calisir, insan izler ve gerekirse
  mudahale eder.
- **HITL (Human-In-the-Loop):** Yuksek riskli islemler. Fikir onaylama, uzman
  degerlendirmesi, NDA gerektiren icerikler. Insan onayi olmadan islem
  ilerlemez.

### Temel Icgoru 2 — MCP Tabanli Adapter-Agnostic Eskalasyon

Eskalasyon kanali degistiginde cekirdek akis ayni kalir. `trigger_human_in_the_loop`
MCP Tool Call'u Slack, WhatsApp veya Email adapter'ina yonlendirilir. Adapter
kontrati normalize edilir; kanal detaylari cekirdek orkestrasyon katmanina
sizmaz.

```text
Fikir sahibi soru sorar veya ajan adim tasarlar
-> RAG/policy "yetersiz bilgi" veya "yuksek risk" tespit eder
-> MCP Tool Call tetiklenir (adapter: slack | whatsapp | email)
-> Uzman ilgili kanalda soruyu okur ve yanitlar
-> Yanit SSE uzerinden kullanici ekranina duser
-> Writeback: yanit wiki'ye kaydedilir
```

### Temel Icgoru 3 — Video/Avatar Destekli Senkron Danismanlik

Asenkron eskalasyon yetmediginde fikir sahibi ve uzman gercek zamanli video
gorusmesine gecebilir. Stream Video ile coklu katilimci, Tavus AI avatar
bridge ile yapay zeka destekli on gorusme asistani. Gorusme transkripti
otomatik olarak cikarilir.

### Temel Icgoru 4 — Writeback ve llm-wiki Kalicilasma

Karpathy llm-wiki pattern adaptasyonu:

```text
Ham kaynaklar  = uzman gorusmeleri, Slack yanitlari, WhatsApp cevaplari
Wiki varliklari = fikir kartlari, domain bilgisi, karar loglari
Writeback      = Her uzman eskalasyonu -> wiki entity guncelleme
Birikimlilik   = Ayni soru ikinci kez gelmez; wiki'den yanitlanir
```

### Temel Icgoru 5 — Autoresearch Ratchet

Karpathy autoresearch pattern adaptasyonu:

```text
Program.md  = IDEA.md (fikir spesifikasyonu)
train.py    = fikir artifact'i (idea.md -> spec -> prototype)
Eval metric = hoop-eval score (slop score, uzman approval rate, writeback hit)
Ratchet     = Git commit uzerinden; iyilesen skor -> keep, kotulesen -> revert
```

---

## 4. Urun Akisi

```text
fikir sahibi uygulamayi acar
-> ana ekranda gecmis gorusmeleri ve eskalasyonlari gorur
-> yeni fikir icin eskalasyon tetikler VEYA gorusme odasi olusturur
-> risk modu belirlenir (HOOTL / HOTL / HITL)
  -> HOOTL: sistem otonom calisir
  -> HOTL: sistem calisir, uzman izler
  -> HITL: uzman onayi beklenir (Slack/WA/Email)
-> gerekirse video gorusme baslar
-> katilimcilar gorusme yapar
-> gorusme sesi transkript icin islenir
-> gorusme bittikten sonra transkript hazirlanir ve subtext cikarilir
-> writeback: uzman karari + transkript subtext'i wiki'ye kaydedilir
-> kullanici transkript/wiki ekraninda icerige erisir, arar, disa aktarir
```

---

## 5. Temel Ozellikler

### 5.1 Hoop — Dongu Yonetisimi

- risk seviyesi tespiti (policy substrate)
- MCP Tool Call tetikleme (`trigger_human_in_the_loop`)
- adapter yonlendirme (Slack Block Kit, WhatsApp Template, Email)
- eskalasyon durumu izleme (pending, approved, rejected, timeout)
- timeout ve fallback yonetimi
- policy lint (konfigurasyonun gecerliligini dogrulama)

### 5.2 Call — Video Gorusme

- paylasilabilir gorusme odasi (Stream Video)
- katilimci adi ile giris
- kamera/mikrofon kontrolu
- AI avatar bridge (Tavus) ile on gorusme asistani
- gorusmeden ayrilma
- gorusme oturumu kaydi (id, baslik, katilimcilar, zaman)

### 5.3 Transcript — Gorusme Transkripti

- zaman damgali satirlar
- konusmaci ayrimi
- gorusme boyunca sirali metin
- subtext (alt metin/baglam) ve yapilandirilmis ozet cikarimi
- aranabilir yapi
- disa aktarma formatlari: `txt`, `md`, `json`

### 5.4 Wiki — Bilgi Birikimi

- uzman yanitlarinin markdown wiki'ye ingestion'i
- cakisma cozumu (birden fazla uzman gorusu)
- entity guncelleme ve versiyonlama
- yapilandirilmis wiki sorgulama
- RAG beslemesi (gelecek eskalasyonlarda wiki'den yanit arama)

### 5.5 Arsiv

- gecmis gorusmeler listesi
- eskalasyon gecmisi
- transkript durumu (pending, processing, ready, failed)
- wiki snapshot'lari

---

## 6. Mimari

```text
mobile app / web UI
-> hoop-core (MCP orkestrator, policy, adapter'lar)
-> hoop-call (Stream Video, avatar bridge, transkript)
-> hoop-wiki (llm-wiki ingest, reconcile, query)
-> services/
   -> token-server (Stream Video token backend)
   -> hoop-proxy (MCP proxy, SSE endpoint)
```

### 6.1 hoop-core

MCP orkestrasyon cekirdegidir:

- Policy substrate: risk siniflari, kural setleri, esik degerleri
- Runtime: MCP server, SSE baglanti yonetimi, timeout
- Adapter'lar: Slack, WhatsApp, Email — her biri ince cevirici katman
- Writeback koordinatoru: uzman yanitini hoop-wiki'ye yonlendirir

### 6.2 hoop-call

Gercek zamanli gorusme katmanidir:

- Stream Video entegrasyonu (oda olusturma, katilimci, medya)
- Tavus AI avatar bridge (sesli/goruntulu AI asistan)
- Transcript servisi (ses -> metin, konusmaci ayrimi, zaman damgasi)
- Oturum yonetimi (baslama, bitis, durum izleme)

### 6.3 hoop-wiki

Karpathy llm-wiki bilgi birikimi katmanidir:

- Ingest: uzman yanitlari, transkript ozetleri -> markdown entity
- Reconcile: cakisan bilgileri uzlastirma, dedup
- Query: yapilandirilmis arama, RAG beslemesi

---

## 7. Veri Modeli

### 7.1 Escalation

```text
Escalation
- id
- ideaId
- riskLevel: low | medium | high
- loopMode: hootl | hotl | hitl
- adapter: slack | whatsapp | email
- status: pending | sent | approved | rejected | timeout
- question
- expertAnswer
- writebackStatus: pending | completed | failed
- createdAt
- resolvedAt
- timeoutAt
```

### 7.2 MeetingSession

```text
MeetingSession
- id
- title
- escalationId (nullable)
- status: scheduled | live | processing | completed | failed
- roomId
- createdBy
- startedAt
- endedAt
```

### 7.3 Participant

```text
Participant
- id
- sessionId
- displayName
- role: idea_owner | expert | avatar
- joinedAt
- leftAt
```

### 7.4 Transcript

```text
Transcript
- id
- sessionId
- status: pending | processing | ready | failed
- language
- items: TranscriptItem[]
```

### 7.5 TranscriptItem

```text
TranscriptItem
- id
- transcriptId
- speakerLabel
- text
- startedAtMs
- endedAtMs
- confidence
```

### 7.6 WikiEntity

```text
WikiEntity
- id
- slug
- title
- content (markdown)
- sources: { escalationId, transcriptId, timestamp }[]
- version
- createdAt
- updatedAt
```

---

## 8. API Taslagi

```text
GET  /health

# Escalation
POST /escalations
GET  /escalations
GET  /escalations/:id
POST /escalations/:id/approve
POST /escalations/:id/reject

# Session
POST /sessions
GET  /sessions
GET  /sessions/:id
POST /sessions/:id/start
POST /sessions/:id/end

# Transcript
GET  /sessions/:id/transcript
POST /sessions/:id/transcript/process

# Wiki
GET  /wiki
GET  /wiki/:slug
POST /wiki/ingest
POST /wiki/query

# Export
GET  /sessions/:id/export?format=md
GET  /sessions/:id/export?format=json
GET  /sessions/:id/export?format=txt
GET  /escalations/:id/export?format=md
```

---

## 9. Ne Yapmaz (What It Does Not Do)

- **Tani koymaz, tedavi onermez:** context-doctor guvenlik kurallari gecerlidir.
  Extract, never generate.
- **Acik uclu chatbot degildir:** Amaci ucuz metin uretmek degil, uzman
  eskalasyonu ve bilgi birikimi saglamaktir.
- **Tek kanala bagimli degildir:** Adapter-agnostic; Slack, WhatsApp, Email
  veya gelecekte baska kanallar entegre edilebilir.
- **Manuel not almaya dayanmaz:** Transkript otomatik cikarilir, uzman yaniti
  otomatik wiki'ye yazilir.

---

## 10. Risk Modlari

**Tam otonom mod (HOOTL).** Dusuk riskli, geri alinmasi kolay islemler. Fikir
taslagi listeleme, transkript export, arsiv goruntuleme. Insan mudahalesine
gerek yok.

**On-event HITL mod (HOTL).** RAG no-answer, slop tespiti veya esik asimi gibi
belirli sinir durumlarinda sistem otomatik eskalasyon uretir. Uzman izleyici
konumundadir ve gerektiginde mudahale eder.

**Zorunlu checkpoint mod (HITL).** Fikir onaylama, NDA gerektiren icerikler,
kritik karar noktalari. Her adim oncesinde insan onayi olmadan islem ilerlemez.
MCP token verilmez.

---

## 11. Test Stratejisi

### 11.1 Escalation Tests

- eskalasyon olusturulur, durumu pending olur
- adapter dogru secilir (slack/whatsapp/email)
- onay sonrasi status approved olur, writeback tetiklenir
- red sonrasi status rejected olur, gerekce saklanir
- timeout sonrasi fallback state'e gecilir

### 11.2 Session Tests

- oturum olusturulur
- oturum durumu guncellenir (live -> completed)
- katilimci bilgisi saklanir

### 11.3 Transcript Tests

- transcript item sirasi korunur
- speaker label saklanir
- zaman damgalari korunur
- bos transcript hatali kabul edilir

### 11.4 Wiki Tests

- ingest sonrasi entity olusur
- ayni entity guncellenmesinde version artar
- sources listesi buyur
- query sonuclari dogru doner

### 11.5 Export Tests

- markdown export uretilir
- json export schema uyumludur
- txt export okunabilir metin dondurur

### 11.6 Integration Tests

- escalation -> session -> transcript -> writeback -> wiki akisi calisir
- transkript hazir degilken export uygun hata dondurur
- wiki'de mevcut bilgi varken eskalasyon yerine wiki yaniti doner

---

## 12. CLI Reference

### Infrastructure

```json
{
  "name": "nokta-hoop",
  "version": "0.1.0",
  "bin": { "nokta-hoop": "./bin/cli.js" },
  "scripts": {
    "test": "jest --verbose",
    "test:cli": "jest tests/cli/ --verbose"
  }
}
```

### Command Table

| Command | Description | Required Flags | Optional Flags |
|---------|-------------|----------------|----------------|
| `nokta-hoop trigger` | Trigger HITL/HOTL escalation | `--input` | `--adapter`, `--risk`, `--config`, `--format`, `--dry-run` |
| `nokta-hoop status` | Check pending escalations | | `--format`, `--verbose` |
| `nokta-hoop approve` | Approve a pending escalation | `--input` | `--format`, `--verbose` |
| `nokta-hoop reject` | Reject with feedback | `--input` | `--format`, `--verbose` |
| `nokta-hoop call` | Start a video call session | `--room` | `--title`, `--avatar`, `--format` |
| `nokta-hoop transcript` | Process/retrieve transcript | `--session` | `--format`, `--output`, `--language` |
| `nokta-hoop export` | Export session or escalation | `--input` | `--format`, `--output` |
| `nokta-hoop wiki-ingest` | Ingest expert answer into wiki | `--input` | `--entity`, `--format`, `--dry-run` |
| `nokta-hoop wiki-query` | Query the wiki knowledge base | `--query` | `--format`, `--verbose`, `--top-k` |
| `nokta-hoop lint` | Validate hoop configuration | `--input` | `--format`, `--verbose` |
| `nokta-hoop eval` | Autoresearch ratchet evaluation | `--input`, `--baseline` | `--output`, `--format` |

### Additional Flags

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--adapter` | `string` | `slack` | Escalation channel: `slack` \| `whatsapp` \| `email` |
| `--risk` | `string` | `auto` | Risk level: `low` \| `medium` \| `high` \| `auto` |
| `--avatar` | `boolean` | `false` | Enable AI avatar for the call session |
| `--language` | `string` | `tr` | Transcript language |
| `--top-k` | `number` | `5` | Number of wiki results to return |

### Usage Scenarios

#### Scenario 1 — Happy Path: Trigger Escalation

```bash
nokta-hoop trigger \
  --input output/risky-idea.json \
  --adapter slack \
  --risk high \
  --format json
```

**Input:** JSON with idea details flagged for expert review.
**Expected Output:** Escalation ticket ID, notification sent via Slack.
**Exit Code:** `0`

#### Scenario 2 — Trigger with Auto Risk Detection

```bash
nokta-hoop trigger \
  --input output/idea-draft.json \
  --risk auto \
  --format json
```

**Input:** JSON idea draft.
**Expected Output:** Risk level auto-detected, escalation created with appropriate loop mode.
**Exit Code:** `0`

#### Scenario 3 — Check Pending Escalations

```bash
nokta-hoop status --format json --verbose
```

**Expected Output:** JSON array of pending escalations with IDs, adapters, risk levels, timestamps, and timeout info.
**Exit Code:** `0`

#### Scenario 4 — Approve Escalation

```bash
nokta-hoop approve \
  --input escalation-abc123.json
```

**Expected Output:** Approval confirmed, writeback triggered to wiki.
**Exit Code:** `0`

#### Scenario 5 — Reject Escalation with Feedback

```bash
nokta-hoop reject \
  --input escalation-abc123.json
```

**Input:** JSON with rejection reason/feedback.
**Expected Output:** Rejection recorded, feedback stored, idea owner notified.
**Exit Code:** `0`

#### Scenario 6 — Start Video Call Session

```bash
nokta-hoop call \
  --room room-xyz789 \
  --title "Fikir Degerlendirme: Implant Calisma" \
  --avatar \
  --format json
```

**Expected Output:** Session ID, room URL, avatar bridge status, participant join instructions.
**Exit Code:** `0`

#### Scenario 7 — Process Transcript

```bash
nokta-hoop transcript \
  --session session-456 \
  --language tr \
  --format json \
  --output output/transcript-456.json
```

**Expected Output:** Transcript with speaker labels, timestamps, confidence scores.
**Exit Code:** `0`

#### Scenario 8 — Export Session as Markdown

```bash
nokta-hoop export \
  --input session-456 \
  --format md \
  --output output/session-456.md
```

**Expected Output:** Markdown file with session metadata, participant list, transcript, escalation decisions.
**Exit Code:** `0`

#### Scenario 9 — Ingest Expert Answer into Wiki

```bash
nokta-hoop wiki-ingest \
  --input output/expert-answer.json \
  --entity "implant-diyabet-gap" \
  --format json
```

**Input:** JSON with expert Q&A from escalation or transcript.
**Expected Output:** Wiki entity created or updated, version incremented, sources linked.
**Exit Code:** `0`

#### Scenario 10 — Query Wiki Before Escalation

```bash
nokta-hoop wiki-query \
  --query "implant basari orani diyabet iliskisi" \
  --top-k 3 \
  --format json
```

**Expected Output:** Top-k matching wiki entities with relevance scores. If match found, escalation may be unnecessary.
**Exit Code:** `0`

#### Scenario 11 — Dry Run Escalation

```bash
nokta-hoop trigger \
  --input output/idea-draft.json \
  --adapter whatsapp \
  --dry-run
```

**Expected:** Prints escalation plan (adapter, recipients, risk level, estimated timeout). No notification sent.
**Exit Code:** `0`

#### Scenario 12 — Wiki Ingest Dry Run

```bash
nokta-hoop wiki-ingest \
  --input output/expert-answer.json \
  --entity "implant-diyabet-gap" \
  --dry-run
```

**Expected:** Prints ingest plan (entity slug, content diff, version change). No wiki modification.
**Exit Code:** `0`

#### Scenario 13 — Autoresearch Ratchet Evaluation

```bash
nokta-hoop eval \
  --input output/current-scores.json \
  --baseline output/baseline-scores.json \
  --output output/eval-report.json \
  --format json
```

**Input:** Current hoop metrics and baseline.
**Expected Output:** Evaluation report with slop score delta, approval rate delta, writeback hit rate delta. Pass/fail ratchet decision.
**Exit Code:** `0`

#### Scenario 14 — Lint Configuration

```bash
nokta-hoop lint \
  --input fixtures/config/hoop-policy.yaml \
  --format json
```

**Expected Output:** Validation results for policy config (risk thresholds, adapter configs, timeout values).
**Exit Code:** `0`

#### Scenario 15 — Missing Input (Error)

```bash
nokta-hoop trigger
```

**Expected:** `Error: required option '--input <path>' not specified`
**Exit Code:** `1`

#### Scenario 16 — Nonexistent Escalation (Error)

```bash
nokta-hoop approve --input nonexistent-escalation.json
```

**Expected:** `Error: Input file not found: nonexistent-escalation.json`
**Exit Code:** `1`

#### Scenario 17 — Invalid Config (Error)

```bash
nokta-hoop trigger \
  --input output/idea-draft.json \
  --config fixtures/config/corrupt-config.yaml
```

**Expected:** `Error: Invalid YAML configuration in fixtures/config/corrupt-config.yaml`
**Exit Code:** `1`

#### Scenario 18 — Schema Validation Error

```bash
nokta-hoop trigger \
  --input fixtures/json/invalid-schema.json
```

**Expected:** `Error: Validation failed — schema mismatch in input file.`
**Exit Code:** `2`

#### Scenario 19 — Adapter Unreachable (Error)

```bash
nokta-hoop trigger \
  --input output/idea-draft.json \
  --adapter slack
```

**Expected (when Slack unreachable):** `Error: Adapter 'slack' unreachable — connection refused.`
**Exit Code:** `3`

#### Scenario 20 — Transcript Not Ready (Error)

```bash
nokta-hoop transcript \
  --session session-456
```

**Expected (when processing):** `Error: Transcript for session-456 is still processing. Status: processing`
**Exit Code:** `2`

#### Scenario 21 — Wiki Query No Results

```bash
nokta-hoop wiki-query \
  --query "tamamen alakasiz konu xyz" \
  --format json
```

**Expected Output:** Empty results array with message: "No matching wiki entities found."
**Exit Code:** `0`

#### Scenario 22 — Export Escalation History

```bash
nokta-hoop export \
  --input escalation-abc123 \
  --format md \
  --output output/escalation-report.md
```

**Expected Output:** Markdown with escalation timeline (created, sent, expert response, approval/rejection, writeback status).
**Exit Code:** `0`

### Exit Codes

| Code | Meaning | Example |
|------|---------|---------|
| `0` | Success | Escalation triggered, transcript ready, wiki updated |
| `1` | General error | Missing file, invalid argument, input not found |
| `2` | Validation error | Schema mismatch, transcript not ready, invalid state |
| `3` | External dependency error | MCP adapter unreachable, Stream API timeout |

---

## 13. Acik Sorular

- Slack uzerinden atilan yanitlarda Reviewer/Editor rollerinin RBAC matrisi
  nasil belirlenecek?
- Insan onayi icin ayrilan sure (orn. 10 dk) asildiginda nasil bir fallback
  state'e gidilecek?
- Birden fazla uzman gorusunde conflict resolution nasil idare edilecek?
- istabot-nokta MRLC pipeline'i ile nokta-hoop arasinda entegrasyon planlanacak
  mi, yoksa bagimsiz mi kalacaklar?
- Video gorusme kaydi saklanacak mi yoksa yalnizca transkript mi hedeflenecek?

---

## 14. Ilk Uygulama Hedefi

```text
1. CLI ile eskalasyon tetikle (nokta-hoop trigger)
2. Eskalasyon durumunu gor (nokta-hoop status)
3. Uzman onayi ver (nokta-hoop approve)
4. Video gorusme baslat (nokta-hoop call)
5. Transkript cikar (nokta-hoop transcript)
6. Uzman yanitini wiki'ye yaz (nokta-hoop wiki-ingest)
7. Wiki'den sorgula (nokta-hoop wiki-query)
8. Sonuclari disa aktar (nokta-hoop export)
```

Bu hedef tamamlandiginda urunun temel degeri kanitlanmis olur: fikir kulucka
surecinde uzman eskalasyonu, gercek zamanli gorusme, transkript ve bilgi
birikimi tek bir CLI uzerinden yonetilir.