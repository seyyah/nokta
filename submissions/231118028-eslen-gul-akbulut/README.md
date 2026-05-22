# Audit Forge Companion App

**Student:** Eslen Gül Akbulut  
**Student ID:** 231118028  
**Challenge:** Audit Forge Challenge (Phase A Submission)

---

## 1. Project Overview
This project is an Expo + TypeScript React Native mobile application designed to act as a test-bed for the `nokta-audit` widget. The app consists of a premium developer statistics dashboard with 3 screens (Home, Profile, Settings) and intentional UI/UX bugs introduced to test on-device audit logging, annotations, and reporting capabilities.

---

## 2. Architecture & Nokta-Audit Integration
The integration of `nokta-audit` follows clean architecture boundaries:
1. **Dependency Injection (DI):** The host application injects native capabilities (screenshotting, filesystem access, and file sharing) into the widget in `app/_layout.tsx` so the widget remains platform-agnostic and modular.
2. **Local Storage Adaptor:** A custom, filesystem-backed JSON storage adaptor (`components/auditStorage.ts`) is injected to persist captured audit notes across app restarts without requiring heavy third-party storage libraries.
3. **Screen Path Mapping:** Route path changes are listened to dynamically using Expo Router's `usePathname()`, passing clean, user-friendly screen names into the widget.

---

## 3. Bug Catalog
To facilitate the testing of the audit widget, the following intentional bugs have been introduced:

| ID | Screen | Bug Type | Description |
|---|---|---|---|
| **BUG-01** | Home | Accessibility (Contrast) | System warning banner uses dark grey text on an almost black background in dark mode, making it illegible. |
| **BUG-02** | Home | Layout Overlap | Recent Activity section header overlaps with the activity subtitle. |
| **BUG-03** | Profile | Visual Regression | Profile avatar is stretched horizontally due to asymmetric dimensions (`180x80`) and `resizeMode="stretch"`. |
| **BUG-04** | Profile | Content Typo | Section title contains a spelling typo: `"Proflie Settings"`. |
| **BUG-05** | Profile | Content Typo | Input label contains a spelling typo: `"E-mial Address"`. |
| **BUG-06** | Profile | Scroll / Layout | The save button is inside a container with `height: 25` and `overflow: "hidden"`, cutting it off and making it unclickable. |
| **BUG-07** | Settings | Layout Overlap | The auto-update toggle switch overlaps the setting text label. |
| **BUG-08** | Settings | Visual & Click Block | The red "Reset All Data" button is absolutely positioned over the "Privacy Policy" button, blocking user clicks. |

---

## 4. Run & Test Instructions

### Prerequisites
- Node.js (v18+)
- npm / yarn
- Expo Go app installed on your physical iOS/Android device or emulator.

### Installation
1. Navigate to the project folder:
   ```bash
   cd nokta/submissions/231118028-eslen-gul-akbulut/app
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

### Running the Application
To launch the Expo packager:
```bash
npm run start
```
- Press `a` for Android Emulator.
- Press `i` for iOS Simulator.
- Scan the QR code with your physical device to open the application in Expo Go.

---

## 5. Audit Reports
The mock screenshot bug logs generated using the widget for Phase A can be viewed here:
1. [report-01-home-contrast.md](./audit-reports/report-01-home-contrast.md)
2. [report-02-profile-avatar.md](./audit-reports/report-02-profile-avatar.md)
3. [report-03-settings-overlap.md](./audit-reports/report-03-settings-overlap.md)
