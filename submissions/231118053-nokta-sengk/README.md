# SlopSense - Autonomous Startup Due Diligence

## 🎯 Track Selection
This project is built for **Track B: Slop Detector**. 

SlopSense is an autonomous mobile agent that evaluates startup pitches and market claims to distinguish between technical/market reality and "slop" (unsubstantiated hype and buzzwords).

---

## 📱 Links & Demo
- **📺 60s Demo Video:** [İzlemek için Tıklayın (YouTube)](https://youtube.com/shorts/C0DgwQkw148?feature=share)
- **🚀 Expo QR Code & Build:** [Expo Proje Sayfası](https://expo.dev/accounts/sengka/projects/app/builds/26a5373d-4d0d-40a9-9e59-70ed4699a7e0)
- **📦 Android APK:** `submissions/231118053-nokta-sengk/app-release.apk` (Lütfen build bittiğinde indirdiğin dosyayı bu klasöre ekle).

---

## 🚀 Features
- **Slop Score (0-100):** A dynamic, color-coded visual indicator of a pitch's hype-to-reality ratio.
- **Engineering-Guided Reasoning:** Detailed breakdown of specific claims, identifying factual inconsistencies and jargon overload.
- **A2UI Adaptive Loading:** A premium loading experience that demonstrates the "agent's thought process" through sequential technical state transitions.
- **🔥 BONUS: Sosyal Sensör (Social Sensor):** An advanced module that leverages LLM market knowledge to identify potential competitors and hidden market risks.

---

## 🛠 Architecture & Decisions
- **Framework:** React Native + Expo (TypeScript).
- **AI Engine:** Google Gemini 1.5 Flash (API v1).
- **Navigation:** React Navigation (Native Stack) for fluid transitions.

### 📝 Decision Log
1. **Direct Fetch:** API anahtarı (AQ. format) uyumluluğu için SDK yerine doğrudan `fetch` kullanıldı.
2. **Reanimated Removal:** Deneysel React Native sürümlerindeki (0.81+) stabilite sorunları nedeniyle animasyonlar standart React state'leri ile optimize edildi.
3. **Strict JSON Prompting:** AI yanıtlarının her zaman parse edilebilir olması için özel bir JSON temizleme mantığı geliştirildi.

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
