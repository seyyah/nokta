export type RootStackParamList = {
  PitchInput: undefined;
  Loading: { pitch: string };
  Dashboard: { result: AnalysisResult };
  ExpertHub: { result: AnalysisResult; pitch: string };
};

export type AnalysisResult = {
  score: number;
  reasoning: string[];
  socialSensor: {
    competitors: string[];
    warnings: string[];
  };
  status?: 'AI_ONLY' | 'PENDING_HUMAN' | 'HUMAN_VERIFIED';
  humanNotes?: string[];
  expertInsights?: {
    cto: string;
    cfo: string;
    strategist: string;
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
