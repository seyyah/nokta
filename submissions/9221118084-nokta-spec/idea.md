# idea.md

## Project Title

NOKTA Spec

## Chosen Track

**Track 1 — Idea Clarifier / Spec Generator**

## One-Sentence Summary

NOKTA Spec is a mobile application that helps users turn rough ideas into clear one-page product specifications by asking 3–5 focused engineering questions and structuring the answers into an actionable spec.

---

## Problem

Many people have promising product or startup ideas, but those ideas usually begin in a vague and unstructured form.  
A user may know the general direction of the idea, but often cannot clearly define:

- what exact problem is being solved,
- who the real target user is,
- what should be included in the first version,
- what constraints exist,
- and what should be intentionally excluded from scope.

Because of this, early-stage ideas often remain unclear, too broad, or difficult to communicate. This slows down decision-making, product planning, and development.

---

## Proposed Solution

This project proposes a mobile-first AI-assisted idea clarification tool called **NOKTA Spec**.

The application accepts a rough idea from the user in **text or voice** form.  
Then, instead of directly generating a vague response, it asks the user **3–5 engineering-oriented clarification questions**. These questions focus on the most important foundations of a product idea:

- the problem,
- the target user,
- the MVP scope,
- the constraints,
- and exclusions for version one.

After collecting the answers, the app generates a clean **one-page product spec** that the user can read, save, and reuse.

---

## Why I Chose This Track

I chose **Track 1** because it is the most practical and product-oriented option among the three tracks. It solves a real problem that appears at the earliest stage of product thinking: people often have an idea, but they do not know how to structure it correctly.

This track is also a strong fit for a mobile app because:

- the user flow is clear and easy to understand,
- the app can be demonstrated quickly,
- the output is immediately useful,
- and the result feels like a real AI-assisted product tool rather than a static school exercise.

In addition, this track allowed me to create a focused MVP with a meaningful flow instead of trying to build too many disconnected features.

---

## Target Users

The main target users of NOKTA Spec are:

- students developing project ideas,
- founders or startup beginners,
- hackathon participants,
- indie developers,
- and anyone who wants to refine a raw idea before building it.

These users usually need help transforming an informal thought into a structured plan.

---

## Core User Flow

The application follows this flow:

1. The user enters a rough idea by typing or using voice input.
2. The app analyzes the idea and generates 3–5 clarification questions.
3. The user answers the questions.
4. The app generates a one-page structured spec.
5. The user can copy, save, or restart the process with a new idea.

This flow was intentionally kept simple so the product remains focused, understandable, and demo-friendly.

---

## Main Features

### MVP Features

- Rough idea input
- Voice input support or voice-input UI path
- AI-style question generation
- Guided answering flow
- One-page spec generation
- Save generated specs locally
- View sample demo flow
- Clean mobile UI suitable for Expo-based implementation

### Optional / Future Features

- stronger real AI backend integration,
- export to Markdown or PDF,
- idea history with search,
- multiple spec templates,
- collaborative refinement,
- and speech playback of generated output.

---

## Product Decisions

Several product decisions were made deliberately during the design of this project:

### 1. Mobile-first design

The project was built as a mobile application because the assignment explicitly asks for a mobile app prototype, and mobile also fits the quick capture-and-refine nature of raw ideas.

### 2. Focus on one strong flow

Instead of trying to support many unrelated workflows, the app focuses on one polished flow:
**idea → questions → answers → spec**.

### 3. One-page output

The final result is intentionally a one-page product spec because it is:

- concise,
- easy to read,
- easy to demo,
- and practical for early-stage planning.

### 4. Clarification before generation

The app does not immediately generate a final result from the raw idea. It first asks targeted questions. This makes the output more structured and more useful.

### 5. Text as primary, voice as support

Voice input is included because the assignment allows text or voice input, but text remains the safest and most reliable main interaction path for the MVP.

---

## What Makes This Project Useful

The value of NOKTA Spec is not simply that it “uses AI.”  
Its value is that it reduces ambiguity.

Instead of giving the user a generic answer, it helps them think through the missing parts of their idea. In this way, the app behaves more like an intelligent product-thinking assistant than a simple text generator.

This makes the project useful for:

- planning,
- pitching,
- scoping,
- and preparing ideas before actual development begins.

---

## Inspiration / Reference Logic

While shaping this project, I was influenced by the general idea that AI systems are most useful when they help users refine thinking, reduce ambiguity, and structure messy input into actionable output.

The project is built around the following principles:

- vague input should be clarified before final generation,
- AI should guide thinking instead of only producing text,
- useful outputs should be structured and actionable,
- and a good product tool should reduce uncertainty rather than add noise.

These principles strongly influenced the choice to make the app ask engineering questions before generating the final spec.

---

## Karpathy / Autoresearch Reference Summary

While preparing this idea, I used the broader logic found in AI-assisted product and research workflows often associated with thinkers such as **Andrej Karpathy** and systems like **Autoresearch**.

### Summary of the reference perspective

A recurring idea in these materials is that AI becomes more powerful when it is used as a tool for:

- organizing messy information,
- refining vague intent,
- asking better intermediate questions,
- and helping humans move from rough thought to structured output.

Instead of treating AI as a final-answer machine, these approaches treat it as a collaborator in the reasoning and structuring process.

### How this influenced my project

This influenced NOKTA Spec in several ways:

- The app does not jump directly to a final result.
- It first asks focused clarification questions.
- It helps the user think in terms of problem, user, scope, and constraints.
- The final output is structured and practical rather than purely conversational.

So the project reflects the idea that AI should help transform ambiguity into a usable product definition.

---

## Scope of This Submission

This submission focuses on delivering a strong MVP for Track 1.

Included in scope:

- mobile app prototype,
- guided idea clarification flow,
- one-page spec generation,
- local/demo-ready logic,
- and a user experience suitable for a short class demo.

Not included in scope:

- full production backend,
- advanced collaboration features,
- complex account systems,
- and highly specialized domain-specific prompting.

These were intentionally excluded to keep the project focused and realistic for the assignment.

---

## Expected Outcome

The expected outcome of this project is a mobile tool that helps users move from:
**“I have an idea, but it is messy”**
to
**“I now have a clear first product spec I can build from.”**

This makes the app suitable for students, builders, and anyone who needs a practical first step between idea and execution.

---

## Conclusion

NOKTA Spec is a focused Track 1 submission that addresses a real problem in early-stage product development: the difficulty of turning vague ideas into structured plans.

By combining rough idea input, clarification questions, and one-page spec generation in a mobile-first experience, the app provides a practical and understandable AI-assisted workflow. The project was intentionally designed as a clean MVP that is easy to demo, useful in practice, and aligned with the NOKTA assignment requirements.
