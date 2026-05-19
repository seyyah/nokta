export type Dimension = {
  key: "market" | "competitors" | "evidence" | "novelty" | "feasibility";
  label: string;
  score: number;
  note: string;
};

export type RedFlag = {
  title: string;
  quote: string;
  explanation: string;
  severity: "low" | "medium" | "high";
};

export type ClaimToVerify = {
  claim: string;
  why: string;
};

export type AnalysisTone = "standard" | "brutal" | "merciful";

export type Analysis = {
  id: string;
  createdAt: number;
  pitch: string;
  tone: AnalysisTone;
  score: number;
  verdict: string;
  summary: string;
  dimensions: Dimension[];
  redFlags: RedFlag[];
  claimsToVerify: ClaimToVerify[];
  rewrite: string;
};
