# Report 01: Home Screen Button Misalignment

## Description
The primary action button labeled "Go to Profile" on the Home Screen is not aligned properly. Instead of being centered like the rest of the layout, it is significantly shifted to the right side, disrupting the visual hierarchy and symmetry of the screen.

## Steps to Reproduce
1. Build and run the Expo application.
2. Ensure the app launches to the default `Home` screen.
3. Observe the layout and positioning of the "Go to Profile" button located below the main title.

## Expected Behavior
The "Go to Profile" button should be perfectly centered horizontally along the main cross-axis, aligning neatly with both the main title and the "Go to Settings" button below it.

## Actual Behavior
The button container has a substantial left margin applied, which pushes the button off-center to the right, causing an asymmetric and unpolished user interface.

## Root Cause
A hardcoded margin property (`marginLeft: 80`) was inadvertently applied to the `buggyButtonContainer` style definition in `HomeScreen.tsx`. Since the parent container uses `alignItems: 'center'`, this explicit margin overrides the default flexbox centering behavior, causing the visual misalignment.

## Suggested Fix
Remove the `marginLeft: 80` property from the `buggyButtonContainer` style object in `app/screens/HomeScreen.tsx`. Let the parent flex container handle the horizontal alignment automatically.

## Screenshot
![Home Bug](assets/home.png)
