# workflow.md — Nokta Contribution Workflow

**This document defines the contribution workflow for Nokta. Read this before contributing.**

All GitHub workflows (`.github/workflows/*.yml`) are generated based on this specification.

---

## Philosophy: Spec-First, Test-Validated, Autonomous Merge

Nokta follows Karpathy's autoresearch pattern:
- **Humans write specs** → Define WHAT needs to be built
- **Machines write code** → Implement specs exactly
- **CI validates** → Objective, measurable metrics
- **Autonomous merge** → No human bottleneck unless necessary

**Key principle:** If a contribution can be objectively validated through spec compliance and test coverage, it should merge autonomously. Human review is the exception, not the rule.

---

## Three Contribution Paths

| Path | What | Input | Output | Validation | Merge |
|------|------|-------|--------|------------|-------|
| **A** | Edit `program.md` sections | Section text | Score (0-100) | Checklist (YAML) | Auto if ≥ main |
| **B** | Create `specs/*.md` files | Spec file | Score (0-100) | Checklist (YAML) | Auto if ≥ baseline |
| **C** | Implement code | TypeScript/React Native | Score (0-100) + Tests | Hard gates + Golden flows | Auto if all pass |

---

## Path A: Section Editing (program.md)

### Workflow

```
1. Pick a section from program.md (see § 0-12)
2. Create branch: section/<number>-<description>
   Example: section/04-data-contracts
3. Edit the section in program.md
4. Commit and push
5. Open PR to main branch
6. CI runs: scripts/section_score.py --section <N>
7. Score calculated (0-100) based on checklists/section_<NN>.yml
8. Decision:
   - Score ≥ current score on main → ✅ AUTO-MERGE
   - Score < current score on main → ❌ AUTO-REJECT
9. If rejected: Fix issues, push to same branch, CI re-runs
```

### Scoring

- Each section has a checklist: `checklists/section_<NN>.yml`
- Checks include:
  - Structural: Required headings present
  - Content: Minimum word count, code blocks, concepts
  - Quality: No TODO placeholders
- Each check has a weight (points)
- Total score: 0-100

### Auto-merge Criteria

- `score(PR) ≥ score(main)` → **AUTO-MERGE**
- No human review required
- Score never drops (ratchet rule)

### Branch Naming

- `section/<number>-<description>`
- Example: `section/04-data-contracts`, `section/11-architectural-invariants`

### Related Files

- Workflow: `.github/workflows/md-ratchet.yml`
- Scoring: `scripts/section_score.py --section <N>`
- Checklists: `checklists/section_<NN>.yml`

---

## Path B: Spec Creation (specs/*.md)

### Workflow

```
1. Copy specs/TEMPLATE.md → specs/<feature-name>.md
2. Create branch: spec/<feature-name>
   Example: spec/user-profile
3. Fill all 5 sections:
   § 1 IDENTITY
   § 2 NON-GOALS
   § 3 DATA CONTRACTS (TypeScript interfaces)
   § 4 OBJECTIVE FUNCTION (measurable metric)
   § 5 RATCHET RULE (merge condition)
4. Delete all > TODO: placeholders
5. Commit and push
6. Open PR to main branch
7. CI runs: scripts/section_score.py --spec-file specs/<feature-name>.md
8. Score calculated (0-100) based on checklists/spec_generic.yml
9. Decision:
   - First PR for this file + score > 0 → ✅ AUTO-MERGE (establishes baseline)
   - Subsequent PRs: score ≥ baseline → ✅ AUTO-MERGE
   - Score < baseline → ❌ AUTO-REJECT
10. If rejected: Fix issues, push to same branch, CI re-runs
```

### Scoring

- Checklist: `checklists/spec_generic.yml`
- Checks include:
  - All 5 sections present
  - TypeScript code blocks in DATA CONTRACTS
  - Scalar metric defined in OBJECTIVE FUNCTION
  - No TODO placeholders remaining
- Total score: 0-100

### Auto-merge Criteria

- **First PR for new spec file:** `score > 0` → **AUTO-MERGE**
- **Subsequent PRs:** `score ≥ baseline` → **AUTO-MERGE**
- No human review required

### Branch Naming

- `spec/<feature-name>`
- Example: `spec/user-profile`, `spec/offline-sync`

### Related Files

- Workflow: `.github/workflows/spec-ratchet.yml`
- Scoring: `scripts/section_score.py --spec-file <path>`
- Checklist: `checklists/spec_generic.yml`

---

## Path C: Implementation (Code)

### Workflow

