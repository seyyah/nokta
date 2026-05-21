# IDEA

## Why The Audit Widget Matters

Most bugs reported from mobile screens lose context before a developer or coding agent sees them. The audit widget lowers that loss: the user reports the issue while looking at the broken screen, marks the relevant area, and writes a short note in human language.

For this submission, the widget behavior is recreated locally as `AuditWidget`. It keeps the important parts from `nokta-audit`: a floating FAB, a selected yellow area, a note form, and a Markdown artifact that can move into a repair loop.

## Markdown As Coding-Agent Input

Markdown is useful because both humans and coding agents can read it without a custom parser. Each report names the screen, describes the issue, records the marked area, gives expected and actual behavior, lists reproduction steps, assigns severity, and includes an explicit agent instruction.

That makes the report more than a bug note. It becomes a bounded repair request:

1. Read this report.
2. Locate the named screen.
3. Form a hypothesis.
4. Repair the smallest relevant code.
5. Test and verify.
6. Commit only if verified, otherwise rollback.

## Closed Loop

The loop is:

`user report -> Markdown report -> coding agent repair -> test -> verify -> commit/rollback`

The app handles Phase A: capture reports, show Markdown, and provide sample artifacts. Phase B can later take one generated report at a time and run the real repair cycle with Codex.

## Why This Fits Track C

Selected Track: C — Otonomi

Track C is not only automation. It needs human touch points and a ratchet. In this submission, the human decides what is wrong and creates the audit report. The coding agent uses the report as structured repair input. When a repair is tested and verified, it can be committed and the app improves. That is the ratchet.

## Rollback Protects Quality

Autonomy without rollback is just unchecked change. A failed repair must not be accepted because it was produced by an agent. If TEST or VERIFY fails, the cycle is documented as a rollback cycle in `FORGE.md`, and the code is reverted or left uncommitted.

Rollback makes the loop safer: failed hypotheses become learning records instead of hidden regressions.
