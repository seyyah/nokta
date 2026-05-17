# AGENT.md — Instructions for AI Agents

**This file provides guidance to AI agents (Claude Code, GitHub Copilot, Cursor, Codex, etc.) working on the Nokta repository.**

## Source of Truth

**program.md is the single source of truth for this project.**
**workflow.md is the single source of truth for contribution workflows.**

- Before starting any task, read `program.md` in full.
- If you encounter a contradiction between `program.md` and any other file (including this one), defer to `program.md`.
- `program.md` defines what Nokta IS, what it does, and what it NEVER does.
- Never implement features not explicitly described in `program.md` or approved spec files in `specs/`.
- **workflow.md** defines HOW contributions are made, validated, scored, and merged.
- All GitHub workflows (`.github/workflows/*.yml`) are generated based on `workflow.md`.

## GitHub Workflow Generation

**IMPORTANT: Workflows are generated from specs, not written directly.**

When creating or modifying CI workflows:

1. **Read workflow.md first** — Understand the complete contribution flow
2. **Identify the workflow purpose** — Which path (A/B/C)? What triggers it?
3. **Map workflow.md logic to YAML** — Translate decision tree into jobs/steps
4. **Never modify workflows directly** — Update `workflow.md` first, then regenerate `.github/workflows/*.yml`
5. **Test locally when possible** — Use `act` or GitHub CLI to simulate workflow execution

**Example pattern:**

```markdown
workflow.md says:
"Path C auto-merge if: all hard gates pass + no security flags + no immutable files"

↓ translates to ↓

.github/workflows/evaluation.yml:
- Job: evaluate
  - Step: Run TypeScript, ESLint, Tests, Bundle check
  - Step: Check security flags
  - Step: Check immutable files
  - Step: Calculate verdict (PASS/REVIEW/FAIL)
- Job: auto-merge (only if verdict=PASS)
  - Step: Merge PR via GitHub API
```

**Golden rule:** If `workflow.md` is unclear or ambiguous, clarify it first before generating workflows. Workflows are code; workflow.md is the spec.

## Repository Context

This is **Nokta** — a mobile app that matures idea sparks (dots) into structured product specs (pages) through LLM-guided questioning. The project follows Karpathy's autoresearch pattern:

- Humans write specs (`program.md`, `specs/*.md`)
- Machines write code (based on specs)
- CI enforces quality via ratcheting metrics
- Score never drops

## Active Missions (Classroom / Challenge Channel)

**If you (the agent) were invoked because a student or contributor opened this repo to work on a challenge submission, read the active mission spec FIRST — it overrides the generic Path A/B/C contribution flow for that submission.**

