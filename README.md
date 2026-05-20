# Nokta — Community-Driven program.md

![NOKTA](assets/nokta.jpeg)

> 1 file, 0 human review. CI decides.

## What?

`program.md` is the Karpathy-style spec file for the Nokta mobile app. This file serves as a complete specification from which AI agents (Claude Code / Codex) can build the application from scratch.

**Humans write the spec, machines write the code.**

## How It Works?

There are three contribution paths:

### Path A — Develop a section of `program.md` (SPEC EDITING)

Edit existing sections in `program.md` to improve specification quality.

```
Pick a section (see Section List below)
    ↓
Open a branch: section/04-data-contracts
    ↓
Edit the relevant section in program.md
    ↓
Open a PR to main
    ↓
CI scores automatically (0-100)
    ↓
Score ≥ current score on main → ✅ Auto-merge
Score < current score on main → ❌ Auto-reject
    ↓
Fix, push, try again
```

**🤖 Fully automated. No human review. The metric decides. Score never drops.**

**Branch naming:** `section/<number>-<description>` (e.g., `section/04-data-contracts`)

### Path B — Propose a new feature spec (SPEC CREATION)

Create new feature specifications as standalone documents.

```
Copy specs/TEMPLATE.md → specs/your-feature.md
    ↓
Open a branch: spec/your-feature
    ↓
Fill in all 5 sections, delete all > TODO lines
    ↓
Open a PR to main
    ↓
CI scores against spec_generic.yml (0-100)
    ↓
First PR for this file → ✅ Establishes baseline (score ≥ 0)
Subsequent PRs → must match or beat the baseline
    ↓
Fix, push, try again
```

**🤖 Fully automated. No human review. First merge sets the bar. Score never drops.**

**Branch naming:** `spec/<feature-name>` (e.g., `spec/user-profile`)

### Path C — Implement code from specs (IMPLEMENTATION)

Write actual code (TypeScript, React Native) based on approved specs.

```
Read program.md or specs/*.md (approved spec)
    ↓
Open a branch: implement/feature-name
    ↓
Write code that implements the spec exactly
    ↓
Run hard gates locally:
  • npx tsc --noEmit (TypeScript)
  • npx eslint . --ext .ts,.tsx (ESLint)
  • npm test (Jest tests)
  • npx expo export --dump-sourcemap (Bundle size < 2MB)
    ↓
Open a PR to submissions branch
    ↓
CI runs evaluation workflow:
  • Validates hard gates
  • Runs golden flow tests (if available)
  • Scores quality/effort
  • Posts scorecard to PR
  • Updates LEADERBOARD.md
    ↓
All gates pass → ✅ Eligible for human review
Any gate fails → ❌ Fix and push again
    ↓
👤 HUMAN REVIEW REQUIRED (even if CI passes)
  • Maintainer reviews code quality
  • Security check (no API keys, XSS, injection)
  • Architecture compliance
  • Spec compliance
    ↓
Approved → 🎉 Merged to main
```

**👤 Human approval required. CI validates, but human reviews for security, architecture, and design patterns.**

**Branch naming:** `implement/<feature-name>`, `fix/<bug>`, `test/<test-name>`

**Evidence required:** Screenshots, screen recording, or Expo Go QR code/APK

---

### Summary: Which Path Should I Use?

| Path | What | Automated? | Branch | Merge Target |
|------|------|------------|--------|--------------|
| **A** | Edit `program.md` sections | ✅ Auto-merge | `section/NN-name` | `main` |
| **B** | Add `specs/*.md` feature specs | ✅ Auto-merge | `spec/feature-name` | `main` |
| **C** | Implement code from specs | 👤 Human approval | `implement/feature-name` | `submissions` → `main` |

**Path A/B = Spec work → Auto-merge**
**Path C = Implementation → Human review required**

## Quick Start

```bash
# 1. Fork or clone the repo
git clone https://github.com/seyyah/nokta.git
cd nokta

# 2. Create a branch (choose your section number)
git checkout -b section/04-data-contracts

# 3. Open program.md, find your section, write it
# Each section has <!-- COMMENT --> instructions inside

# 4. Check your score (optional, local test)
pip install pyyaml
python scripts/section_score.py --section 4

# 5. Commit + push
git add program.md
git commit -m "feat(section-04): add data contracts"
git push origin section/04-data-contracts

# 6. Open a PR on GitHub → CI runs automatically → wait for result
```

## Section List

