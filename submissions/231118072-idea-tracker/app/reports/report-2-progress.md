# Audit Report: Progress Bar Logic Error
**Screen:** Questions (questions.tsx)
**Type:** Logic Bug
**Severity:** Medium
**Description:** The progress bar at the top of the questions screen does not update as the user moves through the questions. It remains stuck at approximately 10%.
**Expected:** The progress bar should fill up proportionally as the user completes each of the 5 questions.
**Actual:** The width is always set to 10% regardless of the current step.
**Location:** `app/app/questions.tsx`
