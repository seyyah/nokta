# voice-viz audit

## Issue

Bars don't fade smoothly on silence.

## Hypothesis

Fade duration is too fast (80ms) and the visual read feels like flicker instead of decay.

## Fix

Increase silent fade duration to **300ms** so the transition is perceivable and stable.

