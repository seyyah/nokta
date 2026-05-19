const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || "YOUR_GROQ_API_KEY";

export const generateResponse = async (userPrompt, chatHistory = []) => {
  try {
    const messages = [
      {
        role: "system",
        content: "Sen 'Nokta' adında, arkadaş canlısı, biraz esprili ve tatlı bir yapay zeka asistanısın. Yanıtlarını kısa, samimi ve mobil chat ekranına uygun şekilde tut. Kullanıcı sana Türkçe yazacaktır."
      },
      ...chatHistory,
      {
        role: "user",
        content: userPrompt
      }
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + GROQ_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: messages,
        temperature: 0.7,
        max_completion_tokens: 512
      })
    });

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    }
    return "Sanırım bir hata oluştu, tekrar dener misin?";
  } catch (error) {
    console.error("Brain Error:", error);
    return "Bağlantıda bir sorun var galiba 😅";
  }
};
