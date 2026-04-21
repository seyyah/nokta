import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export interface Claim {
  text: string;
  verdict: 'GÜÇLÜ' | 'ABARTILI' | 'DOĞRULANAMAZ';
  reasoning: string;
}

export interface AnalysisResult {
  slopScore: number;       // 0–100  (100 = tamamen slop)
  summary: string;         // 1 cümlelik genel değerlendirme
  claims: Claim[];         // tespit edilen iddialar
  recommendation: string;  // yatırımcıya öneri
}

export type RootStackParamList = {
  Home: undefined;
  Result: { result: AnalysisResult; pitch: string };
  Settings: undefined;
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
