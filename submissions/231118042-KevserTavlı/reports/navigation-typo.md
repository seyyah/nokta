# BUG REPORT: Navigation Typo

**Title:** "View Detailed Profile" button crashes or fails to navigate.
**Affected Screen:** SettingsScreen
**Severity:** High

## Reproduction Steps
1. Navigate to the "Settings" tab.
2. Under the "Account" section, press "View Detailed Profile (Typo Bug)".

## Expected Behavior
The app should navigate to the Profile screen.

## Actual Behavior
The navigation fails silently (with a console log) because the destination name is misspelled.

## Suspected Files
- `src/screens/SettingsScreen.tsx`

## Suspected Cause
`navigation.navigate('Pofile')` is used instead of `navigation.navigate('Profile')`.

## Screenshot Placeholder
![Settings Navigation Bug](file:///reports/screenshots/navigation-bug.png)
