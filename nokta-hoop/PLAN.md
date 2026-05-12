# nokta-hoop: Draft Repo Oluşturma Planı

Nokta fikir kuluçka ekosistemini **Human-in/on/out-of-the-Loop (HITL/HOTL/HOOTL)** yönetişim katmanı ve **gerçek zamanlı iletişim** (video/sesli/avatar görüşme) ile genişleten bir draft repo oluşturmak.

---

## Kaynak Analizi

Üç kaynaktan sentezlenen bileşenler:

### 1. [nokta](file:///home/seyyah/works/xtatistix/dev/nokta) — Fikir Kuluçka Çekirdeği
- Engineering-guided, slop-free fikir evrimleştirme
- Dot → Line → Paragraph → Page akışı
- NAIM ekosisteminin spec katmanı
- Challenge/submission tabanlı öğrenci PR modeli
- CI-driven kalite kontrol (validate-pr, score)

### 2. [context-hoop](file:///home/seyyah/works/xtatistix/dev/context-med/packages/context-hoop/IDEA.md) — HITL/HOTL/HOOTL Yönetişim
- MCP tabanlı insan-döngüsü orkestrasyon katmanı
- 3 risk modu: Tam Otonom / On-event HITL / Zorunlu Checkpoint
- Adapter-agnostic kanal (Slack, WhatsApp, Email)
- Writeback öğrenme: uzman cevabı → RAG kalıcılaşma
- Policy → Runtime → Human Console üç katmanlı mimari
- CLI: `trigger`, `status`, `approve`, `reject`, `lint`

### 3. [context-doctor](file:///home/seyyah/works/xtatistix/dev/context-doctor) — Gerçek Zamanlı İletişim
- Expo React Native + Stream Video altyapısı
- İkili/çoklu video görüşme (çalışıyor)
- Tavus AI avatar bridge (çalışıyor)
- Token server + intake-api + avatar-api + avatar-bridge servis mimarisi
- Xtatistix design system (Inter, Blue/Green, Material-ish)

### Bonus: [istabot-nokta](file:///home/seyyah/works/xtatistix/dev/context-med/packages/istabot-nokta/IDEA.md)
- MRLC 4-faz pipeline'ı (DISCOVER → DESIGN → EXECUTE → PUBLISH)
- Karpathy autoresearch + llm-wiki pattern referansları
- Conversation state machine + context memory
- A2UI (Adaptive UI) yaklaşımı

---

## İsimlendirme Analizi

> [!IMPORTANT]
> **Önerilen isim: `nokta-hoop`** — uygunluk değerlendirmesi aşağıdadır.

| Kriter | Değerlendirme |
|--------|---------------|
| **Semantik netlik** | ✅ `nokta` (fikir kuluçka) + `hoop` (human-in-the-loop) — iki domain net |
| **Ekosistem tutarlılığı** | ✅ `context-hoop` adlandırma geleneğini takip ediyor |
| **Kısalık** | ✅ 9 karakter, kolay yazılır |
| **GitHub uygunluğu** | ✅ `seyyah/nokta-hoop` olarak doğal durur |
| **Alternatifler** | `nokta-loop`, `nokta-bridge`, `hoop-nokta` — daha az ifade edici |

**Sonuç:** `nokta-hoop` ismi uygundur ve önerilmektedir.

---

## Tez: nokta-hoop Ne Çözer?

Nokta'nın mevcut fikir kuluçka akışı **tamamen asenkron ve tek yönlü**: öğrenci PR atar, CI değerlendirir. **Eksik olan**:

1. **İnsan Eskalasyonu:** Fikir olgunlaşma sürecinde "ayağı yere basan" uzman geri bildirimi için yapılandırılmış HITL/HOTL/HOOTL mekanizması yok.
2. **Gerçek Zamanlı Danışmanlık:** Fikir sahibi ile mentor/uzman arasında video/sesli/avatar destekli senkron görüşme kabiliyeti yok.
3. **Writeback Döngüsü:** Uzman geri bildirimi bir sonraki fikir iterasyonuna otomatik olarak beslenmiyor (Karpathy llm-wiki pattern).

**nokta-hoop**, Nokta fikir kuluçka pipeline'ına bu üç katmanı ekler.

