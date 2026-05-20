export interface RawSpec {
  title: string;
  rawIdea: string;
  problem: string;
  user: string;
  solution: string;
  scope: string;
  constraints: string;
}

const getGeminiKey = () => process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const getGroqKey = () => process.env.EXPO_PUBLIC_GROQ_API_KEY || '';

export const ai = {
  isConfigured(): boolean {
    return !!getGeminiKey() || !!getGroqKey();
  },

  async generateQuestions(rawIdea: string): Promise<string[]> {
    const geminiKey = getGeminiKey();
    const groqKey = getGroqKey();

    if (!geminiKey && !groqKey) {
      console.log('No API keys configured. Using Mock Question Engine.');
      return this.generateMockQuestions(rawIdea);
    }

    const systemPrompt = `You are Nokta Question Engine, an expert engineering architect. The user will provide a raw, unstructured product idea.
Your job is to generate exactly 5 customized, deep engineering questions in Turkish, one for each of the following dimensions:
1. Problem (Bu fikir hangi özel problemi çözüyor?)
2. Hedef Kullanıcı (Bu çözümü kimler kullanacak?)
3. Kapsam/Scope (Bu uygulamanın MVP kapsamına neler dahil olmalı?)
4. Kısıtlamalar/Constraints (Teknik, bütçe veya zaman kısıtları nelerdir?)
5. Gerekçe/Necessity (Neden bu çözüm şimdi gerekli?)

Önemli: Sorular doğrudan kullanıcının fikriyle alakalı ve spesifik olmalı. Genel veya jenerik sorular olmasın.
Çıktı formatı: SADECE geçerli bir JSON array olmalıdır. Örn: ["soru 1", "soru 2", "soru 3", "soru 4", "soru 5"]`;

    const userPrompt = `Kullanıcı Fikri: "${rawIdea}"`;

    try {
      let jsonText = '';
      if (geminiKey) {
        jsonText = await callGemini(geminiKey, systemPrompt, userPrompt);
      } else {
        jsonText = await callGroq(groqKey!, systemPrompt, userPrompt);
      }

      const cleanJson = extractJson(jsonText);
      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed) && parsed.length === 5) {
        return parsed;
      }
      throw new Error('Parsed response does not contain exactly 5 questions');
    } catch (error) {
      console.error('AI generateQuestions failed, falling back to mock:', error);
      return this.generateMockQuestions(rawIdea);
    }
  },

  async generateSpec(rawIdea: string, questions: string[], answers: string[]): Promise<RawSpec> {
    const geminiKey = getGeminiKey();
    const groqKey = getGroqKey();

    if (!geminiKey && !groqKey) {
      console.log('No API keys configured. Using Mock Spec Generator.');
      return this.generateMockSpec(rawIdea, questions, answers);
    }

    const qaPairs = questions.map((q, i) => `Soru: ${q}\nCevap: ${answers[i] || 'Belirtilmedi'}`).join('\n\n');

    const systemPrompt = `You are Nokta Spec Generator, a expert engineering architect. You take a raw idea and the answers to 5 engineering questions.
You must compile them into a structured, single-page product specification (spec) in Turkish.
Önemli: Çıktı tamamen profesyonel, slop barındırmayan, net bir mühendislik belgesi olmalıdır. Gereksiz heyecanlı kelimeler ("harika", "mükemmel", "devrimsel") kullanmayın.

Çıktı formatı: SADECE geçerli bir JSON objesi olmalıdır. Örn:
{
  "title": "Ürün Adı",
  "problem": "Çözülen problemin kısa ve net özeti",
  "user": "Hedef kullanıcı grubunun tanımı",
  "solution": "Sunulan çözümün ana hatları",
  "scope": "MVP kapsamı (maddeler halinde)",
  "constraints": "Teknik ve operasyonel kısıtlar"
}`;

    const userPrompt = `Ham Fikir: ${rawIdea}\n\n${qaPairs}`;

    try {
      let jsonText = '';
      if (geminiKey) {
        jsonText = await callGemini(geminiKey, systemPrompt, userPrompt);
      } else {
        jsonText = await callGroq(groqKey!, systemPrompt, userPrompt);
      }

      const cleanJson = extractJson(jsonText);
      const parsed = JSON.parse(cleanJson);

      return {
        title: parsed.title || 'İsimsiz Fikir',
        rawIdea: rawIdea,
        problem: parsed.problem || 'Belirtilmedi',
        user: parsed.user || 'Belirtilmedi',
        solution: parsed.solution || 'Belirtilmedi',
        scope: parsed.scope || 'Belirtilmedi',
        constraints: parsed.constraints || 'Belirtilmedi'
      };
    } catch (error) {
      console.error('AI generateSpec failed, falling back to mock:', error);
      return this.generateMockSpec(rawIdea, questions, answers);
    }
  },

  generateMockQuestions(idea: string): string[] {
    // Generate tailored mock questions based on keywords in the idea
    const ideaLower = idea.toLowerCase();
    let theme = 'bu fikir';
    if (ideaLower.includes('yemek') || ideaLower.includes('mutfak') || ideaLower.includes('tarif')) {
      theme = 'yemek/tarif uygulaması';
    } else if (ideaLower.includes('pet') || ideaLower.includes('kedi') || ideaLower.includes('köpek') || ideaLower.includes('hayvan')) {
      theme = 'evcil hayvan platformu';
    } else if (ideaLower.includes('sağlık') || ideaLower.includes('doktor') || ideaLower.includes('hastane')) {
      theme = 'sağlık asistanı';
    } else if (ideaLower.includes('eğitim') || ideaLower.includes('ders') || ideaLower.includes('okul') || ideaLower.includes('öğrenci')) {
      theme = 'eğitim platformu';
    }

    return [
      `Bu ${theme} fikrinin çözmeyi amaçladığı temel problem tam olarak nedir ve mevcut çözümler neden yetersiz kalıyor?`,
      `Bu ürünü ilk kullanacak olan hedef kitle (erken benimseyenler) kimlerdir?`,
      `Uygulamanın MVP (minimum uygulanabilir ürün) sürümünde kesinlikle yer alması gereken 2-3 temel özellik nedir?`,
      `Geliştirme sürecinde karşılaşabileceğiniz en büyük teknik kısıtlama veya bağımlılık (örn: veri gizliliği, API maliyetleri) nedir?`,
      `Neden bu fikri hayata geçirmek için doğru zaman şimdi? Hangi teknolojik veya sosyal değişim bunu destekliyor?`
    ];
  },

  generateMockSpec(rawIdea: string, questions: string[], answers: string[]): RawSpec {
    // Synthesize answers
    const getAnswer = (index: number, fallback: string) => {
      return answers[index] && answers[index].trim().length > 3 ? answers[index].trim() : fallback;
    };

    const problem = getAnswer(0, "Belirtilen problemin çözümü için yapılandırılmış bir mühendislik yaklaşımı gerekir.");
    const user = getAnswer(1, "Bu fikirden doğrudan fayda sağlayacak olan spesifik kullanıcı kitlesi.");
    const scope = getAnswer(2, "MVP kapsamında yer alacak temel işlevler ve kullanıcı senaryoları.");
    const constraints = getAnswer(3, "Geliştirme aşamasında dikkate alınması gereken teknik ve operasyonel limitler.");
    const necessity = getAnswer(4, "Çözümün pazar zamanlaması ve güncel ihtiyaçlarla uyumu.");

    // Extract a potential title
    let title = 'Nokta Projesi';
    const words = rawIdea.split(' ');
    if (words.length > 1) {
      title = words.slice(0, 3).join(' ').replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") + ' Spec';
    }

    return {
      title: title,
      rawIdea: rawIdea,
      problem: problem,
      user: user,
      solution: `Ham fikir doğrultusunda geliştirilecek yazılım çözümü. Gerekçe: ${necessity}`,
      scope: scope,
      constraints: constraints
    };
  }
};

// Client-side API Calls

async function callGemini(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API responded with status ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini API');
  return text;
}

async function callGroq(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    throw new Error(`Groq API responded with status ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from Groq API');
  return text;
}

// JSON extraction helper
function extractJson(text: string): string {
  const firstOpen = text.indexOf('{');
  const firstOpenArray = text.indexOf('[');
  
  let start = -1;
  let end = -1;
  
  if (firstOpen !== -1 && (firstOpenArray === -1 || firstOpen < firstOpenArray)) {
    start = firstOpen;
    end = text.lastIndexOf('}');
  } else if (firstOpenArray !== -1) {
    start = firstOpenArray;
    end = text.lastIndexOf(']');
  }

  if (start !== -1 && end !== -1 && end > start) {
    return text.substring(start, end + 1);
  }
  return text;
}
