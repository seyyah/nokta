# NOKTA — Track A: Dot Capture & Enrich

**Student:** 231118043  
**Track:** Track A — Dot Capture & Enrich  
**Expo Project:** https://expo.dev/@231118043/nokta-dot-capture

---

## What it does

A React Native (Expo) app that takes any raw idea as input and transforms it into a structured one-page engineering spec through a guided AI conversation.

**Akış:**
1. Kullanıcı ham fikrini girer (the "dot")
2. Gemini 2.5 Flash 5 mühendislik sorusu sorar: Sorun → Kullanıcı → Kapsam → Kısıt → Başarı Ölçütü
3. Uygulama tek sayfalık spec üretir: Sorun, Hedef Kullanıcılar, Kapsam (MVP), Kısıtlar, Başarı Ölçütleri, İlk Yapılacak Özellik

---

## Demo

**60-second demo video:** https://youtube.com/shorts/Go5Sug4MkNo?feature=share

**Expo Go QR:** Scan with Expo Go app → `exp://exp.host/@231118043/nokta-dot-capture`

---

## Running locally

```bash
cd app
cp .env.example .env.local
# EXPO_PUBLIC_GEMINI_API_KEY değerini .env.local dosyasına ekle
# Ücretsiz key: https://aistudio.google.com/apikey
npm install
npx expo start
```

---

## Decision Log

**Decision 1 — Track A over B or C**  
Track A aligns most directly with the core NOKTA thesis: turning a raw dot into a structured artifact. It demonstrates the full pipeline (capture → enrich → spec) in one cohesive flow.

**Decision 2 — Gemini 2.5 Flash model**  
Başlangıçta Anthropic Claude Haiku planlanmıştı ancak ücretsiz kota gerektiği için Google Gemini 2.5 Flash'a geçildi. Gemini AI Studio üzerinden ücretsiz API key sağlıyor; 2.5 Flash hızlı (< 2s) ve etkileşimli Q&A için yeterince güçlü.

**Decision 3 — 5 fixed questions instead of dynamic termination**  
An initial design let Claude decide when to stop asking questions. This created variable UX — sometimes 3 questions, sometimes 7. Fixed at 5 (one per engineering category: problem, user, scope, constraint, success metric) for consistent, predictable flow and rubric alignment.

**Decision 4 — React Navigation Stack over Expo Router**  
Expo Router added file-based complexity for a 3-screen linear flow. Stack navigator is simpler, type-safe with the `RootStackParamList`, and does not require restructuring the generated project.

**Decision 5 — Dark theme (#0a0a0a)**  
Reflects the NOKTA brand (minimal, focused, night-mode-friendly). The purple accent (#6c47ff) is the "nokta dot" colour used consistently for CTAs and section headers.

**Decision 6 — AI tools used**  
Claude Code CLI (claude-sonnet-4-6) was used for scaffolding screens, navigation wiring, and prompt engineering. All generated code was reviewed, tested, and adapted for the Track A flow.

---

## File structure

```
app/
├── App.tsx                        # Navigation root
├── app.json                       # Expo config (slug: nokta-dot-capture)
└── src/
    ├── services/claude.ts         # Gemini 2.5 Flash API calls
    └── screens/
        ├── HomeScreen.tsx         # Idea input
        ├── QuestionFlowScreen.tsx # 5-step Q&A
        └── SpecOutputScreen.tsx   # Generated spec
```
