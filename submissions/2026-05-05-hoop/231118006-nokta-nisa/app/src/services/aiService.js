const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
const GROQ_MODEL = 'llama-3.3-70b-versatile';

async function fetchGroq(prompt) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      }),
    });

    const data = await response.json();
    if (data.error) {
      console.log('!!! GROQ API ERROR !!!', data.error.message);
      throw new Error(data.error.message);
    }
    
    console.log('--- GROQ RESPONSE SUCCESS ---');
    if (data.choices && data.choices[0]) {
      console.log('Model Used:', data.model);
      console.log('Response Preview:', data.choices[0].message.content.substring(0, 100) + '...');
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Groq Exception:', error.message);
    throw error;
  }
}

export async function generateEngineeringQuestions(rawIdea) {
  const prompt = `Sen bir ürün mühendisliği danışmanısın. Aşağıdaki ham fikri analiz et ve bunu yapılandırılmış bir ürün spesifikasyonuna dönüştürmek için 5 kritik mühendislik sorusu sor.

Ham Fikir: "${rawIdea}"

Her soruyu şu formatta JSON nesnesi içeren bir dizi olarak döndür:
{
  "questions": [
    {
      "id": 1,
      "category": "Problem",
      "emoji": "🎯",
      "question": "Soru metni...",
      "hint": "Kullanıcıya yardımcı olacak kısa ipucu..."
    }
  ]
}

Sorular şu 5 kategoriden birer tane olmalı:
1. Problem (Acı Noktası), 2. User (Kullanıcı), 3. Kapsam (Scope), 4. Kısıtlar (Constraints), 5. Farklılaşma.

ÖNEMLİ: Yanıtlarında "benzersiz", "eşsiz", "tek" gibi iddialı ve hassas kelimeler kullanma. Bunun yerine "farklı", "ayırt edici", "stratejik", "özgün" gibi kelimeleri tercih et.

Yanıtı SADECE JSON olarak döndür.`;

  try {
    const jsonString = await fetchGroq(prompt);
    const result = JSON.parse(jsonString);
    return result.questions || getDefaultQuestions();
  } catch (error) {
    return getDefaultQuestions();
  }
}

export async function generateSpec(rawIdea, answers) {
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

ÖNEMLİ: Yanıtlarında "benzersiz", "eşsiz", "tek" gibi kelimeler kullanma. Bunun yerine "farklı", "ayırt edici", "avantajlı" gibi ifadeleri tercih et.

Yanıtı SADECE JSON olarak döndür.`;

  try {
    const jsonString = await fetchGroq(prompt);
    return JSON.parse(jsonString);
  } catch (error) {
    return getDefaultSpec(rawIdea);
  }
}

function getDefaultQuestions() {
  return [
    { id: 1, category: 'Problem', emoji: '🎯', question: 'Bu fikrin çözdüğü en spesifik acı noktası nedir?', hint: 'Mevcut durumu düşünün' },
    { id: 2, category: 'User', emoji: '👤', question: 'Bu çözümü kim kullanacak?', hint: 'Profil tanımlayın' },
    { id: 3, category: 'Scope', emoji: '📐', question: 'MVP için hangi 3 temel özellik lazım?', hint: 'Kapsamı daraltın' },
    { id: 4, category: 'Constraints', emoji: '⚠️', question: 'Teknik kısıtlarınız neler?', hint: 'Limitleri belirleyin' },
    { id: 5, category: 'Farklılaşma', emoji: '🚀', question: 'Rakiplerden nasıl farklılaşıyorsunuz?', hint: 'Ayırt edici yönlerinizi belirleyin' },
  ];
}

function getDefaultSpec(rawIdea) {
  return {
    title: 'Ürün Spesifikasyonu',
    problemStatement: `"${rawIdea}" analizi tamamlanamadı.`,
    targetUser: 'Tanımlanmadı.',
    valueProposition: 'Detaylandırılmalı.',
    mvpFeatures: ['Özellik 1', 'Özellik 2'],
    constraints: 'Belirtilmedi.',
    differentiation: 'Tanımlanmadı.',
    trustScore: 40,
    trustReason: 'Bağlantı hatası.',
  };
}
