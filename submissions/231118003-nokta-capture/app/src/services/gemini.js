import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyCQNj1ouzao5UII53r8PHBnDWgMG6K_mhY";
const genAI = new GoogleGenerativeAI(API_KEY);

export const ENGINEERING_QUESTIONS = [
  { id: "problem", icon: "🎯", label: "Problem", question: "Bu fikir hangi acı noktasını çözüyor?" },
  { id: "user", icon: "👤", label: "Kullanıcı", question: "Hedef kitlen tam olarak kim?" },
  { id: "scope", icon: "🗺️", label: "Kapsam", question: "İlk sürümde NE yapacak, NE yapmayacak?" },
  { id: "constraint", icon: "⚙️", label: "Kısıtlar", question: "Hangi teknik/maddi sınırların var?" },
  { id: "success", icon: "📊", label: "Başarı", question: "Başarılı olduğunu nasıl anlarsın?" },
];

export async function generateSpec(rawIdea, answers) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash-lite",
    generationConfig: { responseMimeType: "application/json" }
  });
  
  const prompt = `Sen kıdemli bir Product Engineer'sın. Sana bir ham fikir ve bu fikirle ilgili bazı mühendislik cevapları verilecek.
Ham Fikir: ${rawIdea}
Cevaplar: ${JSON.stringify(answers)}

Lütfen bu fikri derinlemesine analiz et ve AŞAĞIDAKİ JSON FORMATINDA (başka hiçbir metin olmadan) döndür. Eğer kullanıcının cevaplarında eksiklik veya mantıksızlık varsa "ambiguities" kısmına ekle:
{
  "title": "Projenin havalı ve kısa adı",
  "tagline": "Projenin 1 cümlelik vurucu sloganı",
  "problem": "Çözülen problem",
  "user": "Hedef kullanıcı",
  "scope": "Kapsam",
  "constraints": "Kısıtlar",
  "success": "Başarı metrikleri",
  "scores": {
    "clarity": 9,
    "feasibility": 8,
    "impact": 7
  },
  "ambiguities": ["Kullanıcı tanımı eksik", "Pazar stratejisi belirsiz"],
  "risks": [
    "Kullanıcı alışkanlık geliştirmeyebilir",
    "Rakip uygulamalar mevcut"
  ],
  "solutions": [
    "Oyunlaştırma ve hatırlatıcı sistemi kurulabilir",
    "Hedef kitleye özel niş bir pazarlama yapılabilir"
  ],
  "slop_justification": "Fikrin genel teknik gerekçesi"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(clean);
}

export async function enhanceIdea(spec) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash-lite",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `Aşağıdaki ürün spesifikasyonunu incele ve bu fikri BİR ADIM ÖTEYE taşıyacak, yepyeni bir özellik veya alternatif bir yaklaşım öner.
Mevcut Proje: ${JSON.stringify(spec)}

AŞAĞIDAKİ JSON FORMATINDA DÖNDÜR:
{
  "newFeatures": ["Yapay zeka özetleme özelliği", "Pomodoro entegrasyonu"],
  "alternativeApproach": "Bunu bir B2B platformuna dönüştürerek okullara satabilirsin. Böylece..."
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(clean);
}
