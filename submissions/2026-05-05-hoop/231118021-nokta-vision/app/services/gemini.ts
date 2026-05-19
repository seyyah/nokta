// OpenRouter API — rate limit yok, ücretsiz modeller
const OPENROUTER_API_KEY = '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';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Fallback listesi — biri çalışmazsa diğerine geçer
const FREE_MODELS = [
  'google/gemini-2.0-flash-exp:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen-2.5-72b-instruct:free',
  'google/gemma-2-9b-it:free',
  'mistralai/mistral-7b-instruct:free',
  'microsoft/phi-3-medium-128k-instruct:free',
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function callModel(model: string, messages: {role: string, content: string}[]): Promise<Response> {
  return fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://nokta.app',
      'X-Title': 'Nokta Vision',
    },
    body: JSON.stringify({ model, messages }),
  });
}

export async function askAI(prompt: string): Promise<string> {
  for (const model of FREE_MODELS) {
    try {
      const response = await callModel(model, [{ role: 'user', content: prompt }]);

      // Rate limit veya provider hatası → sonraki modele geç
      if (response.status === 429 || response.status === 404) {
        console.warn(`Model atlanıyor (${response.status}): ${model}`);
        if (response.status === 429) await sleep(1000); // 1 saniye bekle
        continue;
      }

      const data = await response.json();

      if (data.error) {
        const msg: string = data.error.message || '';
        console.warn(`Model hatası (${model}): ${msg}`);
        // Her türlü hata için sonraki modele geç
        continue;
      }

      if (!data.choices || data.choices.length === 0) {
        console.warn(`Model boş yanıt (${model}), sonraki deneniyor...`);
        continue;
      }

      return data.choices[0].message.content;
    } catch (err: any) {
      console.warn(`Model exception (${model}): ${err.message}`);
      continue;
    }
  }
  throw new Error('Tüm modeller kullanılamıyor. Lütfen daha sonra tekrar deneyin.');
}

export async function askExpert(messages: {role: string, content: string}[]): Promise<string> {
  const systemPrompt = {
    role: 'system',
    content: `Sen Nokta Projesi'nin "Kıdemli Ürün Stratejisti Kerem"sin. 
    Görevin: Kullanıcıların teknoloji fikirlerini pazar uyumu, gelir modeli ve teknik sürdürülebilirlik açısından analiz etmektir.
    Kişilik: Vizyoner, hafif sert ama yapıcı, profesyonel bir danışman. 
    Kısıtlamalar: Sadece ürün stratejisi konuş. Kod yazma. 
    Cevaplarında mutlaka şu üçlemeden en az birine değin: "Pazar İhtiyacı", "Teknik Borç" veya "Ölçeklenebilirlik".
    Türkçe konuş ve her zaman profesyonel kal.`
  };

  for (const model of FREE_MODELS) {
    try {
      const response = await callModel(model, [systemPrompt, ...messages]);

      if (response.status === 429 || response.status === 404) {
        console.warn(`Expert model atlanıyor (${response.status}): ${model}`);
        if (response.status === 429) await sleep(1000); // 1 saniye bekle
        continue;
      }

      const data = await response.json();

      if (data.error) {
        console.warn(`Expert model hatası (${model}): ${data.error.message}`);
        continue;
      }

      if (!data.choices || data.choices.length === 0) {
        continue;
      }

      return data.choices[0].message.content;
    } catch (err: any) {
      console.warn(`Expert model exception (${model}): ${err.message}`);
      continue;
    }
  }
  throw new Error('Tüm modeller kullanılamıyor.');
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
