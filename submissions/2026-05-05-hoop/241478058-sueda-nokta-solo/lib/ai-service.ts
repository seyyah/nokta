import type { SlopResult } from '@/constants/slop-types';

const GROQ_API_KEY = "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";
const GROQ_MODEL = 'llama-3.1-8b-instant';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const REQUEST_TIMEOUT_MS = 5000;

function normalizeSeverity(severity: string): 'Critical' | 'High' | 'Medium' | 'Low' {
  const candidate = severity.toLowerCase();
  if (candidate === 'critical') return 'Critical';
  if (candidate === 'high') return 'High';
  if (candidate === 'medium') return 'Medium';
  return 'Low';
}

function parseModelJson(rawText: string): SlopResult {
  let payload = rawText.trim();
  
  const match = payload.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (match) {
    payload = match[1].trim();
  } else {
    const firstBrace = payload.indexOf('{');
    const lastBrace = payload.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      payload = payload.substring(firstBrace, lastBrace + 1);
    }
  }

  const parsed = JSON.parse(payload) as Partial<SlopResult>;

  if (
    typeof parsed.slop_score !== 'number' ||
    typeof parsed.is_slop !== 'boolean' ||
    typeof parsed.analysis !== 'string' ||
    !Array.isArray(parsed.flaws) ||
    !Array.isArray(parsed.engineering_questions)
  ) {
    throw new Error('Groq response is not in expected schema.');
  }

  return {
    slop_score: Math.max(0, Math.min(100, Math.round(parsed.slop_score))),
    is_slop: parsed.is_slop,
    analysis: parsed.analysis,
    flaws: parsed.flaws.map((item) => ({
      type: typeof item.type === 'string' ? item.type : 'Belirsiz Kusur',
      description: typeof item.description === 'string' ? item.description : 'Aciklama saglanmadi.',
      severity: normalizeSeverity(typeof item.severity === 'string' ? item.severity : 'Low'),
    })),
    engineering_questions: parsed.engineering_questions.map((item) => ({
      question: typeof item.question === 'string' ? item.question : 'Soru uretilmedi.',
      why_critical:
        typeof item.why_critical === 'string'
          ? item.why_critical
          : 'Bu alan model tarafindan doldurulamadi.',
      severity: normalizeSeverity(typeof item.severity === 'string' ? item.severity : 'Low'),
    })),
    similarProjects: Array.isArray(parsed.similarProjects) 
      ? parsed.similarProjects.map(String) 
      : [],
  };
}

export type AiMode = 'mentor' | 'roast';

