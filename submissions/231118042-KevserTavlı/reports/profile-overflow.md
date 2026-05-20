# BUG REPORT: Profile Bio Overflow

**Title:** "About Me" text overflows or looks messy on small screens.
**Affected Screen:** ProfileScreen
**Severity:** Medium

## Reproduction Steps
1. Navigate to the "Profile" tab.
2. Scroll down to the "About Me" section.
3. Observe the text formatting and container constraints.

## Expected Behavior
The text should be contained within the light gray box and wrap logically, perhaps with a "read more" or limited line count if too long.

## Actual Behavior
The text is raw and lacks proper constraints, which might lead to layout breaking on very narrow devices.

## Suspected Files
- `src/screens/ProfileScreen.tsx`

## Suspected Cause
Lack of `numberOfLines` constraint or specific width management in `bioText` style within `bioContainer`.

## Screenshot Placeholder
![Profile Screen Bio](file:///reports/screenshots/profile-bio.png)
