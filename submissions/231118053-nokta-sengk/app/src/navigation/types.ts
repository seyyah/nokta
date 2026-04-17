export type RootStackParamList = {
  PitchInput: undefined;
  Loading: { pitch: string };
  Dashboard: { result: AnalysisResult };
};

export type AnalysisResult = {
  score: number;
  reasoning: string[];
  socialSensor: {
    competitors: string[];
    warnings: string[];
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
