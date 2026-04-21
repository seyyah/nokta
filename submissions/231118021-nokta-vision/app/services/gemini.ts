// OpenRouter API — rate limit yok, ücretsiz modeller
const OPENROUTER_API_KEY = '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';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemma-3-27b-it:free';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function askAI(prompt: string, retries = 3): Promise<string> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://nokta.app',
      'X-Title': 'Nokta Vision',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  // 429 Rate limit — otomatik bekle ve tekrar dene
  if (response.status === 429 && retries > 0) {
    const waitMs = (4 - retries) * 15000; // 15s, 30s, 45s
    console.warn(`Rate limit hit, ${waitMs/1000}s bekleniyor... (${retries} deneme kaldı)`);
    await sleep(waitMs);
    return askAI(prompt, retries - 1);
  }

  const data = await response.json();

  if (data.error) {
    const msg = data.error.message || 'OpenRouter API error';
    // Provider hatası da retry'a düşsün
    if (retries > 0 && (response.status === 429 || msg.includes('Provider'))) {
      await sleep(10000);
      return askAI(prompt, retries - 1);
    }
    throw new Error(msg);
  }

  if (!data.choices || data.choices.length === 0) {
    throw new Error('No response from AI');
  }

  return data.choices[0].message.content;
}

export async function generateEngineeringQuestions(idea: string): Promise<string[]> {
  const prompt = `Sen Nokta AI'sın, mühendislik odaklı bir fikir geliştirme asistanısın. Kullanıcının ham fikri: "${idea}". 
  Bu fikri bir ürün spesifikasyonuna dönüştürmek için tam olarak 3 kritik mühendislik sorusu oluştur.
  Sorular şu konuları kapsamalı: Problem, Kullanıcı, Kapsam/Kısıtlamalar.
  SADECE 3 stringden oluşan geçerli bir JSON dizisi döndür, markdown veya ekstra metin olmadan. Tüm sorular Türkçe olsun.
  Örnek: ["Soru 1?", "Soru 2?", "Soru 3?"]`;

  const response = await askAI(prompt);
  const cleanJson = response.replace(/```json|```/g, '').trim();
  const match = cleanJson.match(/\[.*\]/s);
  if (!match) throw new Error('AI yanıtı JSON formatına dönüştürülemedi');
  return JSON.parse(match[0]);
}

export async function generateFinalSpec(idea: string, answers: string[]): Promise<string> {
  const prompt = `Aşağıdaki fikir ve mühendislik soru-cevaplarına dayanarak tek sayfalık profesyonel bir ürün spesifikasyonu oluştur.
  
  Fikir: ${idea}
  Soru-Cevap: ${JSON.stringify(answers)}
  
  Markdown formatında yaz. Tüm içerik Türkçe olsun. Bölümler: Genel Bakış, Problem Tanımı, Hedef Kitle, MVP Özellikleri, Teknik Mimari, Kısıtlamalar.
  Özgün, profesyonel ve teknik bir dil kullan.`;

  return await askAI(prompt);
}
