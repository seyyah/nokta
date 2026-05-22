# EVAL

| scenario | expected result |
|---|---|
| Route change from `/` to `/reports` | `currentScreen` becomes `/reports` without extra host state |
| Widget removal from root layout | The three routes still render normally |
| Markdown export | The host writes and shares a text artifact through injected deps |
| Burn-in report review | Each report includes a screenshot reference, screen name, note, bounds, and agent input |

