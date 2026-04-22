# nokta ‧ — Dedup & Idea Cards

> **Track C** — Nokta Assignment Submission

---

## What the App Does

Nokta takes messy, unstructured notes — WhatsApp exports, bullet lists, stream-of-consciousness dumps — and turns them into clean, deduplicated idea cards.

**Flow:**

```
Paste messy text  →  [Process]  →  Clean idea cards
```

Duplicates are removed intelligently: "- Buy Milk", "buy milk", and "• buy milk" are all treated as the same item.

---

## How to Run (Expo Go)

### Prerequisites

- Node.js ≥ 18
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (iOS / Android)

### Steps

```bash
# 1. Navigate to the app folder
cd submissions/2021xxxx-nokta/app

# 2. Install dependencies
npm install

# 3. Start the dev server
npx expo start

# 4. Scan the QR code with Expo Go
```

---

## APK Build Steps

See [`APK_BUILD_INSTRUCTIONS.md`](./APK_BUILD_INSTRUCTIONS.md) for the full guide.

Quick summary:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure build
eas build:configure

# Build APK (Android)
eas build --platform android --profile preview
```

---

## Demo Video

> 📹 (https://www.youtube.com/shorts/FdSDyLgnqho)


---

## Project Structure

```
submissions/2021xxxx-nokta/
├── README.md                  ← this file
├── idea.md                    ← problem framing & approach
├── APK_BUILD_INSTRUCTIONS.md  ← APK build guide
└── app/
    ├── App.tsx                ← entire app (single-file architecture)
    ├── app.json               ← Expo config
    ├── package.json           ← dependencies
    ├── tsconfig.json          ← TypeScript config
    └── babel.config.js        ← Babel preset
```

---

## Decision Log

| Decision | Why |
|---|---|
| Single-file architecture (`App.tsx`) | Assignment scope is small; reduces overhead, easier to review |
| No external libraries | Keeps install size minimal; all logic is native RN + Expo |
| Normalisation-based dedup | Handles bullet prefixes, case, and whitespace — covers real-world messy notes |
| Animated card reveal | Small UX improvement; staggered entrance feels polished without complexity |
| Monospace font for input | Visual cue that this is a "raw text" zone |
| No backend | Explicitly required by assignment; all processing is client-side |

---

## Track

**Track C — Dedup & Idea Cards**
