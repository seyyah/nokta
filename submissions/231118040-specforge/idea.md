# SpecForge

## 1. Identity

SpecForge is a mobile idea-to-spec tool for people who have a promising concept but do not yet have a crisp engineering brief. It accepts a raw text idea or a pasted voice note transcript, asks 5 focused engineering questions, and converts the result into a one-page product spec.

The product is not a general chatbot. It is not a note-taking app. It is not a market research assistant. Its job is narrower: reduce ambiguity before build time.

Primary users:

- students building hackathon or coursework projects
- founders exploring MVP ideas
- community leaders turning fuzzy requests into something engineers can estimate

## 2. Problem

Most early-stage ideas fail before engineering starts because the problem, user, scope, and constraints remain mixed together in one vague paragraph. People overestimate the value of inspiration and underestimate the cost of ambiguity.

The result is predictable:

- teams start building too early
- the first version tries to solve too much
- nobody knows which user the app is truly for
- success cannot be measured after the first sprint

SpecForge fixes that by forcing specificity in a short guided interview.

## 3. User Flow

### Input

The user begins with one of two modes:

- text idea
- voice transcript

### AI Interview

The app asks five engineering questions:

1. What is the painful moment?
2. Who feels it first?
3. What is the smallest v1 worth building?
4. Which constraints will kill adoption?
5. What signal proves this deserves a second sprint?

### Output

The app generates a one-page spec with:

- title
- one-liner
- north star
- problem
- primary user
- MVP scope
- constraints
- success signal
- build notes
- release checklist

## 4. Product Rules

- Every spec section must map back to either a user answer or an explicit AI assumption.
- The app should prefer clarity over creativity.
- The interview should feel short enough to finish in under 3 minutes.
- The final spec should be readable in under 60 seconds.
- Offline demo mode must work without any external API.

## 5. Non-Goals

- real-time speech-to-text transcription
- external LLM integration
- collaborative editing
- project management features
- database sync
- investor deck generation

## 6. Success Metric

Primary metric:

**A user can move from raw idea to a readable, buildable one-page spec in a single sitting without leaving the app.**

Supporting signs:

- all 5 questions are answered
- the generated spec is complete
- the output can be reused in a hackathon, sprint kickoff, or mentor review

## 7. Why This Track

Track 1 is the closest fit to NOKTA's idea maturation loop. The assignment asks for a system that starts from a raw spark and ends in a one-page spec. SpecForge does exactly that with a small, testable flow that is realistic to ship as an Expo app inside a submission folder.
