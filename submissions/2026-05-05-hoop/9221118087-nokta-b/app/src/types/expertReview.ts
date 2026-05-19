export const EXPERT_REVIEW_REASONS = [
  'Market validation',
  'Competitor review',
  'Business model clarity',
  'Technical feasibility',
  'Investor-readiness',
  'Other'
] as const;

export type ExpertReviewReason = (typeof EXPERT_REVIEW_REASONS)[number];

export type ExpertReviewStatus = 'queued' | 'accepted' | 'in_review' | 'completed';

export type GoNoGoRecommendation = 'Not ready' | 'Needs revision' | 'Ready for next step';

export type ExpertReviewer = {
  id: string;
  name: string;
  domain: string;
  availability: string;
  responseEta: string;
};

export type ExpertReviewOutcome = {
  verdict: string;
  topConcerns: string[];
  topImprovements: string[];
  goNoGo: GoNoGoRecommendation;
  expertAdded: string;
};

export type ExpertReviewRequest = {
  id: string;
  status: ExpertReviewStatus;
  reason: ExpertReviewReason;
  note: string;
  createdAt: string;
  updatedAt: string;
  pitch: string;
  aiSummary: string;
  aiScore: number;
  orchestrationReasons: string[];
  reviewer: ExpertReviewer;
  expertComments: string[];
  outcome: ExpertReviewOutcome | null;
  savedToCaseNotes: boolean;
};
