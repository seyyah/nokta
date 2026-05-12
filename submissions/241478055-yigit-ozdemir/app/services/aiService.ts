/**
 * Nokta — AI Servis Katmanı (Groq API)
 * Slop-free, mühendislik rehberli AI etkileşimleri.
 * Groq Cloud — LLaMA 3.3 70B (OpenAI uyumlu REST API).
 */

const API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY ?? '';
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

// ─── Tipler ──────────────────────────────────────────────────

export interface AIError {
  type: 'API_ERROR' | 'PARSE_ERROR' | 'NETWORK_ERROR' | 'SLOP_DETECTED';
  message: string;
}

export interface QuestionsResult {
  success: true;
  questions: string[];
}

export interface ArtifactResult {
  success: true;
  artifact: {
    thesis: string;
    problem: string;
    techConstraints: string;
  };
}

export type QuestionsResponse = QuestionsResult | { success: false; error: AIError };
export type ArtifactResponse = ArtifactResult | { success: false; error: AIError };

// ─── Temel API Çağrısı ──────────────────────────────────────

async function callAI(systemInstruction: string, userPrompt: string): Promise<string> {
  if (!API_KEY) {
    throw { type: 'API_ERROR', message: 'Groq API anahtarı yapılandırılmamış.' } as AIError;
  }

  const body = {
    model: MODEL,
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
    max_tokens: 2048,
    top_p: 0.8,
  };

  let response: Response;
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw {
      type: 'NETWORK_ERROR',
      message: 'Ağ isteği başarısız oldu. Bağlantınızı kontrol edip tekrar deneyin.',
    } as AIError;
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Bilinmeyen hata');
    throw {
      type: 'API_ERROR',
      message: `Groq API ${response.status} hatası döndü: ${errorBody.slice(0, 200)}`,
    } as AIError;
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;

  if (!text || typeof text !== 'string') {
    throw {
      type: 'PARSE_ERROR',
      message: 'AI\'dan boş veya hatalı biçimli yanıt alındı.',
    } as AIError;
  }

  return text.trim();
}

// ─── Slop Tespiti (Çok Katmanlı) ─────────────────────────────

function isSlopInput(text: string): boolean {
  const trimmed = text.trim();

  // 1. Minimum uzunluk
  if (trimmed.length < 10) return true;

  // 2. Düşük eforlu bilinen girdiler
  const lowEffort = /^(test|merhaba|selam|deneme|asdf|qwer|xxx|aaa|bbb|help|fikir|uygulama|şey|hello|hi|hey|lol|ok|evet|hayır|naber)$/i;
  if (lowEffort.test(trimmed)) return true;

  // 3. Aynı karakterin 3+ tekrarı (aaa, qqq, www)
  if (/(.)\1{2,}/i.test(trimmed)) return true;

  // 4. Ünsüz kümeleri: Bir kelimede peş peşe 4+ ünsüz harf varsa → gibberish
  const consonantCluster = /[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]{4,}/;
  const words = trimmed.split(/\s+/);
  const clusterHits = words.filter((w) => consonantCluster.test(w)).length;
  if (words.length > 0 && clusterHits / words.length > 0.5) return true;

  // 5. Sesli harf oranı: Gerçek dillerde (TR/EN) genellikle %15-45 arası
  const vowels = trimmed.match(/[aeıioöuüAEIİOÖUÜ]/g)?.length ?? 0;
  const vowelRatio = vowels / trimmed.replace(/\s/g, '').length;
  if (vowelRatio < 0.12) return true;

  // 6. Düşük entropi: Çok az farklı karakter kullanımı
  const charFreq: Record<string, number> = {};
  const lower = trimmed.toLowerCase().replace(/\s/g, '');
  for (const ch of lower) {
    charFreq[ch] = (charFreq[ch] || 0) + 1;
  }
  const uniqueChars = Object.keys(charFreq).length;
  // Gerçek metinlerde genellikle 8+ farklı karakter bulunur
  if (lower.length > 15 && uniqueChars < 6) return true;

  // 7. Kelime yapısı kontrolü: Hiç boşluk yoksa ve uzun tek kelimeyse → gibberish
  if (!trimmed.includes(' ') && trimmed.length > 25) return true;

  // 8. Tekrarlayan kalıp tespiti: "qwqwqw", "abcabc" gibi
  if (hasRepeatingPattern(trimmed.replace(/\s/g, ''))) return true;

  // 9. Gerçek kelime yapısı testi: Her kelime 2-20 harf arası olmalı,
  //    en az bir kelime sesli harf içermeli
  const realWords = words.filter((w) => {
    if (w.length < 2 || w.length > 25) return false;
    return /[aeıioöuüAEIİOÖUÜ]/i.test(w);
  });
  if (words.length > 0 && realWords.length / words.length < 0.4) return true;

  return false;
}