```
1. Read an approved spec:
   - program.md (sections already scored ≥ baseline)
   - specs/*.md (files already merged to main)

2. Create branch: implement/<feature-name>
   Example: implement/idea-list-screen

3. Write code that implements the spec EXACTLY:
   - Follow TypeScript interfaces from spec
   - Implement all acceptance criteria
   - Write tests that validate acceptance criteria
   - Follow architectural invariants (program.md § 11)

4. Run hard gates locally:
   npx tsc --noEmit           # TypeScript
   npx eslint . --ext .ts,.tsx    # ESLint
   npm test                   # Jest tests
   npx expo export --dump-sourcemap  # Bundle size

5. Commit and push

6. Open PR to submissions branch (NOT main)

7. CI runs: .github/workflows/evaluation.yml
   Validates:
   - Hard Gate 1: TypeScript (20pt)
   - Hard Gate 2: ESLint (20pt)
   - Hard Gate 3: Tests (20pt)
   - Hard Gate 4: Bundle size < 2MB (20pt)
   - Hard Gate 5: No unauthorized deps (10pt)
   - Golden Flows: Integration tests (10pt)

   Total: 100 points

8. CI posts scorecard to PR

9. CI updates LEADERBOARD.md

10. Decision (AUTO-MERGE CRITERIA):

    ✅ AUTO-MERGE if ALL conditions met:
    - All hard gates PASS (no ❌)
    - Golden flow pass rate ≥ main branch rate
    - No immutable files modified (program.md § 0)
    - Spec compliance validated via tests

    ⏸️  HUMAN REVIEW if ANY condition true:
    - Hard gate FAIL (contributor must fix first)
    - Spec ambiguity detected (test coverage gaps)
    - Security flags (API keys, credentials, XSS patterns)
    - Architecture violations (non-standard patterns)
    - New dependencies added (requires approval)

11. If auto-merged:
    - PR merged to submissions → main
    - Score recorded on leaderboard
    - CHANGELOG.md entry auto-generated

12. If human review required:
    - Maintainer reviews code
    - Maintainer assigns score (0-100):
      - Hard gates: 70pt (objective)
      - Code quality: 15pt (subjective)
      - Spec fidelity: 15pt (subjective)
    - Maintainer merges or requests changes
    - Final score recorded on leaderboard
```

### Scoring System

**Objective Metrics (70pt):**
- TypeScript (20pt) — Zero compilation errors
- ESLint (20pt) — Zero linting errors
- Tests (20pt) — All tests passing
- Bundle Size (10pt) — JS bundle < 2MB
- Golden Flows (10pt) — Integration tests passing

**Subjective Metrics (30pt) — Only if human review required:**
- Code Quality (15pt) — Readability, maintainability, patterns
- Spec Fidelity (15pt) — How precisely spec was implemented

### Auto-merge Criteria (PREFERRED PATH)

**Autonomous merge happens when:**

1. **All hard gates PASS**
   - `npx tsc --noEmit` → 0 errors ✅
   - `npx eslint . --ext .ts,.tsx` → 0 errors ✅
   - `npm test` → All tests pass ✅
   - Bundle size < 2MB ✅
   - No unauthorized deps ✅

2. **Golden flow tests PASS**
   - If golden flow tests exist: `pass_rate(PR) ≥ pass_rate(main)`
   - If golden flow tests don't exist yet: Skip (not blocking)

3. **Spec compliance validated**
   - All acceptance criteria from spec have corresponding tests
   - Tests are valid (not `expect(true).toBe(true)`)
   - Tests validate user behavior, not implementation details

4. **No security flags**
   - No API keys or credentials in code
   - No XSS/injection vulnerabilities detected
   - No file system manipulation outside AsyncStorage

5. **No immutable files modified**
   - `.github/workflows/` untouched
   - `scripts/*.py` untouched
   - `checklists/*.yml` untouched
   - `app.json`, `tsconfig.json`, `babel.config.js`, `.eslintrc.js` untouched

6. **Architecture compliance**
   - Zustand for state (not Context API, not Redux)
   - Service layer properly used
   - No direct AsyncStorage from components
   - File naming conventions followed

**If ALL above conditions met → 🤖 AUTO-MERGE**

### Human Review Cases (EXCEPTION, NOT RULE)

**Human review required only when:**

1. **Spec ambiguity**
   - Spec doesn't define expected behavior clearly
   - Multiple valid interpretations possible
   - Test coverage gaps indicate spec uncertainty

2. **Security concerns**
   - Potential XSS, SQL injection, command injection
   - File system access outside approved patterns
   - Dependency with known vulnerabilities

