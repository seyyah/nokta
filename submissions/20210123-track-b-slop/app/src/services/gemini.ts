import { CONFIG } from '../theme/config';
import { AnalysisResult } from '../navigation/types';

export const analyzePitch = async (pitch: string): Promise<AnalysisResult> => {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': CONFIG.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `
              You are a professional Venture Capitalist and Market Reality Auditor. 
              Analyze this startup pitch for "Slop" (hype/buzzwords).
              Pitch: "${pitch}"
              
              Return ONLY a valid JSON object.
              JSON Schema:
              {
                "score": number,
                "reasoning": string[],
                "socialSensor": { "competitors": string[], "warnings": string[] }
              }
            `
          }]
        }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    let text = data.candidates[0].content.parts[0].text;
    
    // Temizleme işlemi
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(text) as AnalysisResult;
  } catch (error: any) {
    console.error('Gemini Fetch Error:', error);
    return {
      score: 50,
      reasoning: ["Hata: " + error.message, "Lütfen internet bağlantınızı ve API anahtarınızı kontrol edin."],
      socialSensor: { competitors: [], warnings: ["Bağlantı sorunu"] }
    };
  }
};
