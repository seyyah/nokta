import { GoogleGenAI, Type } from "@google/genai";

interface IdeaCard {
  title: string;
  description: string;
}

interface IdeaOrganizerResponse {
  cards: IdeaCard[];
}

export async function organizeIdeas(notes: string): Promise<IdeaOrganizerResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Please add it to your secrets.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        text: `You are an expert idea organizer and brainstormer. 
Your task is to take messy brainstorming notes and turn them into a structured set of idea cards.

Rules:
1. Remove exact or near-identical duplicates.
2. Merge ideas that are conceptually similar into a single, cohesive card.
3. Split multi-part thoughts into separate, clear idea cards.
4. For each resulting card, provide a punchy "title" and a clear "one sentence description".

Output format: Return ONLY valid JSON in the following schema:
{
  "cards": [
    {
      "title": "Short Descriptive Title",
      "description": "One sentence that captures the essence of the idea."
    }
  ]
}

Messy brainstorming notes:
${notes}`,
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          cards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ["title", "description"],
            },
          },
        },
        required: ["cards"],
      },
    },
  });

  try {
    const data = JSON.parse(response.text || "{}");
    if (!data.cards || !Array.isArray(data.cards)) {
      throw new Error("Invalid response format from AI");
    }
    return data as IdeaOrganizerResponse;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Could not organize ideas. Please try again.");
  }
}
