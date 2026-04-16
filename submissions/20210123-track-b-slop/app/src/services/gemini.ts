import { GoogleGenerativeAI } from '@google/generative-ai';
import { CONFIG } from '../theme/config';
import { AnalysisResult } from '../navigation/types';

const genAI = new GoogleGenerativeAI(CONFIG.GEMINI_API_KEY);

export const analyzePitch = async (pitch: string): Promise<AnalysisResult> => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: CONFIG.MODEL_NAME,
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `
      You are a professional Venture Capitalist and Market Reality Auditor. 
      Your task is to analyze a startup pitch for "Slop" (meaningless hype, excessive buzzwords, and lack of technical or market substance).

      Analyze the following pitch:
      "${pitch}"

      Return a JSON object with the following schema:
      {
        "score": number (0-100, where 100 is pure slop/garbage and 0 is pure technical/market substance),
        "reasoning": string[] (3-5 specific points explaining the score, focusing on what claims are unrealistic or "slopy"),
        "socialSensor": {
          "competitors": string[] (2-3 actual or potential competitors in the market),
          "warnings": string[] (1-3 realistic warnings about pazar zayıflığı or technical risks)
        }
      }

      Focus criteria for "Slop" score:
      - Overuse of AI/Blockchain/Quantum buzzwords without specific use cases.
      - Unsubstantiated market size claims.
      - Lack of clear product-market fit logic.
      - "Revolutionary" or "Disruptive" claims without a clear moat.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error('Gemini Analysis Error:', error);
    // Return a fallback result in case of API failure (e.g. invalid key)
    return {
      score: 50,
      reasoning: ["API Error: Lütfen API anahtarını kontrol edin.", "Analiz şu anda modifiye edilemiyor."],
      socialSensor: {
        competitors: ["Error detecting competitors"],
        warnings: ["API connectvity issue"]
      }
    };
  }
};