/**
 * Tekrarlayan alt dizi kalıplarını tespit eder.
 * Örn: "abcabc" → true, "qwqwqw" → true
 */
function hasRepeatingPattern(s: string): boolean {
  const len = s.length;
  if (len < 6) return false;
  // 2-5 karakter uzunluğunda tekrarlayan kalıpları ara
  for (let patLen = 2; patLen <= 5; patLen++) {
    const pattern = s.slice(0, patLen);
    let repeats = 0;
    for (let i = 0; i < len - patLen + 1; i += patLen) {
      if (s.slice(i, i + patLen) === pattern) repeats++;
    }
    // Metnin %60'ından fazlası aynı kalıpla oluşuyorsa → slop
    if (repeats >= Math.floor(len / patLen) * 0.6) return true;
  }
  return false;
}

// ─── Genel Fonksiyonlar ─────────────────────────────────────

/**
 * Ham fikri analiz eder ve tam olarak 5 mühendislik sorusu üretir.
 */
export async function generateQuestions(rawDot: string): Promise<QuestionsResponse> {
  if (isSlopInput(rawDot)) {
    return {
      success: false,
      error: {
        type: 'SLOP_DETECTED',
        message:
          'Girdi slop (düşük kaliteli içerik) olarak tespit edildi. Lütfen analiz edilebilecek kadar detaylı (ne, kim, neden) gerçek bir fikir girin.',
      },
    };
  }

  const systemInstruction = `Sen, slop-free bir mühendislik ortamında çalışan Kıdemli bir Sistem Mimarısın.
Görevin: Aşağıdaki ham fikri analiz et. Fikri somut bir spesifikasyona dönüştürmeye yardımcı olacak, keskin, teknik ve sınır belirleyici tam olarak 5 mühendislik sorusu üret.

Kurallar:
- Çıktı tam olarak 5 string içeren geçerli bir JSON dizisi OLMALIDIR. Örnek: ["Soru 1?", "Soru 2?", ...]
- Soruları TÜRKÇE yaz.
- Her soru farklı bir boyutu incelemeli: problem netliği, hedef kullanıcı, teknik fizibilite, kapsam sınırları veya farklılaşma.
- Selamlama yok, iltifat yok, dolgu metin yok. Saf teknik sorgulama.
- Fikir belirsizse, sorularınız kesinlik dayatmalı.
- Asla "Harika fikir" veya "Yardımcı olmaktan memnuniyet duyarım" ya da herhangi bir sosyal nezaket ifadesi kullanma.
- SADECE JSON dizisini çıktı olarak ver. Öncesinde veya sonrasında başka hiçbir şey olmasın.`;

  const userPrompt = `Ham Fikir (Nokta):\n"""${rawDot}"""`;

  try {
    const raw = await callAI(systemInstruction, userPrompt);

    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw {
        type: 'PARSE_ERROR',
        message: 'AI yanıtı geçerli bir JSON dizisi içermiyordu.',
      } as AIError;
    }

    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed) || parsed.length === 0 || parsed.some((q: unknown) => typeof q !== 'string')) {
      throw {
        type: 'PARSE_ERROR',
        message: 'AI geçersiz bir soru formatı döndürdü.',
      } as AIError;
    }

    const questions = parsed.slice(0, 5) as string[];
    return { success: true, questions };
  } catch (err) {
    if ((err as AIError).type) {
      return { success: false, error: err as AIError };
    }
    return {
      success: false,
      error: {
        type: 'PARSE_ERROR',
        message: `AI yanıtı ayrıştırılamadı: ${String(err)}`,
      },
    };
  }
}

