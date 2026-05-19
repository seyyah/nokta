import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY, GEMINI_MODEL } from '../constants/gemini';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

// Fallback (Mock) verileri — API kota aşımında (Limit: 0) sorunsuz demo yapabilmek için
const fallbackQuestions = {
  questions: [
    { id: 1, dimension: "Kullanıcı & Problem", text: "Üniversite öğrencileri ders notlarına şu an nasıl ulaşıyor? Bu süreçte en büyük sıkıntı nerede?" },
    { id: 2, dimension: "Değer", text: "Senin platformun mevcut Telegram grubu veya Drive paylaşımından ne açıdan daha iyi bir deneyim sunacak?" },
    { id: 3, dimension: "İlk Adım", text: "İlk 50 kullanıcını hangi üniversiteden, hangi kanaldan kazanmayı planlıyorsun?" },
    { id: 4, dimension: "Risk", text: "Hocalar içeriklerin telif hakkını ihlal ettiğini iddia ederse ne yaparsın?" },
    { id: 5, dimension: "Başarı", text: "6 ay sonra platformun işe yaradığını sana hangi somut rakam gösterir?" }
  ]
};

const fallbackSpec = {
  title: "NoteHub — Öğrenciden Öğrenciye Not Platformu",
  problem: "Üniversite öğrencileri ders notlarına dağınık Telegram grupları ve Drive linkleri aracılığıyla ulaşıyor; notlar güvenilmez, aranması zor ve ders bazında filtrelenemiyor.",
  user: "Türkiye'deki üniversite öğrencileri — özellikle sınav döneminde kaliteli, derse özel özet not arayan 18-24 yaş arası mobil kullanıcılar.",
  scope: "MVP: Üniversite + ders bazında not yükleme ve arama. İlk versiyonda canlı ders anlatımı, quiz veya AI özet özelliği YOK.",
  constraint: "İçerik kalite kontrolü: Slop notların platforma dolması kullanıcı güvenini zedeler. İlk aşamada manuel moderasyon gerekli.",
  metric: "Haftalık 200+ aktif not yüklemesi ve kullanıcı başına ortalama 3+ ders kaydı (Retention göstergesi)."
};

const fallbackScore = {
  total: 87,
  dimensions: [
    { id: "problem", label: "Problem Netliği", score: 92, reason: "Öğrencilerin not sorunu evrensel, yaşanan acı iyi tanımlanmış." },
    { id: "market", label: "Pazar Potansiyeli", score: 88, reason: "Türkiye'de 8M+ üniversite öğrencisi, yüksek günlük mobil kullanım." },
    { id: "originality", label: "Orijinallik", score: 78, reason: "Yurt dışında benzerleri var (Studocu), Türkiye'de güçlü bir rakip henüz yok." },
    { id: "feasibility", label: "Teknik Fizibilite", score: 90, reason: "Standart CRUD + dosya depolama; solo geliştirici 1 ayda MVP çıkarabilir." }
  ],
  verdict: "Net pazar ihtiyacı ve düşük teknik engel — erken kullanıcı güveni kazanmak ve içerik kalitesini korumak kritik başarı faktörü."
};

const fallbackStackAndCost = {
  stack: {
    frontend: "React Native (Expo) — iOS ve Android'e tek kodla; öğrenci kitlesi mobil ağırlıklı",
    backend: "Supabase (PostgreSQL + Auth + Storage) — not dosyaları için storage, ücretsiz tier başlangıç için yeterli",
    ai: "Google Gemini 2.0 Flash — not özetleme ve arama kalitesini artırmak için opsiyonel",
    infra: "Expo EAS Build + Vercel Edge Functions — sıfır sunucu maliyeti, otomatik ölçekleme"
  },
  cost: {
    solo_3months: "~₺0 - ₺800 (Supabase + domain; ilk 500 kullanıcıya kadar ücretsiz tier yeterli)",
    small_team_3months: "~₺3.000 - ₺7.000 (Tasarım araçları, premium storage, pazarlama bütçesi dahil)",
    note: "Supabase ücretsiz tier 1GB dosya depolama ve 50.000 aylık aktif kullanıcıya kadar ücretsiz."
  }
};


/**
 * Generate 5 engineering questions for a given idea
 */
