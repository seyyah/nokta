# Track B - Slop Detector / Due Diligence

This submission implements a focused mobile slice of Nokta for evaluators, angel investors, and operators who need to quickly test whether a startup pitch is grounded or saturated with unsupported hype.

The app accepts one pasted pitch paragraph and produces a disciplined, due-diligence style analysis:
- Slop score (0-100)
- Verdict label
- Executive summary
- Suspicious claim extraction
- Category-by-category rationale
- Rewrite suggestions
- Manual verification checklist

The product is intentionally **not** an open-ended chatbot. It is designed as a compact evaluator workflow with deterministic output that is explainable and easy to audit.

This aligns with Nokta's thesis: idea generation is abundant, while rigorous, falsifiable thinking is scarce. The implemented slice acts as a pre-screen layer before deeper diligence.

Scope is intentionally narrow to meet the assignment constraint of shipping one complete, demo-ready slice rather than attempting the full Nokta platform. The app runs on a local deterministic analysis engine first, and the code is structured to allow a future drop-in replacement with an LLM-backed API.

