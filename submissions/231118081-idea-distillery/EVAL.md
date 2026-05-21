# Track C Ratchet Eval

These golden scenarios protect the accepted forge cycles. A future repair is not
allowed to pass if it breaks any scenario below.

## EV-01 Saved Brief Status Is Actionable

Given a saved brief with status `mentor_review`, the user workspace must show a
customer-facing waiting-review label and a next-action hint. The card must not
only show the raw enum value.

Checks:

- saved status has a readable label
- waiting review explains that a mentor ticket exists
- reviewed status explains that feedback was written back

## EV-02 Feature Creep Warnings Become Decisions

Given a distilled brief with feature creep warnings, the result screen must add
an action label before each warning.

Allowed action labels:

- `Cut for v1`
- `Move later`
- `Keep only if core`
- `Keep`

## EV-03 Mentor Sees User Decisions

Given a HOTL/HITL brief saved with selected game decisions, the mentor queue and
ticket detail must expose that user decision context before mentor feedback is
written.

Checks:

- ticket list shows locked decision count
- ticket detail shows selected decision question and selected option
- mentor feedback still writes back into the saved brief future plan

## EV-04 No Context-Free Mentor Ticket

Home must not create mentor tickets directly. A review ticket is valid only
after a brief exists with readiness, mentor packet, and any user decisions.

This scenario is the rollback ratchet from cycle 4.

## Verification Command

```bash
cd submissions/231118081-idea-distillery/app
npm run typecheck
```

Manual smoke flow:

```txt
User Login -> Add Notes / Idea -> Load Sample -> Distill Game Pitch
-> select decisions -> Save Brief and Create Mentor Ticket
-> Mentor Login -> Review Ticket -> paste feedback -> Resolve Ticket
-> User Workspace -> Open Future Plan
```