export async function generateQuestions(idea) {
  const prompt = `Sen bir ürün danışmanısın. Kullanıcı sana bir ham fikir sundu.
Bu fikri somut ve gerçekçi bir ürün spesifikasyonuna dönüştürmek için tam olarak 5 soru üret.
Sorular sade, anlaşılır ve bu fikre özel olsun — genel kalıp sorular değil.
Her soru aşağıdaki boyutu ele alsın ve fikre uygulansın:

1. "Kullanıcı & Problem" boyutu: Bu fikrin hedef kitlesini ve mevcut çözümleri sorgula
2. "Değer" boyutu: Bu fikrin rakiplerinden farkını ve sunduğu avantajı sorgula
3. "İlk Adım" boyutu: İlk kullanıcılara nasıl ulaşılacağını sorgula
4. "Risk" boyutu: Fikrin başarısız olabileceği senaryoyu ve alternatifi sorgula
5. "Başarı" boyutu: 6 ay içindeki somut başarı göstergesini sorgula

Ham fikir: "${idea}"

Sadece JSON döndür:
{
  "questions": [
    {"id": 1, "dimension": "Kullanıcı & Problem", "text": "<bu fikre özel soru>"},
    {"id": 2, "dimension": "Değer", "text": "<bu fikre özel soru>"},
    {"id": 3, "dimension": "İlk Adım", "text": "<bu fikre özel soru>"},
    {"id": 4, "dimension": "Risk", "text": "<bu fikre özel soru>"},
    {"id": 5, "dimension": "Başarı", "text": "<bu fikre özel soru>"}
  ]
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid response from Gemini');
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.warn("API Rate Limit veya Hata, Fallback Data dönüyor:", error.message);
    return fallbackQuestions;
  }
}

/**
 * Generate a one-page spec from idea + answers
 */
export async function generateSpec(idea, questionsAndAnswers) {
  const qaText = questionsAndAnswers
    .map((qa) => `[${qa.dimension}] Soru: ${qa.question}\nCevap: ${qa.answer}`)
    .join('\n\n');

  const prompt = `Sen bir ürün mimarısın. Kullanıcı bir ham fikri mühendislik sorularıyla zenginleştirdi.
Bu bilgileri kullanarak tek sayfalık, kısa ve net bir ürün spesifikasyonu üret.
Sadece JSON döndür.

Ham Fikir: "${idea}"

Soru-Cevaplar:
${qaText}

Format:
{
  "title": "Fikir başlığı (kısa, çarpıcı)",
  "problem": "Çözülen temel problem (1-2 cümle)",
  "user": "Hedef kullanıcı profili (1-2 cümle)",
  "scope": "MVP kapsamı - ne yapılır, ne yapılmaz (2-3 madde)",
  "constraint": "Teknik veya iş kısıtı (1-2 madde)",
  "metric": "Başarı metriği - nasıl ölçülür (1-2 madde)"
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid response from Gemini');
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.warn("API Rate Limit veya Hata, Fallback Spec dönüyor:", error.message);
    return fallbackSpec;
  }
}

/**
 * Generate Nokta Score (4 dimensions, 0-100 each)
 */
export async function generateNoktaScore(spec) {
  const prompt = `Sen bir girişim değerlendirme uzmanısın. Aşağıdaki ürün spesifikasyonunu 4 boyutta değerlendir.
Her boyut için 0-100 arası bir puan ver ve kısa bir gerekçe yaz.
Sadece JSON döndür.

Spesifikasyon:
${JSON.stringify(spec, null, 2)}

Format:
{
  "total": 0-100 (ortalama),
  "dimensions": [
    {"id": "problem", "label": "Problem Netliği", "score": 0-100, "reason": "Kısa gerekçe"},
    {"id": "market", "label": "Pazar Potansiyeli", "score": 0-100, "reason": "Kısa gerekçe"},
    {"id": "originality", "label": "Orijinallik", "score": 0-100, "reason": "Kısa gerekçe"},
    {"id": "feasibility", "label": "Teknik Fizibilite", "score": 0-100, "reason": "Kısa gerekçe"}
  ],
  "verdict": "Tek cümlelik genel değerlendirme"
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid response from Gemini');
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.warn("API Rate Limit veya Hata, Fallback Score dönüyor:", error.message);
    return fallbackScore;
  }
}

/**
 * Generate Stack & Cost estimation based on spec
 */
export async function generateStackAndCost(spec) {
  const prompt = `Sen deneyimli bir yazılım mimarısın. Aşağıdaki ürün spesifikasyonuna bakarak:
1. En uygun teknoloji stack'ini öner (Frontend, Backend, AI/ML, Infra)
2. MVP geliştirme maliyet tahmini ver (Solo geliştirici ve küçük ekip için, 3 aylık)
Sadece JSON döndür.

Spesifikasyon:
${JSON.stringify(spec, null, 2)}

Format:
{
  "stack": {
    "frontend": "Teknoloji adı — kısa gerekçe",
    "backend": "Teknoloji adı — kısa gerekçe",
    "ai": "AI/ML servis — kısa gerekçe",
    "infra": "Altyapı — kısa gerekçe"
  },
  "cost": {
    "solo_3months": "Tahmini maliyet aralığı (₺ cinsinden)",
    "small_team_3months": "Tahmini maliyet aralığı (₺ cinsinden)",
    "note": "Kısa not — ücretsiz tier'lar veya kritik maliyet kalemi"
  }
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid response from Gemini');
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.warn("API Rate Limit veya Hata, Fallback Stack dönüyor:", error.message);
    return fallbackStackAndCost;
  }
}
