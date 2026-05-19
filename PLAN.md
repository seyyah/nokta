# PLAN.md — Phased Implementation Roadmap

**This document outlines the development phases for Nokta v0.1.**

All phases follow the spec-driven pattern:
1. Spec is written first (`program.md` or `specs/*.md`)
2. Spec is scored and merged (Path A/B)
3. Code is implemented from spec (Path C)
4. CI validates implementation
5. Human reviews and approves
6. Implementation merges

---

## Current Status

**Project Phase:** Phase 0 (Documentation & Infrastructure) — **In Progress**

**What exists:**
- ✅ `program.md` — Complete spec (source of truth)
- ✅ `mobile-skeleton.md` — Template for spec sections
- ✅ `README.md` — Public-facing overview
- ✅ `specs/TEMPLATE.md` — Template for feature specs
- ✅ `checklists/section_XX.yml` — Spec scoring rubrics for program.md sections
- ✅ `checklists/spec_generic.yml` — Spec scoring rubric for specs/*.md
- ✅ `scripts/section_score.py` — Scoring engine (supports both spec types)
- ✅ `.github/workflows/md-ratchet.yml` — CI for program.md sections
- ✅ `.github/workflows/spec-ratchet.yml` — CI for specs/*.md files
- ✅ `AGENT.md` — AI agent instructions
- ✅ `CLAUDE.md` — Claude Code quick reference
- ✅ `PLAN.md` — This file
- 🔄 `CHANGELOG.md` — To be created
- 🔄 `WALKTHROUGH.md` — To be created
- 🔄 `.github/workflows/implementation-ratchet.yml` — CI for implementation PRs (to be created)

**What does NOT exist yet:**
- ❌ Expo app scaffold (`app/`, `src/`, `package.json`)
- ❌ TypeScript interfaces (`src/features/idea/types.ts`)
- ❌ React components (`src/features/idea/components/`)
- ❌ Services (`src/services/llm.ts`, `src/features/idea/services/storage.ts`)
- ❌ Tests (`__tests__/`)
- ❌ Golden flow tests

---

## Phase 0: Documentation & Infrastructure (Current Phase)

**Goal:** Establish project governance, scoring system, and contributor guidance before code implementation begins.

**Status:** 🟡 In Progress (90% complete)

### Deliverables

- [x] `program.md` — Complete spec (all 12 sections filled)
- [x] `mobile-skeleton.md` — Template structure
- [x] `README.md` — Public overview with contribution paths
- [x] `specs/TEMPLATE.md` — Feature spec template
- [x] `checklists/section_XX.yml` — Scoring rubrics for program.md (12 section checklists)
- [x] `checklists/spec_generic.yml` — Scoring rubric for specs/*.md
- [x] `scripts/section_score.py` — Scoring engine with dual mode (program.md sections + spec files)
- [x] `.github/workflows/md-ratchet.yml` — CI for program.md section edits (Path A)
- [x] `.github/workflows/spec-ratchet.yml` — CI for specs/*.md files (Path B)
- [x] `AGENT.md` — AI agent instructions (human-in-loop for Path C)
- [x] `CLAUDE.md` — Claude Code quick reference
- [x] `PLAN.md` — This roadmap
- [ ] `CHANGELOG.md` — Semantic versioning log (v0.1.0-dev)
- [ ] `WALKTHROUGH.md` — Guided tour for new contributors
- [ ] `.github/workflows/implementation-ratchet.yml` — CI for implementation PRs (Path C)

### Acceptance Criteria

- [x] Spec scoring works for program.md sections (`--section N` and `--all`)
- [x] Spec scoring works for specs/*.md files (`--spec-file specs/X.md`)
- [x] CI auto-merges spec PRs (Path A/B) when score ≥ main
- [x] CI auto-rejects spec PRs (Path A/B) when score < main
- [ ] CI validates implementation PRs (Path C) but does NOT auto-merge
- [ ] Implementation CI checks: TypeScript, ESLint, bundle size, tests
- [ ] Implementation CI posts comment with hard gate results
- [ ] README clearly explains 3 contribution paths (A, B, C)
- [ ] AGENT.md distinguishes automated (A/B) vs human-review (C) paths

**Target Completion:** 2025-04-01 (Today)

---

## Phase 1: Expo Scaffold & TypeScript Contracts

**Goal:** Create minimal runnable Expo app with TypeScript interfaces defined per program.md § 4.

**Status:** 🔴 Not Started

### Deliverables

- [ ] Expo app initialized (`npx create-expo-app nokta --template blank-typescript`)
- [ ] Folder structure per program.md § 2 (Setup Protocol)
- [ ] Dependencies installed per program.md § 2 allowlist
- [ ] `src/features/idea/types.ts` — All TypeScript interfaces from program.md § 4
- [ ] `tsconfig.json` — TypeScript strict mode enabled
- [ ] `.eslintrc.js` — ESLint config
- [ ] `app.json` — Expo identity config
- [ ] `babel.config.js` — Transpiler config
- [ ] `package.json` — Dependency lock with only approved deps
- [ ] App launches without crash (`npx expo start`)
- [ ] TypeScript compiles clean (`npx tsc --noEmit`)
- [ ] ESLint passes (`npx eslint . --ext .ts,.tsx`)

### Acceptance Criteria

- [ ] All hard gates pass (TypeScript, ESLint)
- [ ] App launches and shows blank screen (no crash)
- [ ] All interfaces from program.md § 4 are typed correctly
- [ ] No unauthorized dependencies added
- [ ] PR includes screenshot of running app + `npx tsc --noEmit` output

**Branch:** `implement/expo-scaffold`

**Target Completion:** v0.2.0

---

## Phase 2: Storage Service & State Management

**Goal:** Implement AsyncStorage service and Zustand store per program.md § 4 & § 11.

**Status:** 🔴 Not Started

### Deliverables

- [ ] `src/features/idea/services/storage.ts` — AsyncStorage wrapper
  - [ ] `saveIdea(idea: Idea): Promise<void>`
  - [ ] `loadIdea(id: string): Promise<Idea | null>`
  - [ ] `loadAllIdeas(): Promise<Idea[]>`
  - [ ] `deleteIdea(id: string): Promise<void>`
- [ ] `src/features/idea/store.ts` — Zustand store
  - [ ] `ideas: Idea[]` state
  - [ ] `addIdea(idea: Idea): void` action
  - [ ] `updateIdea(id: string, updates: Partial<Idea>): void` action
  - [ ] `deleteIdea(id: string): void` action
  - [ ] `loadIdeas(): Promise<void>` async action
- [ ] Tests for storage service (`src/features/idea/services/__tests__/storage.test.ts`)
- [ ] Tests for Zustand store (`src/features/idea/__tests__/store.test.ts`)

### Acceptance Criteria

- [ ] All hard gates pass
- [ ] Storage service tests pass (happy + error cases)
- [ ] Store tests pass (state mutations verified)
- [ ] No direct AsyncStorage access from components
- [ ] PR includes test output screenshot

**Branch:** `implement/storage-state`

**Target Completion:** v0.3.0

---

## Phase 3: Screen 1 — Idea List (Home)

**Goal:** Implement home screen per program.md § 5 (Screen 1 spec).

**Status:** 🔴 Not Started

### Deliverables

- [ ] `app/index.tsx` — Home screen
- [ ] `src/features/idea/components/IdeaCard.tsx` — Card component
- [ ] `src/features/idea/components/MaturityBadge.tsx` — Badge component (● ━ ¶ 📄)
- [ ] `src/features/idea/components/EmptyState.tsx` — Empty state with animation
- [ ] `src/features/idea/components/FAB.tsx` — Floating Action Button
- [ ] Tests for each component
- [ ] Navigation: tap card → navigate to `/idea/[id]`
- [ ] Long-press delete with confirmation

### Acceptance Criteria (from program.md § 5)

- [ ] GIVEN no ideas WHEN app opens THEN empty state shown with FAB visible
- [ ] GIVEN 5 ideas WHEN app opens THEN all 5 cards visible, sorted by updatedAt desc
- [ ] GIVEN user taps FAB and types "drone delivery" WHEN user presses send THEN new DOT idea created and chat opens
- [ ] GIVEN user long-presses idea WHEN delete confirmed THEN idea removed from list and storage
- [ ] All component tests pass
- [ ] PR includes screenshots + screen recording

**Branch:** `implement/idea-list-screen`

**Target Completion:** v0.4.0

---

## Phase 4: LLM Service (Mock Mode)

**Goal:** Implement mock LLM service per program.md § 7.

**Status:** 🔴 Not Started

### Deliverables

- [ ] `src/services/llm.ts` — LLM abstraction
  - [ ] `getNextQuestion(idea: Idea, messages: Message[]): Promise<string>`
  - [ ] Mock mode (default): returns deterministic responses
  - [ ] Live mode (feature flag): calls real API
- [ ] `src/mock/llm-responses.json` — Mock response map from program.md § 7
- [ ] `src/mock/golden-ideas.json` — 3 golden transcripts from program.md § 7
- [ ] `src/config/features.ts` — Feature flags (`MOCK_LLM: true`)
- [ ] Tests for LLM service (mock mode)

### Acceptance Criteria

- [ ] All hard gates pass
- [ ] Mock responses match program.md § 7 exactly
- [ ] `FEATURES.MOCK_LLM = true` returns deterministic responses (no API calls)
- [ ] 3 golden transcripts validated
- [ ] PR includes test output

**Branch:** `implement/llm-service`

**Target Completion:** v0.5.0

---

## Phase 5: Screen 2 — Idea Chat (Refinement)

**Goal:** Implement chat screen per program.md § 5 (Screen 2 spec).

**Status:** 🔴 Not Started

### Deliverables

- [ ] `app/idea/[id].tsx` — Chat screen
- [ ] `src/features/idea/components/ChatBubble.tsx` — Message bubble
- [ ] `src/features/idea/components/MessageInput.tsx` — Input + send button
- [ ] `src/features/idea/components/MaturityProgress.tsx` — Top progress bar
- [ ] `src/features/idea/components/SpecPreviewButton.tsx` — Appears at PARAGRAPH+
- [ ] Maturity transition logic (per `MATURITY_RULES` in types.ts)
- [ ] Auto-scroll to bottom
- [ ] Tests for each component
- [ ] Integration test: full conversation → maturity transitions

### Acceptance Criteria (from program.md § 5)

- [ ] GIVEN new DOT idea WHEN chat opens THEN system's first message visible
- [ ] GIVEN 3 answered questions WHEN maturity rules met THEN maturity transitions automatically
- [ ] GIVEN maturity PARAGRAPH WHEN user views chat THEN SpecPreviewButton visible
- [ ] GIVEN user closes/reopens chat WHEN messages existed THEN all messages restored
- [ ] All component tests pass
- [ ] PR includes screenshots + screen recording of full flow

**Branch:** `implement/idea-chat-screen`

**Target Completion:** v0.6.0

---

## Phase 6: Screen 3 — Idea Spec Card

**Goal:** Implement spec view screen per program.md § 5 (Screen 3 spec).

**Status:** 🔴 Not Started

### Deliverables

- [ ] `app/idea/spec/[id].tsx` — Spec card screen
- [ ] `src/features/idea/components/SpecField.tsx` — Labeled field component
- [ ] `src/features/idea/components/SparkOrigin.tsx` — Spark origin display
- [ ] `src/features/idea/components/ShareButton.tsx` — Copy to clipboard
- [ ] Markdown formatting for share
- [ ] Tests for each component

### Acceptance Criteria (from program.md § 5)

- [ ] GIVEN PAGE maturity WHEN spec opens THEN all 6 fields populated
- [ ] GIVEN LINE maturity WHEN spec opens THEN available fields show, rest show placeholder
- [ ] GIVEN user taps share WHEN spec exists THEN formatted text copied with success toast
- [ ] All component tests pass
- [ ] PR includes screenshots

**Branch:** `implement/spec-card-screen`

**Target Completion:** v0.7.0

---

## Phase 7: Golden Flow Tests

**Goal:** Implement integration tests per program.md § 8.

**Status:** 🔴 Not Started

### Deliverables

- [ ] `__tests__/golden-flows/create-idea.test.tsx` — Create flow
- [ ] `__tests__/golden-flows/refinement.test.tsx` — Refinement flow
- [ ] `__tests__/golden-flows/spec-view.test.tsx` — Spec view flow
- [ ] `__tests__/golden-flows/persistence.test.tsx` — Persistence flow
- [ ] All 4 golden flows pass
- [ ] CI runs golden flow tests on every PR

### Acceptance Criteria (from program.md § 8)

Golden flow tests:
1. **Create Idea** — FAB → enter spark → DOT idea created
2. **Refinement** — Chat opens → system question → answer → maturity transitions
3. **Spec View** — Spec card → populated fields match conversation
4. **Persistence** — Create → close → reopen → data intact

Metric: `(passing_golden_flow_tests / total_golden_flow_tests) × 100`

Merge rule: All hard gates pass AND golden_flow_pass_rate(PR) ≥ golden_flow_pass_rate(main)

**Branch:** `implement/golden-flow-tests`

**Target Completion:** v0.8.0

---

## Phase 8: UI Config System

**Goal:** Implement local JSON-driven UI config per program.md § 6.

**Status:** 🔴 Not Started

### Deliverables

- [ ] `src/config/screens.json` — Screen layout config
- [ ] `src/config/component-map.ts` — Component mapping
- [ ] Screens read config and render components dynamically
- [ ] Tests for config-driven rendering

### Acceptance Criteria

- [ ] All 3 screens use `screens.json` for layout
- [ ] Component props match config schema
- [ ] Changing `screens.json` changes UI without code changes
- [ ] PR includes before/after screenshots

**Branch:** `implement/ui-config`

**Target Completion:** v0.9.0

---

## Phase 9: Bundle Optimization & Polish

**Goal:** Ensure bundle size < 2MB and polish UX.

**Status:** 🔴 Not Started

### Deliverables

- [ ] Bundle size optimized (< 2MB JS bundle)
- [ ] Loading states polished
- [ ] Error states handled gracefully
- [ ] Animations smooth (maturity transitions, empty state)
- [ ] Accessibility labels added
- [ ] Final UX audit

### Acceptance Criteria

- [ ] `npx expo export --dump-sourcemap` → JS bundle < 2MB
- [ ] All hard gates pass
- [ ] All golden flows pass
- [ ] APK tested on physical device
- [ ] PR includes APK download link + QR code

**Branch:** `implement/bundle-polish`

**Target Completion:** v1.0.0-rc1

---

## Phase 10: v1.0.0 Release

**Goal:** First stable release.

**Status:** 🔴 Not Started

### Deliverables

- [ ] All phases 1-9 complete
- [ ] All golden flow tests pass at 100%
- [ ] Documentation updated (README, WALKTHROUGH)
- [ ] CHANGELOG.md updated to v1.0.0
- [ ] Git tag: `v1.0.0`
- [ ] Release notes published
- [ ] APK available for download

### Acceptance Criteria

- [ ] All hard gates pass
- [ ] Golden flow pass rate: 100%
- [ ] No open critical bugs
- [ ] Demo video published (< 2 minutes)
- [ ] WALKTHROUGH.md complete

**Target Completion:** v1.0.0

---

## Version History

| Version | Phase | Status | Deliverables |
|---------|-------|--------|--------------|
| v0.1.0-dev | Phase 0 | 🟡 In Progress | Documentation, infrastructure, CI workflows |
| v0.2.0 | Phase 1 | 🔴 Not Started | Expo scaffold, TypeScript contracts |
| v0.3.0 | Phase 2 | 🔴 Not Started | Storage service, Zustand state |
| v0.4.0 | Phase 3 | 🔴 Not Started | Screen 1: Idea List |
| v0.5.0 | Phase 4 | 🔴 Not Started | LLM service (mock mode) |
| v0.6.0 | Phase 5 | 🔴 Not Started | Screen 2: Idea Chat |
| v0.7.0 | Phase 6 | 🔴 Not Started | Screen 3: Spec Card |
| v0.8.0 | Phase 7 | 🔴 Not Started | Golden flow tests |
| v0.9.0 | Phase 8 | 🔴 Not Started | UI config system |
| v1.0.0-rc1 | Phase 9 | 🔴 Not Started | Bundle optimization, polish |
| v1.0.0 | Phase 10 | 🔴 Not Started | First stable release |

---

## Notes

- **Spec-first development:** Every phase starts with spec validation (program.md or specs/*.md must be complete before implementation)
- **Ratchet enforcement:** Score never drops. Implementation PRs must pass hard gates AND maintain/improve golden flow pass rate
- **Human approval:** All implementation PRs (Path C) require maintainer review, even if CI passes
- **Small PRs:** Max 10 files, 500 lines per PR. Break large features into sub-phases if needed
- **Evidence required:** Every implementation PR must include screenshots, recordings, or APK

---

**Next Action:** Complete Phase 0 by creating CHANGELOG.md, WALKTHROUGH.md, and implementation-ratchet.yml CI workflow.
