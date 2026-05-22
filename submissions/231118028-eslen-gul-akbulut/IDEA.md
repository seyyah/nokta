# IDEA: Audit Forge Companion App

## 1. Project Name
**Audit Forge Companion App** (QA-Audit Portal)

## 2. Problem Statement
Mobile application development cycles suffer from friction when reporting visual, layout, and user interface (UI/UX) bugs. Typical issues include:
- **Friction in Reporting:** QA engineers must take screenshots, export them to a computer, highlight bugs manually in an image editor, and write reports on external issue trackers.
- **Context Loss:** Developers struggle to map screenshots back to the exact code files, routes, or application states.
- **Accessibility Regressions:** Contrast issues, typos, and clipping buttons slip into production because visual auditing is detached from the local development loop.

## 3. Solution
A highly polished, modern developer dashboard prototype that acts as the test host for the **Nokta-Audit** system. 
- **Floating Drop-in Widget:** The app integrates the floating `nokta-audit` action button on all screens.
- **On-Device Annotation:** QA testers can tap the floating button, capture the live screen, draw yellow bounding boxes around issues, and add local notes.
- **Clean Architecture Integration:** The widget uses Dependency Injection to interact with native modules (FileSystem, Sharing, ViewShot) without breaking the clean structure of the host app.

## 4. Target Audience
- **Mobile Development Teams:** For fast-paced internal testing and feedback loops.
- **QA Engineers & Accessibility Auditors:** To perform immediate visual checks and log reports directly on-device.
- **UI/UX Designers:** To verify layout alignment and style implementations against prototypes.

## 5. MVP Features
- **Modern Tab-Based Navigation:** Three screens built using Expo Router:
  1. **Home Screen:** A dynamic statistics dashboard showing audit status, current activity, and shortcuts.
  2. **Profile Screen:** A simulated user profile editor with image uploads and profile form inputs.
  3. **Settings Screen:** A system preferences panel with feature toggles and reset triggers.
- **Intentional UI/UX Bugs:** Added layout overlap, aspect-ratio stretching, typos, accessibility contrast issues, and clickable area blockages for testing the audit framework.
- **Nokta-Audit Floating Widget:** Fully mounted overlay that allows immediate bug annotation and Markdown export.
