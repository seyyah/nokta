import { AnalysisResult, CategoryName } from '../types/analysis';

export type EscalationTrigger = 'score' | 'evidence' | 'market' | 'manual';

export type EscalationSignal = {
  recommended: boolean;
  reasons: string[];
  triggeredBy: EscalationTrigger[];
};

const HIGH_SLOP_THRESHOLD = 67;
const LOW_EVIDENCE_THRESHOLD = 70;
const HIGH_MARKET_RISK_THRESHOLD = 70;

function getCategoryScore(analysis: AnalysisResult, categoryName: CategoryName): number {
  const category = analysis.categories.find((item) => item.name === categoryName);
  return category?.score ?? 0;
}

function unique<T extends string>(values: T[]): T[] {
  return [...new Set(values)];
}

export function deriveEscalationSignal(
  analysis: AnalysisResult,
  manualDeeperReviewRequested: boolean
): EscalationSignal {
  const triggeredBy: EscalationTrigger[] = [];
  const reasons: string[] = [];

  const evidenceRisk = getCategoryScore(analysis, 'Evidence Quality');
  const marketRisk = getCategoryScore(analysis, 'Market Claim Risk');
  const differentiationRisk = getCategoryScore(analysis, 'Differentiation');

  if (analysis.score >= HIGH_SLOP_THRESHOLD) {
    triggeredBy.push('score');
    reasons.push('Overall slop risk is high and warrants human judgment before investor-facing use.');
  }

  if (evidenceRisk >= LOW_EVIDENCE_THRESHOLD) {
    triggeredBy.push('evidence');
    reasons.push('Evidence quality is weak, so claims should be validated by an expert reviewer.');
  }

  if (marketRisk >= HIGH_MARKET_RISK_THRESHOLD) {
    triggeredBy.push('market');
    reasons.push('Market claims are broad and unsupported by concrete sourcing.');
  }

  if (differentiationRisk >= 75) {
    reasons.push('Differentiation is unclear, increasing the need for external competitive perspective.');
  }

  if (manualDeeperReviewRequested) {
    triggeredBy.push('manual');
    reasons.push('User explicitly requested deeper human review for this pitch.');
  }

  const uniqueReasons = unique(reasons).slice(0, 4);

  return {
    recommended: triggeredBy.length > 0,
    reasons: uniqueReasons,
    triggeredBy: unique(triggeredBy)
  };
}