---

## Proposed Changes

### [NEW] Repo Dizin Yapısı

```text
nokta-hoop/
├── README.md                    # Proje tanımı, kurulum, kullanım
├── IDEA.md                      # Ana fikir belgesi (IDEA standardı)
├── AGENT.md                     # LLM ajanları için kurallar
├── DESIGN.md                    # Tasarım sistemi (doctor'dan miras)
├── CHANGELOG.md                 # Proje değişiklik günlüğü
│
├── docs/
│   ├── architecture.md          # Üç katmanlı mimari açıklaması
│   ├── hoop-protocol.md         # HITL/HOTL/HOOTL MCP protokol detayı
│   ├── karpathy-patterns.md     # Autoresearch + llm-wiki adaptasyonu
│   └── video-integration.md     # Stream Video + Avatar bridge entegrasyonu
│
├── packages/
│   ├── hoop-core/               # MCP orkestratör çekirdeği
│   │   ├── package.json
│   │   ├── bin/cli.js           # nokta-hoop CLI entry
│   │   ├── src/
│   │   │   ├── policy/          # Risk kuralları, kontratlar
│   │   │   ├── runtime/         # MCP server, SSE, timeout yönetimi
│   │   │   ├── adapters/        # Slack, WhatsApp, Email adapter'ları
│   │   │   └── writeback/       # Uzman cevabı → wiki/RAG kalıcılaşma
│   │   └── tests/
│   │
│   ├── hoop-call/               # Gerçek zamanlı görüşme katmanı
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── stream/          # Stream Video entegrasyonu
│   │   │   ├── avatar/          # Tavus AI avatar bridge
│   │   │   └── session/         # Görüşme oturumu yönetimi
│   │   └── tests/
│   │
│   └── hoop-wiki/               # Karpathy llm-wiki bilgi birikimi
│       ├── package.json
│       ├── src/
│       │   ├── ingest/          # Uzman cevabı → markdown wiki
│       │   ├── reconcile/       # Çakışma çözümü, dedup
│       │   └── query/           # Yapılandırılmış wiki sorgulama
│       └── tests/
│
├── services/
│   ├── token-server/            # Stream Video token backend
│   └── hoop-proxy/              # MCP proxy (SSE endpoint)
│
├── apps/
│   └── mobile/                  # (Gelecek) Expo RN mobil uygulama
│
├── fixtures/                    # Test verileri
│   ├── escalations/
│   ├── policies/
│   └── wiki-snapshots/
│
└── .github/
    └── workflows/
        ├── ci.yml               # Lint + test + typecheck
        └── hoop-eval.yml        # Autoresearch ratchet evaluation
```

---

### [NEW] IDEA.md — Ana Fikir Belgesi İçeriği

IDEA.md aşağıdaki bölümleri içerecek:

1. **Tez:** Fikir kuluçka sürecinde insan-ajan yönetişimi neden kritik
2. **Problem:** Asenkron PR-only akışın sınırları, uzman feedback darboğazı
3. **Nasıl Çalışır:**
   - Temel İçgörü 1: Üç döngü modu (HITL / HOTL / HOOTL)
   - Temel İçgörü 2: MCP tabanlı adapter-agnostic eskalasyon
   - Temel İçgörü 3: Video/avatar destekli senkron danışmanlık
   - Temel İçgörü 4: Writeback → llm-wiki kalıcılaşma (Karpathy pattern)
   - Temel İçgörü 5: Autoresearch ratchet (fikir kalitesinin ölçülebilir iyileşmesi)
4. **Ne Yapmaz:** Tanı koymaz, tedavi önermez (context-doctor güvenlik kuralları)
5. **Neden Şimdi:** Mevcut nokta + hoop + doctor altyapılarının sentez olgunluğu
6. **Mimari:** Üç paket (hoop-core, hoop-call, hoop-wiki) + servisler
7. **CLI Reference:** Komut tablosu, senaryolar, exit code'lar
8. **Açık Sorular**

---

### [NEW] README.md — Giriş Belgesi

```markdown
# nokta-hoop

> Nokta fikir kuluçkasına HITL/HOTL/HOOTL yönetişim, gerçek zamanlı
> video/avatar danışmanlık ve Karpathy llm-wiki bilgi birikimi ekleyen
> otonom orkestrasyon katmanı.

Nokta düşünür. Hoop yönetir. Birlikte üretirler.
```

