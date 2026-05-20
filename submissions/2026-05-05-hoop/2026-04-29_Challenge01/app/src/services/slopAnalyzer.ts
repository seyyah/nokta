import type { Spec } from '@/types';

export interface SlopScore {
  overall: number; // 0-100, higher is better (less slop)
  technicalDepth: number;
  marketReality: number;
  defensibility: number;
  feasibility: number;
  novelty: number;
  verdict: 'PURE SLOP' | 'SLOPPY' | 'MIXED' | 'GROUNDED' | 'SHARP';
  redFlags: string[];
  claimsToVerify: string[];
}

const SLOP_KEYWORDS = [
  'revolutionary', 'game-changing', 'disruptive', 'paradigm shift',
  'blockchain', 'AI-powered', 'machine learning', 'next-generation',
  'cutting-edge', 'innovative solution', 'world-class', 'industry-leading'
];

const VAGUE_TERMS = [
  'seamless', 'intuitive', 'user-friendly', 'easy to use',
  'powerful', 'robust', 'scalable', 'flexible'
];

export function analyzeSlopScore(spec: Spec, idea: string, answers: Record<string, string>): SlopScore {
  const redFlags: string[] = [];
  const claimsToVerify: string[] = [];
  
  // Analyze for buzzwords
  const lowerIdea = idea.toLowerCase();
  const buzzwordCount = SLOP_KEYWORDS.filter(kw => lowerIdea.includes(kw.toLowerCase())).length;
  if (buzzwordCount > 2) {
    redFlags.push(`Aşırı buzzword kullanımı (${buzzwordCount} adet)`);
  }

  // Check for vague terms
  const vaguenessCount = VAGUE_TERMS.filter(term => lowerIdea.includes(term.toLowerCase())).length;
  if (vaguenessCount > 3) {
    redFlags.push('Belirsiz terimler fazla (spesifik detay eksik)');
  }

  // Check technical depth
  const hasTechStack = /\b(react|node|python|java|swift|kotlin|postgres|mongodb|aws|azure)\b/i.test(
    idea + ' ' + Object.values(answers).join(' ')
  );
  const technicalDepth = hasTechStack ? 75 : 40;
  if (!hasTechStack) {
    redFlags.push('Teknik mimari detayı yok');
    claimsToVerify.push('Hangi teknoloji stack kullanılacak?');
  }

  // Check market reality
  const hasUserCount = /\d+\s*(kullanıcı|user|kişi|müşteri)/i.test(idea + ' ' + Object.values(answers).join(' '));
  const marketReality = hasUserCount ? 70 : 45;
  if (!hasUserCount) {
    redFlags.push('Hedef kullanıcı sayısı belirsiz');
    claimsToVerify.push('Kaç kullanıcıya ulaşmayı hedefliyorsunuz?');
  }

  // Check defensibility (competitor awareness)
  const mentionsCompetitors = /rakip|competitor|alternatif|benzer/i.test(
    Object.values(answers).join(' ')
  );
  const defensibility = mentionsCompetitors ? 65 : 35;
  if (!mentionsCompetitors) {
    redFlags.push('Rakip analizi yapılmamış');
    claimsToVerify.push('Mevcut rakipleriniz kimler?');
  }

  // Check feasibility
  const hasTimeline = /\d+\s*(gün|hafta|ay|day|week|month)/i.test(
    Object.values(answers).join(' ')
  );
  const feasibility = hasTimeline ? 70 : 50;
  if (!hasTimeline) {
    claimsToVerify.push('MVP için gerçekçi bir zaman tahmini nedir?');
  }

  // Check novelty
  const isGeneric = /uygulama|app|platform|sistem/i.test(idea) && 
                    !/özgün|farklı|yeni|unique|novel/i.test(idea);
  const novelty = isGeneric ? 40 : 65;
  if (isGeneric) {
    redFlags.push('Jenerik fikir - farklılaştırıcı özellik belirsiz');
    claimsToVerify.push('Rakiplerden farkınız ne?');
  }

  // Calculate overall score
  const overall = Math.round(
    (technicalDepth * 0.25) +
    (marketReality * 0.2) +
    (defensibility * 0.2) +
    (feasibility * 0.2) +
    (novelty * 0.15)
  );

  // Determine verdict
  let verdict: SlopScore['verdict'];
  if (overall >= 80) verdict = 'SHARP';
  else if (overall >= 65) verdict = 'GROUNDED';
  else if (overall >= 50) verdict = 'MIXED';
  else if (overall >= 35) verdict = 'SLOPPY';
  else verdict = 'PURE SLOP';

  return {
    overall,
    technicalDepth,
    marketReality,
    defensibility,
    feasibility,
    novelty,
    verdict,
    redFlags,
    claimsToVerify,
  };
}