3. **Architecture violations**
   - Non-standard patterns not defined in spec
   - Performance implications not covered by tests
   - Breaking changes to public APIs

4. **New dependencies**
   - Any modification to `package.json` dependencies
   - Requires issue approval first

5. **Hard gate failures**
   - Contributor must fix and resubmit
   - Not a "review", just a blocker

**In these cases:**
- Maintainer reviews manually
- Maintainer enters subjective score (0-30pt)
- Combined with objective score (0-70pt)
- Total score recorded on leaderboard
- Maintainer merges or requests changes

### Branch Naming

- `implement/<feature-name>` — New feature
- `fix/<bug-description>` — Bug fix
- `test/<test-name>` — Test additions

Examples: `implement/idea-list-screen`, `fix/maturity-badge-crash`, `test/golden-flow-persistence`

### Evidence Required

Include in PR description:
- 📸 Screenshots of working feature
- 🎥 Screen recording (< 60 seconds, unlisted YouTube/Loom)
- 📱 Expo Go QR code or APK download link
- ✅ Checklist of acceptance criteria met

### Related Files

- Workflow: `.github/workflows/evaluation.yml`
- Scoring: Python logic in workflow
- Leaderboard: `scripts/update_leaderboard.py`

---

## Leaderboard System

### Purpose

Track contributor effort and quality. Gamify contributions.

### Location

- **Live leaderboard:** `leaderboard` branch → `LEADERBOARD.md`
- **View URL:** `https://github.com/<user>/<repo>/blob/leaderboard/LEADERBOARD.md`

### Ranking Logic

**Leaders ranked by:**
1. Highest total score achieved in any single PR
2. Tie-breaker: Total number of PRs
3. Tie-breaker: Latest submission date

### Score Calculation

**Automatic (Path C auto-merge):**
- Hard gates: 70pt (objective)
- Golden flows: 10pt (objective)
- **Total:** 80pt maximum (auto-merge PRs)

**Human-reviewed (Path C edge cases):**
- Hard gates: 70pt (objective)
- Code quality: 15pt (subjective, assigned by reviewer)
- Spec fidelity: 15pt (subjective, assigned by reviewer)
- **Total:** 100pt maximum (human-reviewed PRs)

**Note:** Auto-merged PRs score lower (max 80pt) but merge faster. Human-reviewed PRs can score higher (max 100pt) but are slower.

### Leaderboard Update

- Auto-updated by CI after each evaluation
- Push to `leaderboard` branch via git worktree
- No manual edits (will be overwritten)

---

## Branch Strategy

### Permanent Branches

- `main` — Stable, approved code and specs
- `submissions` — Implementation PRs land here first (Path C)
- `leaderboard` — Auto-generated leaderboard (LEADERBOARD.md only)

### Temporary Branches

- `section/<number>-<desc>` — Path A (section edits)
- `spec/<feature>` — Path B (spec creation)
- `implement/<feature>` — Path C (implementation)
- `fix/<bug>` — Path C (bug fixes)
- `test/<test>` — Path C (test additions)

### Merge Flow

**Path A/B:**
```
section/NN-name → main (auto-merge if score ≥ baseline)
spec/feature → main (auto-merge if score ≥ baseline)
```

**Path C (auto-merge):**
```
implement/feature → submissions (evaluation runs)
submissions → main (auto-merge if criteria met)
```

**Path C (human review):**
```
implement/feature → submissions (evaluation runs)
submissions → (waiting) → maintainer reviews
submissions → main (human merges after review)
```

---

## Common Scenarios

### Scenario 1: Improve a section in program.md

```bash
git checkout -b section/04-data-contracts
# Edit program.md section 4
git add program.md
git commit -m "feat(section-04): add TypeScript interfaces for data contracts"
git push origin section/04-data-contracts
# Open PR to main
# CI scores → if ≥ current → auto-merge ✅
```

### Scenario 2: Propose a new feature spec

```bash
cp specs/TEMPLATE.md specs/offline-sync.md
git checkout -b spec/offline-sync
# Fill all 5 sections, delete TODO lines
git add specs/offline-sync.md
git commit -m "spec(offline-sync): add offline data sync feature spec"
git push origin spec/offline-sync
# Open PR to main
# CI scores → if score > 0 (first PR) → auto-merge ✅
```

### Scenario 3: Implement a feature (auto-merge path)

