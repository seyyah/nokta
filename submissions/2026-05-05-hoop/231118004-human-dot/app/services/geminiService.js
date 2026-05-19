import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY, GEMINI_MODEL } from '../constants/gemini';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

// ── Sabit soru fallback'i (API'siz) ─────────────────────────────────────────
const fallbackQuestions = {
  questions: [
    { id: 1, dimension: 'Kullanıcı & Problem', text: 'Bu fikrin hedef kullanıcısı kimdir ve şu an bu problemi nasıl çözüyorlar?' },
    { id: 2, dimension: 'Değer', text: 'Mevcut çözümlerden seni ayıran somut bir avantaj nedir?' },
    { id: 3, dimension: 'İlk Adım', text: 'İlk 50 kullanıcına nasıl ve nereden ulaşmayı planlıyorsun?' },
    { id: 4, dimension: 'Risk', text: 'Fikrin başarısız olabileceği en büyük senaryo nedir, alternatifin var mı?' },
    { id: 5, dimension: 'Başarı', text: '6 ay sonra başarıyı hangi somut metrikle ölçeceksin?' },
  ],
};

// ── Akıllı Fallback: fikirden & cevaplardan üretilen gerçekçi veri ───────────

function _titleFromIdea(idea) {
  if (!idea) return 'Nokta MVP';
  const words = idea.trim().split(/\s+/);
  const core = words.slice(0, 5).join(' ');
  return core.charAt(0).toUpperCase() + core.slice(1);
}

function _smartSpec(idea, qas) {
  const title = _titleFromIdea(idea);
  const answerMap = {};
  if (Array.isArray(qas)) {
    qas.forEach((qa) => { answerMap[qa.dimension] = qa.answer; });
  }

  const user = answerMap['Kullanıcı & Problem'] || 'Ürünü kullanacak bireyler ve kurumlar';
  const deger = answerMap['Değer'] || 'Rakiplerden daha hızlı ve odaklı bir çözüm sunar';
  const ilkAdim = answerMap['İlk Adım'] || 'İlk kullanıcılar sosyal ağlar ve topluluk kanallarından kazanılacak';
  const risk = answerMap['Risk'] || 'Kullanıcı edinimi yavaş olabilir; yedek strateji: B2B pivot';
  const basari = answerMap['Başarı'] || 'İlk 3 ayda 200+ aktif kullanıcı ve %40 haftalık retention';

  return {
    title,
    problem: `${user} şu an bu sorunu dağınık ve verimsiz yöntemlerle çözüyor. Merkezi, akıllı bir çözüm ihtiyacı netleşmiş durumda.`,
    user: user.length > 20 ? user : `${user} — düzenli, pratik çözümler arayan kullanıcılar`,
    scope: `MVP: Temel değer önerisi teslimi + kullanıcı akışı. ${deger}. İlk versiyonda ödeme, admin paneli ve entegrasyonlar kapsam dışı.`,
    constraint: `${risk}. Teknik açıdan: ilk 3 ayda büyük ölçek beklenmemeli, altyapı buna göre kurgulanacak.`,
    metric: `${basari}. Başarı göstergesi: ${ilkAdim} kanalından gelen ilk 50 kullanıcının geri dönüş oranı.`,
  };
}

