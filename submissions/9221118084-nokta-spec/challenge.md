---

## `challenge.md`

```md
# challenge.md

## Project Challenges and How They Were Addressed

This document explains the main challenges encountered while developing **NOKTA Spec** and how those challenges were handled during the project.

---

## 1. Turning a Rough Assignment Into a Real Product

### Challenge

The assignment description defined the general track, but it did not define the exact product behavior, UX flow, or implementation details. This meant I had to convert a short assignment description into a usable mobile product concept.

### Solution

I translated the assignment into a focused product flow:

**idea input → clarification questions → user answers → one-page spec**

This became the core of the app and guided the entire UI and development process.

---

## 2. Keeping the Scope Small Enough

### Challenge

It was easy to imagine many extra features, such as collaboration, account systems, cloud sync, exporting, different templates, and stronger AI integrations. Adding too many features would have made the app incomplete or messy.

### Solution

I limited the project to a strong MVP with one polished core flow. I focused only on the features needed to satisfy Track 1 and support a clean demo.

Included in the MVP:

- rough idea input
- clarification questions
- structured spec generation
- local save flow
- mobile UI

Excluded from the MVP:

- full backend
- authentication
- collaboration
- cloud sync
- advanced exports

---

## 3. Designing for Both Text and Voice Input

### Challenge

The assignment states that the user can provide the idea through text or voice. Supporting voice input can introduce technical and platform-specific complexity, especially in a student project with limited time.

### Solution

The app was designed so that text input remains the primary safe path, while voice support is included as part of the user experience and submission requirements. This preserves usability even if speech recognition is limited on a device.

This decision allowed the project to remain aligned with the assignment without making voice the single point of failure.

---

## 4. Making the AI Feel Useful Without a Full Backend

### Challenge

A production AI backend would add complexity, cost, and integration time. However, the app still needed to feel intelligent and complete during the demo.

### Solution

I used a local/mock AI logic approach for the MVP. The app simulates the useful behavior of:

- generating clarification questions,
- structuring user responses,
- producing a one-page spec.

This made the app fully demoable without depending on a live backend service.

---

## 5. Structuring a Good Final Output

### Challenge

A generated output can easily become too long, too vague, or too conversational. The teacher’s track requirement calls for a clear one-page spec, so the output needed a consistent structure.

### Solution

I organized the final result into fixed sections:

- Problem
- Target User
- Solution Summary
- MVP Scope
- Constraints
- Key Assumptions
- Suggested Features
- Risks / Open Questions

This improved readability and made the output look like a real product planning artifact instead of a generic AI response.

---

## 6. Building a Demo-Friendly Mobile Experience

### Challenge

The teacher requires a short demo video, so the app had to be understandable almost immediately. A confusing flow or overly complex UI would weaken the demo.

### Solution

I prioritized:

- clear screen hierarchy,
- strong button hierarchy,
- clean cards and spacing,
- minimal navigation complexity,
- and a simple guided flow.

The app was designed so that someone watching the demo can quickly understand what it does.

---

## 7. Balancing Design and Development Time

### Challenge

There is always a tradeoff between making the app visually polished and finishing the required technical submission items on time.

### Solution

I chose a clean, modern, minimal interface that was realistic to implement within the project timeframe. I focused on consistency and clarity rather than overly complicated visual effects.

---

## 8. Understanding the Submission Constraints

### Challenge

The assignment is not only about building the app. It also requires:

- a forked repo,
- a specific folder structure,
- a PR,
- an APK,
- a README,
- an `idea.md`,
- and a demo video link.

This makes the project part technical implementation and part structured submission workflow.

### Solution

I treated the project as both:

1. a product prototype,
2. and a formal software submission.

This meant planning the folder structure and documentation as part of the project itself, not as an afterthought.

---

## 9. Aligning the App With Track 1 Exactly

### Challenge

There was a risk of drifting away from the exact teacher requirement by adding unrelated AI features or turning the app into a more generic assistant.

### Solution

I continuously aligned the app with the Track 1 definition:

- rough input,
- 3–5 engineering questions,
- one-page spec generation.

This kept the project clearly inside the assignment scope.

---

## 10. Making the Output Useful, Not Just Impressive

### Challenge

AI-generated products can sometimes look impressive but produce weak or generic output. For this assignment, usefulness matters more than flashy wording.

### Solution

I focused the app on reducing ambiguity. The goal of the system is not simply to generate text, but to help the user clarify:

- what problem exists,
- who the user is,
- what belongs in MVP,
- and what constraints matter.

That made the project more practical and aligned with product thinking.

---

## Lessons Learned

This project showed that a good AI product is not only about generation. It is also about:

- asking the right intermediate questions,
- narrowing scope,
- structuring output,
- and creating a clear user journey.

It also showed the importance of balancing:

- idea quality,
- implementation quality,
- and submission quality.

---

## Conclusion

The biggest challenge in NOKTA Spec was not only technical implementation. It was transforming a broad assignment into a focused, usable, and presentable mobile product.

By limiting scope, clarifying the flow, and keeping the app demo-ready, I was able to create a submission that is aligned with the teacher’s requirements and meaningful as a real MVP.