export async function analyzeIdeaWithAiService(ideaText: string, mode: AiMode = 'mentor'): Promise<SlopResult> {
  try {
    if (!GROQ_API_KEY) {
      throw new Error('Groq API key is missing.');
    }

    const nonce = `Req-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const isRoast = mode === 'roast';
    const personaText = isRoast 
      ? `"Sen aşırı sinirli, sabırsız, inanılmaz ukala ve acımasız bir teknoloji milyarderi ve Y-Combinator yöneticisisin. Görevin gelen girişim fikirlerini YERLE BİR ETMEK ve kurucuyla dalga geçmek. Asla yapıcı olma!
1. Fikri paramparça et: 'Bu ne saçmalık?', 'İki tane havalı kelimeyi yan yana koyunca Steve Jobs olmuyorsun.', 'Hangi enayi buna yatırım yapar?', 'Sıfır mantık, %100 slop.' gibi spesifik cümleler kullanarak fikri acımasızca ez!
2. Spesifik Analiz: Dili son derece alaycı, küstah ve sinirli tut. 'analysis' (genel değerlendirme) ve 'description/why_critical' gibi tüm uzun açıklama alanlarında bu vahşi dili sürdür. Kesinlikle kibar geçişler yapma.
3. Market Analizi: Pazarda onlardan daha iyi yapanları gösterip, kurucunun ne kadar hayalperest olduğunu ve bu rezil fikirle kimsenin ilgilenmeyeceğini sertçe vurgula."`
      : `"Sen deneyimli, yapıcı ve vizyoner bir Mentor Mühendissin. Amacın, girişim fikirlerindeki gereksiz karmaşıklığı ('Slop') bulmak ve kullanıcıya pozitif bir dille yol göstermektir.
1. Fikri değerlendir: Gereksiz teknolojiler (AI, Blockchain vb.) kullanılıyorsa, yapıcı ve yüreklendirici bir şekilde daha basit alternatiflere yönlendir.
2. Spesifik Analiz: Asla heves kırma. Çözüm odaklı yapıcı eleştiriler sun.
3. Market Analizi: Pazardaki benzer projeleri göster, onlardan ilham almasını sağla."`;

    const prompt = `
${personaText}
ÇOK ÖNEMLİ: Yanıtlarını kesinlikle kusursuz ve tam Türkçe karakterler (ç, ş, ğ, ü, ö, ı) kullanarak ver. Başka bir dil kullanma.

Beklenen schema:
{
  "slop_score": number (0-100),
  "is_slop": boolean,
  "analysis": string,
  "flaws": [
    { "type": string, "description": string, "severity": "Critical" | "High" | "Medium" | "Low" }
  ],
  "engineering_questions": [
    { "question": string, "why_critical": string, "severity": "Critical" | "High" | "Medium" | "Low" }
  ],
  "similarProjects": [
    "Proje 1: Neden benziyor...",
    "Proje 2: Neden benziyor..."
  ]
}

Kurallar:
- En az 3 flaw ver.
- En az 2 engineering question ver.
- Dil Turkce olsun.
- KESİNLİKLE Markdown kullanma, obje değerlerinde (örn. description, question) *, ** veya madde işaretleri bulunmamalıdır. Düz metin kullan.

Fikir:
${ideaText}

Benzersiz İşlem Kimliği: ${nonce} (Bu ID'yi analizde yansıtma, sadece cache kırmak içindir ve her seferinde sıfırdan düşün)
`.trim();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          temperature: 0.3,
          messages: [
            {
              role: 'system',
              content: `Sen ${mode === 'roast' ? 'aşırı sinirli, alaycı ve acımasız biçimde ukala bir teknoloji milyarderisin. Fikirleri aşağıla ve sert çık, asla kibar olma.' : 'yapıcı bir mühendissin.'} Yanıtlarında UTF-8 Türkçe karakterler (ç, ş, ğ, ü, ö, ı) kullanmalısın. You must return ONLY a raw, valid JSON object. DO NOT output any Markdown formatting (like * or **), bullet points, conversational text, or code blocks. The response must start with { and end with }.`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq request failed (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const rawText = data.choices?.[0]?.message?.content;
    if (!rawText) {
      throw new Error('Groq response was empty.');
    }

    return parseModelJson(rawText);
  } catch (error) {
    const resolvedError =
      error instanceof Error ? error : new Error('Bilinmeyen bir API hatasi olustu.');

    if (
      resolvedError.name === 'TypeError' &&
      /fetch|network|failed|cors/i.test(resolvedError.message)
    ) {
      console.error('Groq API request error (possible CORS/network issue in browser):', resolvedError);
    } else {
      console.error('Groq API request error:', resolvedError);
    }

    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert(`API Hatasi: ${resolvedError.message}`);
    }

    throw resolvedError;
  }
}

export async function detoxIdeaWithAiService(ideaText: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.2, // Lower temp for more deterministic stripping
        messages: [
          {
             role: 'system',
             content: 'Sen bir MVP minimalistisin. Sana verilen saçma sapan ve buzzword dolu (AI, Web3, Blockchain) fikirleri alıp, teknoloji kelimelerini budayarak sadece işin "özünü" anlatan, en ucuz ve yapılabilir (MVP) versiyonuna çevirip 1-2 cümlelik tertemiz, no-code veya basit yazılım odaklı bir fikir olarak geri döndürürsün. Sadece sonucu ver, Merhaba gibi girişler yapma. Türkçe cevap ver.'
          },
          {
             role: 'user',
             content: ideaText
          }
        ]
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
     throw new Error('Groq detoks failed');
  }

  const data = await response.json();
  const result = data.choices?.[0]?.message?.content;
  if (!result) throw new Error('Detoks sonuc bos');
  return result.trim();
}
