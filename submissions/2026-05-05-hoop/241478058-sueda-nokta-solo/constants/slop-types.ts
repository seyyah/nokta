export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type SlopFlaw = {
  type: string;
  description: string;
  severity: SeverityLevel;
};

export type EngineeringQuestion = {
  question: string;
  why_critical: string;
  severity: SeverityLevel;
};

export type SlopResult = {
  slop_score: number;
  is_slop: boolean;
  analysis: string;
  flaws: SlopFlaw[];
  engineering_questions: EngineeringQuestion[];
  similarProjects?: string[];
};
