# Idea Refiner

## 📌 Track Selection
**Track 1 — Raw Idea → AI Spec Generator**

## 📌 Short Description
Idea Refiner is a mobile application designed for founders and creators to instantly transform their unstructured voice memos into clean, actionable, and standardized one-page product specifications using AI.

## 📌 Demo Section
*   **Expo QR Link:** [Open in Expo Go](https://expo.dev/@sibel9356/app)
*   ** Video Link:** https://youtu.be/zPQXMSJGY04
## 📌 Decision Log
*   **Framework Choice:** Selected React Native (via Expo) for rapid development and easy cross-platform deployment.
*   **AI Models:** Chose OpenAI Whisper for high-accuracy voice transcription over native device APIs to ensure quality, and GPT-4o-mini for fast, cost-effective structuring of the raw text.
*   **Constraint Implementation:** Decided to restrict voice recording to a maximum of 3 minutes. This manages API costs effectively and forces the user to be concise with their initial idea.
*   **Output Format:** Implemented a rigid, predefined Markdown template for the output specification. This ensures consistency across all generated specs and removes the need for complex prompt engineering by the user.
