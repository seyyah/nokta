# Nokta Audit-Forge Mission — Müşterinin Geliştirici Olduğu Hafta

**Misyon süresi:** 1 hafta
**Teslim:** Pull Request, bu repoya
**Tavan puan:** 110 (oto-skor) + 10 Çılgınlık (manuel, demo günü) + 5 Sadelik bonus + 5 Otonomi bonus

> Önceki sefer ([`challenge.md`](challenge.md)) "fikri yaz, bir dilimini kodla"ydı. Bu sefer farklı: **müşterinin geliştirici olduğu** kapalı döngüyü kendi elinle kurup, **agent'ın ne kadarını otonom kapatabildiğini** ölç.

---

## Nedir?

İki repo, iki rol, bir kapalı döngü:

- **[seyyah/nokta-audit](https://github.com/seyyah/nokta-audit)** — drop-in React Native widget; FAB'a dokun, ekranı yakala, sarı kutuyla işaretle, not düş, Markdown rapor üret. Backend yok.
- **[seyyah/nokta](https://github.com/seyyah/nokta)** — host uygulama (bu repo). Audit widget'ı buraya gömeceksin ve forge döngüsünü buradan koşturacaksın.

Mission çekirdeği şu döngüyü kurmak: **müşteri (sen veya bir tester) bir UX aksaklığı görür → nokta-audit ile yakalar → ürettiği `.md` raporu coding agent'a (Claude Code / Codex / OpenCode) input verirsin → agent autoresearch ratchet loop (`READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT`) ile fix veya feature ekler → sen sadece review ve merge edersin.**

Detay arka plan için: [nokta-audit/IDEA.md](https://github.com/seyyah/nokta-audit/blob/main/IDEA.md) ve [nokta-audit/nokta-forge.md](https://github.com/seyyah/nokta-audit/blob/main/nokta-forge.md).

---

## İki Faz

### Phase A — Audit entegrasyonu

1. `submissions/<öğrenci-no>-<slug>/app/` altına minimal bir Expo + TypeScript projesi aç (3-5 ekranlı küçük bir nokta klonu yeter; idea/spec listesi + detay + onboarding gibi).
2. `@xtatistix/mobile-audit` paketini kur (veya nokta-audit deposunu submodule olarak getir).
3. Kök bileşene tek satır mount: `<AuditWidget deps={...} currentScreen={...} />`.
4. `deps` üzerinden enjeksiyon: `captureScreen`, `captureRef`, `writeFile`, `writeFileBinary`, `shareFile`, `storage`. Hiçbir native paketi widget içine `import` ETTİRME — host application boundary kuralı.
5. `currentScreen` prop'unu Expo Router aktif route'undan dinamik besle.
6. **En az 3 farklı ekranda** widget'ı tetikleyip burn-in'li ekran görüntüsü + not + `.md` rapor üret. Bu raporlar `submissions/<id>-<slug>/audit-reports/` altına git'lensin.

### Phase B — Forge cycle ledger

1. Phase A'da ürettiğin `audit-reports/*.md` dosyalarını sırayla coding agent'a (Claude Code, Codex, OpenCode, Antigravity — istediğin) input ver.
2. Her rapor için bir **forge cycle** koştur: `READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT/ROLLBACK`.
3. Her cycle **15 dakika** ile kutulu. 15dk'da bitmediyse mevcut durumu `FORGE.md`'ye yaz, sonraki cycle'a bırak.
4. **En az 3 başarılı cycle** (commit atan) ve **en az 1 ROLLBACK** loglamış olmalısın. Başarısız hipotez değerli veridir — onu silme, logla.
5. `FORGE.md` ledger şu kolonları içersin: cycle numarası, rapor adı, hipotez, sonuç (success/rollback), değişen dosyalar, test sonucu, commit hash, kg (ağırlık), human touch points.
6. Commit mesaj formatı: `[FORGE: EkranAdı] Açıklama — Xkg`.

---

## Üç Track — birini seç ve README'ye yaz

**Track A — Sadelik (drop-in primitive disiplini)**
En az ek koda en geniş etkiyi sığdır. Widget host app'in geri kalanına sızmasın; kaldırdığında app çalışmaya devam etsin (`grep -r 'AuditWidget' app/` tek bir mount satırı dönmeli). Audit raporları küçük ve tek-kutulu olsun. Forge cycle'ları minimum diff: tek dosya, tek değişiklik, tek test.

**Track B — Yaratıcılık (müşteri-geliştirici use case'i)**
Audit raporu sıradan bir stil bug'ı değil, **bir feature request** olsun. Müşteri "burada X olsa güzel olurdu" yazsın, forge cycle yeni bir davranış doğursun. `IDEA.md` ekle: "bu kompozisyonda fark ettiğim, müşterinin geliştirici olduğu yeni use case" — 1-2 paragraf, somut. Bonus: tour-agent veya başka bir agent ile kompozisyon (audit + X).

**Track C — Otonomi (ratchet disiplini)**
En az insan müdahalesiyle en çok cycle. README'de "human touch points" sayacı net olsun: hangi anda agent durdurulup yönlendirildi, niye. `FORGE.md`'de monoton artan kg (ratchet). Bonus: kendi `EVAL.md`'ni büyüt — her başarılı cycle yeni bir altın senaryo ekler; gelecek cycle'lar onu bozamaz.

> Track seçimi `submissions/<id>-<slug>/README.md`'de **ilk satırda** açık olsun (`Track: A` / `Track: B` / `Track: C`). Score.py bunu okuyup puanlar.

---

## Teslim formatı

`submissions/<öğrenci-no>-<slug>/` klasörü aç. Örnek: `submissions/20210123-kuantum-seyyah/`.

Zorunlu içerik:

| Dosya / klasör | İçerik |
|---|---|
| `README.md` | Track seçimi (ilk satır), Expo QR / link, ≤60 sn demo video linki, decision log, **human touch points sayısı**, kullanılan AI tool log'u |
| `IDEA.md` | (Track B zorunlu, diğerleri opsiyonel) Keşfettiğin "müşteri-geliştirici" use case'i, 1-2 paragraf |
| `app/` | Expo + TypeScript proje (audit widget entegre edilmiş) |
| `audit-reports/` | En az 3 `.md` audit raporu — burn-in'li ekran görüntüsü gömülü |
| `FORGE.md` | Cycle ledger: ≥3 success + ≥1 rollback, hipotez/sonuç/kg/commit hash kolonlarıyla |
| `app-release.apk` | APK (zorunlu, yoksa -5; +3 bonus) |

**Ana dizine (root) dokunma.** Sadece kendi klasörüne commit et. `validate-pr.yml` ihlal eden PR'ı reject eder.

---

## Rubric

**Oto-skor (110 — `.github/scripts/score.py` üretir):**

| Eksen | Puan | Nasıl ölçülür |
|---|---|---|
| Çalışır Teslim | 35 | README + Expo link + demo video + APK + `app.json` |
| Scope Disiplini | 25 | Track seçimi net, README'de decision log, ≥500 karakter README |
| Anti-Slop Orijinallik | 20 | Diğer submission'larla TF-IDF cosine < 0.80 |
| Engineering Trace | 20 | ≥5 anlamlı commit, decision log var |
| APK | ±3 / −5 | Varsa +3, yoksa −5 |

**Manuel bonuslar (demo günü, jüri):**

- **+10 Çılgınlık** — yarışma tezine hizmet eden, beklenmedik çalışır capability
- **+5 Sadelik** — Track A için: gerçekten drop-in primitive disiplini korunmuş; ek kod minimal; widget kaldırılabilir
- **+5 Otonomi** — Track C için: human touch points sayısı düşük + FORGE.md ratchet kanıtı somut

**Ceza:**
- Similarity ≥ 0.80 → kopyacı submission'a anti-slop ekseninde **−%35**. Orijinal: ilk commit erken olan. İtiraz yok.
- APK yok → **−5**
- Root dosyalara dokunma → PR reject
- `FORGE.md` yok / cycle yok → Engineering Trace **0**
- 3'ten az audit raporu → Çalışır Teslim ekseninde **−10**

---

## Değerlendirme soruları (jüri bunlara bakar)

1. Audit widget kaldırıldığında app çalışıyor mu? (Drop-in tersinden testi.)
2. `FORGE.md`'de **başarısız hipotezler** loglanmış mı? (Sadece success loglamak ratchet'i çürütür.)
3. Audit raporundaki burn-in'li ekran görüntüsü gerçekten visual ground truth taşıyor mu, yoksa boş kutular mı?
4. Forge cycle commit'leri minimal mi (tek sorun, tek fix), yoksa "fırsattan istifade" refactor mu yapılmış?
5. Track B seçildiyse `IDEA.md`'deki use case **sade** ve **yaratıcı** mı, yoksa bilinen bir patern mi?
6. Track C seçildiyse human touch points sayacı README'de **doğru** mu (commit history ile çelişmemeli)?
7. Cycle'lar arasında öğrenme var mı? Agent ikinci cycle'da birinci cycle'ın başarısız hipotezini tekrar denemiyor mu?

---

## Kurallar

- **Bireysel.** Ekip yok.
- **AI tool serbest.** Claude Code CLI, Codex, OpenCode, Cursor, Copilot — hepsi. README'de hangisini hangi cycle'da kullandığını logla.
- **Rate limit vurursan** backup tool'a geç, README'de belirt. Cycle yarıda kalırsa partial writeback yap.
- **Çatışma çözümü:** mevcut bir submission ile similarity ≥ 0.80 çıkarsan ilk commit zamanı erken olan orijinaldir; geç olan kopyacı sayılır.
- **Çılgınlık bonusu** demo gününde manuel — repodaki dosyalara yansımaz.
- **Audit raporlarındaki ekran görüntüleri** kendi mock data'nla olmalı; gerçek kullanıcı verisi (isim, telefon, e-posta) içermesin.

---

## Teslim öncesi self-check

- [ ] `submissions/<id>-<slug>/README.md` ilk satırında `Track: A/B/C` var
- [ ] `app/` altında çalışır Expo projesi + audit widget mount
- [ ] `audit-reports/` altında ≥3 burn-in'li `.md` rapor
- [ ] `FORGE.md` ledger: ≥3 başarılı + ≥1 rollback cycle
- [ ] `app-release.apk` var (yoksa −5)
- [ ] Decision log + human touch points + AI tool log README'de
- [ ] Root dizine dokunulmamış (sadece `submissions/<id>-<slug>/` altı commit'li)
- [ ] (Track B) `IDEA.md` eklendi
- [ ] (Track C) `EVAL.md` eklendi (opsiyonel ama otonomi bonusunu açar)

PR aç. `validate-pr.yml` gate'i + `score.yml` oto-skor + `LEADERBOARD.md` regen otomatik koşacak. Demo gününde Çılgınlık ve track bonusları elden eklenir.

---

🤖 İki repo, bir döngü: müşteri yakalar, agent onarır, sen review edersin.
