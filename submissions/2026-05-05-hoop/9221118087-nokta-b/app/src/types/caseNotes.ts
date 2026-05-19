import { GoNoGoRecommendation } from './expertReview';

export type ExpertCaseNote = {
  id: string;
  timestamp: string;
  pitch: string;
  aiSummary: string;
  escalationReason: string;
  escalationContext: string;
  expertVerdict: string;
  goNoGo: GoNoGoRecommendation;
  expertName: string;
};
