# program.md — Nokta v0.1

> Karpathy-style instruction file for building Nokta mobile app.
> This file IS the product spec. The CI ratchet enforces it. Humans write this, agents build from it.

---

## 0. IMMUTABLE INFRA

<!-- SECTION OWNER: Write the list of files that NO contributor may edit. These are protected by CI. -->
<!-- WHY: Karpathy's pattern separates fixed infrastructure from editable surface. This section defines the boundary. -->

> TODO: List every file path that is off-limits, with a one-line reason for each.

---

## 1. IDENTITY

Nokta is a mobile app that captures idea sparks as small as a single word and matures them into structured product specs through guided questioning. It is not a chatbot, not a note-taking app, not a general-purpose AI assistant. It is an idea incubator.

The user starts with a dot — a single word, a fragment, a hunch. The system asks targeted questions. The dot becomes a line (a title), then a paragraph (a problem statement), then a page (a full spec with audience, solution, metrics, and effort estimate). The metaphor is cosmological: a singularity expands into a universe.

Target user: anyone with ideas but no structured process to mature them — founders, students, researchers, product managers.

Nokta is NOT:
- A general chatbot (conversations are structured interrogations, not open-ended)
- A note-taking app (the system actively challenges and shapes your input)
- A project management tool (it ends at spec, not at execution)
- A code generator (it produces specs, not software — the agent layer comes later)

---

## 2. SETUP PROTOCOL

<!-- SECTION OWNER: Write exact steps to go from zero to running app + passing tests. Must complete in ≤5 minutes. -->
<!-- INCLUDE: Node/npm versions, Expo CLI, folder structure tree, dependency allowlist, verification command. -->

> TODO: Step-by-step setup instructions with folder structure and dependency list.

---

## 3. NON-GOALS

<!-- SECTION OWNER: List at least 5 things Nokta v0.1 will NOT do, with a one-line reason for each. -->
<!-- WHY: Prevents scope creep. If it's not explicitly a non-goal, someone will build it. -->

> TODO: Explicit list of what is out of scope and why.

---

## 4. DATA CONTRACTS

<!-- SECTION OWNER: Define all TypeScript interfaces and enums. These are the source of truth for the entire app. -->
<!-- MUST INCLUDE: Idea, Message, IdeaSpec, MaturityStage, AsyncStorage key schema. All in TS code blocks. -->

> TODO: TypeScript interfaces and storage schema.

---

## 5. SCREEN & FEATURE SPEC

<!-- SECTION OWNER: Define the 3 screens, their components, navigation flow, and acceptance criteria. -->
<!-- SCREENS: (1) Idea List / Home, (2) Idea Chat / Refinement, (3) Idea Spec Card / Read-only view. -->
<!-- MUST INCLUDE: User journey, component list per screen, maturity indicator behavior, transition rules. -->

> TODO: Screen definitions, UX flow, component lists, acceptance criteria.

---

## 6. UI CONFIG

<!-- SECTION OWNER: Define the local JSON-driven UI config system. NOT a remote server — a local config/screens.json. -->
<!-- WHY: Lightweight backend-driven UI simulation. App shell reads layout from JSON, not hardcoded. -->
<!-- MUST INCLUDE: JSON schema, component mapping rules, example JSON for 1 screen, feature flag mechanism. -->
<!-- NOTE: Real backend-driven UI is deferred to v0.2. -->

> TODO: JSON schema, mapping rules, example config, feature flags.

---

## 7. LLM CONTRACT

<!-- SECTION OWNER: Define mock LLM behavior, prompt templates, and golden test transcripts. -->
<!-- CRITICAL: CI runs in mock mode. No real API calls during testing. -->
<!-- MUST INCLUDE: Mock response format, ≥3 golden transcripts, prompt template, env flag for mock/live switch. -->

> TODO: Mock LLM spec, golden transcripts, prompt template, fallback behavior.

---

## 8. OBJECTIVE FUNCTION

<!-- SECTION OWNER: Define the hard gates and the single scalar metric that governs merge decisions. -->
<!-- PATTERN: Hard gates (binary pass/fail) + one scalar product metric. NOT a weighted composite. -->
<!-- HARD GATES: lint, typecheck, bundle size limit. Fail any = instant reject. -->
<!-- SCALAR METRIC: golden flow pass count, or critical-path scenario pass rate. -->

> TODO: Gate definitions, scalar metric formula, merge rule in one sentence.

---

## 9. THE RATCHET LOOP

<!-- SECTION OWNER: Define the PR → CI → measure → keep/revert cycle. -->
<!-- CORE RULE: Score never drops. If PR score < main score, reject. -->
<!-- MUST INCLUDE: Flow diagram (text-based), merge queue behavior, fail message format, re-run mechanism. -->

> TODO: Ratchet loop specification.

---

## 10. CONTRIBUTION PROTOCOL

<!-- SECTION OWNER: Define branch naming, commit conventions, PR template, and quarantine rules. -->
<!-- QUARANTINE: Changes to CI config, dependencies, or auth code require manual review. -->

> TODO: Branch naming, commit format, PR template, quarantine rules, max PR size.

---

## 11. ARCHITECTURAL INVARIANTS

<!-- SECTION OWNER: Define code structure rules that must never be violated. -->
<!-- MUST INCLUDE: State management choice, component boundaries, service layer rules, naming conventions. -->

> TODO: Invariant rules for code architecture.

---

## 12. TESTING PHILOSOPHY

<!-- SECTION OWNER: Define what a valid test is, anti-patterns, and minimum test requirements. -->
<!-- MUST INCLUDE: Valid test definition, anti-pattern list, golden flow tests, test file location rules. -->

> TODO: Testing standards and anti-patterns.
