# Audit Forge Challenge — Kevser Tavlı

This repository is a complete submission for the **Audit Forge Challenge**. It demonstrates a React Native + Expo application integrated with the `nokta-audit` widget, featuring intentional bugs and a simulated AI-driven repair ledger.

## Project Structure
```
submissions/231118042-KevserTavlı/
├── app/                  # Expo TypeScript Application
│   ├── src/
│   │   ├── screens/      # Home, Profile, Settings
│   │   └── components/   # Audit Storage Adaptor
│   └── App.tsx           # Global Entry and Widget Integration
├── reports/              # Markdown Bug Reports (Audit Output)
├── FORGE.md              # Engineering Ledger (Repair Cycles)
└── README.md             # This file
```

## Track Selection
**Track A: The Auditor**
Focused on building a high-quality "host application" that serves as the perfect environment for testing the `nokta-audit` widget and simulating autonomous repair cycles.

## Features
- **3 Primary Screens**: Dashboard, Profile, and Settings.
- **Audit Widget**: Integrated globally with `@xtatistix/mobile-audit`.
- **Modern UI**: Clean cards, rounded corners, and responsive layouts.
- **Intentional Bugs**: 4 realistic engineering slips (UI, state, and navigation).
- **Forge Loop**: Documentation of READ-LOCATE-REPAIR cycles including a rollback scenario.

## How to Run locally
1. Navigate to the `app` directory:
   ```bash
   cd app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start Expo:
   ```bash
   npx expo start
   ```

## Audit Widget Workflow
1. **Capture**: Press the 🛡️ button to trigger a screenshot.
2. **Annotate**: Highlight the bug area and add a descriptive note.
3. **Manage**: Double-tap the 🛡️ button to see the list of captured bugs.
4. **Export**: Export as Markdown to simulate the input for the Forge Loop.

## Forge Workflow
The `FORGE.md` file tracks the lifecycle of bug fixes using the Karpathy ratchet loop discipline:
1. **READ**: Understand the bug report.
2. **LOCATE**: Find the line of code responsible.
3. **HYPOTHESIZE**: Propose a fix.
4. **REPAIR**: Apply changes.
5. **TEST/VERIFY**: Ensure the fix works and doesn't break other parts.
6. **COMMIT/ROLLBACK**: Finalize or revert based on results.

## Screenshots (Placeholders)
![App Dashboard](file:///app/assets/screenshots/dashboard.png)
![Audit List](file:///app/assets/screenshots/audit-list.png)

## License
MIT
