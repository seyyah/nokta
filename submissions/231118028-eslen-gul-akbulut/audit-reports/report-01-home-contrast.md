# Audit Bug Report: Home Screen Low Contrast Warning Banner

## Details
- **Screen:** Home Screen (`/`)
- **Reporter:** Eslen Gül Akbulut (QA Team)
- **Severity:** High (Accessibility/Usability Violation)
- **Status:** Open

## Description
The warning banner at the top of the Home Screen ('URGENT: System Update Required') uses a text color that does not have enough contrast against its background. In dark mode, it displays very dark grey text on an almost black background, which makes the text completely unreadable for users, especially those with visual impairments. This violates WCAG 2.1 AA accessibility guidelines (contrast ratio should be at least 4.5:1).

## Steps to Reproduce
1. Launch the application in Dark Mode.
2. Observe the top of the Home Screen.
3. Attempt to read the warning text in the system update banner.

## Visual Proof
![Home Screen Contrast Bug](./assets/home_screen_bug.png)

## Suggested Fix
Increase the contrast of the text against the background. For example, in dark mode, change the text color to a bright yellow or white (e.g. `#ef4444` or `#ffffff`) to make it easily readable and call appropriate attention to the warning.

```diff
- <Text style={[styles.contrastTitle, { color: isDark ? '#27272a' : '#e4e4e7' }]}>
+ <Text style={[styles.contrastTitle, { color: isDark ? '#ef4444' : '#b91c1c' }]}>
```
