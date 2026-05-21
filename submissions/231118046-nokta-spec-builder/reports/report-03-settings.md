# Report 03: Settings Screen Bad Padding

## Description
The menu items displayed on the Settings Screen have severe layout defects. The text options appear cramped, lack breathing room, and are partially clipped on the left edge of the screen, creating a poor user experience.

## Steps to Reproduce
1. Launch the Expo application.
2. From the Home Screen, tap on the "Go to Settings" button.
3. Observe the layout, spacing, and alignment of the text items listed under the "Settings Screen" title.

## Expected Behavior
The settings options list should be clearly legible, featuring adequate internal padding (e.g., 16px) for a comfortable touch target size. The container should align appropriately within the screen bounds without cutting off the text.

## Actual Behavior
The options container has excessively narrow padding and is pulled to the left, causing the text elements to press directly against or bleed past the left boundary of the device screen.

## Root Cause
The `buggyPadding` style defined in `SettingsScreen.tsx` utilizes incorrect layout tokens: a minuscule `padding: 2` and a `marginLeft: -10`. In React Native, negative margins pull elements out of their standard layout flow, which in this case clips the text off the left edge of the viewport.

## Suggested Fix
Refactor the `buggyPadding` style object in `app/screens/SettingsScreen.tsx`. Remove the negative `marginLeft: -10` rule. Increase the padding property to a standard mobile token like `padding: 16`. Additionally, adding a subtle `borderRadius` might improve the container's aesthetic.

## Screenshot
![Settings Bug](assets/settings.png)
