# Audit Bug Report: Settings Screen Component Overlap & Absolute Button Block

## Details
- **Screen:** Settings Screen (`/settings`)
- **Reporter:** Eslen Gül Akbulut (QA Team)
- **Severity:** High (Functional Block)
- **Status:** Open

## Description
There are two major UI/UX layout bugs on the Settings Screen:
1. **Toggle Switch Overlap:** Under General Settings, the "Background Auto-Update & Cloud Sync" switch overlaps with the option label text, making the option difficult to read and causing clicks to fail or trigger incorrectly.
2. **Absolute Position Reset Button:** The red "Reset All Data" button is positioned absolutely inside the About & Support card, overlaying directly on top of the "Privacy Policy" button. This completely blocks interaction with the Privacy Policy setting and makes the layout look visually broken.

## Steps to Reproduce
1. Navigate to the Settings Screen.
2. Scroll to the "General Settings" section and see the switch overlapping the text "Background Auto-Update & Cloud Sync".
3. Scroll to the "Information" section and observe the red "Reset All Data" button floating on top of the "Privacy Policy" button.

## Visual Proof
![Settings Screen Overlap Bug](./assets/settings_screen_bug.png)

## Suggested Fix
1. Modify the `overlappingRow` stylesheet to use standard flex alignment with `justifyContent: 'space-between'` instead of absolute positioning.
2. Remove absolute positioning from the "Reset All Data" button and place it in the normal flex layout flow, centered at the bottom of the card or view.

```diff
-  overlappingSwitchContainer: {
-    position: 'absolute',
-    left: 140,
-    zIndex: 10,
-  },
+  switchContainer: {
+    // Let it use default flexbox layout next to the text
+  },
```

```diff
-  absoluteResetBtn: {
-    position: 'absolute',
-    bottom: 12,
-    right: 24,
-    backgroundColor: '#ef4444',
-    paddingHorizontal: 16,
-    paddingVertical: 10,
-    borderRadius: 12,
-    zIndex: 999,
-  },
+  resetBtn: {
+    backgroundColor: '#ef4444',
+    paddingHorizontal: 16,
+    paddingVertical: 12,
+    borderRadius: 12,
+    marginTop: 20,
+    alignItems: 'center',
+  },
```
