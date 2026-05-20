const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

export interface QA {
  question: string;
  answer: string;
}

const QUESTION_CATEGORIES = [
  'Problem (Sorun): Bu fikir hangi spesifik sorunu çözüyor?',
  'User (Kullanıcı): Birincil kullanıcı kim ve bağlamı nedir?',
  'Scope (Kapsam): Bu fikrin minimum geçerli versiyonu nedir?',
  'Constraint (Kısıt): En büyük teknik veya kaynak kısıtları nelerdir?',
  'Success Metric (Başarı Ölçütü): Fikrin başarısını nasıl ölçeceksin?',
];

async function callGemini(systemPrompt: string, userMessage: string): Promise<string> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      generationConfig: { maxOutputTokens: 512, temperature: 0.7 },
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API hatası ${response.status}: ${err}`);
  }
  const data = await response.json();
  return data.candidates[0].content.parts[0].text as string;
}

export async function askNextQuestion(idea: string, previousQAs: QA[], questionIndex: number): Promise<string> {
  const category = QUESTION_CATEGORIES[questionIndex] ?? QUESTION_CATEGORIES[4];
  const systemPrompt = `Sen ham fikirleri spec'e dönüştüren bir mühendislik danışmanısın. Türkçe yanıt ver.
Bu kategoride TEK bir odaklı soru sor: "${category}".
Soruyu 20 kelimede tut. Açıklama veya giriş yapma — sadece soruyu yaz.`;
  const history = previousQAs.map((qa, i) => `S${i + 1}: ${qa.question}\nC${i + 1}: ${qa.answer}`).join('\n');
  return callGemini(systemPrompt, `Ham fikir: "${idea}"${history ? `\n\nÖnceki S&C:\n${history}` : ''}`);
}

export async function generateSpec(idea: string, qas: QA[]): Promise<string> {
  const systemPrompt = `Sen bir ürün spec yazarısın. Fikir ve soru-cevaplara dayanarak kısa bir tek sayfalık mühendislik spec'i yaz. Türkçe yaz.
Şu bölümleri kullan:
## Sorun
## Hedef Kullanıcılar
## Kapsam (MVP)
## Kısıtlar
## Başarı Ölçütleri
## İlk Yapılacak Özellik

Somut ve direkt ol. Gereksiz söz yok. Toplam uzunluk: ~300 kelime.`;
  const history = qas.map((qa, i) => `S${i + 1}: ${qa.question}\nC${i + 1}: ${qa.answer}`).join('\n\n');
  return callGemini(systemPrompt, `Ham fikir: "${idea}"\n\nMühendislik S&C:\n${history}`);
}
