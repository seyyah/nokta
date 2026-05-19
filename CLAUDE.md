# CLAUDE.md — Quick Reference for Claude Code

This file provides guidance to Claude Code (claude.ai/code) when working on the Nokta repository.

## Project Identity

**Nokta** — Mobile app that matures idea sparks into structured product specs via LLM-guided questioning.

- **Metaphor:** Dot → Line → Paragraph → Page (cosmological expansion)
- **Target User:** Anyone with ideas but no structured maturation process
- **Pattern:** Karpathy's autoresearch (humans write specs, machines write code, CI enforces quality)

## Source of Truth

**Read `program.md` first. Always.**

- `program.md` defines WHAT Nokta is, WHAT it does, and WHAT it NEVER does
- If contradiction between `program.md` and any other file → defer to `program.md`
- Never implement features not explicitly in `program.md` or approved `specs/*.md`

## Tech Stack

### Mobile App (Expo/React Native)
- **Framework:** Expo with TypeScript
- **Router:** Expo Router (file-based navigation)
- **State:** Zustand (mandatory — no Context API, no Redux)
- **Storage:** AsyncStorage (local-first, no backend)
- **LLM:** Mock mode (testing) / Live API (production)
- **Testing:** Jest + React Native Testing Library
- **Lint:** ESLint (config in `.eslintrc.js`)

### CI/CD
- **Workflow:** GitHub Actions (`.github/workflows/`)
- **Spec Scoring:** Python (`scripts/section_score.py`)
- **Rubrics:** YAML (`checklists/*.yml`)
- **Ratchet Rule:** Score never drops

### Not Used (v0.1)
- ❌ Backend server (no Express, Supabase, Firebase)
- ❌ Authentication (local-only, single-user)
- ❌ Databases (AsyncStorage only)
- ❌ Analytics / telemetry
- ❌ i18n (English only)

## Three Contribution Paths

| Path | What | Branch | Merge |
|------|------|--------|-------|
| **A** | Edit `program.md` sections | `section/NN-name` | Auto (if score ≥ main) |
| **B** | Add `specs/*.md` feature specs | `spec/feature-name` | Auto (if score ≥ main) |
| **C** | Implement code from specs | `implement/feature-name` | **Auto (if all criteria met)** OR Human review (edge cases) |

**Your role varies by path:**
- **Path A/B:** Help improve spec quality, run local scoring, explain failures
- **Path C:** Write spec-compliant code, ensure hard gates pass, provide evidence
  - **Preferred:** Spec-compliant implementation → auto-merge (max 80pt)
  - **Exception:** Edge cases (deps, security, architecture) → human review (max 100pt)

**See [workflow.md](workflow.md) for detailed contribution workflow and auto-merge criteria.**

## Development Commands

```bash
# Setup
npm install
npx expo start

# Quality gates (run before PR)
npx tsc --noEmit          # TypeScript
npx eslint . --ext .ts,.tsx   # Lint
npm test                  # Jest tests
npx expo export --dump-sourcemap  # Bundle size check

# Spec scoring (Path A/B only)
python scripts/section_score.py --section 4        # Single section
python scripts/section_score.py --all             # All sections
python scripts/section_score.py --spec-file specs/feature.md  # Spec file
```

## File Structure

```
nokta/
├── app/                  # Expo Router screens (Path C)
│   ├── index.tsx         # Screen 1: Idea List
│   └── idea/
│       ├── [id].tsx      # Screen 2: Idea Chat
│       └── spec/[id].tsx # Screen 3: Spec Card
├── src/                  # App source (Path C)
│   ├── features/idea/    # Idea feature
│   │   ├── components/   # UI components
│   │   ├── services/     # Storage, LLM services
│   │   ├── hooks/        # Custom hooks
│   │   ├── types.ts      # TypeScript interfaces (source of truth)
│   │   └── __tests__/    # Co-located tests
│   ├── config/           # Feature flags, screens.json
│   └── services/         # Shared services
├── scripts/              # CI scoring (IMMUTABLE)
├── checklists/           # Spec rubrics (IMMUTABLE)
├── specs/                # Feature specs (Path B)
├── .github/workflows/    # CI pipeline (IMMUTABLE)
├── program.md            # Source of truth (Path A)
├── mobile-skeleton.md    # Template for program.md
├── AGENT.md              # AI agent instructions
├── CLAUDE.md             # This file
└── README.md             # Public docs
```

## Immutable Files (DO NOT EDIT)

These files are protected by CI. Contributors MUST NOT modify them:

- `.github/workflows/` — CI pipeline
- `scripts/section_score.py` — Scoring engine
- `checklists/*.yml` — Scoring rubrics
- `app.json` — Expo identity
- `tsconfig.json` — TypeScript config
- `babel.config.js` — Transpiler config
- `.eslintrc.js` — Lint rules
- `package.json` — Only maintainer may edit (deps require approval)

**Why:** Fixed infrastructure prevents gaming the metric. Only editable surface changes.

## Hard Gates (Path C — Implementation PRs)

All must pass before PR:

