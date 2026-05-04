import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the API only when we need to use it.
const getGenAI = () => {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('API Key is missing. Please set EXPO_PUBLIC_GEMINI_API_KEY.');
  }
  return new GoogleGenerativeAI(apiKey);
};

export const processNotes = async (notes) => {
  if (!notes || notes.trim().length === 0) {
    throw new Error('Notes are empty.');
  }

  const genAI = getGenAI();
  const prompt = `
    You are an AI assistant designed to clean, deduplicate, and categorize messy notes.
    The user will provide you with a raw text block (e.g., WhatsApp exports, scattered bullet points).
    
    Your Tasks:
    1. Clean up "slop" (useless text, conversational filler, timestamps, etc.).
    2. Deduplicate similar or identical ideas into single, concise points.
    3. Categorize each point into one of the following domains: "Technical", "Business", "Design", or "Other".
    
    You MUST output the result ONLY as a strictly formatted JSON array containing the processed ideas. Do not include any conversational text before or after the JSON.
    
    JSON Schema:
    [
      { "id": number, "title": string, "category": string, "desc": string }
    ]
    
    Make the "title" short and punchy. Make the "desc" descriptive but concise. Start "id" at 1 and increment.
    
    Notes to process:
    """
    ${notes}
    """
  `;

  // Provide fallbacks in case of "Service Unavailable" (503) or Rate Limits (429)
  // Prioritize flash-lite to avoid rate limit spans on 2.0/2.5.
  const modelsToTry = ["gemini-flash-lite-latest", "gemini-2.5-flash", "gemini-2.0-flash"];
  let finalError = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      const match = responseText.match(/\[[\s\S]*\]/);
      if (!match) {
        throw new Error('Failed to parse AI response: No JSON array found.');
      }
      
      const parsedData = JSON.parse(match[0]);
      return parsedData; // Success! No need to try other models.
    } catch (error) {
      // Silently record error, it will throw finalError if all models fail.
      finalError = error;
    }
  }

  throw new Error(finalError.message || 'An error occurred during AI processing.');
};
