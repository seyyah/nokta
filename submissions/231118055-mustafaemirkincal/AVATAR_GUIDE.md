# Avatar Guide

Use this if you want your own face inside the app.

## What to prepare

1. Create a clean front-facing selfie or photo set.
2. Export the avatar from Avaturn as `.glb`.
3. Make sure the mesh has a visible head, jaw, and mouth area.
4. Name the file `avatar.glb`.

## Where to put it

Copy the file to:

`app/assets/avatar.glb`

## What to check

- The face should be centered.
- The model should be small enough to load on mobile.
- Avoid overly dense geometry.
- Keep the materials simple so the app can load it quickly.

## Later hookup

When you are ready to add the avatar to the app:

1. Load the GLB from `app/assets/avatar.glb`.
2. Map the mouth or jaw node to microphone level or viseme data.
3. Add a small fallback face if the model fails to load.
4. Rebuild the APK after the asset is updated.

## If you want lipsync

- Use one node for the head rotation.
- Use one node for the mouth opening.
- Drive the mouth from mic level first, then replace it with real visemes later.
- Keep the animation simple so latency stays low.
