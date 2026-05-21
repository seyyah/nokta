// Uygulama genelinde kullanılan TypeScript tipleri

export interface IdeaSession {
  id: string;
  rawIdea: string;
  answers: Record<string, string>;
  spec: SpecDocument | null;
  createdAt: string;
  updatedAt: string;
}

export interface SpecDocument {
  productName: string;
  problem: string;
  targetUser: string;
  scope: {
    inScope: string[];
    outOfScope: string[];
  };
  constraints: string[];
  solution: string;
  successMetrics: string[];
  nextVersion: string[];
}

export interface Question {
  id: string;
  key: keyof Omit<SpecDocument, 'productName' | 'scope' | 'successMetrics' | 'nextVersion'> | 'scope' | 'productName';
  step: number;
  title: string;
  subtitle: string;
  placeholder: string;
  icon: string;
  color: string;
}
