const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export const generateGeminiResponse = async (prompt, history = [], audioBase64 = null, imageBase64 = null) => {
  try {
    const contents = [...history];

    const parts = [];
    if (audioBase64) {
      parts.push({
        inline_data: {
          mime_type: 'audio/mp4',
          data: audioBase64
        }
      });
      parts.push({ text: prompt || "Lütfen bu sesli mesajı analiz et. Önce kullanıcının ne dediğini tam olarak yazıya dök (transkript), sonra cevabını ver. Format: TRANSKRİPT: [metin] ||| CEVAP: [cevap]" });
    } else if (imageBase64) {
      parts.push({
        inline_data: {
          mime_type: 'image/jpeg',
          data: imageBase64
        }
      });
      parts.push({ text: prompt || "Bu resimde ne görüyorsun? Mühendislik perspektifiyle analiz et ve Nokta Vision asistanı olarak yorumla." });
    } else {
      parts.push({ text: prompt });
    }

    contents.push({ role: 'user', parts });

    const response = await fetch(`${BASE_URL}?key=${API_KEY}`, {

      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    if (error.message.includes('high demand')) {
      return 'Şu an çok fazla istek var, Google sunucuları biraz meşgul. Lütfen birkaç saniye sonra tekrar dene.';
    }
    return 'Üzgünüm, şu an bir hata oluştu: ' + error.message;
  }

};