| # | Section | Contents |
|---|---------|----------|
| 0 | IMMUTABLE INFRA | List of files that must not be modified |
| 1 | IDENTITY | ✅ Already complete — use as reference |
| 2 | SETUP PROTOCOL | Setup steps from zero to running app |
| 3 | NON-GOALS | What will not be built in v0.1 |
| 4 | DATA CONTRACTS | TypeScript interfaces and storage schema |
| 5 | SCREEN & FEATURE SPEC | 3 screens, UX flow, component list |
| 6 | UI CONFIG | Local JSON-driven UI config system |
| 7 | LLM CONTRACT | Mock LLM, prompt template, golden transcripts |
| 8 | OBJECTIVE FUNCTION | Hard gates + single scalar metric |
| 9 | THE RATCHET LOOP | PR → CI → measure → keep/revert cycle |
| 10 | CONTRIBUTION PROTOCOL | Branch, commit, PR rules |
| 11 | ARCHITECTURAL INVARIANTS | Code structure rules |
| 12 | TESTING PHILOSOPHY | Test standards and anti-patterns |

## Scoring

Each section has a checklist (`checklists/section_XX.yml`). CI reads this checklist and evaluates the section:

- **Structural checks:** Are required headings present? Is the minimum word count met?
- **Content checks:** Are specific concepts/patterns present? (e.g. TypeScript code block, JSON schema)
- **Each check carries a weight.** Scored out of 100 points.

**Scoring rule:** Your score cannot drop below the current score on the main branch. Equal or higher means you merge.

### Test Locally

```bash
# Single section (Path A)
python scripts/section_score.py --section 4

# All sections (Path A)
python scripts/section_score.py --all

# CI-formatted output (Path A)
python scripts/section_score.py --all --ci-comment

# Score a spec file (Path B)
python scripts/section_score.py --spec-file specs/your-feature.md
```

## Spec Contributions (Path B)

Use Path B to propose a new Nokta mobile app feature as a standalone spec.

```bash
# 1. Copy the template
cp specs/TEMPLATE.md specs/your-feature-name.md

# 2. Create a branch
git checkout -b spec/your-feature-name

# 3. Fill in all 5 sections, then delete every > TODO line

# 4. Check your score locally
python scripts/section_score.py --spec-file specs/your-feature-name.md

# 5. Commit + push
git add specs/your-feature-name.md
git commit -m "spec(your-feature): describe feature"
git push origin spec/your-feature-name

# 6. Open a PR → spec-ratchet CI runs automatically
```

### Spec Checklist (`checklists/spec_generic.yml`)

| Check | Weight | Description |
|-------|--------|-------------|
| `identity_section` | 20pt | `## 1. IDENTITY` section present |
| `non_goals_min` | 15pt | At least 5 non-goal items listed |
| `non_goals_section` | 5pt | `## 2. NON-GOALS` section present |
| `data_contracts_section` | 15pt | `## 3. DATA CONTRACTS` section present |
| `typescript_blocks` | 10pt | TypeScript code block in DATA CONTRACTS |
| `objective_function_section` | 15pt | `## 4. OBJECTIVE FUNCTION` section present |
| `scalar_metric` | 10pt | Scalar metric or formula defined |
| `ratchet_rule_section` | 5pt | `## 5. RATCHET RULE` section present |
| `no_todos_remaining` | 5pt | No `> TODO:` placeholders left |

**Ratchet rule:** First PR for a new spec file — passes with any score > 0. Subsequent PRs for the same spec file — must match or beat the score on main.

## Rules

1. **Only edit `program.md` (Path A) or add a new `specs/*.md` file (Path B).** Do not edit checklist YAMLs, CI workflows, or scripts — these are IMMUTABLE INFRA.
2. **Section 1 (IDENTITY) is already complete.** Use it as a reference and follow its format.
3. **Multiple people can write the same section.** The highest score gets merged.
4. **Delete TODO placeholders.** As long as `> TODO:` lines remain, the section score stays low.
5. **AI tools are welcome** — vibe-writing is fine. But you still need to pass the checklist.
6. **English or Turkish** — both are supported by the checklist.

## FAQ

**Q: What if someone else is writing the same section?**
First to merge wins. The next PR must beat that score. Ratchet.

**Q: My PR was rejected — what should I do?**
Read the CI comment — it will show which checklist items failed. Fix them, push, and CI runs again.

**Q: Section 1 is already complete — can I improve it?**
Yes — but you need to beat its current score (100/100). Delete content and the score drops; you'll be rejected.

**Q: Can I contribute to multiple sections?**
Yes — each in its own branch + its own PR.
