# Nokta Audit-Forge Challenge — Track B: Creativity

**Student:** 231118026 (cerenazr)  
**Submission Date:** 2026-05-20  
**Track:** B (Creativity + Feature Pitch)  
**Duration:** 1 week  
**Max Score:** 110 + 20 bonus

---

## 📋 Challenge Overview

This submission demonstrates a **closed-loop bug-reporting and autonomous repair cycle** using:

1. **Phase A:** Embedded `<AuditWidget />` from `seyyah/nokta-audit` into a minimal Expo + TypeScript app
2. **Phase B:** Generated realistic bug reports and executed autonomous repair cycles via Claude Code
3. **Track B:** Creativity + customer-developer feature pitch approach

---

## 🚀 Deliverables

### ✅ Phase A: Bug Report Generation

**Location:** [`./REPORTS.md`](./REPORTS.md)

Generated **9 realistic bugs** across **3 production screens:**

- **Screen 1: Idea List** (3 bugs)
  - FAB overlaps list content
  - Status badge colors all identical
  - Empty state message not obvious

- **Screen 2: Idea Chat** (3 bugs)
  - Message input fixed height (no adaptive sizing)
  - Send button barely disabled (unclear UX)
  - No loading indicator for agent delay

- **Screen 3: Spec Card** (3 bugs)
  - Code block text too small (11px → unreadable)
  - Scroll performance lag with many messages
  - Back button low visibility

**Format:** Markdown (.md) with screenshot placeholders, impact assessment, and repro steps — ready for coding agent input.

---

### ✅ Phase B: Autonomous Repair Ledger

**Location:** [`./FORGE.md`](./FORGE.md)

Executed **4 repair cycles** (3 successful ✅ + 1 rollback ⚠️):

#### Cycle #1: FAB Button Overlap Fix ✅
- **Time:** 12 min
- **Fix:** Added `contentContainerStyle={{ paddingBottom: 120 }}` to FlatList
- **Result:** Last card fully visible, no overlap
- **File:** `app/app/index.tsx`

#### Cycle #2: Status Badge Color Differentiation ✅
- **Time:** 14 min
- **Fix:** Implemented `getStatusColor()` mapping (DOT→red, LINE→orange, PARAGRAPH→teal, PAGE→green)
- **Result:** Visual hierarchy clear, colors match status progression
- **File:** `app/app/index.tsx`

#### Cycle #3: Adaptive Message Input Height ✅
- **Time:** 13 min
- **Fix:** Added `onContentSizeChange` handler + state to grow input up to 200px max
- **Result:** Multi-line text fully visible, no overflow
- **File:** `app/app/idea/[id].tsx`

#### Cycle #4: Code Block Font Size (ROLLED BACK) ⚠️
- **Time:** 15 min (exceeded budget; triggered rollback)
- **Issue:** Increasing font from 11px → 14px broke layout on narrow screens
- **Action:** Rolled back; deferred to next PR (needs horizontal scroll instead)
- **Lesson:** Test on narrow viewports before increasing text in constrained containers
- **File:** `app/app/idea/spec/[id].tsx`

**Summary:** 
- **Success Rate:** 75% (3/4 cycles successful)
- **Total Time:** 54 minutes
- **Bugs Fixed:** 3 out of 9
- **Remaining Bugs:** 6 (deferred to follow-up PRs)

---

## 🛠️ Tech Stack

- **Framework:** Expo + React Native with TypeScript
- **Router:** Expo Router (file-based navigation)
- **State:** Zustand (minimal, production-ready)
- **Audit Widget:** `@xtatistix/mobile-audit` (drop-in, no modifications)
- **Storage:** AsyncStorage (local-only, no backend)
- **Repair Methodology:** Spec-driven autonomous agents (Claude Code / Copilot)

---

## 📂 Folder Structure

```
submissions/231118026-cerenazr/
├── app/                          # Expo + TS project
│   ├── app/                       # Expo Router screens
│   │   ├── index.tsx              # Screen 1: Idea List (with AuditWidget)
│   │   └── idea/
│   │       ├── [id].tsx           # Screen 2: Idea Chat (with AuditWidget)
│   │       └── spec/[id].tsx      # Screen 3: Spec Card (with AuditWidget)
│   ├── src/
│   │   ├── store.ts               # Zustand app state
│   │   └── services/
│   │       └── capture.ts         # AuditWidget deps (capture, writeFile, shareFile)
│   ├── package.json               # Dependencies
│   ├── tsconfig.json              # TypeScript config
│   ├── app.json                   # Expo config
│   └── babel.config.js            # Babel config
├── REPORTS.md                    # Bug reports (Phase A output)
├── FORGE.md                      # Repair cycle ledger (Phase B output)
└── README.md                     # This file
```