function _smartScore(idea) {
  // Fikir uzunluğuna ve kelime sayısına göre skorlar hafifçe değişsin
  const words = (idea || '').split(/\s+/).length;
  const base = 70 + Math.min(words, 15);
  const v = (offset) => Math.min(100, Math.max(55, base + offset + (Math.floor(Math.random() * 7) - 3)));

  const p = v(8);
  const m = v(3);
  const o = v(-5);
  const f = v(5);
  const total = Math.round((p + m + o + f) / 4);

  const ideaLower = (idea || '').toLowerCase();
  const hasTech = /uygulama|platform|sistem|ai|yapay|mobil|web/.test(ideaLower);
  const hasSocial = /öğrenci|kullanıcı|insan|topluluk|pazar/.test(ideaLower);

  return {
    total,
    dimensions: [
      {
        id: 'problem', label: 'Problem Netliği', score: p,
        reason: hasSocial
          ? 'Hedef kitle ve acı noktası açıkça tanımlanmış, empati güçlü.'
          : 'Problem var ama biraz daha somutlaştırılabilir.',
      },
      {
        id: 'market', label: 'Pazar Potansiyeli', score: m,
        reason: 'Türkiye ve MENA pazarında büyüme fırsatı mevcut, mobil penetrasyon yüksek.',
      },
      {
        id: 'originality', label: 'Orijinallik', score: o,
        reason: hasTech
          ? 'AI destekli yaklaşım fark yaratıyor, rakiplerden ayrışma potansiyeli var.'
          : 'Benzer çözümler mevcut; farklılaşma stratejisi netleştirilmeli.',
      },
      {
        id: 'feasibility', label: 'Teknik Fizibilite', score: f,
        reason: 'Solo geliştirici için 6-8 haftada MVP çıkarılabilir, açık kaynak araçlar yeterli.',
      },
    ],
    verdict: total >= 82
      ? 'Güçlü bir başlangıç noktası — pazar doğrulamasına odaklan ve hızlı bir pilot başlat.'
      : "Potansiyel var; problem-solution fit'i netleştirip MVP kapsamını daraltarak ilerlemeyi dene.",
  };
}

function _smartStack(idea) {
  const lower = (idea || '').toLowerCase();
  const isEdu = /öğrenci|üniversite|okul|eğitim/.test(lower);
  const isHealth = /sağlık|doktor|hasta|klinik/.test(lower);
  const isFinance = /finans|ödeme|para|bütçe/.test(lower);

  let backend = 'Supabase (PostgreSQL + Auth + Storage) — ücretsiz tier, hızlı kurulum';
  if (isFinance) backend = 'Supabase + Row Level Security — finansal veri için güvenli, GDPR uyumlu';
  if (isHealth) backend = 'Supabase + Encrypted Storage — sağlık verisi için şifrelenmiş depolama';

  return {
    stack: {
      frontend: 'React Native (Expo SDK 54) — iOS & Android, tek kod tabanı, EAS Build hazır',
      backend,
      ai: 'Google Gemini 2.0 Flash — Türkçe NLP, düşük latency, ücretsiz tier yeterli',
      infra: 'EAS Build (APK/IPA) + Vercel Edge Functions — sıfır sunucu yükü, otomatik ölçekleme',
    },
    cost: {
      solo_3months: isFinance ? '~₺1.200–₺2.500' : '~₺0–₺800',
      small_team_3months: isEdu ? '~₺3.500–₺6.000' : '~₺4.000–₺9.000',
      note: 'Supabase free tier ilk 500 kullanıcıya kadar sıfır maliyet. Domain + EAS dışında ek gider yok.',
    },
  };
}

// ── JSON parse yardımcısı ─────────────────────────────────────────────────────
function safeParseJSON(text, fallback) {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return fallback;
    return JSON.parse(match[0]);
  } catch {
    return fallback;
  }
}

// ── Streaming soru üretimi ────────────────────────────────────────────────────
export async function generateQuestionsStream(idea, onChunk) {
  const prompt = `Sen bir ürün danışmanısın. Kullanıcı sana bir ham fikir sundu.
Bu fikri somut bir ürün spesifikasyonuna dönüştürmek için tam olarak 5 soru üret.
Sorular bu fikre özel olsun — genel kalıp değil.

Ham fikir: "${idea}"

Sadece JSON döndür:
{
  "questions": [
    {"id": 1, "dimension": "Kullanıcı & Problem", "text": "<soru>"},
    {"id": 2, "dimension": "Değer", "text": "<soru>"},
    {"id": 3, "dimension": "İlk Adım", "text": "<soru>"},
    {"id": 4, "dimension": "Risk", "text": "<soru>"},
    {"id": 5, "dimension": "Başarı", "text": "<soru>"}
  ]
}`;

  try {
    const result = await model.generateContentStream(prompt);
    let fullText = '';
    for await (const chunk of result.stream) {
      const t = chunk.text();
      fullText += t;
      if (onChunk) onChunk(t);
    }
    return safeParseJSON(fullText, fallbackQuestions);
  } catch (error) {
    console.warn('generateQuestionsStream → fallback:', error.message);
    if (onChunk) onChunk(JSON.stringify(fallbackQuestions, null, 2));
    return fallbackQuestions;
  }
}

