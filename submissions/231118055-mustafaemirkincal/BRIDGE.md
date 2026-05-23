# BRIDGE.md — Human Support Protocol

This document defines the Week 2 human support path for NOKTA.

## Why it exists

The main dedup flow is good for clean dumps, but it should not guess when the input is muddy, risky, or too wide. The bridge makes that decision visible and hands the case to a human expert with a short, structured brief.

## Bridge rules

1. Ask 3 to 5 focused engineering questions.
2. Keep the questions about problem, user, scope, constraints, and success.
3. Do not turn the bridge into a full spec. The bridge is a handoff, not a replacement.
4. If the expert answer is still unclear, keep only the clarified slice and send that back into the main dedup flow.
5. Log the handoff in the decision log so the human touch point is explicit.

## Output shape

- title
- summary
- 3 to 5 questions
- human decision note
- next step
- tags

## Practical rule

If the input looks like a pitch, a note dump, or a partial plan and the model cannot isolate a single problem statement, the app should route to the bridge instead of forcing a noisy guess.
