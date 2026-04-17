# SlopSense - Autonomous Startup Due Diligence

## 🎯 Track Selection
This project is built for **Track B: Slop Detector**. 

SlopSense is an autonomous mobile agent that evaluates startup pitches and market claims to distinguish between technical/market reality and "slop" (unsubstantiated hype and buzzwords).

---

## 🚀 Features
- **Slop Score (0-100):** A dynamic, color-coded visual indicator of a pitch's hype-to-reality ratio.
- **Engineering-Guided Reasoning:** Detailed breakdown of specific claims, identifying factual inconsistencies and jargon overload.
- **A2UI Adaptive Loading:** A premium loading experience that demonstrates the "agent's thought process" through sequential technical state transitions.
- **🔥 BONUS: Sosyal Sensör (Social Sensor):** An advanced module that leverages LLM market knowledge to identify potential competitors and hidden market risks not mentioned in the pitch.

---

## 🛠 Architecture & Decisions
- **Framework:** React Native + Expo (TypeScript).
- **AI Engine:** Google Gemini 1.5 Flash.
- **Navigation:** React Navigation (Native Stack) for fluid, state-driven transitions.
- **Styling:** Custom Design System with a premium Dark Mode aesthetic.

### 📝 Decision Log (Key Engineering Choices)
1. **Direct Fetch vs. SDK:** Switched from the Google Generative AI SDK to direct `fetch` calls to handle the latest `AQ.` format API keys and ensure maximum compatibility across different environments.
2. **Stability over Animation:** Decided to replace `react-native-reanimated` with standard React states for UI transitions to ensure the app runs flawlessly on experimental React Native versions (0.81+) without runtime crashes.
3. **Prompt Engineering:** Implemented a strict JSON-output prompt with a cleansing logic to ensure the AI's reasoning is always structured and parseable.

---

## 📦 How to Run
1. Navigate to the app folder: `cd app`
2. Install dependencies: `npm install`
3. Add your Gemini API Key in `src/theme/config.ts`.
4. Start the project: `npx expo start --clear`
5. Scan the QR code with **Expo Go**.

---

## 👨‍💻 Author & Submission Info
- **Project Folder:** `submissions/20210123-track-b-slop/`
- **Total Meaningful Commits:** 5+
- **Artifacts Included:** Source code, README, Documentation.

---

*Built with ❤️ for the Nokta Away Mission Hackathon.*
