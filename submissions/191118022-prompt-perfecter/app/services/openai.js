// API anahtarını .env dosyasından okuyun: EXPO_PUBLIC_OPENAI_API_KEY=sk-...
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL_NAME = 'gpt-5.4-mini';

/**
 * Generate 4 engineering questions for a given prompt
 */
export async function generateQuestions(userPrompt) {
  const systemInstruction = `Sen bir fikir mühendisi asistansın. Kullanıcı sana ham bir fikir cümlesi verecek.
Bu fikri "mükemmel bir AI promptu"na dönüştürmek için tam olarak 4 soru sor.
Sorular şu mühendislik boyutlarını kapsamalı: Problem, Hedef Kullanıcı, Kapsam, Kısıtlar.
Yanıtını SADECE JSON formatında ver, başka hiçbir şey yazma:
{
  "questions": [
    {"id": 1, "category": "Problem", "question": "..."},
    {"id": 2, "category": "Hedef Kullanıcı", "question": "..."},
    {"id": 3, "category": "Kapsam", "question": "..."},
    {"id": 4, "category": "Kısıt", "question": "..."}
  ]
}`;

  const body = {
    model: MODEL_NAME,
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: `Ham fikir: "${userPrompt}"` }
    ],
    temperature: 0.7,
    response_format: { type: "json_object" }
  };

  const response = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'OpenAI API hatası');
  }

  const data = await response.json();
  const text = data.choices[0].message.content;
  
  return JSON.parse(text);
}

/**
 * Generate the perfect prompt and slop score based on Q&A
 */
export async function generatePerfectPrompt(userPrompt, questions, answers) {
  const qaContext = questions.map((q, i) => 
    `${q.category}: "${q.question}"\nCevap: "${answers[i] || 'Belirtilmedi'}"`
  ).join('\n\n');

  const systemInstruction = `Sen bir prompt mühendisi uzmanısın. Kullanıcının ham fikri ve verdiği cevapları analiz ederek:
1. Yaratıcı, detaylı ve etkileyici bir "mükemmel prompt" üret (türkçe, 150-250 kelime)
2. Fikrin özgünlük/slop skorunu hesapla (0=tamamen klişe, 10=çok özgün)
3. Slop skoru için gerekçe ve özgünlük önerisi ver

Yanıtını SADECE JSON formatında ver:
{
  "perfectPrompt": "...",
  "slopScore": 7,
  "slopReason": "...",
  "originalityTip": "..."
}`;

  const body = {
    model: MODEL_NAME,
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: `Ham fikir: "${userPrompt}"\n\nMühendislik Soruları ve Cevapları:\n${qaContext}` }
    ],
    temperature: 0.8,
    response_format: { type: "json_object" }
  };

  const response = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'OpenAI API hatası');
  }

  const data = await response.json();
  const text = data.choices[0].message.content;
  
  return JSON.parse(text);
}
