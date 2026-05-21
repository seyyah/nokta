# Report 02: Profile Screen Text Overflow

## Description
The descriptive text block on the Profile Screen overflows its designated container. This causes the text to spill out over the background, resulting in broken aesthetics and readability issues, especially on smaller device screens.

## Steps to Reproduce
1. Launch the Expo application.
2. From the Home Screen, tap on the "Go to Profile" button to navigate to the `ProfileScreen`.
3. Observe the long text paragraph displayed inside the gray rectangular container.

## Expected Behavior
The text content should be properly constrained within its gray container. It should wrap nicely to new lines or expand the container's height dynamically to accommodate the content length.

## Actual Behavior
The text exceeds the physical boundaries of the gray background container and bleeds vertically and horizontally into the surrounding screen space, making the UI look completely broken.

## Root Cause
The `buggyTextContainer` style object in `ProfileScreen.tsx` is strictly constrained by hardcoded dimensions (`width: 150`, `height: 40`). The nested `<Text>` element lacks spatial restrictions, so when the text length exceeds these hardcoded limits, the React Native rendering engine allows the text to overflow its parent's boundaries.

## Suggested Fix
Modify the `buggyTextContainer` styles in `app/screens/ProfileScreen.tsx`. Remove the hardcoded `height: 40` and `width: 150` values. Instead, use a percentage-based width (e.g., `width: '90%'`) and add some internal `padding`. This will allow the container to dynamically grow to wrap the text content.

## Screenshot
![Profile Bug](assets/profile.png)
