Track: C

# 231118055 - Mustafa Emir Kincal

## Submission Summary

This submission now carries the Week 1, Week 2, and Week 3 slices of NOKTA in one folder:

- Week 1: note dump to idea card dedup flow
- Week 2: human support bridge for expert escalation
- Week 3: forge ledger with ratchet discipline and rollback visibility

## Expo QR / Link

[http://localhost:8084](http://localhost:8084)

## Demo Video

`PENDING_RECORDING`

## Included Artifacts

- `app/` - Expo app source
- `idea.md` - original Track C idea brief
- `BRIDGE.md` - human support protocol for Week 2
- `FORGE.md` - cycle ledger for Week 3
- `audit-reports/` - 3 burn-in report files with visual notes
- `app-release.apk` - Android release binary

## Decision Log

1. I kept the main dump-to-card flow as the default path because Week 1 still needs to stay obvious and easy to demo.
2. I added a human bridge CTA so the app can hand off unclear dumps to a person instead of forcing the model to guess.
3. I added a forge ledger screen so Week 3 can show success, rollback, kg growth, and human touch points in one place.
4. Gemini is optional: the app uses it when `EXPO_PUBLIC_GEMINI_API_KEY` exists, but local fallback logic still works offline.
5. The product name stays `NOKTA` so the later weeks read as extensions of the same app rather than separate experiments.

## Human Touch Points

1

## AI Tool Log

| Area | Tool | Use |
|---|---|---|
| Week 1 | Claude Code | Gemini migration, dedup flow, APK rebuild |
| Week 2 | Claude Code | Human bridge screen and support brief |
| Week 3 | Claude Code | Forge ledger screen, reports, and docs |

## Run

```bash
cd app
npm install
npx expo start
```
