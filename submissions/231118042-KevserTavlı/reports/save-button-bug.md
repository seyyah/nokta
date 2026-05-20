# BUG REPORT: Broken Save Button

**Title:** "Save Report" button does nothing when pressed.
**Affected Screen:** HomeScreen
**Severity:** High

## Reproduction Steps
1. Open the application.
2. Ensure you are on the "Home" tab (Dashboard).
3. Locate the "Quick Actions" card.
4. Press the "Save Report" button.

## Expected Behavior
The button should trigger a save operation or show a feedback alert.

## Actual Behavior
Nothing happens. The button is unresponsive.

## Suspected Files
- `src/screens/HomeScreen.tsx`

## Suspected Cause
The `TouchableOpacity` for the "Save Report" button is missing the `onPress` prop.

## Screenshot Placeholder
![HomeScreen Save Button](file:///reports/screenshots/save-button.png)
