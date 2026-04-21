import { GoogleGenerativeAI } from '@google/generative-ai';
import { AnalysisResult } from '../types';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY ?? '';
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';

// Sadece geçerli bir Gemini anahtarı varsa genAI başlat
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

const SYSTEM_PROMPT = `
Sen Nokta platformunun Kıdemli Due Diligence motorusun. Görevin verilen bir startup pitch içeriğini (metin veya döküman) analiz etmek.

Analiz sırasında şunlara odaklan:
1. Pitch içindeki somut iddiaları (pazar payı, büyüme hızı, teknik özellik vb.) tespit et.
2. Her iddiayı kategorize et: GÜÇLÜ (kanıtlanabilir), ABARTILI (desteklenmemiş) veya DOĞRULANAMAZ (gerçek dışı veya spekülatif).
3. 0–100 arası bir "Slop Skoru" (gereksiz laf kalabalığı ve abartı oranı) hesapla. (100 = tamamen içi boş/abartı).
4. Yatırımcı gözüyle bir özet ve net bir öneri yaz.

SADECE aşağıdaki JSON formatında yanıt ver:
{
  "slopScore": <sayı>,
  "summary": "<Türkçe özet>",
  "claims": [{"text": "<iddia metni>", "verdict": "GÜÇLÜ" | "ABARTILI" | "DOĞRULANAMAZ", "reasoning": "<neden bu sonuç verildi?>"}],
  "recommendation": "<yatırımcıya net öneri>"
}
`;

export async function analyzePitch(pitch: string): Promise<AnalysisResult> {
  if (!GROQ_API_KEY && !GEMINI_API_KEY) {
    return getMockResult(pitch);
  }

  // Gemini daha iyi sonuç verdiği için varsa önce onu dene (özellikle PDF desteği için)
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent([SYSTEM_PROMPT, pitch]);
      const response = await result.response;
      const text = response.text();
      const cleanedJson = text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanedJson) as AnalysisResult;
    } catch (error) {
      console.error("Gemini hatası, Groq deneniyor:", error);
    }
  }
  
  return analyzeWithGroq(pitch);
}

async function analyzeWithGroq(pitch: string): Promise<AnalysisResult> {
  if (!GROQ_API_KEY) return getMockResult(pitch);

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: pitch }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) throw new Error(`API Hatası: ${response.status}`);
  const data = await response.json();
  return JSON.parse(data.choices[0]?.message?.content || '{}');
}

export async function analyzeFile(base64: string, mimeType: string): Promise<AnalysisResult> {
  if (!genAI) {
    throw new Error("Dosya analizi için Google Gemini API anahtarı gereklidir. Lütfen ayarlardan ekleyin.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent([
    SYSTEM_PROMPT,
    {
      inlineData: {
        data: base64,
        mimeType: mimeType
      }
    }
  ]);

  const response = await result.response;
  const text = response.text();
  const cleanedJson = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleanedJson) as AnalysisResult;
}

export async function askAiQuestion(pitch: string, question: string, context: AnalysisResult): Promise<string> {
  const prompt = `
  Analiz edilen startup pitch: "${pitch}"
  Mevcut Slop Analizi: ${JSON.stringify(context)}
  
  Kullanıcının sorusu: "${question}"
  
  Lütfen bu startup hakkındaki soruyu bir profesyonel yatırımcı gibi detaylı ama net şekilde Türkçeyle yanıtla. Sadece gerçeğe ve analize dayalı konuş.
  `;

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (e) {
      console.error("Gemini sohbet hatası, Groq deneniyor:", e);
    }
  }

  // Groq Fallback
  if (!GROQ_API_KEY) throw new Error("Sohbet için bir API anahtarı (Gemini veya Groq) gereklidir.");

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: "Sen Nokta platformunun Kıdemli Due Diligence motorusun." },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile'
    })
  });

  if (!response.ok) throw new Error(`Sohbet API Hatası: ${response.status}`);
  const data = await response.json();
  return data.choices[0]?.message?.content || 'Yanıt alınamadı.';
}

export async function transcribeAudio(uri: string): Promise<string> {
  if (!GROQ_API_KEY) return "Demo Modu: Ses transkripsiyonu simüle ediliyor...";

  const formData = new FormData();
  
  // React Native fetch için en güvenli dosya yapısı
  const fileToUpload = {
    uri: uri,
    type: 'audio/m4a',
    name: 'audio.m4a',
  };
  
  // @ts-ignore
  formData.append('file', fileToUpload);
  formData.append('model', 'whisper-large-v3-turbo');

  try {
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Accept': 'application/json',
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Groq Transkripsiyon Hatası:", errorData);
      throw new Error(`Transkripsiyon hatası: ${response.status}`);
    }
    
    const data = await response.json();
    return data.text || '';
  } catch (error) {
    console.error("Transkripsiyon isteği başarısız:", error);
    throw error;
  }
}

function getMockResult(pitch: string): AnalysisResult {
  const wordCount = pitch.split(' ').length;
  const buzzwords = ['yıkıcı', 'devrim', 'yapay zeka', 'blockchain', 'trilyon', 'milyar', 'roket', 'benzersiz'];
  const buzzCount = buzzwords.filter(w => pitch.toLowerCase().includes(w)).length;
  const slopScore = Math.min(95, 20 + buzzCount * 15 + (wordCount < 40 ? 25 : 0));

  return {
    slopScore,
    summary: `Bu pitch ${wordCount} kelimeden oluşuyor ve ${buzzCount} adet yüksek riskli kelime içeriyor. Çevrimdışı modda analiz edilmiştir.`,
    claims: [
      { text: "Pazar liderliği iddiası", verdict: "ABARTILI", reasoning: "Kanıt ve pazar verisi sunulmamış." },
      { text: "Teknik altyapı", verdict: "GÜÇLÜ", reasoning: "Takım deneyimi bu iddiayı destekliyor olabilir." }
    ],
    recommendation: slopScore > 60 
      ? "Yüksek slop riski. Somut veriler istenmeden ilerlenmemeli." 
      : "Makul bir pitch. İkinci bir görüşme önerilir."
  };
}