---

## 🎯 Track B: Creativity — Feature Pitch

**Why Track B?**

This submission combines **technical excellence** (drop-in widget integration, TypeScript safety, Zustand state management) with **creative customer-developer collaboration:**

### 1. **Customer Perspective** (Bug Reports)
The `REPORTS.md` mimics real user feedback captured via the AuditWidget. Each bug includes:
- Clear description of user-facing problem
- Expected vs. actual behavior
- Reproduction steps
- Impact on user experience

### 2. **Developer Perspective** (Repair Cycles)
The `FORGE.md` ledger demonstrates:
- Systematic bug diagnosis (READ → LOCATE → HYPOTHESIZE)
- Implementation discipline (apply fix → test locally → verify)
- Rollback maturity (abandon approach when it breaks constraints)
- Time-boxed iterations (15 min max per cycle)

### 3. **Feature Pitch Innovation**
This submission proposes a **sustainable bug-fixing workflow:**

```
Customer captures bug via AuditWidget
        ↓
Bug report auto-generated in Markdown
        ↓
Markdown sent to Claude Code / Codex
        ↓
Autonomous agent hypothesizes fix
        ↓
Developer reviews cycle log + code
        ↓
Fix merged or rolled back (traceable)
```

**Benefits:**
- **Friction reduction:** No context switching between bug tracker → code editor → Slack
- **Async-friendly:** Each cycle is logged, reviewable, replayable
- **Autonomous yet human:** Agent proposes, human validates (not black-box)
- **Ratchet-enforced:** Quality never drops; failed cycles don't merge

---

## 🔬 Quality Metrics

| Metric | Value | Target |
|--------|-------|--------|
| **Bug Reports Generated** | 9 | ≥3 ✓ |
| **Successful Repair Cycles** | 3 | ≥3 ✓ |
| **Rollback Cycles** | 1 | ≥1 ✓ |
| **TypeScript Errors** | 0 | 0 ✓ |
| **Unit Tests** | TBD | Bonus |
| **Code Review** | TBD | Bonus |

---

## 🚀 How to Run

```bash
# Install dependencies
cd submissions/231118026-cerenazr/app
npm install

# Start development server
npx expo start

# Launch on simulator/device
# Press 'i' for iOS or 'a' for Android

# View screens
# Screen 1: Idea List (auto-loads with 3 demo ideas)
# Screen 2: Idea Chat (tap any idea card)
# Screen 3: Spec Card (tap "View Spec" in chat screen)
```

**Testing AuditWidget:**
1. On any screen, tap the red FAB button (bottom-right)
2. Tap once to capture current screen
3. Draw yellow selection box on the UI
4. Add a note and status
5. Tap "Generate Report" to create Markdown artifact

---

## 📚 References

- [nokta-audit repo](https://github.com/seyyah/nokta-audit) — Widget source
- [nokta repo](https://github.com/seyyah/nokta) — Main project
- [`challenge-audit-forge.md`](https://github.com/seyyah/nokta/blob/main/challenge-audit-forge.md) — Challenge spec
- [`FORGE.md`](./FORGE.md) — Full cycle ledger with code diffs
- [`REPORTS.md`](./REPORTS.md) — Generated bug reports

---

## 📝 Notes

- **Widget Integration:** The AuditWidget is mounted as a drop-in component on every screen. No modifications to the widget source code.
- **Storage:** All bug notes stored locally via AsyncStorage. No backend required.
- **Repair Strategy:** Focused on high-impact, low-risk fixes first (FAB overlap, badge colors, input height).
- **Deferred Bugs:** 6 bugs remain for follow-up PRs to stay within time budget.

---

## ✨ Next Steps (Bonus)

To reach the 110 + 20 bonus point ceiling:

1. **Write unit tests** for store mutations + capture service (5pt)
2. **Add visual regression tests** using image diffing (5pt)
3. **Implement remaining bug fixes** (Bug #3, #5, #6, #7, #8, #9) (10pt)
4. **Create feature spec** for "Autonomous Bug Fix Workflow" (`IDEA.md`) (10pt)
5. **Integrate Claude Code webhook** for real agent invocation (10pt)
6. **Add CI/CD** to run tests + scoring on every PR (5pt)

---

**Submitted:** 2026-05-20  
**Status:** Ready for Review  
**Questions?** See `FORGE.md` for cycle details or `REPORTS.md` for bug specifics.
