export const callGeminiAPI = async (prompt, apiKey) => {
  const cleanKey = apiKey ? apiKey.trim() : '';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(cleanKey)}`;
  console.log("Calling Gemini API URL:", url.split('?key=')[0]);

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Gemini Response Body:", errorBody);
      throw new Error(`Gemini API Request Failed: Status ${response.status}. Details: ${errorBody}`);
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      throw new Error('Invalid response structure from Gemini API');
    }

    return textResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
