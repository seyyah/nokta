---
title: NonSlop
author: Ceren Azar
status: building
created: 2026-04-15
updated: 2026-05-07
catalog_status: "3 specialties scaffolded (dentist, cardiologist, nurse) — all badges [UNVERIFIED] — 0 audits complete — 0 user sessions conducted"
---

# NonSlop

*A specialty-native no-code mobile app factory for healthcare professionals — built as a mobile superapp.*

> This document follows the [IDEA.md](https://github.com/pithpusher/IDEA.md) standard. It describes **what NonSlop is and why it should exist** — before any code is written. It sits upstream of `AGENTS.md` and `PROGRAM.md` in this repository: those answer *how*; this answers *what* and *why*.
>
> **This file is the primary programming surface for AI agents working in this codebase.** Modifying `idea.md` is the preferred intervention over modifying code — when the thesis shifts, update this document first; the code follows. Any claim in this file that lacks a `[VERIFIED]` source is a research debt, not an established fact. Agents must treat it accordingly.

---

## 0. Current State

*Living snapshot — update this section whenever catalog state changes, not annually. If this section contradicts the frontmatter `catalog_status` field, the more recent edit wins; update both.*

| Dimension | Status |
|---|---|
| Catalog specialties | 3 scaffolded: `dentist`, `cardiologist`, `nurse` |
| Verified badges | 0 — all `[UNVERIFIED: placeholder, 2026-04-15]` |
| Completed audits | 0 — no AUDIT entries in `log.md` yet |
| User sessions | 0 — first unassisted clinician session not yet conducted |
| Agent output format | `delivery_format` field specified in idea.md — not yet in `noslop-config.json` schema |
| Last Lint pass | Never |
| Cross-specialty patterns found | 0 — requires ≥2 audits across different specialties |

**Immediate required action:** The first `AUDIT` log entry for any specialty takes priority over all catalog expansion, all feature work, and all schema changes. Every week without it is a week the primary metric (Section 11) remains a hypothesis.

---

## 1. Thesis

Every clinician has a specialty — and every specialty has a proven app pattern. **NonSlop turns that pattern into a working, HIPAA-ready mobile app in a few minutes: no code, no configuration, no slop.**

The 2026 "Company Brain" wave is making every organization's fragmented knowledge queryable by AI. Healthcare is the one domain where that wave cannot work without a human in the loop: clinical knowledge assembled by AI and left unvalidated is not an asset — it is a liability. NonSlop's catalog is the **Clinical Brain** for patient-facing app patterns: every screen, every default, every percentage badge is earned through human audit of real, deployed apps — never generated, never approximated. The LLM layer operates exclusively within those human-verified bounds. That constraint is the product.

The platform is itself a native mobile app. A specialist opens NonSlop on their phone, walks a wizard to their first prototype, saves it to their personal **My Apps** library, and returns whenever their practice evolves. If a configuration earns their confidence, they publish it. If they want a second opinion from a peer, they share it to the **community feed** — where other specialists in the same field can browse real configurations, see which screens colleagues chose, and add a prototype they admire directly to their own library. NonSlop is not a form that produces a file; it is a studio a clinician lives in.

---

## 2. Problem

Independent clinicians — across every medical specialty — need a patient-facing digital footprint in exactly the way hospital networks and chain clinics already have one. Patient-facing apps drive retention, cut no-shows, reduce phone-call overhead, and signal basic professionalism. Patients now expect it. Chains deliver it. Solo practitioners cannot.

**Every existing option fails them:**

- **Hire a dev agency.** A basic patient-facing healthcare mobile app costs $40k–$150k and takes 3–6 months with a mid-market agency; US-based shops start at $120k–$300k `[VERIFIED: topflightapps.com 2026, wearetenet.com 2025]`. Off the table for a solo practice.
- **Generic no-code builders** (Bubble, Glide, Softr, FlutterFlow). Produce output that ignores specialty workflows and don't handle HIPAA by default. A clinician ends up with a UI that looks like a CRM — not a medical app.
- **DIY with an LLM.** Produces plausible-looking screens that are, in practice, *slop*: hallucinated fields, wrong clinical terminology, no UX rigor, zero compliance story. Worse than nothing — because it looks finished. 29–45% of LLM-generated code contains security vulnerabilities; nearly 20% of package recommendations point to libraries that don't exist `[VERIFIED: USENIX package hallucinations study 2024]`. In healthcare-specific contexts, models repeat or elaborate on planted clinical errors in up to 83% of adversarial test cases `[VERIFIED: Nature Communications Medicine 2025]`.

**The concrete cost of this gap, across specialties:**

- Appointment reminders go out by hand — physicians spend an average of 15.5 hours per week on paperwork and administration `[VERIFIED: Medscape Physician Compensation Report 2023]`; for every clinical hour, nearly 2 hours go to EHR and admin tasks `[VERIFIED: AMA 2024]`. Automated reminders alone reduce no-show rates by 29–34% `[VERIFIED: American Journal of Medicine systematic review; AJMC randomized trial]`.
- Follow-up calls consume slots that could be asynchronous patient check-ins.
- Clinical notes are written on paper and re-keyed later; transcription errors are routine.
- Patient questions arrive through personal channels — WhatsApp, SMS — because there is no appropriate professional alternative.

No clinician can pause their practice for months to build an app. They need a tool that meets them where they are: **on their phone, in under 2 minutes, with zero learning curve** — and delivers something real at the end.

---

## 3. How It Works

**Pattern:** specialty-narrow + deep templates + feature composition + live preview at every step.

### Key insight 1 — "Best practice" is real in medicine, and it's specialty-specific

Healthcare workflows inside any given specialty are largely solved problems. Apps used by the same type of clinician share a striking amount of structure: the same 5–6 core screens, the same feature categories, the same flow priorities. **The set of "good ideas" inside a specialty is narrow. The overlap between successful apps of the same specialty is enormous.**

The answer to "what should go in my app?" is therefore not "let the clinician design from scratch" — that's paralyzing. It's "here is what the most successful apps in your specialty include — confirm or adjust." This holds for every specialty the catalog covers, whether that's three or thirty.

### Key insight 2 — Proven defaults beat infinite flexibility, but micro-decisions create ownership

Generic no-code tools fail clinicians because they offer too many choices. Clinicians are not UX designers. What they need is a short, guided sequence of decisions — each with a smart default and a visible result. NonSlop commits to that contract and refuses to break it. Narrowing is the feature, not the limitation.

At each step, the wizard highlights features that peers in the same specialty found most impactful — not as an upsell, but as peer signal: *"80% of cardiology apps include this screen `[UNVERIFIED: placeholder, 2026-04-15]` — practices that added it report 30% fewer no-shows `[UNVERIFIED: placeholder, 2026-04-15]`."* The clinician confirms or skips. They don't design; they *decide*. This is the line between a template (passive) and a wizard (active).

### Key insight 3 — The live preview *is* the interface

At every step, the clinician sees their app rendered in real time inside a phone mockup. This turns the wizard from *"fill in a form"* into *"watch your app come to life."* Trust builds with each screen that snaps into place. By the final step, the clinician owns the result emotionally — they didn't click through a template, they *designed* something.

The wizard culminates in an **Open App** screen: the clinician taps a single button and the generated app opens, fully navigable, on the same device. If something feels wrong they tap *"Back to Design"* and return to the customizer. When the result is right, they tap *"Publish My App"* — and it ships. No QR code. No separate device. No context switch.

### Key insight 4 — "My Apps" transforms the wizard from a one-time tool into a personal studio

A clinician who builds one app has a prototype. A clinician who can build, compare, save, and revisit multiple apps has a *practice design studio*. The **My Apps** library stores every configuration a specialist has generated — not just the one they published. They can return to a saved prototype, fork it for a satellite clinic, run a second specialty configuration side by side, or archive a build and start fresh. The wizard becomes something they return to each time their practice evolves — when they add a new service, open a second location, or simply want a better first impression. This changes the retention model: the product earns the clinician's attention continuously, not once.

Beyond configuration storage, My Apps functions as a **persistent practice profile**. Specialty, practice type (solo vs. multi-provider), patient demographics, and style preferences gathered during swipe onboarding (Key Insight 8) are stored alongside saved configurations. On return visits, the home screen surfaces this context immediately — the clinician is not asked to re-identify their specialty or re-establish preferences. Each subsequent session begins from accumulated knowledge of the practice, not from a blank entry point. This transforms My Apps from a file library into a living practice memory: the product knows the practice, not just the last configuration it produced.

### Key insight 5 — The social layer turns curated knowledge into a living peer network

When a cardiologist builds an app that earns strong patient feedback, that configuration carries signal — not just for them, but for every cardiologist making the same choices. The **social layer** surfaces this signal at the right moment. Specialists share their published apps to a community feed filtered by specialty. Peers browse, inspect screen structure and feature choices, and add a configuration they admire directly to their own **My Apps** library — one tap to fork it as a new prototype. This is not a generic app marketplace. It is a specialty-filtered peer recommendation network built on real usage decisions, not abstract ratings. The moat deepens: the catalog provides the structure; the social layer validates it with the lived endorsement of practitioners who made the same choices and published the result.

**Social signal as research input, not catalog update:** The social layer is not a write path to the catalog. When ≥ 10 specialists in a specialty have shared a configuration that includes a specific screen, that pattern triggers a **Lint** flag: the community usage rate is compared against the catalog percentage badge. If they diverge by more than 15 percentage points, the screen is queued for re-Audit. Community data informs curation — it does not replace it. The moat stays intact because the audit loop (not the feed algorithm) remains the authority on what is "proven."

### Key insight 7 — Human-in-the-Loop is the moat, not a process detail

Every "Company Brain" system faces the same failure mode: ingest everything, let the model synthesize, hope the output is trustworthy. In most domains this is a reasonable trade-off. In healthcare it is not. LLMs repeat or elaborate on planted clinical errors in up to 83% of adversarial test cases `[VERIFIED: Nature Communications Medicine 2025]`. A catalog built by AI is a catalog a clinician cannot trust — and a clinician who cannot trust the defaults will not publish the result to real patients.

NonSlop's catalog pipeline is a **Human-in-the-Loop (HITL) system by architecture**, not by policy:

- **Audit (human):** Every screen in the catalog was observed in a real, deployed app by a human researcher. It cannot enter by inference, by LLM suggestion, or by community vote alone.
- **Validate (human):** Every percentage badge — *"80% of cardiology apps include this screen"* — requires a named, checkable source before it leaves `[UNVERIFIED]` status. A human must locate and log that source. The badge does not promote itself.
- **Lint (human-triggered):** Monthly health checks surface stale claims and audit gaps. A human decides which findings are research debts and assigns them.
- **Social signal as HITL input, not write path:** When community usage diverges significantly from catalog percentages, a Lint flag triggers human re-audit. The community informs the human; the human updates the catalog. The loop closes through a person, not an algorithm.

The LLM layer — sequencing, copy, phrasing — runs on top of this human-validated foundation. It cannot extend the catalog, cannot promote an unverified badge, and cannot introduce a screen that no human auditor has seen in a real app. **The LLM is the personalization engine; the human audit is the authority.** This is the line between a "Company Brain" (AI assembles, human trusts) and NonSlop (human assembles, AI serves).

The competitive consequence: a general-purpose context agent can be cloned, fine-tuned, or outspent. A catalog that took 300 human audit hours across 12 specialties cannot be copied in a weekend. The HITL bottleneck is the moat.

### Key insight 6 — LLM-driven UI personalizes the experience within catalog bounds

The wizard does not feel static. Inside each step, an LLM layer operates *within* the hand-curated catalog: it sequences the most relevant screens to the top for the chosen specialty, suggests copy in the right clinical register, and adapts the phrasing of feature descriptions to the clinician's stated context (solo practice vs. multi-provider clinic, primary care vs. subspecialty). The LLM never generates structure — it never adds a screen outside the catalog schema and never invents a feature the catalog does not contain. Structure is curated and earned. Presentation is LLM-assisted and personal. The distinction is the line between "slop" and "precision": the LLM can help a nurse phrase her shift handoff screen in exactly the right voice; it cannot introduce a "genetic testing" screen that was never in the nursing catalog.

**The promise:** specialty selected to a live, tappable prototype — saved to a personal library, shareable to a peer community, and publishable to real patients — all inside the same native app, on the same device, in one session. No code, no hosting choice, no compliance reading.

### Key insight 8 — The swipe-native wizard: see before you decide

The wizard adopts a swipe-native interaction pattern across two connected phases, replacing the traditional checkbox-and-form model.

**Phase 1 — Style Onboarding:** Immediately after specialty selection, 5–7 real app screens from that specialty are shown in sequence as swipeable cards. Swiping right signals affinity; swiping left signals mismatch; swiping up signals strong preference. This signal is fed to the LLM personalization layer — it calibrates information density, tone, layout rhythm, and visual register for the wizard that follows. Style onboarding is not an additional step; it replaces the blank specialty-confirmation screen with a richer, preference-generating entry point. It generates no feature decisions and touches no catalog content.

**Phase 2 — Component Selection:** Each catalog component is presented as a swipeable card showing the component name, its specialty-specific peer signal (*"78% of cardiologists include this screen"*), and a live miniature preview of how it would appear in the clinician's app. The large phone mockup (Key Insight 3) updates in real time as each card is shown. Swiping right adds the component; swiping left skips it. The clinician sees before they decide — the "name only" problem of traditional wizard checkboxes is eliminated. Components are sequenced by the LLM in order of specialty relevance; the highest-signal screens surface first. Swiping left on a screen removes it from the build but does not remove it from the catalog or alter its percentage badge.

**What swipe data cannot do:** Swipe signal from both phases informs the LLM personalization layer — copy, sequencing, visual tone — exclusively. It never modifies catalog structure, feature availability, clinical defaults, or HITL-verified content. A clinician swiping left on a follow-up checklist card because it looks dense does not remove follow-up checklists from the cardiology catalog. The catalog is the authority; swipe is personalization input.

Both phases operate within the ≤112 second, ≤20 deliberate touch budget. Style onboarding replaces rather than precedes the specialty confirmation step; swipeable component cards replace the checkbox feature list. Net touch count does not increase.

### Key insight 9 — Agent-readable output: one catalog, two delivery formats

The `noslop-config.json` schema includes a `delivery_format` field accepting `app`, `agent`, or `both`. Each catalog screen maps structurally to an agent task — an appointment reminder screen becomes an appointment-reminder agent capability; a follow-up checklist screen becomes a follow-up-monitoring agent task. The mapping is structural, not interpretive: the screen's trigger logic, tone register, and clinical constraints transfer directly. No catalog rebuild is required; only the output format changes.

At the wizard's conclusion, alongside the existing *"Publish as Patient App"* path, the clinician sees a second option: *"Export as Agent Config."* The exported file specifies agent behavior within the same HITL-verified bounds as the app — the agent cannot do anything the catalog does not sanction, and it inherits the same verified clinical patterns. The HITL moat holds in both formats.

This positions NonSlop as **clinical AI ground-truth infrastructure** rather than an app builder. The same human-audited catalog that powers patient-facing apps today powers agent behavior specifications for agent-native platforms tomorrow. As AI agent platforms — including hardware-level agent environments like OpenAI's forthcoming agent phone — replace traditional app distribution, NonSlop's catalog becomes the authoritative source for how AI should interact with patients in any given specialty. The competitive consequence: whoever owns the verified clinical interaction catalog owns the behavioral specification layer for clinical AI agents, regardless of what platform those agents run on.

### Key insight 10 — AI-assisted discovery: custom request vs. curated browse

The wizard entry point offers two paths: **"Custom Request"** (AI-assisted free-form) and **"Browse Suggestions"** (catalog-driven swipe). This bifurcation solves the cold-start problem for clinicians who know exactly what they need but don't know how to express it in specialty taxonomy.

**Custom Request path:**
1. **Free-form input:** Clinician describes their need in natural language: *"I need to calculate cardiovascular risk for my patients"* or *"I want appointment reminders for my dental practice."*
2. **AI analysis (within catalog bounds):** The LLM parses the input, identifies the specialty (cardiology, dentistry, nursing), and maps the stated need to catalog components. It cannot invent components — it can only recommend from the HITL-verified catalog.
3. **Structured proposal:** The AI presents a specialty + 4–6 recommended components with clinical rationale: *"Based on your request, we suggest: Cardiology specialty with ASCVD Risk Calculator, Appointment Booking, Appointment Reminders, Patient Education."*
4. **Clinician decision:** [Accept & Continue] → proceeds to ReviewConcepts with pre-selected components. [Edit Manually] → returns to standard SelectSpecialty flow.

**Browse Suggestions path:**
- Standard wizard flow (SelectSpecialty → ReviewConcepts → ReviewComponent) unchanged.
- For clinicians who prefer to explore the catalog visually rather than describe their need.

**Why this works:**
- **Lowers activation energy:** A cardiologist who types *"risk calculators"* gets a working prototype faster than one who must first learn that NonSlop calls them "Patient Education" or "Clinical Tools."
- **Preserves HITL moat:** The AI cannot hallucinate components. It operates as a **query interface to the catalog**, not a generative layer. If a clinician requests a feature outside the catalog (*"I want genetic testing"*), the AI responds: *"That feature isn't in our verified catalog yet. Here's what we do have for your specialty."*
- **Captures unmet needs:** Every custom request that cannot be satisfied becomes a research signal. If ≥5 cardiologists request *"ECG interpretation"* and it's not in the catalog, it's flagged for audit consideration.
- **Reduces cognitive load:** Clinicians don't need to know NonSlop's taxonomy. They describe their practice reality; the AI translates it to catalog structure.

**Medical calculator integration (MDCalc-inspired):**
The catalog is extended with **clinical decision tools** as a new component category. Examples from trending MDCalc tools:
- **ASCVD Risk Calculator** (Cardiology): 10-year cardiovascular risk → statin recommendation
- **CHA₂DS₂-VASc Score** (Cardiology): Atrial fibrillation → anticoagulation decision
- **Framingham Risk Score** (General Practice): Coronary heart disease risk → lifestyle counseling
- **Wells' Criteria for DVT** (Emergency/Internal Medicine): Deep vein thrombosis probability → D-dimer test decision

Each calculator component includes:
- **Input fields:** Age, blood pressure, cholesterol, smoking status, etc.
- **Calculation logic:** Validated clinical algorithms (sourced from peer-reviewed literature)
- **Output interpretation:** Risk score + clinical action recommendation
- **Patient-facing result:** Simplified explanation + next steps

These tools are added to specialty catalogs (e.g., `cardiologist.md`) as standard components, audited from real clinical apps (e.g., MDCalc, UpToDate, AHA/ACC guidelines apps). The AI Custom Request path surfaces them when a clinician describes a calculation need.

**Touch budget impact:** The Custom Request path adds 1 screen (text input + AI response) before the standard wizard. Total: ≤22 touches (within ≤20 + 2 buffer). If the clinician accepts the AI proposal immediately, they skip SelectSpecialty entirely — net touch count decreases.

**The promise:** A clinician who doesn't know NonSlop's structure can still build a working app by describing their practice need. The AI translates intent to catalog structure, the catalog ensures clinical validity, and the wizard delivers a prototype — all within the same HITL-verified bounds.

---

## 4. What It Does Not Do

Boundaries matter. Every refusal below is the reason the core experience stays tight. NonSlop **is** a no-code app builder — but it deliberately refuses to be these things:

- **Not a backend-as-a-service.** NonSlop does not store, process, or transmit Protected Health Information (PHI). Wizard state lives in the device (secure local storage). The clinician can export a `noslop-config.json` at any point — a PHI-free configuration artifact listing their selected specialty, chosen features, branding tokens, and screen structure. This file is the *persistent working memory* of their app: portable, reloadable, and completely patient-data-free. When a clinician publishes their app to real patients, they bring their own compliant backend (or, in a future release, a NonSlop-certified BaaS add-on). This is a HIPAA boundary, not a technical shortcut.

- **Not a code editor — and no code export.** Users never see, edit, or download source code. There is no "eject to Expo project" button in v1. The moment users can edit code, the product becomes a half-finished IDE and the *no slop* promise collapses. This restriction applies to *code only*. The configuration schema (`noslop-config.json`) is always exportable by design — a future renderer or BaaS integration can read it and reconstruct the app independently of NonSlop's own infrastructure.

- **Not a full App Store submission pipeline.** *"Publish My App"* in v1 means the app is live and shareable — it does not mean automated submission to the Apple App Store or Google Play. Distribution mechanics (TestFlight, a direct install link, or eventual store submission) are handled outside the wizard. The clinician's job inside NonSlop ends when they tap *Publish*.

- **Not a replacement for EHR / PMS systems.** NonSlop does not integrate with any clinical record system at launch — whether that's a large EHR platform or a specialty-specific practice management tool. The apps it builds are patient-facing layers — booking, reminders, education, simple messaging — not clinical documentation.

- **Not an unconstrained AI generator.** There is no LLM that invents new screens or new features on demand. The catalog is and remains hand-curated from audits of real healthcare apps — that is the moat. Every screen earns its place by showing up in real, successful apps of its specialty. The LLM layer operates exclusively *inside* the catalog schema: it personalizes sequencing, register, and phrasing, but it cannot generate structure or extend the catalog on the fly. The user-facing offer is never *"describe your app and we'll generate it"* — it is *"here is what the best apps in your specialty include; the LLM helps you make it yours."* See Key Insight 6.

---

## 5. Where To Start

For any agent or contributor picking this project up:

**The instinct is to look at the code. Resist it.**

The wizard scaffolding is settled. What is not settled — and what determines whether this product has a moat — is the quality of the template catalog. The catalog is the product. Every proven-pattern claim, every screen, every default feature, every percentage badge must be earned by real research into real apps used by real clinicians.

The catalog lives in [`catalog/`](./catalog/). Three specialties are currently scaffolded — all percentage badges are `[UNVERIFIED: placeholder, 2026-04-15]` and no app audits have been conducted yet. The schema for a catalog page is in [`catalog/_schema.md`](./catalog/_schema.md).

**Three catalog operations — in this order, always:**

1. **Audit** — Read apps deployed in a specialty. Source: app store listings, candidate source list on each catalog page, clinician advisory contacts. Output: one `AUDIT` entry per app in `log.md`, naming the app, specialty, screens observed, and features noted. This step creates new knowledge. It cannot be skipped or approximated.

2. **Validate** — For every `[UNVERIFIED: placeholder, 2026-04-15]` badge, locate a named, checkable source in the audit log or public literature. Update the badge to `[VERIFIED: source]`. Log a `VALIDATE` entry. No badge moves without a log entry. No estimate, no approximation: if you cannot name the source, the badge stays `[UNVERIFIED]`.

3. **Lint** — Monthly health check. Scan for: `[UNVERIFIED]` badges whose date stamp is older than 30 days (every `[UNVERIFIED]` tag must carry a creation date in the format `[UNVERIFIED: placeholder, YYYY-MM-DD]` — a badge without a date is automatically a Lint failure), specialty pages with zero AUDIT log entries, percentages in `idea.md` that contradict catalog badges, orphan screens (in catalog but unreferenced by any wizard step), and cross-specialty candidates (screens flagged in ≥2 specialty audits but absent from a third specialty's catalog page). Log a `LINT` entry. Every lint finding is a research debt item — not a code item.

These three operations map directly to `log.md` entry types: AUDIT, VALIDATE, LINT. If an action cannot be logged under one of these three types, it is not a catalog operation.

**The compounding mechanic — why each audit enriches the whole, not just one specialty:**

Every AUDIT log entry is compared against all existing AUDIT entries across all specialties, not just the one being updated. When a screen appears in audits of ≥2 different specialties, it earns a `cross-specialty` flag in the catalog. That flag propagates forward: every specialty page that does not yet reference that screen gets it added to its "cross-specialty candidate" list for the next Audit pass. An auditor reviewing `dentist.md` who finds that "appointment reminders" also appears in `cardiologist.md` and `nurse.md` audits has found a cross-specialty signal — not merely a dental pattern. The signal means the screen is likely structural to patient-facing care broadly, not specialty-specific. This changes its default weight in the wizard.

The catalog compounds because new audits query the whole structure, not just the specialty being researched. A catalog with 3 audited specialties is not three times more valuable than a catalog with 1 — it is structurally richer in proportion to the cross-specialty patterns it can surface. This is the same compounding property Karpathy identifies in LLM wikis: each new source retroactively enriches all prior knowledge, because the cross-reference surface grows faster than the source count.

The highest-value work is:

- **Audit** apps already deployed in a specialty. Each specialty page has a candidate source list. Start there.
- **Validate** every percentage claim. "90% of apps in this specialty include this screen" should be a measurable observation, not an estimate. Change the status tag from `[UNVERIFIED: placeholder, 2026-04-15]` to `[VERIFIED: source]` only when you have a named, checkable source.
- **Extend** — when a new specialty is ready to be added, the research comes first. A new specialty is a content artifact before it is a code change.
- **Prune** — remove features nobody uses. Remove screens that turned out not to be universal. The catalog only works if it's honest.
- **Log everything** — every audit session, every source read, every percentage resolved goes in [`log.md`](./log.md). If it didn't happen in the log, it didn't happen.

The code is the scaffolding. The catalog is the building. **When in doubt, spend time on content, not scaffolding.**

---

## 6. Why Now

- **Patient expectations shifted permanently in 2020–2022.** Telehealth usage jumped from 0.1% of all patient visits in 2019 to 17% in 2023 `[VERIFIED: Rock Health Consumer Adoption Survey 2023]`; 8 in 10 patients report having used telemedicine, and 94% say they'd use it again `[VERIFIED: Rock Health 2022]`. Chains deliver this. Solo practitioners don't. The gap is visible and growing.
- **Mobile development has collapsed in cost.** Cross-platform tooling (React Native / Expo) reduces development and maintenance cost by 30–40% vs. native builds `[VERIFIED: Rubix Studios industry report 2024]` — an app costing $150k native can be built for ~$60k with Expo `[VERIFIED: Natively.dev 2024]`. The bottleneck is no longer engineering — it's the UX decisions that precede it. That's exactly what NonSlop removes.
- **HIPAA tooling has matured.** BAA-friendly cloud hosting, audit-log-as-a-service, compliant storage primitives. A solo practice can, in principle, run HIPAA-compliant infrastructure without an in-house compliance officer — if someone packages it correctly.
- **LLMs can generate UI copy but produce generic slop.** This is the inflection NonSlop is betting on. Generalized AI tools can build *something*, but what they build is indistinguishable across specialties — and in healthcare contexts, actively dangerous: LLMs repeat or elaborate on clinical errors in up to 83% of adversarial test cases `[VERIFIED: Nature Communications Medicine 2025]`. **Curation — the opposite of generation — is the new moat.** The name is the thesis.

- **The "Company Brain" wave is cresting — and healthcare is the worst domain to ride it without a human in the loop.** YC's Summer 2026 Requests for Startups explicitly names "Company Brain" (fragmented organizational knowledge → structured → AI-executable) as a priority investment thesis. The infrastructure for this wave — model capability, MCP, persistent memory, context providers — matured in 2025–2026. Open-source implementations (Scout, agno-agi) already exist. NonSlop is not a general Company Brain. It is a **specialty-specific Clinical Brain** that applies the same compounding-knowledge pattern to a domain where the stakes of getting it wrong are measured in clinical outcomes, not sprint velocity. That domain specificity — and the HITL audit layer it demands — is a natural defensibility that horizontal Company Brain tools structurally cannot offer.

- **The specialty-first template pattern is validated outside healthcare.** The core NonSlop bet — that specialty-specific defaults outperform generic builder flexibility — is already confirmed in adjacent domains. Shopify's industry-specific onboarding paths (retail, restaurant, services) produce measurably higher store-setup completion than generic setup flows `[STRUCTURAL: pattern validation — Shopify Merchant Success blog 2023]`. Wix reports that vertical-specific template users (restaurant, salon, portfolio) reach site-launch at significantly higher rates than users starting from a blank canvas `[STRUCTURAL: Wix Partner Day findings 2022]`. Figma Community specialty-filtered templates (mobile UI, design systems, presentation) dominate individual-template download counts over generic templates. In every domain that has tried it, *specialty-first beats general-purpose for non-expert builders*. Healthcare has not had a specialty-native no-code option until now — the pattern is externally validated; the domain is unaddressed.

---

## 7. Who Benefits

- **Primary — any clinician running a patient-facing practice**, in any specialty the catalog supports. The common thread is not the specialty — it's a clear workflow problem and zero technical background. These users self-serve through the wizard.
- **Secondary — clinic managers and practice owners** who need a rapid MVP to show a partner, a franchise evaluator, or a potential investor. A NonSlop-built app lets them demo *"what we'd offer patients"* without procuring engineering.
- **Tertiary — residency programs and health-tech educators.** A program teaching clinicians about digital health can use NonSlop as a hands-on lab: students walk through the wizard and compare their choices, seeing firsthand which screens are *proven* vs. *niche* inside their field.
- **Indirectly — the patients themselves.** Patients of small clinics currently get a worse digital experience than patients of chains. A clinic running a NonSlop-built app gives them a professional, specialty-appropriate experience they've come to expect from larger providers.

- **Emerging — the peer community.** As the My Apps library fills with real configurations from real clinicians, the social feed becomes a discovery surface that has never existed in clinical UX: a specialty-filtered, practitioner-curated repository of what actually works in patient-facing mobile apps. A physiotherapist browsing cardiology configurations to benchmark her own digital strategy; a dentist studying how another practice structures onboarding — this cross-specialty peer learning is a compounding asset that grows with every configuration shared.

---

## 8. Constraints

- **HIPAA envelope.** No PHI in the wizard. No PHI in logs. No PHI in device storage. The build process must be verifiably zero-PHI by inspection — not as a trust statement.
- **112-second UX budget.** Every feature the team wants to add is evaluated against this: does it fit inside 112 seconds, or does it push the median past 2 minutes? If yes, it's cut, deferred, or moved to an optional "advanced" flow. The swipe-native wizard (Key Insight 8) is budget-neutral by design: style onboarding replaces the specialty confirmation step; swipeable component cards replace the checkbox feature list. Neither adds a new phase — each substitutes for an existing one. Any future extension of the swipe layer must satisfy the same substitution constraint before it ships.
- **Mobile-native, end-to-end.** NonSlop is itself a native mobile application (React Native / Expo). The wizard, the My Apps library, the social feed, and the generated app preview all run on the same device. There is no web portal, no separate laptop step, no QR handoff. The entire experience — from specialty selection through prototype review through community browsing — must be thumb-navigable and performant on mid-range mobile hardware. **Target device baseline:** mid-range Android (Qualcomm Snapdragon 680 class, 4 GB RAM) and iPhone 12 or equivalent. The 112-second budget is validated against these devices, not flagship hardware. Animation complexity must degrade gracefully on older or constrained devices before touch latency is allowed to degrade — visual fidelity is a cost; responsiveness is not negotiable. This is not a "mobile-first" design preference; it is a platform commitment. The clinician lives in their phone; NonSlop meets them there.
- **One specialty at a time — catalog growth is research, not code.** The initial catalog covers a small number of pioneering specialties, chosen to prove the pattern. Every additional specialty is a research project *before* it is a code change. No specialty ever ships on "plausible" content. The ceiling on how many specialties NonSlop supports is the ceiling on how much clinical-UX research the team has actually done.
- **Three-layer catalog architecture.** The catalog is not a flat file collection. Its mutability is architecturally tiered:
  - **Layer 1 — Sources (immutable):** All research, audit sessions, and resolved percentages are logged in `log.md` as append-only entries (INGEST, AUDIT, VALIDATE). A source is never edited in-place; it is superseded by a new log entry with a later date.
  - **Layer 2 — Catalog (schema-constrained mutable):** Pages in `catalog/` are agent-editable only within the schema defined in `catalog/_schema.md`. No percentage badge may move from `[UNVERIFIED]` to `[VERIFIED]` without a corresponding Layer 1 entry. No field may contain a claim not derivable from at least one log entry.
  - **Layer 3 — Schema (release-gated immutable):** `catalog/_schema.md` defines permitted fields, value vocabularies, and status transitions. The schema changes only in deliberate releases — never during a catalog update pass.

  **Catalog health rules (falsifiable).** A catalog update pass is valid if and only if all of the following hold: (a) every `[VERIFIED]` badge has a corresponding `VALIDATE` entry in `log.md` referencing a named, dated, publicly checkable source; (b) no specialty page reaches `status: verified` with fewer than 3 distinct `AUDIT` log entries from different source apps; (c) no percentage claim diverges more than 10 percentage points from the mean across the AUDIT entries supporting it. A pass that violates any of these rules is not a catalog update — it is a draft. These rules are not aspirational; they are the definition of what *done* means for a catalog entry. A future CI lint step will enforce them automatically; until then, the Lint operation (see Section 5) enforces them manually.

- **No real user data at build time.** Apps are populated with sample content only. A clinician cannot upload a real patient list into NonSlop. This is both a HIPAA decision and a UX decision (upload flows would destroy the 112-second budget). The exportable output is the `noslop-config.json` configuration artifact — it describes the app's structure and choices, contains zero patient data, and is designed to be reloadable so the clinician can resume or update their app at any time.

---

## 9. Risks

- **Template quality collapse.** The entire value proposition rests on *"these are proven patterns."* If the percentages are fabricated or the catalog is shallow, word-of-mouth will expose it fast. Clinicians talk to each other. The moat is only as deep as the research.
- **Regulatory drift.** HIPAA and US state-level health regulations evolve. A catalog marked "HIPAA-ready" in 2026 must be re-validated annually at minimum. This is ongoing maintenance, not a one-time cost.
- **Specialty expansion pressure.** NonSlop's promise creates immediate pull from every clinician whose specialty isn't yet in the catalog. When they arrive and find nothing for their field, they churn — and they tell peers. The temptation to rush-add specialties without research is the number-one existential risk. The correct answer, against almost every growth instinct, is *"not yet — not until the catalog is real."*
- **Perceived templatization.** If the clinician walks away feeling *"I just clicked through a template,"* retention and word-of-mouth suffer. The customizer must feel like design, not configuration. The active mitigation is the peer-signal mechanism described in Key Insight 2: at each step the clinician sees specialty-specific data that frames their confirmation as a *decision*, not a click-through. This is subtle, measurable via qualitative interviews, and worth protecting deliberately.
- **Platform dependency.** NonSlop's mobile build pipeline depends on the React Native / Expo ecosystem. A major breaking change in that stack would affect both the wizard and the output apps simultaneously — not just the delivery layer. A contingency plan and pinned dependency strategy are required before this product goes load-bearing for real clinics.
- **"No-code wall" churn.** No-code tools have a history of losing users once real needs outgrow them. If a clinician hits a wall — *"I want this one extra feature"* — and has no path forward, they churn. The v2 question is how to provide a graceful escape valve without breaking the "no code export" principle of v1.

- **Social layer quality degradation.** The community feed is only valuable if the configurations shared to it are worth emulating. Low-quality shares, specialty misclassification, or vanity publishing (sharing a draft that was never used by real patients) will erode trust in the peer signal. Moderation strategy and quality signals — verified specialty credentials, active patient usage, recency — must be designed before the social layer opens to wide use.

- **LLM presentation drift within catalog bounds.** The LLM layer that personalizes wizard copy and sequencing may drift toward generic phrasing or hallucinate specialty-specific terminology even while nominally staying inside catalog constraints. The mitigation is strict catalog anchoring: the LLM selects and sequences from a fixed, schema-validated vocabulary; it cannot emit tokens outside that vocabulary. Regular audits of LLM output against the catalog schema are required to detect drift before it reaches clinicians.

---

## 10. Open Questions

- **How do we honestly source the "proven pattern" percentages?** Public app-store scraping? A partner advisory board? A clinician survey? A pay-for-access audit vendor? The answer shapes what we can defensibly claim, and it shapes credibility with every skeptical clinician. → *Tracked in each specialty catalog page under "Audited Sources."*

- **How do we validate the concrete numbers in the Problem section?** The claims about cost of dev agencies ($15k–$60k `[UNVERIFIED: placeholder, 2026-04-15]`) need citation before being made publicly. → *File sourced replacements back to this document and remove the `[UNVERIFIED]` tag.*

- **Should v2 offer a code eject?** The question is worth reframing: the right escape valve is not *"eject to code"* but *"can another renderer consume the config schema?"* The `noslop-config.json` artifact is designed to be readable by any framework that implements the schema. This sidesteps vendor lock-in without breaking the no-code promise and without inviting bad-faith build-and-export usage. The real v2 question is whether to document and stabilize the schema as a public spec, or keep it internal.

- **Who owns template maintenance long term?** Three plausible models: (a) an in-house medical-UX team, (b) rotating advisory boards per specialty, (c) open community pull requests with gatekeeping. Each has very different cost and quality implications. → *Decision needed before first specialty reaches `status: verified`.*

- **Monetization model.** One-time license? Subscription per clinic? Per-app hosting fee? Free during beta with a paid BaaS add-on later? The wizard UX is indifferent to the answer, but the brand positioning is not — *"no credit card required"* is load-bearing today.

- **When does multi-language land?** The target market includes non-English-speaking clinicians (Turkish dentists are a live example in this project's context). The wizard copy is currently English. At what user count does internationalization become the top priority? → *Tracked in [`catalog/dentist.md`](./catalog/dentist.md) Open Questions (Turkish locale specifics).*

- **Relationship with real patient data, ever?** v1 says *never*. v2 might need a story — even if that story is *"bring your own compliant backend, here is a reference integration."* The silence is fine today; it will not be fine forever.

- **Social feed moderation at scale.** Who decides whether a shared configuration is "good enough" to surface to peers? Automated quality signals (specialty verified, app actually published, recency) can carry the early load — but at what point does the community need human review? And who does that reviewing: Nonslop staff, a specialty advisory board, the clinicians themselves via peer voting?

- **LLM model selection and update policy.** The LLM layer that drives wizard personalization must be pegged to a specific model version to avoid silent behavior changes between releases. When the underlying model is updated, the catalog anchoring logic must be re-validated before the new model ships to clinicians. What is the validation protocol, and who owns it?

- **My Apps persistence across devices.** If a clinician saves five prototypes on their phone then switches to a tablet, do their apps follow them? v1 localStorage means no — the library is device-local. A cloud sync story (even a minimal one) is load-bearing for any clinician who considers the library their working document. When does this become the top infrastructure priority?

---

## 11. Success Criteria

Concrete signals that the thesis is working. These are **targets**, not current state. Measurements are logged in [`log.md`](./log.md) as they are collected.

**Primary metric — device-normalized interaction count:** The wizard completion budget is expressed as deliberate touch interactions from specialty selection to *Open App* tap. Interaction count is hardware-independent — it measures wizard complexity, not hardware speed, making it comparable across device classes the way bits-per-byte is comparable across vocabulary sizes. The ceiling is derived from the 112-second floor: at a realistic deliberate-touch cadence of one interaction per 5–7 seconds, ≤ 112 seconds maps to a budget of **≤ 20 deliberate touches on the critical path**. Any design that requires more than 20 touches is too complex regardless of device — the fix is wizard simplification, not hardware upgrade. **Hardware floor:** on target-class devices (Snapdragon 680 / iPhone 12), ≤ 20 interactions must also complete in ≤ 112 seconds. If interaction count is within budget but time is exceeded, the problem is animation or load latency — a rendering issue, not a UX complexity issue. The two sub-metrics diagnose different failure modes. All other metrics below are *diagnostic* — they identify *why* the primary metric is or is not being met.

- **Completion rate.** ≥ 80% of users who start the wizard reach the final build step. Drop-off greater than 10% at any single step is a redesign trigger. *[No baseline yet — first measurement session needed.]*
- **Median time on task.** ≤ 112 seconds from specialty selection to *Open App*, measured end-to-end in one session. A median above 2 minutes means the flow is too heavy and something has to be cut. *[No baseline yet.]*
- **Pattern score distribution.** ≥ 70% of completed apps achieve a pattern score of 85 or higher. Consistently low scores mean users are ignoring the defaults — a sign the defaults (or the score itself) need work. *[No baseline yet.]*
- **Open App rate.** ≥ 70% of completers tap *Open App* to navigate through their generated app. Because the preview is on the same device, friction is near zero — a rate below 70% signals a trust problem upstream, not a friction problem at the final step. *[No baseline yet.]*
- **NPS among completers.** ≥ 50. The standard test for *"would you tell another clinician about this?"* *[No baseline yet.]*
- **Qualitative.** In user interviews, the recurring sentence should be something like *"this was the first time building an app felt like design, not engineering."* If we hear *"it was easy"* but not *"it was mine,"* the customizer is templating too hard and losing the ownership moment. *[No interviews conducted yet.]*

**Claim freshness policy.** Percentage badges in the catalog are re-validated each time a specialty page moves from `draft` to `verified`. HIPAA compliance claims are re-validated annually (minimum). Problem-section statistics ($15k–$60k agency cost, etc.) are re-validated before any public-facing use.

**First validation commitment.** All baselines above are pending the first instrumented user session. The product thesis cannot be confirmed or refuted until a clinician who does not know the team completes the wizard unassisted. That session — its duration, its drop points, and the clinician's qualitative reaction — is the first real evidence this document does not yet have. It takes priority over all catalog expansion, all feature additions, and all code refactors. Every week without a first session is a week the primary metric remains a hypothesis.

---

## 12. Context / References

**Direct inspiration**
- Andrej Karpathy, [`autoresearch`](https://github.com/karpathy/autoresearch) — the `program.md` pattern: *describe the thing to build in Markdown, not code.*
- Andrej Karpathy, [LLM Wiki gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) — the *"persistent, compounding artifact"* framing that applies equally to this document.
- [`pithpusher/IDEA.md`](https://github.com/pithpusher/IDEA.md) — the vendor-neutral idea-file standard this document follows.

**UX references — apps the catalog draws from**
- Patient-facing apps across deployed clinical specialties, audited for screen structure and feature patterns. Specific references live in the catalog itself, where they are relevant — not here.
- Booking and onboarding UX patterns from consumer health apps inform the wizard's rhythm.

**Philosophical prior art**
- Vannevar Bush's 1945 *Memex* essay — curated personal knowledge with meaningful connections between documents — is the deep ancestor of every "proven pattern" approach.

**Technical stack**
- Native mobile application (React Native / Expo). NonSlop is itself a mobile app: wizard, My Apps library, social feed, and generated app preview all run natively on the clinician's device. The clinician completes the wizard, taps *Open App* to navigate the live prototype, saves it to My Apps, optionally shares it to the community feed, and publishes when ready. No web portal. No QR handoff. No desktop step. See `PROGRAM.md` for stack specifics.

**Sibling documents in this repo**
- [`AGENTS.md`](./AGENTS.md) — constraints and reminders for agents working in this codebase.
- [`PROGRAM.md`](./PROGRAM.md) — implementation scope, file-level build status, design tokens.
- [`CLAUDE.md`](./CLAUDE.md) — re-exports `AGENTS.md` for Claude-family agents.
- [`catalog/_schema.md`](./catalog/_schema.md) — schema and vocabulary for specialty catalog pages.
- [`catalog/dentist.md`](./catalog/dentist.md) — Dentist specialty catalog (status: draft).
- [`catalog/cardiologist.md`](./catalog/cardiologist.md) — Cardiologist specialty catalog (status: draft).
- [`catalog/nurse.md`](./catalog/nurse.md) — Nurse specialty catalog (status: draft).
- [`log.md`](./log.md) — append-only research and activity log.

---

---

## 13. YC Application Context

*This section is written for Y Combinator's Summer 2026 application. It is not a pitch deck — it is the honest, checkable version of what NonSlop is, for a reader who will ask hard questions.*

**One-liner**
NonSlop is a specialty-native no-code mobile app factory for independent clinicians — with a human-audited Clinical Brain at the core that makes every generated app provably non-slop.

**Market**
The AMA's 2022 Physician Practice Benchmark Survey reports that 49.1% of US physicians practice in groups of 10 or fewer `[VERIFIED: AMA Physician Practice Benchmark Survey 2022]`. Against a total active physician count of approximately 985,000 `[VERIFIED: AMA Physician Workforce Report 2023]`, this yields roughly **483,000 physicians in small or solo practices** — the primary NonSlop segment. Add the adjacent independent-practice population: ~126,000 dentists in solo or small-group settings `[VERIFIED: ADA Health Policy Institute, Dentist Workforce Report 2023]`, ~48,000 physical therapists in private practice `[VERIFIED: APTA Workforce Analysis 2022]`, and comparable cohorts in chiropractic, optometry, and independent mental health. **Total addressable US market: approximately 700,000–800,000 clinicians** operating without the institutional IT resources that generate patient-facing mobile apps as a matter of course.

At $49–$99/month per publishing clinic, even 1% penetration of the physician segment alone (~4,800 clinics) represents $2.8–$5.7M ARR. The beachhead is the specialty catalog: each specialty added compounds the addressable cohort multiplicatively, not additively — a dentist catalog opens a different referral network than a cardiology catalog, and both are independent word-of-mouth surfaces. International expansion (Turkey, EU) adds a second wave addressable market without catalog rebuild — only locale and regulatory adaptation.

**Revenue model**
Subscription per clinic. Free tier: unlimited prototyping, My Apps library, community browsing. Paid tier ($49–$99/month): publish to patients, cloud sync across devices, verified specialty badge on the community feed. No upfront cost, no credit card required for the wizard. Revenue begins when the clinician decides the app is good enough to share with real patients — which is the same moment they are most likely to pay.

**Why this team**
`[TO BE FILLED — founders, clinical advisory contacts, relevant expertise.]`

**Why YC**
YC's Summer 2026 RFS names "Company Brain" as a priority. NonSlop is the clinical-domain answer to that thesis — with the HITL layer that makes it defensible in the one sector where AI-assembled knowledge without human validation creates direct patient risk. The catalog infrastructure maps directly onto the three-layer LLM-wiki architecture (immutable sources → schema-constrained mutable catalog → release-gated schema) that YC-backed companies in adjacent domains are converging on independently. We are building the same primitive, in the hardest domain, with the moat already partially constructed.

**What we need from YC**
Clinical advisory introductions (to accelerate catalog audit across 3–5 additional specialties), US healthcare regulatory guidance (HIPAA BAA partnership vetting), and distribution into the medical education and residency-program channel identified in Section 7.

---

*This file is a living artifact. When the thesis, the boundaries, or the proven-pattern catalog shifts meaningfully, update the `updated` frontmatter date and the affected section — don't rewrite history, and don't let it go stale.*
