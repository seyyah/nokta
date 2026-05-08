Startup Pitch Tester - Track 2 Idea

Problem
Founders often present pitches full of hype, buzzwords, and inflated market claims. It is hard to quickly judge how grounded a pitch is without a structured critique.

Target User

- Early-stage investors
- Startup program mentors
- Hackathon juries
- Founders who want honest feedback

Core Flow

1. User pastes a startup pitch paragraph.
2. AI analyzes the pitch for unrealistic claims and buzzword density.
3. App returns a Slop Score (1-100) and a short justification.

Inputs

- Pitch paragraph (plain text)

Outputs

- SLOP SCORE: 1-100
- JUSTIFICATION: 2-3 sentences calling out specific issues

AI Prompting Strategy
Use a strict response format so the app can display results cleanly:
SLOP SCORE: [Score]
JUSTIFICATION: [2-3 sentences]

Success Criteria

- Response is structured and easy to read.
- Score feels consistent with the pitch quality.
- Users can quickly decide if a pitch is fluff-heavy.

Edge Cases

- Very short or empty pitch -> no request sent.
- Overly long pitch -> still scrollable in UI.
- API errors -> user sees clear error message.

Future Ideas

- Extract a short list of flagged buzzwords.
- Add a confidence bar or score visualization.
- Save past analyses locally.