```bash
# Read program.md § 5 (Screen 1: Idea List)
git checkout -b implement/idea-list-screen

# Write code:
# - app/index.tsx
# - src/features/idea/components/IdeaCard.tsx
# - src/features/idea/components/__tests__/IdeaCard.test.tsx

# Verify locally:
npx tsc --noEmit
npx eslint . --ext .ts,.tsx
npm test

# All pass → commit
git add app/ src/
git commit -m "feat(idea-list): implement idea list screen with maturity badges"
git push origin implement/idea-list-screen

# Open PR to submissions
# CI runs evaluation
# All hard gates pass + golden flows pass + no security flags
# → ✅ AUTO-MERGE to main
# → Score recorded on leaderboard (max 80pt)
```

### Scenario 4: Implementation with human review needed

```bash
# Implement feature that adds a new npm dependency
git checkout -b implement/user-authentication

# Code includes: npm install firebase

# Push and open PR to submissions
# CI detects dependency change
# → ⏸️  HUMAN REVIEW REQUIRED
# → Maintainer reviews security implications
# → Maintainer assigns subjective scores (code quality, spec fidelity)
# → Total score recorded (max 100pt)
# → Maintainer merges if approved
```

### Scenario 5: Fix a bug found in production

```bash
git checkout -b fix/maturity-badge-crash
# Fix the bug in src/features/idea/components/MaturityBadge.tsx
# Add regression test in __tests__/MaturityBadge.test.tsx

npx tsc --noEmit && npx eslint . --ext .ts,.tsx && npm test
# All pass

git add src/
git commit -m "fix(maturity-badge): handle null idea gracefully"
git push origin fix/maturity-badge-crash

# Open PR to submissions
# CI runs → all pass → auto-merge ✅
```

---

## Metrics and Transparency

### Objective Metrics (Automated)

- Section score (0-100) — Path A/B
- TypeScript errors (count)
- ESLint errors (count)
- Test pass rate (%)
- Bundle size (MB)
- Golden flow pass rate (%)

### Subjective Metrics (Human-assigned, Path C edge cases only)

- Code quality (0-15pt) — Readability, patterns, maintainability
- Spec fidelity (0-15pt) — How precisely spec was followed

### Transparency

- All scores visible on leaderboard
- All evaluations posted as PR comments
- All scoring logic in open source (scripts/)
- All checklists in version control (checklists/)

---

## Anti-Patterns (Will Block Merge)

❌ **Spec violations**
- Implementing features not in spec
- Ignoring acceptance criteria
- Using different data structures than spec defines

❌ **Test anti-patterns**
- `expect(true).toBe(true)` — Tests nothing
- Snapshot spam — Breaks on every change
- Mock everything — If you mock storage, LLM, navigation, AND component, you're testing nothing
- Tests without assertions

❌ **Architecture violations**
- Using Context API instead of Zustand
- Direct AsyncStorage access from components
- Calling services directly instead of via hooks
- Wrong file locations or naming

❌ **Security issues**
- API keys in code
- Credentials in code
- XSS vulnerabilities
- SQL/command injection patterns

❌ **Immutable file edits**
- Modifying `.github/workflows/`
- Modifying `scripts/*.py`
- Modifying `checklists/*.yml`
- Modifying `app.json`, `tsconfig.json` without approval

---

## FAQ

**Q: Why autonomous merge? Isn't human review safer?**
A: Specs + tests provide objective validation. Human review is a bottleneck and adds latency. If all objective criteria pass, merge should be automatic. Human review for edge cases only.

**Q: What if I disagree with the auto-merge decision?**
A: Open a GitHub issue. If there's a pattern of incorrect auto-merges, we update the spec or tests to catch that pattern.

**Q: Can I increase my leaderboard score by resubmitting?**
A: Yes! Multiple submissions allowed. Only your highest score counts for leaderboard ranking.

**Q: Why do auto-merged PRs score lower (max 80pt) than human-reviewed (max 100pt)?**
A: Auto-merge is the preferred path (faster, no bottleneck). The 20pt difference (code quality + spec fidelity) is subjective and only assessable by humans in edge cases.

**Q: What if my PR needs human review but I don't want to wait?**
A: Fix the issue that triggered human review (e.g., remove the new dependency, clarify the spec ambiguity, fix the security issue). Then resubmit for auto-merge.

**Q: Can I work on multiple PRs simultaneously?**
A: Yes! Each PR is evaluated independently. Work on as many as you want.

**Q: What if I find a bug in the scoring system?**
A: Open a GitHub issue with evidence. If confirmed, we fix the scoring logic and re-score affected PRs.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| v1.0.0 | 2026-04-01 | Initial workflow specification |

---

**Remember:** Specs first, tests validate, autonomous merge when possible, human review for exceptions only.

Read this document fully before contributing. If anything is unclear, open a GitHub issue.
