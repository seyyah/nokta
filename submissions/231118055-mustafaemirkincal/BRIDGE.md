# BRIDGE.md

> Human bridge note for the final-week demo. When the forge gets stuck twice, the app opens this path and asks for a real person.

## Trigger

- If the last two forge cycles are `ROLLBACK` or `FAIL`, the bridge opens automatically.
- The bridge button is also available manually from the forge panel.

## What the bridge carries

- The dictated transcript from the user
- The current avatar persona
- The current forge context
- A short meeting summary that can be pasted into the next cycle

## Meeting summary

- The expert confirmed that the voice visualizer was the right primary surface for the final week.
- The avatar was kept intentionally simple so the lip-sync signal could stay clean and readable.
- The forge should not keep guessing after two consecutive rollbacks.
- The next cycle should feed the clarified context back into the board instead of expanding the scope.

## Follow-up rule

- After the bridge, the next audit report should be generated from the new human summary.
- The bridge summary should be fed into the next forge cycle as context.
- Do not erase the rollback row; it is part of the ratchet history.
