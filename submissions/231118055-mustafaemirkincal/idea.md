# Nokta Nokta - Consolidated Submission

## Thesis

This submission keeps the Track C dedup workflow and packages the final-week voice/avatar/forge materials in the same folder, so the whole project is reviewable as one coherent delivery instead of split across multiple folders.

## Problem

- Notes arrive as messy dumps, repeated chat lines, and half-finished bullets.
- A good demo needs a clear API-backed app, but the final-week artifacts also need to live next to it.
- Reviewers should not have to search across multiple submission folders to find the source, binary, and reports.

## Solution

This folder combines:

1. An API-backed Expo app that deduplicates note dumps into idea cards.
2. A single `app-release.apk` for direct review.
3. Final-week artifacts for voice, avatar, forge, bridge, and dictated audit reports.

## Why this works

- The app stays useful on its own because it still runs with the Gemini key.
- The final-week docs sit next to the app, so the voice/avatar layer is documented even if the reviewer only opens one folder.
- The APK is stored beside the source, which makes the submission easier to verify.

## Non-goals

- Rebuilding the whole project into multiple repo roots.
- Hiding the API setup in a separate branch or folder.
- Leaving the final-week assets disconnected from the main submission.

## Summary

The folder is now the canonical Nokta submission for this student number: one app, one APK, one review path.
