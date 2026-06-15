# Changelog

All notable changes to Nokta will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- **14 merged submissions** under `submissions/`:
  - `201118062-mergen-wolfscatt-audit` by @wolfscatt (PR #300)
  - `211118068-audit-forge` by @mrkarahann (PR #297)
  - `231118040-nokta-final` by @mehmetalisahingm (PR #308)
  - `231118044-slopdetec-audit` by @Yilmazurun (PR #295)
  - `231118046-nokta-spec-builder` by @Ravza-nurr (PR #309)
  - `231118055-mustafaemirkincal` by @memirkincal (PR #311)
  - `231118057-nokta-cleaner-final` by @eraycubukcu (PR #303)
  - `231118060-audit-forge` by @aliordek1 (PR #320)
  - `231118062-spec-agent` by @Utkuuzun14 (PR #302)
  - `231118066-forge-app` by @Alpereneri12 (PR #315)
  - `231118070-audit-forge` by @mrtynk (PR #304)
  - `231118072-idea-tracker` by @zeynepyardimci (PR #325)
  - `241478074-safiyeozkan` by @sayko89 (PR #316)
  - `9191118048-nokta-voice-forge` by @19e9 (PR #313)
- Implementation CI workflow (Path C) — to be completed in Phase 0

---

## [0.3.0-challenge] - 2026-05-21

Second community-driven submission round for **Challenge 2: Audit-Forge Mission** (Tracks A–D). Repo continued the "student challenge" workflow established in 0.2.0; this entry captures the Ch2 grading round, supporting CI/scoring fixes, and the close-out of stale Ch1 carry-over PRs.

### Added
- **29 merged Ch2 submissions** under `submissions/<id>-<slug>/`. Highest auto-score: 88/110 (14 submissions tied — Engineering Trace rubric is stricter for Ch2 so 100/103 ceiling not yet reached). See `LEADERBOARD.md` → "Challenge 2: Audit-Forge Mission".
- **`scoring/scores_ch1.json`** — frozen Ch1 results snapshot. Future scoring runs preserve Ch1 entries verbatim and only re-score Ch2 (`.github/scripts/score.py` reads this file when present).
- **Same-student similarity exemption** in `.github/scripts/similarity_check.py` — submissions sharing the same `\d{6,}-` student-id prefix no longer flag each other as copycats (a student authoring multiple tracks should not penalise themselves).

### Changed
- **`.github/scripts/score.py`** — Ch2-aware scoring: detects Ch2 submissions, enforces `FORGE.md` presence (Engineering Trace → 0 if missing) and `audit-reports/` minimum of 3 `.md` files (−10 from Çalışır Teslim if not met). Ch1 entries continue to use the original rubric, sourced from frozen snapshot.
- **`.github/workflows/score.yml`** — runs on all `submissions/**` pushes with `[skip ci]` tag on the auto-commit to prevent recursive triggering.

### Closed (without merge)
- **40 Ch2 PRs closed** across two maintainer sessions:
  - 22 in first sweep (validate-pr.yml gate failures: folder format, non-`submissions/` files, merge conflicts, exact duplicates of already-merged folders).
  - 6 two-level path / Turkish-character folder names (`submissions/2026-05-05-hoop/<id>-<slug>/`, `submissions/231118042-KevserTavlı/`, etc.).
  - 8 stale-base + same-student duplicate (validate failed on `Check only submissions/ touched` step, or folder duplicated a folder merged earlier in the same round).
  - 4 stale-base after first-time-contributor CI approval surfaced the underlying validate failure.
- Each closed PR received a templated Turkish comment naming the specific failure (stale base, two-level path, folder format, exact duplicate, no submission) and the fix recipe (rebase / rename / fresh-branch instructions).

### Notes
- First-time contributor CI runs (`action_required` state) were approved in batch for the final 15 candidate PRs after triage; 11 then passed validate and were merged, 4 surfaced as stale-base and were closed.
- `scoring/scores.json` total submissions: 100 (71 Ch1 + 29 Ch2). Anti-slop similarity report unchanged from Ch1 round (same 17 copycat pairs ≥ 0.80; no new flags in Ch2 entries).
- Manual "Çılgınlık +10" demo-day bonus still pending application; LEADERBOARD shows auto-score only.

---

## [0.2.0-challenge] - 2026-05-13

Round of community-driven submission grading. Repo briefly pivoted to a
"student challenge" model parallel to the section-ratchet system; this entry
captures that work and the supporting CI fixes.

### Added
- **49 merged student/community submissions** under `submissions/<id>-<slug>/` covering Tracks A–D (capture, slop detection, idea-spec, HITL, expert support, etc.). Highest auto-score: 103/110 (8 submissions tied — see LEADERBOARD.md).
- **`scoring/scores.json` + `scoring/scores.md`** — first auto-generated rubric snapshot covering 68 submissions. Anti-slop (TF-IDF cosine ≥ 0.80) flagged 22 copycat pairs.
- **`scoring/similarity.json`** — per-submission similarity matrix; copycat-detected entries received the configured −35 % anti-slop penalty.
- **LEADERBOARD.md** repurposed for the challenge rubric: Delivery 35 + Scope 25 + Anti-Slop 20 + Trace 20 + APK (±3/−5). Top contributors and per-submission breakdown auto-populated from `scoring/scores.json` + merged-PR author map.

### Changed
- **`.github/workflows/validate-pr.yml`** — submission folder regex widened `^[0-9]{6,}-[a-z0-9-]+$` → `^[0-9]{6,}-[A-Za-z0-9-]+$` to accept CamelCase slugs (`231118018-FitLoop`, `241478088-spec-architect-Abdulkahhar`, `211118085-RavzanurErdogan`). PR #166.
- **`.github/workflows/score.yml`** — added job-level `permissions: contents: write` so `github-actions[bot]` can push the auto-generated `scoring/` directory back to `main`; the bot was failing silently with HTTP 403 prior. PR #167.

### Closed (without merge)
- **26 PRs closed** for failing the validate-pr.yml gate or the artifact requirement (README + Expo/demo-video link):
  - 14 with non-conforming folder names (Turkish chars / spaces / missing student-id prefix)
  - 13 missing a `README.md` in the submission folder
  - 12 touching paths outside `submissions/` (root `.gitignore`, `.DS_Store`, stray `package-lock.json`, etc.)
  - 8 with neither Expo nor demo-video link in README
  - 4 with merge conflicts against main
- **4 superseded PRs** auto-closed when the more comprehensive duplicate from the same author was merged: #84 (← #158), #102 (← #125), #79 (← #118), #75 (← #97). Authors: Yilmazurun, mehmetalisahingm, esramusul, sengka.

### Restored
- **`assets/nokta.jpeg`** — original 1021356-byte logo restored from blob `cafe70e` (commit `add2b99`); had been deleted by student PR `3509b51` on 2026-05-11.
- **Rich documentation set** (`README.md`, `CHANGELOG.md`, `AGENT.md`, `CLAUDE.md`, `LEADERBOARD.md`, `PLAN.md`, `program.md`, `mobile-skeleton.md`, `workflow.md`) brought from `origin/section/09-ratchet-clarity-2` to `main` for the first time. PR #169.

### Notes
- Validate-pr.yml gate held during the merge round — none of the 49 merged PRs touched root files.
- Manual "Çılgınlık +10" demo-day bonus not yet applied; LEADERBOARD shows auto-score only.
- 61 unique contributors recognised in this round.

---

## [0.1.0-dev] - 2025-04-01

### Added
- **program.md** — Complete spec (source of truth) with all 12 sections filled per Karpathy's autoresearch pattern
- **mobile-skeleton.md** — Template structure for spec sections with TODO placeholders
- **README.md** — Public-facing overview explaining 3 contribution paths (A: edit program.md sections, B: add specs/*.md, C: implement code)
- **specs/TEMPLATE.md** — Feature spec template with 5 required sections (IDENTITY, NON-GOALS, DATA CONTRACTS, OBJECTIVE FUNCTION, RATCHET RULE)
- **checklists/** — Spec scoring rubrics:
  - `section_XX.yml` (12 files) — Checklist for each program.md section
  - `spec_generic.yml` — Generic checklist for specs/*.md files
- **scripts/section_score.py** — Python scoring engine supporting:
  - `--section N` — Score a single program.md section
  - `--all` — Score all program.md sections
  - `--spec-file specs/X.md` — Score a feature spec file
  - `--ci-comment` — Generate CI-formatted markdown output
- **.github/workflows/md-ratchet.yml** — CI workflow for Path A (program.md section edits):
  - Triggers on changes to `program.md` (currently aliased to program.md)
  - Scores changed sections against main baseline
  - Auto-merges if score ≥ main, rejects if score < main
  - Posts sticky PR comment with score breakdown
- **.github/workflows/spec-ratchet.yml** — CI workflow for Path B (specs/*.md additions):
  - Triggers on changes to `specs/**/*.md`
  - Scores new/modified spec files against generic rubric
  - First merge establishes baseline, subsequent PRs must match or beat it
  - Auto-merges if eligible
  - Posts sticky PR comment with score breakdown
- **AGENT.md** — Comprehensive AI agent instructions:
  - Distinguishes 3 contribution paths (A/B auto-merge, C human-review)
  - Human-in-loop protocol for implementation PRs
  - Spec-implementation validation checklist
  - Architectural invariants and anti-patterns
  - Git workflow and commit conventions
- **CLAUDE.md** — Quick reference for Claude Code sessions:
  - Tech stack summary
  - Common development commands
  - File structure overview
  - Immutable files list
  - Hard gates and golden flow tests
  - Task-specific workflows
- **PLAN.md** — Phased implementation roadmap:
  - 10 phases from Phase 0 (documentation) to Phase 10 (v1.0.0 release)
  - Current status tracking (Phase 0 at 90% complete)
  - Deliverables and acceptance criteria per phase
  - Version history table
- **CHANGELOG.md** — This file

### Changed
- README.md now clearly separates Path A, Path B, and Path C contribution workflows
- Scoring system now supports both program.md sections and standalone spec files

### Verification
- Tested section scoring: `python scripts/section_score.py --section 1` → 100/100 (IDENTITY section complete)
- Tested spec scoring: `python scripts/section_score.py --spec-file specs/TEMPLATE.md` → Score calculated (fails due to TODO placeholders, as expected)
- Tested md-ratchet CI: Mock PR with program.md changes triggers workflow correctly
- Tested spec-ratchet CI: Mock PR with specs/*.md changes triggers workflow correctly

---

## Version Numbering

- **v0.x.y** — Development versions (pre-stable)
- **v1.0.0** — First stable release (target: Phase 10 complete, all golden flows pass at 100%)

### Development Phase Mapping

| Version | Phase | Status |
|---------|-------|--------|
| v0.1.0-dev | Phase 0: Documentation & Infrastructure | 🟡 In Progress (90%) |
| v0.2.0 | Phase 1: Expo Scaffold & TypeScript Contracts | 🔴 Not Started |
| v0.3.0 | Phase 2: Storage Service & State Management | 🔴 Not Started |
| v0.4.0 | Phase 3: Screen 1 — Idea List | 🔴 Not Started |
| v0.5.0 | Phase 4: LLM Service (Mock Mode) | 🔴 Not Started |
| v0.6.0 | Phase 5: Screen 2 — Idea Chat | 🔴 Not Started |
| v0.7.0 | Phase 6: Screen 3 — Spec Card | 🔴 Not Started |
| v0.8.0 | Phase 7: Golden Flow Tests | 🔴 Not Started |
| v0.9.0 | Phase 8: UI Config System | 🔴 Not Started |
| v1.0.0-rc1 | Phase 9: Bundle Optimization & Polish | 🔴 Not Started |
| v1.0.0 | Phase 10: First Stable Release | 🔴 Not Started |

---

## Notes

- All changes in v0.x.y are **spec contributions** (Path A/B). No implementation code exists yet.
- Implementation (Path C) begins in Phase 1 (v0.2.0).
- See PLAN.md for detailed phase breakdown.
- See program.md for complete product spec (source of truth).