| Mission | Spec | Timebox | Focus |
|---------|------|---------|-------|
| Solo Seferi (closed) | [`challenge.md`](challenge.md) | 2 hours | Track A/B/C: dot capture / slop detector / migration & dedup. Produced the `[0.2.0-challenge]` round on `main`. |
| **Audit-Forge (active)** | [`challenge-audit-forge.md`](challenge-audit-forge.md) | 1 week | Müşterinin geliştirici olduğu kapalı döngü: embed [`seyyah/nokta-audit`](https://github.com/seyyah/nokta-audit) widget into a host Expo app, run forge cycles (`READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT/ROLLBACK`) on the produced `.md` reports, log everything in `FORGE.md`. Tracks: A=Sadelik, B=Yaratıcılık, C=Otonomi. |

**Agent's role when helping a challenge participant:**

1. **Read the active mission spec in full** before touching anything in `submissions/<id>-<slug>/`.
2. **Honor the host application boundary** — `nokta-audit` is a drop-in primitive; do not let widget code leak into host routes / services / state. If the student asks for a shortcut that breaks this, push back and cite `nokta-audit/IDEA.md`.
3. **Forge cycle discipline** — 15-minute timebox per cycle; minimal diffs (single problem, single fix); log failed hypotheses, not just successes; commit format `[FORGE: ScreenName] desc — Xkg`.
4. **Track determines what to optimize for:**
   - **Track A (Sadelik)** — minimize added code; `grep -r 'AuditWidget' app/` should return one mount line. Refuse to add helpers the student doesn't strictly need.
   - **Track B (Yaratıcılık)** — the audit report should drive a *feature*, not a bug fix; `IDEA.md` is mandatory and must articulate a non-obvious customer-as-developer use case.
   - **Track C (Otonomi)** — count and minimize human touch points; encourage growing `EVAL.md` so future cycles can't regress past wins (ratchet).
5. **Stay inside `submissions/<id>-<slug>/`** — never edit root files, `.github/`, or other students' folders. `validate-pr.yml` will reject the PR otherwise.
6. **AI tool log** — whatever agent you are (Claude Code / Codex / OpenCode / Cursor / Copilot), the student must log which agent did which cycle in their `README.md`. Remind them if you notice the log is empty.

When in doubt about the mission's intent (not the code), the spec file is the source of truth. When in doubt about the code, defer to `program.md` and `workflow.md` as usual.

## Three Contribution Paths

Contributors can participate in three distinct ways:

### Path A & B: Spec Contributions (FULLY AUTOMATED)

**Path A:** Edit `program.md` sections (spec writing)
**Path B:** Add new `specs/*.md` files (feature spec writing)

These paths are **fully automated**:
- CI scores the spec using `scripts/section_score.py` and `checklists/*.yml`
- Score ≥ main baseline → ✅ Auto-merge
- Score < main baseline → ❌ Auto-reject
- No human approval required

**Branch naming:**
```
section/<number>-<description>    # section/04-data-contracts
spec/<feature-name>                # spec/user-profile
```

**Your role as AI agent:**
- Help contributors improve spec quality
- Run local scoring before PR
- Explain which checklist items failed
- Never modify immutable files (see program.md § 0)

### Path C: Implementation Contributions (SPEC-DRIVEN AUTO-MERGE)

**Path C:** Implement code based on existing specs in `program.md` or `specs/*.md`

**Philosophy:** If implementation can be objectively validated through spec compliance and tests, it should auto-merge. Human review is the exception, not the rule.

**Auto-merge criteria (PREFERRED PATH):**
- ✅ All hard gates pass (TypeScript, ESLint, tests, bundle size < 2MB)
- ✅ Golden flow pass rate ≥ main branch
- ✅ No immutable files modified
- ✅ No security flags (API keys, XSS, injection)
- ✅ No new dependencies (or pre-approved)
- ✅ Architecture compliance validated via tests

**If ALL criteria met → 🤖 AUTO-MERGE (max score: 80pt)**

**Human review required (EDGE CASES ONLY):**
- New dependencies added
- Security concerns detected
- Architecture violations
- Spec ambiguity (test coverage gaps)
- Immutable files modified

**If human review needed → ⏸️  HOLD for maintainer (max score: 100pt = 80pt objective + 20pt subjective)**

**Branch naming:**
```
implement/<feature-name>           # implement/idea-list-screen
fix/<bug-description>              # fix/maturity-transition-crash
test/<test-description>            # test/golden-flow-persistence
```

**Your role as AI agent:**
- Write code that implements the spec exactly
- Ensure all hard gates pass locally before PR
- Provide evidence (screenshots, recordings, APK)
- Write tests that validate all acceptance criteria
- Aim for auto-merge path (faster, no bottleneck)
- If auto-merge criteria met, PR merges automatically
- If human review needed, explain why and wait for maintainer

**See [workflow.md](workflow.md) for detailed workflow and decision tree.**

## Human-in-Loop Protocol

**Human review is the EXCEPTION, not the rule. Only required for:**

1. **Edge cases that trigger REVIEW verdict** (Path C)
   - New dependencies added → Requires GitHub issue approval first
   - Security flags detected → XSS, injection, API keys, credentials
   - Immutable files modified → CI pipeline, scoring, config files
   - Architecture violations → Non-standard patterns not defined in spec
   - Spec ambiguity → Test coverage gaps indicate unclear requirements

2. **Immutable infrastructure changes** (program.md § 0) — **FORBIDDEN**
   - `.github/workflows/` — CI pipeline
   - `scripts/*.py` — Scoring engine
   - `checklists/*.yml` — Scoring rubrics
   - `app.json`, `tsconfig.json`, `babel.config.js`, `.eslintrc.js` — Build config
   - These files CANNOT be modified by contributors

3. **Quarantine items** (program.md § 10)
   - Any file containing API keys or secrets
   - Auth-related code (v0.1 NON-GOAL)

**When human review is needed:**
1. CI will mark PR with ⏸️ REVIEW verdict
2. CI comment explains why review is needed
3. Maintainer reviews and either:
   - Approves and merges (may assign 0-20pt subjective score)
   - Requests changes
4. Final score = 80pt objective + up to 20pt subjective

**When auto-merge happens:**
1. CI validates all criteria
2. CI marks PR with ✅ PASS verdict
3. CI auto-merges to main
4. Score = 80pt max (objective only)
5. No human bottleneck

**As an AI agent:**
- Aim for auto-merge path (write spec-compliant code with full test coverage)
- If human review needed, explain why clearly
- Never bypass hard gates
- Never assume approval

**See [workflow.md](workflow.md) for complete decision tree.**

## Spec-Implementation Validation

When reviewing an implementation PR, verify:

1. **Spec compliance:**
   - Does code implement the spec exactly as written?
   - Are all acceptance criteria met?
   - Are TypeScript interfaces from spec used correctly?

2. **Hard gates:**
   - `npx tsc --noEmit` → Zero errors
   - `npx eslint . --ext .ts,.tsx` → Zero errors
   - `npx expo export --dump-sourcemap` → JS bundle < 2MB
   - `git diff origin/main -- package.json` → No unauthorized deps

3. **Golden flow tests:**
   - Create Idea flow passes
   - Refinement flow passes
   - Spec view flow passes
   - Persistence flow passes

4. **Architectural invariants (program.md § 11):**
   - Zustand for state (not Context API, not Redux)
   - Services never called directly from components
   - No direct AsyncStorage access from components
   - Proper file naming and location

5. **Testing philosophy (program.md § 12):**
   - Tests validate user behavior, not implementation details
   - No snapshot spam
   - No mock-everything tests
   - Minimum coverage met

## program.md Update Protocol

**Spec contributions (Path A/B) may update program.md or add specs/*.md.**
**Implementation contributions (Path C) NEVER update program.md.**

If an implementation reveals a spec error or ambiguity:
1. Open a GitHub issue describing the problem
2. Wait for maintainer to update spec
3. Then implement against the corrected spec

Do NOT:
- Update program.md as part of an implementation PR
- Assume spec intent
- Implement features not in spec
- Add "nice to have" features

## CHANGELOG.md Update Protocol

**Maintain semantic versioning discipline.**

After every significant phase or feature completion:
1. Add an entry to CHANGELOG.md following [Keep a Changelog](https://keepachangelog.com/) format
2. Use semantic versioning (semver.org): v0.x.y during development, v1.0.0 for first stable release
3. Categories: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`
4. Be specific: "Added IdeaListScreen with maturity badges" not "Added files"
5. Include verification details showing the feature was tested

Current version: **v0.1.0-dev** (Nokta mobile app in development)

See **Git Workflow** section for commit and tag creation instructions.

## Student Submission Merge Protocol

**Treat every merged `submissions/<student-id>-<slug>/` PR as an event that MUST be reflected in both `CHANGELOG.md` and `LEADERBOARD.md`. Do not consider a merge "done" until both surfaces are in sync.**

Student PRs are the "müşterinin geliştirici olduğu" (customer-as-developer) channel: the student forks the repo, pushes their work under `submissions/<student-id>-<slug>/`, and opens a PR against `main`. After merge, the agent MUST verify the following chain has completed.

### After every successful submission PR merge

1. **Verify `score.yml` ran on `main`.**
   - Trigger: push to `main` touching `submissions/**`.
   - Expected artifacts (committed by `github-actions[bot]` to `main`):
     - `scoring/scores.json` — includes the new submission row
     - `scoring/scores.md` — markdown snapshot
     - `scoring/similarity.json` — refreshed similarity matrix
     - `LEADERBOARD.md` — regenerated by `.github/scripts/update_leaderboard.py`
   - If the bot commit (`Auto: update scoring + leaderboard [skip ci]`) is missing, check Actions logs:
     - HTTP 403 → missing `permissions: contents: write` (already configured; do not remove).
     - `gh pr list` failure → `GH_TOKEN` not propagated; verify the env block in `score.yml`.
   - Re-run the workflow via `gh workflow run score.yml` once the cause is fixed; do NOT hand-edit `LEADERBOARD.md` to paper over the failure.

2. **Confirm `LEADERBOARD.md` reflects the merge.**
   - The submission row must appear in the **All Submissions** table with score, rubric breakdown, author handle, and PR number.
   - If the author is a new contributor with a top-N score, they must appear in **Top Contributors**.
   - If the submission triggered a new similarity flag, the **Anti-Slop** table must list the new pair.
   - The footer `Total Submissions` / `Total Contributors` counters must match `scoring/scores.json`.

3. **Add a `CHANGELOG.md` entry under `[Unreleased]`.**
   - Per-PR line under `### Added`, using this shape:
     ```
     - `submissions/<id>-<slug>/` — <track> — score **N**/110, PR #<N> by @<handle>
     ```
   - At the end of a challenge round (when the round is closed), roll the unreleased lines up into a dated release block (see the existing `[0.2.0-challenge] - 2026-05-13` entry for the rollup format: Added / Changed / Closed without merge / Restored / Notes).
   - Never invent CHANGELOG entries for PRs that did NOT actually merge.

### Cross-checks before declaring merge complete

- `scoring/scores.json` count == number of `submissions/*/` directories on `main`.
- Every row in `LEADERBOARD.md`'s All Submissions table maps to an entry in `scoring/scores.json`.
- Every merged PR that touched `submissions/**` has a `CHANGELOG.md` `[Unreleased]` line (or is already covered by a closed release block).
- Similarity flags in `LEADERBOARD.md` exactly match `scoring/similarity.json["flags"]`.

### What NOT to do

- ❌ Do not hand-edit `LEADERBOARD.md` — it is overwritten by `update_leaderboard.py` on the next `score.yml` run.
- ❌ Do not bypass `validate-pr.yml` gates (folder regex, `submissions/`-only scope, README/APK warnings). If a student's PR fails these, the fix is on the student side; never disable the gate.
- ❌ Do not add `CHANGELOG.md` entries for submissions that were closed without merge — those belong (if at all) in the round's `### Closed (without merge)` block at rollup time.
- ❌ Do not assign manual "Çılgınlık +10" bonus in `LEADERBOARD.md`; that bonus lives outside the auto-generated artifact and is applied at demo day.

## Phantom Context Warning

**Do not hallucinate file contents or assume unverified paths.**

This repo is in early stages. Many features referenced in `program.md` do not exist yet.

Before referencing a file:
1. Check filesystem with `ls`, `Read`, or `Glob` tools
2. If file doesn't exist, tell user: "This requires implementing X, which is not yet written"
3. Ask if they want you to scaffold it now

## Language and Localization

**Code and documentation: English only for v0.1.**

- All TypeScript code, comments, variable names, git messages: English
- Documentation files (README, AGENT, program.md, etc.): English
- User-facing strings in the app: English only (i18n deferred to v0.2+, per program.md § 3)

## Code Style

- TypeScript: ESLint rules defined in `.eslintrc.js` (IMMUTABLE)
- Files: `kebab-case.ts` / `.tsx`
- Components: `PascalCase`
- Hooks: `useCamelCase`
- Types: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- 2-space indent, semicolons required
- Comments: Explain *why*, not *what* — code should be self-documenting

## Testing Philosophy

**Tests must validate user behavior, not implementation details.**

Valid test: "If I refactored internals but kept same UX, would this test pass?"
- Yes → valid test
- No → rewrite the test

**Anti-patterns (AUTO-REJECT):**
- `expect(true).toBe(true)` — tests nothing
- Snapshot spam — breaks on every change
- Mock everything — if you mock storage, LLM, navigation, AND component, you're testing nothing
- Duplicate tests with different variable names
- Tests without assertions

**Minimum requirements:**
- New component → at least 1 render test
- New service function → at least 2 tests (happy + error)
- Every maturity transition → covered by test
- Every golden flow → integration test

## Dependency Management

**Minimize external dependencies. Only maintainer may add new deps.**

Allowed dependencies are listed in program.md § 2 (Setup Protocol).

If you need a new dependency:
1. Open a GitHub issue
2. Explain why existing deps cannot solve the problem
3. Wait for maintainer approval
4. Only then modify package.json

Do NOT:
- Add a dependency without approval
- Use a different state management library (Zustand is mandatory)
- Add UI libraries beyond what's approved
- Install testing frameworks beyond Jest + React Native Testing Library

## Git Workflow

**Small, atomic commits with descriptive messages.**

Examples:
- ✅ `feat(idea-list): add maturity badges to idea cards`
- ✅ `test(golden-flow): add persistence test for idea storage`
- ✅ `fix(llm-service): handle timeout in mock mode`
- ✅ `docs(program-md): improve LLM contract section`
- ❌ `Update files` (too vague)
- ❌ `WIP` (commit meaningful units of work)

### Commit Workflow (AI Agent Responsibility)

When you complete a meaningful unit of work:

1. **Verify locally:**
   ```bash
   npx tsc --noEmit
   npx eslint . --ext .ts,.tsx
   npm test
   ```

2. **Stage and commit:**
   ```bash
   git add <files>
   git commit -m "feat(component): brief description"
   ```
   - Use conventional commit prefixes: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
   - Keep first line under 72 characters
   - Add detailed description in commit body if needed

3. **Push to remote:**
   ```bash
   git push origin <branch-name>
   ```

4. **Do NOT create version tags** — only maintainer creates tags

### When to Create Commits

Create a commit when:
- ✅ A single feature or fix is complete
- ✅ All hard gates pass locally
- ✅ Tests pass locally
- ❌ Work is incomplete (no WIP commits)
- ❌ Breaking CI (fix locally first)

## Key Files and Their Purposes

| File | Purpose | Contribution Path |
|------|---------|-------------------|
| `program.md` | Source of truth — complete spec | Path A (sections) |
| `mobile-skeleton.md` | Template for program.md sections | Reference only |
| `specs/TEMPLATE.md` | Template for feature specs | Copy for Path B |
| `specs/*.md` | Feature spec files | Path B (new specs) |
| `challenge.md` | Solo Seferi mission spec (closed, 2h) | Classroom / challenge round |
| `challenge-audit-forge.md` | Audit-Forge mission spec (active, 1 week) | Classroom / challenge round |
| `AGENT.md` | This file — AI agent instructions | Maintainer only |
| `CLAUDE.md` | Claude Code quick reference | Maintainer only |
| `README.md` | Public-facing project overview | Maintainer only |
| `PLAN.md` | Phased implementation roadmap | Maintainer only |
| `WALKTHROUGH.md` | Guided tour for new contributors | Maintainer only |
| `CHANGELOG.md` | Semantic versioning log | Updated on releases |
| `checklists/*.yml` | Scoring rubrics for specs | IMMUTABLE |
| `scripts/section_score.py` | Spec scoring engine | IMMUTABLE |
| `.github/workflows/*.yml` | CI pipeline definitions | IMMUTABLE |
| `app/` | Expo Router screens | Path C (implementation) |
| `src/` | App source code | Path C (implementation) |
| `__tests__/` | Test files | Path C (implementation) |

## Implementation PR Checklist

When opening an implementation PR (Path C), include:

```markdown
## What Changed
[Brief description of what was implemented]

## Spec Reference
- Implements: `program.md § X` or `specs/feature-name.md`
- Acceptance criteria met: [list them]

## Evidence (REQUIRED)
- [ ] 📸 Screenshot(s) of working feature
- [ ] 🎥 Screen recording (< 60 seconds, YouTube/Loom)
- [ ] 📱 Expo Go QR code or APK download link

## Local Verification
- [ ] `npx tsc --noEmit` → Zero errors
- [ ] `npx eslint . --ext .ts,.tsx` → Zero errors
- [ ] `npm test` → All tests pass
- [ ] Golden flow tests updated (if applicable)

## Architectural Compliance
- [ ] Zustand for state management
- [ ] Services called via hooks, not directly
- [ ] No direct AsyncStorage access from components
- [ ] Proper file naming and location
- [ ] Tests validate user behavior, not implementation

## Checklist
- [ ] No new dependencies added (or approved via issue)
- [ ] No immutable files modified
- [ ] PR is ≤ 10 files, ≤ 500 lines changed
- [ ] Commit messages follow conventional format
```

## Anti-Patterns to Avoid

❌ **Don't** implement features not in `program.md` or approved specs
❌ **Don't** modify immutable infrastructure files
❌ **Don't** add dependencies without approval
❌ **Don't** use different state management (Zustand is mandatory)
❌ **Don't** auto-merge implementation PRs (human approval required)
❌ **Don't** write snapshot spam tests
❌ **Don't** mock everything in tests
❌ **Don't** commit WIP or broken code
❌ **Don't** bypass hard gates ("I'll fix later")
❌ **Don't** add features marked as NON-GOALS (program.md § 3)
❌ **Don't** create backend servers, auth systems, or analytics (v0.1 is local-only)

## When in Doubt

1. Read `program.md` again
2. Check if feature is in NON-GOALS (program.md § 3)
3. Check if file is IMMUTABLE (program.md § 0)
4. Ask the user for clarification
5. Wait for explicit approval before proceeding

---

**Remember:** This is a spec-driven, CI-enforced, ratcheting quality system inspired by Karpathy's autoresearch. Precision, spec compliance, and human oversight (for implementation) are paramount. When uncertain, ask — don't assume.

**Spec PRs (Path A/B) = Automated merge**
**Implementation PRs (Path C) = Human approval required**
