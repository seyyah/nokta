// utils/geminiService.js

const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_KEY;

// ✅ Pre-configured with your CONFIRMED working model
let workingModel = "gemini-2.5-flash-lite"; // Set directly for speed

// Backup models in case the primary fails
const BACKUP_MODELS = [
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.5-flash"
];

async function getWorkingModel() {
  // If we already have a working model, use it
  if (workingModel) return workingModel;

  // Otherwise test backups
  for (const model of BACKUP_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${GEMINI_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: "test" }] }] })
      });

      if (response.ok) {
        console.log(`✅ Using model: ${model}`);
        workingModel = model;
        return model;
      }
    } catch (e) {
      // Continue to next model
    }
  }
  throw new Error("No working model found");
}

async function callGemini(prompt) {
  try {
    const model = await getWorkingModel();
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${GEMINI_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid response structure");
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

export async function generateQuestions(rawIdea) {
  try {
    const prompt = `Based on the idea: "${rawIdea}", generate 4 engineering interview questions. Return ONLY valid JSON (no markdown, no extra text). Format: {"questions": [{"id": 1, "dimension": "Problem", "question": "..."}, {"id": 2, "dimension": "User", "question": "..."}, {"id": 3, "dimension": "Scope", "question": "..."}, {"id": 4, "dimension": "Constraints", "question": "..."}]}`;

    const raw = await callGemini(prompt);
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.warn("Using fallback for Questions");
    return {
      questions: [
        { id: 1, dimension: "Problem", question: "What is the core issue you are solving?" },
        { id: 2, dimension: "User", question: "Who exactly is the target audience?" },
        { id: 3, dimension: "Scope", question: "What is the most important feature?" },
        { id: 4, dimension: "Constraints", question: "Are there any technical or budget limits?" }
      ]
    };
  }
}

export async function generateIdeaCard(rawIdea, questions, answers) {
  try {
    const prompt = `Synthesize into product card. Idea: ${rawIdea}. Answers: ${JSON.stringify(answers)}. Return ONLY JSON (no markdown): {"title": "string", "tagline": "string", "problem": "string", "solution": "string", "target_user": "string", "scope": "string", "constraints": "string", "next_step": "string"}`;

    const raw = await callGemini(prompt);
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.warn("Using fallback for Idea Card");
    return {
      "title": "NotePoint Strategic Concept",
      "tagline": "From raw idea to engineered artifact",
      "problem": "Unstructured brainstorming leads to project drift",
      "solution": "An AI-guided interview process for technical validation",
      "target_user": "Software Engineering students and researchers",
      "scope": "Idea Capture | AI Enrichment | Structured Output",
      "constraints": "Must be lightweight and low-latency",
      "next_step": "Proceed to MVP development"
    };
  }
}