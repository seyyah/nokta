export type VerdictLabel = 'Low Slop' | 'Medium Slop' | 'High Slop';

export type CategoryName =
  | 'Market Claim Risk'
  | 'User Clarity'
  | 'Feasibility'
  | 'Differentiation'
  | 'Evidence Quality'
  | 'Scope Discipline';

export type CategoryScore = {
  name: CategoryName;
  score: number;
  explanation: string;
};

export type AnalysisResult = {
  pitch: string;
  score: number;
  verdict: VerdictLabel;
  summary: string;
  categories: CategoryScore[];
  suspiciousClaims: string[];
  rewriteSuggestions: string[];
  diligenceChecklist: string[];
  generatedAt: string;
};