/**
 * Fikir + cevaplardan yapılandırılmış Proje Anayasası çıktısı oluşturur.
 */
export async function generateArtifact(
  rawDot: string,
  questions: string[],
  answers: string[]
): Promise<ArtifactResponse> {
  const qaPairs = questions
    .map((q, i) => {
      const answer = answers[i]?.trim();
      if (!answer) return null;
      return `S: ${q}\nC: ${answer}`;
    })
    .filter(Boolean)
    .join('\n\n');

  const systemInstruction = `Sen, IDEA Standardı kapsamında resmi bir Proje Anayasası taslağı hazırlayan Baş Mühendissin.
Ham fikri ve mühendislik soru-cevaplarını yapılandırılmış bir spesifikasyona sentezle.

Çıktı formatı — SADECE tam olarak şu üç anahtarı içeren geçerli JSON döndür:
{
  "thesis": "Projenin temel amacını ve değer önerisini belirten 2-4 cümlelik açıklayıcı bir ifade. TÜRKÇE yaz.",
  "problem": "Doldurulan boşluğun kesin bir açıklaması — bugün kim acı çekiyor, ne başarısız oluyor ve mevcut çözümler neden yetersiz kalıyor. 3-5 cümle. TÜRKÇE yaz.",
  "techConstraints": "Mimari kararlar, platform kısıtları, ölçeklenebilirlik sınırları, güvenlik gereksinimleri ve açıkça kapsam dışı olan öğeler. Teknik ve kuru. 3-6 cümle. TÜRKÇE yaz."
}

Kurallar:
- Dil: Kuru, profesyonel, kesin. Sıfır dolgu.
- Asla "devrimci", "çığır açan", "son teknoloji" gibi ifadeler veya herhangi bir pazarlama dili kullanma.
- Her iddiayı sağlanan verilere dayandır. Bilgi eksikse, bunu açık bir soru olarak belirt.
- SADECE JSON nesnesini çıktı olarak ver. Markdown çitleri yok, giriş yok, çıkış yok.`;

  const userPrompt = `Ham Fikir (Nokta):\n"""${rawDot}"""\n\nMühendislik Soru-Cevap:\n${qaPairs}`;

  try {
    const raw = await callAI(systemInstruction, userPrompt);

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw {
        type: 'PARSE_ERROR',
        message: 'AI yanıtı geçerli bir JSON nesnesi içermiyordu.',
      } as AIError;
    }

    const parsed = JSON.parse(jsonMatch[0]);
    if (
      typeof parsed.thesis !== 'string' ||
      typeof parsed.problem !== 'string' ||
      typeof parsed.techConstraints !== 'string'
    ) {
      throw {
        type: 'PARSE_ERROR',
        message: 'AI eksik veya geçersiz alanlara sahip bir çıktı döndürdü.',
      } as AIError;
    }

    return {
      success: true,
      artifact: {
        thesis: parsed.thesis,
        problem: parsed.problem,
        techConstraints: parsed.techConstraints,
      },
    };
  } catch (err) {
    if ((err as AIError).type) {
      return { success: false, error: err as AIError };
    }
    return {
      success: false,
      error: {
        type: 'PARSE_ERROR',
        message: `AI çıktısı ayrıştırılamadı: ${String(err)}`,
      },
    };
  }
}
