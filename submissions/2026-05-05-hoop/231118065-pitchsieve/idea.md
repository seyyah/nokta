# PitchSieve

## One-liner

Paste a startup pitch. Get back a skeptical read on whether the language says anything real.

## Why this should exist

A lot of startup writing is not fake exactly. It is softer than fake. It is language that gives the sensation of insight while dodging the burden of being specific. The pitch sounds ambitious, polished, and market-aware, but after reading it you still cannot answer basic questions:

- who exactly is this for
- what painful workflow is being fixed
- why this wedge is believable now
- what is actually different from the existing workaround

That gap matters. Early diligence is often less about finding the perfect company and more about filtering out rhetoric that hides weak thinking. PitchSieve is a compact machine for doing that first filter.

## What "slop" means here

In this product, slop is not bad grammar. Slop is language that expands confidence while shrinking precision.

Examples:

- broad audience words like "businesses" or "everyone"
- inflated verbs like "revolutionize" and "transform"
- buzzword padding like "AI-powered", "smart", or "end-to-end"
- giant market references with no wedge
- claims that sound strong but are hard to verify
- problem statements vague enough to fit ten different products

Low-slop pitches feel narrower. They sound like someone has actually sat with the workflow.

## User

The user is a skeptical reader under time pressure:

- student evaluating startup ideas
- founder trying to tighten their own pitch
- hackathon judge
- early-stage investor or scout doing first-pass filtering
- operator who wants to separate concrete ideas from deck theater

## Input / Output

Input:

- one startup pitch paragraph pasted into a mobile text box

Output:

- `slop score` from 0 to 100
- short critique tags
- readable reasons for the score
- an optional tighter rewrite suggestion

The key product decision is that this is a language-and-structure reader, not an investment oracle.

## Scoring dimensions

PitchSieve scores a pitch by looking for a handful of deterministic signals:

1. Audience specificity
2. Buzzword density
3. Hype verb density
4. Market-size handwaving
5. Unverifiable confidence claims
6. Problem framing quality
7. Differentiation clarity
8. Concrete workflow evidence

The scoring engine is intentionally simple. The app is making a legible argument, not hiding behind a mysterious model score.

## Why the app is useful

This is useful because pitch quality is often judged socially. A confident tone can borrow credibility from startup culture itself. PitchSieve pushes back by asking a narrower question: if you strip away performance language, is there still a concrete claim left?

That makes it useful both as critique and as coaching. Founders can tighten their wording. Readers can keep their skepticism sharp.

## MVP scope

The MVP is deliberately tight:

- one polished mobile screen flow
- local heuristic `analyzePitch(text)` function
- offline scoring
- result panel with score, tags, reasons, and rewrite
- one-tap example loading for demos

No accounts. No cloud sync. No backend. No external LLM call.

## Out of scope

- verifying whether market-size claims are factually true
- scraping websites, decks, or founders
- personalized investor recommendations
- storing pitch history in a backend
- voice input, team collaboration, or export workflows
- pretending the app can predict startup success

## 60-second demo plan

1. Open PitchSieve and show the single input screen.
2. Paste a very slopped-up pitch full of AI/buzzword language.
3. Tap `Analyze` and show the high score, tags, and reasons.
4. Highlight the rewrite suggestion and explain how it compresses the claim into something testable.
5. Tap `Analyze Another`, load the sharper example, and show the lower score.
6. End on the thesis: this app does not judge the company, it judges whether the pitch is hiding the company.