| Gate | Command | Pass Condition |
|------|---------|----------------|
| TypeScript | `npx tsc --noEmit` | Zero errors |
| ESLint | `npx eslint . --ext .ts,.tsx` | Zero errors |
| Bundle Size | `npx expo export --dump-sourcemap` | JS bundle < 2MB |
| Dep Lock | `git diff origin/main -- package.json` | No unauthorized deps |
| Tests | `npm test` | All tests pass |

## Golden Flow Tests (Path C)

Integration tests that validate end-to-end user flows:

1. **Create Idea** — FAB → enter spark → DOT idea created
2. **Refinement** — Chat opens → system asks → user answers → maturity transitions
3. **Spec View** — Navigate to spec → populated fields match conversation
4. **Persistence** — Create → close app → reopen → data intact

**Metric:** `(passing_golden_flow_tests / total_golden_flow_tests) × 100`

**Merge rule:** All hard gates pass AND golden_flow_pass_rate(PR) ≥ golden_flow_pass_rate(main)

## Architectural Invariants (Path C)

Must follow these rules:

1. **State Management:**
   - Zustand only (`src/features/idea/store.ts`)
   - Components access via hooks (`useIdeaStore`)
   - NO direct AsyncStorage from components

2. **Service Layer:**
   - LLM: `src/services/llm.ts` (single entry point)
   - Storage: `src/features/idea/services/storage.ts`
   - Services are pure functions (no React hooks)

3. **Naming:**
   - Files: `kebab-case.ts` / `.tsx`
   - Components: `PascalCase`
   - Hooks: `useCamelCase`
   - Types: `PascalCase`
   - Constants: `UPPER_SNAKE_CASE`

4. **Testing:**
   - Tests in `__tests__/` co-located with code
   - Test user behavior, not implementation
   - No snapshot spam, no mock-everything

## Common Tasks

### Task: Help User Improve Spec (Path A/B)

```bash
# 1. Run local scoring
python scripts/section_score.py --section 4

# 2. Identify failing checks
# Example output:
# ✅ data_contracts_section (15pt)
# ❌ typescript_blocks (10pt) — No TypeScript code found
# ✅ data_contracts_min (10pt)

# 3. Explain what's missing
"Your spec needs a TypeScript code block in the DATA CONTRACTS section.
Add a ```typescript block with interface definitions."

# 4. After user fixes, re-score
python scripts/section_score.py --section 4
```

### Task: Implement Feature from Spec (Path C)

```bash
# 1. Read spec
# program.md § 5 (Screen & Feature Spec) or specs/feature.md

# 2. Create branch
git checkout -b implement/idea-list-screen

# 3. Write code that implements spec EXACTLY
# - Use TypeScript interfaces from spec
# - Follow architectural invariants
# - Add tests for acceptance criteria

# 4. Verify hard gates locally
npx tsc --noEmit
npx eslint . --ext .ts,.tsx
npm test

# 5. Commit and push
git add <files>
git commit -m "feat(idea-list): implement idea list screen with maturity badges"
git push origin implement/idea-list-screen

# 6. Open PR with evidence (screenshots, recording, APK)
# 7. Wait for human review (DO NOT auto-merge)
```

### Task: Add New Feature Spec (Path B)

```bash
# 1. Copy template
cp specs/TEMPLATE.md specs/user-profile.md

# 2. Create branch
git checkout -b spec/user-profile

# 3. Fill all 5 sections, delete all > TODO lines
# § 1 IDENTITY, § 2 NON-GOALS, § 3 DATA CONTRACTS, § 4 OBJECTIVE FUNCTION, § 5 RATCHET RULE

# 4. Score locally
python scripts/section_score.py --spec-file specs/user-profile.md

# 5. Commit and push
git add specs/user-profile.md
git commit -m "spec(user-profile): add user profile feature spec"
git push origin spec/user-profile

# 6. Open PR → CI scores → auto-merge if score ≥ 0 (first PR for this file)
```

## Human-in-Loop Rules

**Implementation PRs (Path C) require human approval even if CI passes.**

Ask user before:
- Adding new dependencies
- Modifying immutable files
- Adding features not in spec
- Making architectural decisions not defined in spec
- Exposing API keys or secrets

## Anti-Patterns

❌ Implement features not in spec
❌ Modify immutable infrastructure files
❌ Add dependencies without approval
❌ Use Context API / Redux (Zustand is mandatory)
❌ Auto-merge implementation PRs
❌ Write snapshot spam tests
❌ Mock everything in tests
❌ Commit WIP or broken code
❌ Add backend, auth, analytics (v0.1 NON-GOALS)

## Quick Checks Before PR

**Spec PRs (Path A/B):**
- [ ] Score ≥ main baseline (run `python scripts/section_score.py`)
- [ ] All `> TODO:` lines removed
- [ ] No immutable files modified

**Implementation PRs (Path C):**
- [ ] All hard gates pass locally
- [ ] Golden flow tests updated
- [ ] Evidence included (screenshots, recording)
- [ ] Spec reference in PR description
- [ ] No new dependencies (or approved via issue)
- [ ] Follows architectural invariants
- [ ] PR ≤ 10 files, ≤ 500 lines

## When in Doubt

1. Read `program.md` again
2. Check `AGENT.md` for detailed instructions
3. Ask the user for clarification
4. Wait for explicit approval

---

**Remember:** Spec PRs auto-merge. Implementation PRs require human review. Score never drops. program.md is source of truth.