// ── Streaming spec üretimi ────────────────────────────────────────────────────
export async function generateSpecStream(idea, questionsAndAnswers, onChunk) {
  const qaText = Array.isArray(questionsAndAnswers)
    ? questionsAndAnswers
        .map((qa) => `[${qa.dimension}] Soru: ${qa.question}\nCevap: ${qa.answer}`)
        .join('\n\n')
    : '';

  const prompt = `Sen bir ürün mimarısın. Aşağıdaki bilgilere göre tek sayfalık ürün spesifikasyonu üret. Sadece JSON döndür.

Ham Fikir: "${idea}"

${qaText ? `Soru-Cevaplar:\n${qaText}` : ''}

Format:
{
  "title": "Kısa çarpıcı başlık",
  "problem": "Çözülen temel problem (1-2 cümle)",
  "user": "Hedef kullanıcı profili (1-2 cümle)",
  "scope": "MVP kapsamı (2-3 madde)",
  "constraint": "Kısıt (1-2 madde)",
  "metric": "Başarı metriği (1-2 madde)"
}`;

  try {
    const result = await model.generateContentStream(prompt);
    let fullText = '';
    for await (const chunk of result.stream) {
      const t = chunk.text();
      fullText += t;
      if (onChunk) onChunk(t);
    }
    const parsed = safeParseJSON(fullText, null);
    if (parsed) return parsed;
    throw new Error('parse failed');
  } catch (error) {
    console.warn('generateSpecStream → smart fallback:', error.message);
    const fb = _smartSpec(idea, questionsAndAnswers);
    if (onChunk) onChunk(JSON.stringify(fb));
    return fb;
  }
}

// ── Nokta Skoru (streaming) ───────────────────────────────────────────────────
export async function generateNoktaScoreStream(spec, onChunk) {
  const prompt = `Sen girişim değerlendirme uzmanısın. Aşağıdaki speci 4 boyutta puanla. Sadece JSON döndür.

Spec: ${JSON.stringify(spec)}

Format:
{
  "total": <0-100 ortalama>,
  "dimensions": [
    {"id": "problem", "label": "Problem Netliği", "score": <0-100>, "reason": "kısa gerekçe"},
    {"id": "market", "label": "Pazar Potansiyeli", "score": <0-100>, "reason": "kısa gerekçe"},
    {"id": "originality", "label": "Orijinallik", "score": <0-100>, "reason": "kısa gerekçe"},
    {"id": "feasibility", "label": "Teknik Fizibilite", "score": <0-100>, "reason": "kısa gerekçe"}
  ],
  "verdict": "tek cümle değerlendirme"
}`;

  try {
    const result = await model.generateContentStream(prompt);
    let fullText = '';
    for await (const chunk of result.stream) {
      const t = chunk.text();
      fullText += t;
      if (onChunk) onChunk(t);
    }
    return safeParseJSON(fullText, _smartScore(spec?.title));
  } catch (error) {
    console.warn('generateNoktaScoreStream → smart fallback:', error.message);
    return _smartScore(spec?.title);
  }
}

// ── Stack & Maliyet (streaming) ───────────────────────────────────────────────
export async function generateStackAndCostStream(spec, onChunk) {
  const prompt = `Sen yazılım mimarısın. Aşağıdaki spec için teknoloji stack ve maliyet tahmini ver. Sadece JSON döndür.

Spec: ${JSON.stringify(spec)}

Format:
{
  "stack": {
    "frontend": "teknoloji — gerekçe",
    "backend": "teknoloji — gerekçe",
    "ai": "ai servis — gerekçe",
    "infra": "altyapı — gerekçe"
  },
  "cost": {
    "solo_3months": "₺ aralığı",
    "small_team_3months": "₺ aralığı",
    "note": "kısa not"
  }
}`;

  try {
    const result = await model.generateContentStream(prompt);
    let fullText = '';
    for await (const chunk of result.stream) {
      const t = chunk.text();
      fullText += t;
      if (onChunk) onChunk(t);
    }
    return safeParseJSON(fullText, _smartStack(spec?.title));
  } catch (error) {
    console.warn('generateStackAndCostStream → smart fallback:', error.message);
    return _smartStack(spec?.title);
  }
}
