import { GoogleGenerativeAI } from '@google/generative-ai';

// NOT: Gerçek API anahtarınızı buraya eklemeyi unutmayın!
// Güvenlik için ortam değişkenlerinden veya güvenli bir yapılandırmadan okunmalıdır.
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY'; // <--- Buraya kendi anahtarınızı yazın

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function generateEngineeringQuestions(rawIdea) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `Sen bir ürün mühendisliği danışmanısın. Aşağıdaki ham fikri analiz et ve bunu yapılandırılmış bir ürün spesifikasyonuna dönüştürmek için 5 kritik mühendislik sorusu sor.

Ham Fikir: "${rawIdea}"

Her soruyu şu formatta JSON dizisi olarak döndür:
[
  {
    "id": 1,
    "category": "Problem",
    "emoji": "🎯",
    "question": "Soru metni...",
    "hint": "Kullanıcıya yardımcı olacak kısa ipucu..."
  }
]

Sorular şu 5 kategoriden birer tane olmalı:
1. Problem (Acı Noktası) — Bu fikrin çözdüğü spesifik sorun nedir?
2. User (Kullanıcı) — Bu çözümü kim, hangi bağlamda kullanacak?
3. Scope (Kapsam) — MVP sınırları nerede başlıyor, nerede bitiyor?
4. Constraints (Kısıtlar) — Teknik, finansal veya operasyonel limitler neler?
5. Differentiation (Farklılaşma) — Mevcut çözümlerden farkı nedir?

Yanıtı SADECE JSON dizisi olarak döndür, başka metin ekleme.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return getDefaultQuestions();
  } catch (error) {
    console.log('Gemini API error, using defaults:', error.message);
    return getDefaultQuestions();
  }
}

export async function generateSpec(rawIdea, answers) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const qaBlock = answers
    .map((a, i) => `Soru ${i + 1} (${a.category}): ${a.question}\nCevap: ${a.answer}`)
    .join('\n\n');

  const prompt = `Sen bir ürün mühendisliği uzmanısın. Aşağıdaki ham fikirden ve mühendislik sorularına verilen cevaplardan yola çıkarak yapılandırılmış bir tek-sayfa ürün spesifikasyonu oluştur.

Ham Fikir: "${rawIdea}"

Soru-Cevaplar:
${qaBlock}

Aşağıdaki JSON formatında döndür:
{
  "title": "Ürün Adı",
  "problemStatement": "Problem tanımı...",
  "targetUser": "Hedef kullanıcı profili...",
  "valueProposition": "Temel değer önerisi...",
  "mvpFeatures": ["Özellik 1", "Özellik 2", "Özellik 3"],
  "constraints": "Teknik kısıtlar...",
  "differentiation": "Farklılaşma noktası...",
  "trustScore": 75,
  "trustReason": "Trust score açıklaması..."
}

Trust Score 0-100 arası olmalı. Cevapların derinliği, tutarlılığı ve teknik somutluğuna göre hesapla.

Yanıtı SADECE JSON olarak döndür.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return getDefaultSpec(rawIdea);
  } catch (error) {
    console.log('Gemini API error, using default spec:', error.message);
    return getDefaultSpec(rawIdea);
  }
}

function getDefaultQuestions() {
  return [
    {
      id: 1,
      category: 'Problem',
      emoji: '🎯',
      question: 'Bu fikrin çözdüğü en spesifik acı noktası (pain point) nedir? Kullanıcılar şu an bu problemi nasıl çözmeye çalışıyor?',
      hint: 'Mevcut durumu ve eksiklikleri düşünün',
    },
    {
      id: 2,
      category: 'User',
      emoji: '👤',
      question: 'Bu çözümü kullanacak birincil kullanıcı kimdir? Hangi bağlamda (zaman, mekan, durum) kullanacak?',
      hint: 'Yaş, meslek, teknik yetkinlik düzeyini düşünün',
    },
    {
      id: 3,
      category: 'Scope',
      emoji: '📐',
      question: 'İlk sürüm (MVP) için hangi 3 temel özellik olmazsa olmaz? Hangi özellikler v2\'ye bırakılabilir?',
      hint: 'En küçük çalışır ürünü hayal edin',
    },
    {
      id: 4,
      category: 'Constraints',
      emoji: '⚠️',
      question: 'Teknik, finansal veya operasyonel kısıtlarınız neler? (Süre, bütçe, platform, düzenleyici gereksinimler)',
      hint: 'Gerçekçi limitleri belirleyin',
    },
    {
      id: 5,
      category: 'Differentiation',
      emoji: '💎',
      question: 'Mevcut benzer çözümlerden (rakiplerden) nasıl farklılaşıyorsunuz? Kullanıcının sizi tercih etmesi için en güçlü nedeniniz nedir?',
      hint: 'Benzersiz değer önerinizi netleştirin',
    },
  ];
}

function getDefaultSpec(rawIdea) {
  return {
    title: 'Ürün Spesifikasyonu',
    problemStatement: `"${rawIdea}" fikri ile çözülmek istenen problem henüz AI tarafından analiz edilemedi. Lütfen detayları manuel olarak gözden geçirin.`,
    targetUser: 'Hedef kullanıcı profili henüz belirlenmedi.',
    valueProposition: 'Temel değer önerisi detaylandırılmalı.',
    mvpFeatures: ['Temel özellik 1', 'Temel özellik 2', 'Temel özellik 3'],
    constraints: 'Kısıtlar belirtilmeli.',
    differentiation: 'Farklılaşma noktası tanımlanmalı.',
    trustScore: 40,
    trustReason: 'AI analizi tamamlanamadı — varsayılan skor atandı.',
  };
}
