export interface AnalysisResult {
  score: number; // 0-100
  decision: string; // Karar (e.g. "TEKNİK ÇÖP")
  gerekce?: string; // Genel acımasız açıklama
  teknikDerinlik: string;
  savunulabilirlik: string;
  pazarGercekligi: string;
}

export const SYSTEM_PROMPT = `
ROLÜN: Acımasız bir Baş Mühendis ve Risk Analistisin. Görevin, fikirlerin içindeki 'slop' (çöp/yığın) içeriği bulup çıkarmak.

SKORLAMA MANTIĞI (KRİTİK):
- Slop Score (%) arttıkça fikir DEĞERSİZLEŞİR. 
- %0-30: Kusursuz, teknik derinliği olan, eşsiz mimari (Artifact).
- %31-60: Potansiyel var ama jenerik öğeler içeriyor.
- %61-100: Çöp (Slop). Jenerik AI fikirleri, API wrapper'lar, teknik imkansızlıklar.

CEZALANDIRMA KRİTERLERİ (Skoru Agresif Artır):
1. Teknik Sığlık: Eğer kullanıcı "AI kullanacağım", "OpenAI", "Uygulama yapacağım" gibi genel terimler kullanıyorsa, teknik derinlik yoktur. SKORU +40 ARTIR.
2. Savunulabilirlik Yoksunluğu: Eğer bir rakip bu işi 1 ayda kopyalayabiliyorsa (entry barrier yoksa), SKORU +30 ARTIR.
3. Pazar Halüsinasyonu: Fikir gerçek bir acıyı çözmüyor, sadece 'havalı' görünüyorsa SKORU +20 ARTIR.

ÖDÜLLENDİRME (Skoru Düşür):
- Sadece 'Donanım entegrasyonu', 'Özel veri seti', 'TinyML', 'Edge computing' veya 'Proprietary algorithm' gibi somut mühendislik kanıtları varsa puanı iyileştir.

ANALİZ FORMATI (TÜRKÇE):
- Karar: Çok sert ve net bir başlık (Örn: "TEKNİK ÇÖP" veya "MİMARİ BAŞYAPIT").
- Gerekçe: Nazik olma. "Bu fikir sığ çünkü..." diye başla.
- Slop Score: 100 üzerinden net rakam.
`;

export const analyzeIdea = async (idea: string, q1?: string, q2?: string, q3?: string): Promise<AnalysisResult> => {
  // Mock network delay corresponding to an LLM call
  await new Promise(resolve => setTimeout(resolve, 2500));

  const content = (idea + " " + (q1 || "") + " " + (q2 || "") + " " + (q3 || "")).toLowerCase();
  
  let tempScore = 15; // Base starting point (solid)
  
  const shallowTechWords = ["ai kullanacağım", "openai", "uygulama yapacağım", "chatgpt", "gpt-4", "yapay zeka", "mobil uygulama", "wrapper", "api"];
  const hardwareProofWords = ["donanım entegrasyonu", "özel veri seti", "tinyml", "edge computing", "proprietary algorithm", "edge", "tescilli algoritmalar"];
  const lackOfDefenseWords = ["1 ayda", "sosyal medya", "Tinder", "tinder gibi", "hızlı kopyalanabilir", "reklam geliri", "influencer"];
  const hallucinationWords = ["kripto", "blockchain", "metaverse", "web3", "token", "nft", "kuantum"];

  // 1. Teknik Sığlık Ceza Mantığı
  let isShallow = false;
  if (shallowTechWords.some(w => content.includes(w)) || content.length < 100) {
    tempScore += 40;
    isShallow = true;
  }

  // 2. Savunulabilirlik Yoksunluğu
  let lacksDefense = false;
  if (lackOfDefenseWords.some(w => content.includes(w)) || isShallow) {
    tempScore += 30;
    lacksDefense = true;
  }

  // 3. Pazar Halüsinasyonu
  let isBuzzy = false;
  if (hallucinationWords.some(w => content.includes(w))) {
    tempScore += 20;
    isBuzzy = true;
  }

  // ÖDÜLLENDİRME
  let hasProof = false;
  if (hardwareProofWords.some(w => content.includes(w))) {
    tempScore -= 40;
    hasProof = true;
  }

  // Cap Score 0-100
  const finalScore = Math.max(0, Math.min(100, tempScore));

  const buildDecision = (s: number) => {
    if (s <= 30) return "MİMARİ BAŞYAPIT (Solid)";
    if (s <= 60) return "RİSKLİ / JENERİK (Borderline)";
    return "TEKNİK ÇÖP (Yüksek Slop)";
  };

  const buildGerekce = (s: number) => {
    if (s > 60) return "Bu fikir sığ çünkü hiçbir donanım veya özel veri seti (Proprietary) bariyeri içermiyor. 1 ayda herkes tarafından kopyalanabilir uyduruk bir vizyon.";
    if (s <= 30) return "Olağanüstü. Özel veri setleri, donanım bariyerleri veya savunulabilir teknik limitler üzerine oturtulmuş gerçek mühendislik.";
    return "Fikirde potansiyel var ancak jenerik API yapılarına bağlılık rakiplere kapı aralıyor.";
  };

  return {
    score: finalScore,
    decision: buildDecision(finalScore),
    gerekce: buildGerekce(finalScore),
    teknikDerinlik: isShallow 
      ? "Sıfır mühendislik. AI veya hazır uygulama motorlarına bağlı kalınmış." 
      : hasProof ? "Donanım Edge mimarisine dayanan derin fiziksel entegrasyon." : "Ortalama. Ancak altyapı rakiplerce kopyalanmaya elverişli.",
    savunulabilirlik: lacksDefense 
      ? "Yok. Peçete arkasına yazılan bu vizyon pazara çıkar çıkmaz büyük oyuncularca klonlanır." 
      : hasProof ? "Çok Yüksek. Tescilli algoritmalar veya donanım maliyetleri rakipleri uzak tutuyor." : "Riske açık. Kullanıcı ağı oluşturulmadan değer tekeline sahip değilsiniz.",
    pazarGercekligi: isBuzzy 
      ? "Hype üzerinden sörf yapılıyor, gerçek bir problemi çözen pazar kanıtı (traction) hayalden ibaret." 
      : hasProof ? "Net ve dikey (niche) bir sorun seçilmiş, B2B alıcısı olmaya son derece elverişli." : "Problemin varlığı tartışmaya açık."
  };
};
