export type Idea = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'Aktif' | 'Beklemede' | 'Tamamlandı';
};

export type RootStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  IdeaList: undefined;
  IdeaDetail: { idea: Idea };
};
