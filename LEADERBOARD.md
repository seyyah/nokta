# 🏆 Nokta Leaderboard

Otomatik puanlama: `.github/scripts/score.py` rubric ile her submission'a 0–110 arası skor verir. Anti-slop + APK düzeltmesi dahil. "Çılgınlık +10" bonusu demo gününde elden eklenecek.

**Rubric (Challenge 1 - Away Mission):** Delivery 35 + Scope 25 + Anti-Slop 20 + Trace 20 + APK (±3/−5) = 110 max.

**Rubric (Challenge 2 - Audit-Forge):** Aynı temel puanlama geçerlidir. Ancak `FORGE.md` dosyası eksikse Engineering Trace otomatik olarak **0** puanlanır. `audit-reports/` altında en az 3 adet `.md` raporu yoksa Çalışır Teslim puanından **-10** düşülür.

---

## ☄️ Challenge 1: Away Mission

### Top Contributors
| Rank | Contributor | Best Score | Submissions | Best PR |
|---|---|---|---|---|
| — | — | — | — | — |

### All Submissions
| Rank | Submission | Score | Delivery | Scope | Anti-Slop | Trace | APK | Author | PR | Flags |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `2026-05-05-hoop` | **18** | 3/35 | 0/25 | 20/20 | 0/20 | −5 ❌ | — | — |  |

---

## 🛠️ Challenge 2: Audit-Forge Mission

### Top Contributors
| Rank | Contributor | Best Score | Submissions | Best PR |
|---|---|---|---|---|
| — | — | — | — | — |

### All Submissions
| Rank | Submission | Score | Delivery | Scope | Anti-Slop | Trace | APK | Author | PR | Flags |
|---|---|---|---|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — | — | — | — | — |

---

## Anti-Slop (Similarity ≥ 0.80)

TF-IDF cosine similarity; `.github/scripts/similarity_check.py` detayını üretir. Daha geç commit eden "copycat" sayılır ve anti-slop puanı %35 ceza alır.

| Original | Copycat | Similarity |
|---|---|---|
| `231118070-nokta-not-ayirici` | `231118033-dot-capture-enrich` | **0.950** |
| `231118004-dot-capture` | `231118004-human-dot` | **0.912** |
| `231118009-track-a` | `231118070-nokta-not-ayirici` | **0.903** |
| `241478009-nokta-capture` | `231118070-nokta-not-ayirici` | **0.901** |
| `241478009-nokta-capture` | `231118009-track-a` | **0.901** |
| `231118009-track-a` | `231118033-dot-capture-enrich` | **0.897** |
| `241478009-nokta-capture` | `231118033-dot-capture-enrich` | **0.889** |
| `231118027-pitch-validator` | `231118052-spec-gen` | **0.887** |
| `9221118085-notepoint` | `231118070-nokta-not-ayirici` | **0.867** |
| `9221118085-notepoint` | `231118033-dot-capture-enrich` | **0.857** |
| `241478013-nokta-engineer-ai` | `231118052-spec-gen` | **0.854** |
| `231118009-track-a` | `9221118085-notepoint` | **0.840** |
| `231118036-ali-nursin-karacan` | `231118052-spec-gen` | **0.835** |
| `241478009-nokta-capture` | `9221118085-notepoint` | **0.835** |
| `231118036-ali-nursin-karacan` | `241478013-nokta-engineer-ai` | **0.828** |
| `231118027-pitch-validator` | `241478013-nokta-engineer-ai` | **0.824** |
| `231118033-dot-capture-enrich` | `231118052-spec-gen` | **0.816** |
| `231118070-nokta-not-ayirici` | `231118052-spec-gen` | **0.811** |
| `231118033-nokta-mascot-human-support` | `231118045-patiler` | **0.810** |
| `231118009-track-a` | `231118052-spec-gen` | **0.808** |
| `241478009-nokta-capture` | `231118052-spec-gen` | **0.806** |
| `231118036-ali-nursin-karacan` | `231118027-pitch-validator` | **0.802** |

---

**Last Updated:** 2026-05-20 19:52 UTC

**Total Contributors:** 0

**Total Submissions (Challenge 1):** 1

**Total Submissions (Challenge 2):** 0

**Similarity flags:** 22


🤖 Otomatik üretildi — kaynak: `scoring/scores.json` + `gh pr list --state merged`. Manuel "Çılgınlık +10" bonusu eklenmedi.
