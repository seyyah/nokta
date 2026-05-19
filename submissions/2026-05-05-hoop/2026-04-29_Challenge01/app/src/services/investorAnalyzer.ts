import type { Question } from '@/types';

export interface InvestorMemo {
  title: string;
  markdown: string;
  recommendation: 'PASS' | 'CONSIDER' | 'STRONG_YES';
  investmentScore: number;
}

export interface InvestorRiskScore {
  overall: number; // 0-100, higher is better (lower risk)
  marketRisk: number;
  executionRisk: number;
  competitiveRisk: number;
  timingRisk: number;
  teamRisk: number;
  verdict: 'HIGH_RISK' | 'MODERATE_RISK' | 'LOW_RISK' | 'INVESTABLE';
  dealBreakers: string[];
  strengths: string[];
  exitPotential: string;
}

export function analyzeInvestorRisk(
  memo: InvestorMemo,
  idea: string,
  answers: Record<string, string>
): InvestorRiskScore {
  const dealBreakers: string[] = [];
  const strengths: string[] = [];
  
  // Analyze market risk
  const hasMarketSize = /\d+\s*(million|billion|trillion|M|B|T)/i.test(
    idea + ' ' + Object.values(answers).join(' ')
  );
  const marketRisk = hasMarketSize ? 75 : 35;
  if (!hasMarketSize) {
    dealBreakers.push('No quantified market size provided');
  } else {
    strengths.push('Market opportunity quantified');
  }

  // Analyze execution risk
  const hasTimeline = /\d+\s*(month|year|quarter)/i.test(Object.values(answers).join(' '));
  const hasMilestones = /milestone|phase|stage|launch/i.test(Object.values(answers).join(' '));
  const executionRisk = (hasTimeline ? 40 : 0) + (hasMilestones ? 40 : 0) + 20;
  if (!hasTimeline && !hasMilestones) {
    dealBreakers.push('No clear execution roadmap');
  }

  // Analyze competitive risk
  const mentionsCompetitors = /competitor|alternative|existing|incumbent/i.test(
    Object.values(answers).join(' ')
  );
  const hasMoat = /patent|network effect|data|brand|switching cost/i.test(
    Object.values(answers).join(' ')
  );
  const competitiveRisk = (mentionsCompetitors ? 40 : 0) + (hasMoat ? 40 : 0) + 20;
  if (!mentionsCompetitors) {
    dealBreakers.push('No competitive analysis');
  }
  if (hasMoat) {
    strengths.push('Defensible competitive moat identified');
  }

  // Analyze timing risk
  const hasTrend = /trend|growing|emerging|shift|adoption/i.test(
    idea + ' ' + Object.values(answers).join(' ')
  );
  const timingRisk = hasTrend ? 70 : 45;
  if (hasTrend) {
    strengths.push('Riding market trend');
  }

  // Analyze team risk (based on answer depth)
  const avgAnswerLength = Object.values(answers).reduce((sum, a) => sum + a.length, 0) / 
                          Math.max(Object.keys(answers).length, 1);
  const teamRisk = avgAnswerLength > 100 ? 70 : avgAnswerLength > 50 ? 50 : 30;
  if (avgAnswerLength < 50) {
    dealBreakers.push('Insufficient detail in responses');
  }

  // Calculate overall score
  const overall = Math.round(
    (marketRisk * 0.3) +
    (executionRisk * 0.25) +
    (competitiveRisk * 0.25) +
    (timingRisk * 0.1) +
    (teamRisk * 0.1)
  );

  // Determine verdict
  let verdict: InvestorRiskScore['verdict'];
  if (overall >= 75) verdict = 'INVESTABLE';
  else if (overall >= 60) verdict = 'LOW_RISK';
  else if (overall >= 45) verdict = 'MODERATE_RISK';
  else verdict = 'HIGH_RISK';

  // Determine exit potential
  let exitPotential: string;
  if (overall >= 75) {
    exitPotential = 'Strong acquisition or IPO potential within 5-7 years';
  } else if (overall >= 60) {
    exitPotential = 'Moderate exit potential, likely acquisition in 7-10 years';
  } else if (overall >= 45) {
    exitPotential = 'Uncertain exit path, requires significant traction';
  } else {
    exitPotential = 'High risk, exit unlikely without major pivot';
  }

  return {
    overall,
    marketRisk,
    executionRisk,
    competitiveRisk,
    timingRisk,
    teamRisk,
    verdict,
    dealBreakers,
    strengths,
    exitPotential,
  };
}

export function generateInvestorQuestions(): Question[] {
  return [
    {
      id: 'market',
      text: 'What is the total addressable market (TAM) and how did you validate customer demand?',
      category: 'problem',
    },
    {
      id: 'moat',
      text: 'What prevents well-funded competitors from copying your solution in 6 months?',
      category: 'constraint',
    },
    {
      id: 'revenue',
      text: 'What are your unit economics (CAC, LTV, gross margin) and path to profitability?',
      category: 'scope',
    },
    {
      id: 'risk',
      text: 'What is the single biggest risk to execution and how will you mitigate it?',
      category: 'constraint',
    },
  ];
}
