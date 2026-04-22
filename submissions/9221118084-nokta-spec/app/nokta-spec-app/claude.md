# CLAUDE.md

## Project Name

NOKTA Spec

## Project Type

Mobile application built with Expo React Native + TypeScript

## Assignment Context

This project is being built for a university class assignment based on the **NOKTA** repository:

- Original repo: `https://github.com/seyyah/nokta`
- This submission must be placed inside:
  `submissions/<student-number>-<slug>/`

Example:
`submissions/20210123-nokta-spec/`

The project must be submitted as part of a forked version of the NOKTA repository.

---

## Assignment Goal

The assignment asks students to choose **one of three tracks** and build a working mobile app prototype.

This project uses:

## Chosen Track

**Track 1 — Idea Clarifier / Spec Generator**

### Track 1 definition

The app takes a rough idea in **text or voice**, asks the user **3–5 engineering questions** about:

- the problem
- the target user
- the scope
- the constraints

Then it generates a clean **one-page product spec**.

---

## What the app should do

The app helps users turn rough and messy ideas into structured product specs.

### Main user flow

1. User enters a rough idea using text input or voice input
2. The app generates 3–5 clarifying engineering questions
3. The user answers those questions
4. The app generates a polished one-page spec

---

## Product Positioning

This should feel like an **AI idea refinement assistant** for:

- students
- founders
- builders
- hackathon participants
- early-stage product thinkers

Tone of the app:

- smart
- calm
- modern
- supportive
- structured
- demo-friendly

This is not a playful app.  
It should feel like a clean startup-style productivity / AI assistant tool.

---

## Design Source of Truth

There is an existing design file for this project.

Claude must treat the design as the primary visual reference and implement the mobile app to match it as closely as possible.

Match the design in terms of:

- layout
- spacing
- typography hierarchy
- button hierarchy
- cards
- colors
- border radius
- visual rhythm
- screen structure
- overall feel

Do not replace the design with a different aesthetic.

---

## Core Screens to Build

### 1. Welcome / Home Screen

Must include:

- app name: **NOKTA Spec**
- subtitle or tagline
- mention of chosen track:
  **Track 1: Idea Clarifier & Spec Generator**
- short product description
- primary button: **Start**
- secondary button: **View Sample**

### 2. Idea Input Screen

Must include:

- multiline input for raw idea
- clear placeholder text
- helper text explaining what the AI will do
- microphone / voice input button
- validation if the input is empty
- primary button: **Generate Questions**

### 3. AI Questions Flow

Must include:

- 3 to 5 clarifying engineering questions
- progress indicator
- current question card
- answer input
- back / next controls
- final button to generate spec

Question themes should include:

- problem
- target user
- MVP scope
- constraints
- exclusions / what not to build in version 1

### 4. Generating Spec Screen

Must include:

- polished loading UI
- dynamic loading messages
- a strong “AI is thinking” feeling

Example loading messages:

- Analyzing idea
- Structuring scope
- Drafting one-page spec

### 5. Final Spec Screen

Must display the generated spec in clean sections:

- Problem
- Target User
- Solution Summary
- MVP Scope
- Constraints
- Key Assumptions
- Suggested Features
- Risks / Open Questions

Must include actions:

- Copy Spec
- Save
- Regenerate
- Start New Idea

### 6. Optional History Screen

Should show previously generated specs saved locally.

Each history item should show:

- title
- timestamp
- preview snippet

Tapping an item should reopen the saved spec.

---

## Voice Input Requirement

The assignment says the user can give the rough idea in **text or voice**.

Therefore the app should visibly support both:

- text input
- voice input

### MVP expectation for voice

Voice support does not need to be production-perfect.

Preferred approach:

- show a microphone button in the UI
- if speech-to-text is implemented, transcribe the user’s speech into the idea field
- if speech-to-text is not yet fully implemented, provide a polished placeholder or fallback message

Fallback message example:
“Voice input is planned for the next version. Please type your idea for now.”

Voice should not block the main app flow.

---

## Technical Requirements

### Stack

Use:

- Expo
- React Native
- TypeScript

Preferred:

- Expo Router, if it fits cleanly
- otherwise React Navigation

Use local mock AI logic first so the app works without a backend.

The project should run with:

```bash
npm install
npx expo start
```
