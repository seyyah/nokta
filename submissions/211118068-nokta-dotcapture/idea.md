# Track A Idea File - Dot Capture & Enrich

## Working Product Name
Nokta Spec Pilot

## Raw Idea Input
"Small local cafes struggle to predict daily demand and waste food. I want a simple mobile tool that helps owners plan prep amount and menu focus using lightweight daily signals."

## Engineering Discovery Questions (3-5)
1. What exact planning decision should the app improve first (daily prep volume, menu mix, or staffing)?
2. Who is the primary user persona for MVP (owner, shift manager, or staff)?
3. Which minimum data inputs can users provide in under 2 minutes each day?
4. What constraints matter most in MVP (no POS integration, offline usage, low-end Android support)?
5. Which metric proves value in two weeks (waste reduction %, stockout reduction %, prep time saved)?

## Example Answers
1. First focus: daily prep volume recommendation for top 10 products.
2. Primary user: cafe owner or shift manager opening the store.
3. Inputs: yesterday sales summary, day type (weekday/weekend), expected weather category, local event flag.
4. Constraints: no external integrations in v1, must run on low-end Android, response under 5 seconds.
5. Success metric: at least 15% reduction in end-of-day waste for tracked products.

## One-Page Spec (Expected Output)
### Product Idea
A mobile assistant for small cafes that converts a rough operational idea into a concrete product plan through guided engineering questions.

### Problem
Cafe operators over-prepare due to uncertain demand, causing recurring waste and margin loss.

### Target User
Primary: independent cafe owner / opening shift manager.
Secondary: staff who perform prep planning.

### MVP Scope
- Input rough goal in natural language.
- App asks 5 structured engineering questions.
- User answers in short text fields.
- App generates a one-page implementation-ready product spec.

### Constraints
- Android-first support via Expo.
- No POS integration in MVP.
- Low setup complexity and minimal daily input burden.

### Success Metric
- 15% waste reduction for tracked SKUs over 14 days.
- At least 4/5 user-rated clarity on generated spec usefulness.

### First Sprint Plan
- Day 1-2: question engine + UI flow.
- Day 3-4: spec generation + fallback behavior.
- Day 5: test pass, demo script, APK packaging.

## Why This Track
Track A gives the strongest engineering narrative: idea intake -> clarification questions -> spec artifact. It demonstrates practical AI utility with measurable product framing.
