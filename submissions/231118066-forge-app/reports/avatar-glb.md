# avatar-glb audit

## Issue

Mouth flickers at high speech rate.

## Hypothesis

100ms interval is too fast and causes visible jitter when combined with other animations and renders.

## Fix

Use **160ms** interval and **Easing.inOut** for the mouth height transitions.