---

## Karpathy Pattern Adaptasyonu

### AutoResearch Adaptasyonu
```text
Program.md = IDEA.md (fikir spesifikasyonu)
train.py   = fikir artifact'ı (idea.md → spec → prototype)
Eval metric = hoop-eval score (slop score, uzman approval rate, writeback hit rate)
Ratchet    = Git commit üzerinden; iyileşen skor → keep, kötüleşen → revert
```

### LLM-Wiki Adaptasyonu
```text
Raw sources    = uzman görüşmeleri, Slack yanıtları, WhatsApp cevapları
Wiki entities  = fikir kartları, domain bilgisi, karar logları
Writeback      = Her uzman eskalasyonu → wiki entity güncelleme
Compounding    = Aynı soru ikinci kez gelmez; wiki'den yanıtlanır
```

---

## User Review Required

> [!IMPORTANT]
> **Repo konumu:** `nokta-hoop` reposunu nerede oluşturacağız?
> - Seçenek A: `/home/seyyah/works/xtatistix/dev/nokta-hoop` (bağımsız repo, `seyyah/nokta-hoop` olarak GitHub'da)
> - Seçenek B: `context-med/packages/nokta-hoop` (monorepo içinde paket olarak)
>
> Nokta'nın kendisi bağımsız bir repo olduğu için **Seçenek A önerilir**.

> [!WARNING]
> **Draft Kapsamı:** Bu plan bir "draft repo" oluşturmayı hedefler — yani çalışan kod değil, **IDEA.md + dizin iskeleti + boilerplate**. Çalışan implementasyon ayrı bir faz olacaktır.

---

## Open Questions

1. **GitHub org:** `seyyah/nokta-hoop` mi yoksa `xtatistix/nokta-hoop` mi olacak?
2. **Mobile dahil mi?** `apps/mobile/` klasörünü draft'a dahil edecek miyiz yoksa ileride mi ekleyeceğiz?
3. **context-doctor kodu kopyalanacak mı?** Stream Video + avatar-bridge kodlarını doğrudan fork mu edeceğiz, yoksa sadece IDEA.md'de referans mı vereceğiz?
4. **istabot-nokta ilişkisi:** `istabot-nokta` MRLC pipeline'ı ile `nokta-hoop` arasında entegrasyon planlanıyor mu, yoksa bunlar bağımsız mı kalacak?
5. **Monorepo tooling:** Packages arası bağımlılık yönetimi için npm workspaces mı kullanacağız?

---

## Execution Plan (Draft Only)

### Adım 1: Repo skeleton oluştur
- Git init + remote ekle
- Dizin yapısını oluştur (boş klasörler + .gitkeep)
- Root `package.json` (workspaces config)

### Adım 2: IDEA.md yaz
- Nokta + context-hoop + context-doctor sentezi
- Karpathy pattern adaptasyonu
- CLI reference tablosu
- Açık sorular

### Adım 3: Destekleyici dokümanlar
- README.md, AGENT.md, DESIGN.md (context-doctor'dan adapte)
- `docs/` altındaki mimari dokümanlar

### Adım 4: CI boilerplate
- `.github/workflows/ci.yml` (lint, test, typecheck)
- `.github/workflows/hoop-eval.yml` (autoresearch ratchet stub)

### Adım 5: Package skeletonları
- `hoop-core/package.json` + CLI stub
- `hoop-call/package.json` + placeholder
- `hoop-wiki/package.json` + placeholder
- Temel smoke test'ler

---

## Verification Plan

### Automated Tests
```bash
# Repo yapısı doğrulama
ls -la nokta-hoop/
cat nokta-hoop/IDEA.md
cat nokta-hoop/package.json

# Package skeleton'ların geçerliliği
cd nokta-hoop && npm install
npm run test  # smoke tests geçmeli
```

### Manual Verification
- IDEA.md'nin Nokta + Hoop + Doctor sentezini doğru yansıtıp yansıtmadığı
- Karpathy pattern referanslarının tutarlılığı
- CLI reference'ın context-hoop standardına uyumu
