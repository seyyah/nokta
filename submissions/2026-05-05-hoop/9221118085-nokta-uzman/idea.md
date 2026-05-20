# idea.md — Track A: Expert Escalation & Human Review

## Raw Idea (Input)

> "An AI idea incubation app that can escalate risky or uncertain ideas to real human experts for validation and feedback."

---

## AI Engineering Interview (3–5 Questions)

**Q1 — Problem:**  
What exact pain does this solve?  
AI systems can generate and organize ideas quickly, but they often lack real-world judgment in sensitive areas such as law, finance, health, privacy, and technical architecture. Users may trust AI-generated suggestions too early without proper human validation.

**Q2 — User:**  
Who is the primary user?  
Early-stage founders, students, indie hackers, and product builders who are brainstorming startup or technical ideas and need additional expert guidance before development.

**Q3 — Scope:**  
What is the MVP?  
A mobile application where users submit an idea, receive an AI evaluation, and—if the idea contains uncertainty or risk—it gets escalated to a human expert review queue. Experts can then provide approval or improvement feedback.

**Q4 — Constraint:**  
What are the main constraints?  
The system must remain lightweight and fast enough for mobile use. AI analysis should be low-latency and inexpensive. Expert escalation should be simple and understandable without requiring complex moderation systems.

**Q5 — Success Metric:**  
How do we know it works?  
A user can submit a raw idea and receive:
1. An AI-generated evaluation within a few seconds
2. A clear risk classification
3. Human expert feedback for uncertain or high-risk ideas

---

# One-Page Spec

## Product Name

**Nokta Uzman** — *AI meets human expertise.*

---

## Problem Statement

AI systems are effective at brainstorming and structuring ideas, but they are not always reliable for high-stakes or expertise-heavy decisions. Areas involving law, finance, health, security, and technical systems may require human review before moving into implementation.

There is currently a gap between fast AI ideation and trusted expert validation.

---

## Solution

A mobile-first application (Expo / React Native) where users submit raw ideas or project concepts. The AI analyzes the idea and detects whether additional expert support is required.

If uncertainty or risk is detected, the idea is escalated to a human expert queue where specialists can review and return structured feedback.

---

## Core User Flow

```text
[User submits idea]
          ↓
[AI evaluates idea]
          ↓
[Risk / uncertainty detection]
          ↓
[Escalate to expert queue]
          ↓
[Human expert review]
          ↓
[Feedback returned to user]
```

---

## Expert Review Schema

```json
{
  "idea": "string",
  "risk_level": "Low | Medium | High",
  "ai_summary": "string",
  "expert_verdict": "string",
  "status": "Pending | Reviewed"
}
```

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Expo (React Native) | Fast mobile prototyping and APK export |
| AI | Groq Llama 3.3 | Fast conversational reasoning |
| Storage | Local state / AsyncStorage | Lightweight mobile persistence |
| UI | React Native Stylesheet | Simple and fast iteration |

---

## Constraints & Mitigations

- **Latency:** Groq chosen for low-latency conversational performance
- **Cost:** Lightweight prompting and short response generation
- **Reliability:** Fallback AI responses added for API failure cases
- **Complexity:** Expert workflow intentionally simplified for MVP

---

## Out of Scope (v1)

- Real-time messaging with experts
- Authentication system
- Expert reputation scoring
- Multi-user collaboration
- Payment or booking systems

---

## Open Questions

1. Should experts eventually have specialized categories (law, finance, health)?
2. Should the escalation system become automatic or user-controlled?
3. Can expert feedback later be used to improve AI reasoning quality?
4. Should users be able to attach documents or screenshots to ideas?

---

## Decision Log

| Date | Decision | Reason |
|---|---|---|
| 2026-05-12 | Chose Track A | Strong alignment with AI-guided idea enrichment workflows |
| 2026-05-12 | Chose Expo over bare RN | Faster mobile prototyping and easier APK deployment |
| 2026-05-12 | Chose Groq Llama 3.3 | Fast inference speed and good conversational reasoning |
| 2026-05-12 | Added Human Escalation Layer | AI alone may not be sufficient for high-risk ideas |
| 2026-05-12 | Simplified Expert Queue | Keeps MVP lightweight and easy to demonstrate |

---

## Karpathy / Autoresearch Reference

This project relates to AI-assisted reasoning systems and human-in-the-loop workflows.

The application uses structured prompting and uncertainty detection to determine when AI confidence may not be sufficient. Instead of treating the LLM as a final authority, the system introduces human escalation as an additional reasoning layer.

This reflects Karpathy’s framing of LLMs as reasoning engines that benefit from iterative feedback and contextual correction rather than isolated one-shot outputs. The project also explores hybrid intelligence workflows where AI and human expertise collaborate inside an idea incubation ecosystem.