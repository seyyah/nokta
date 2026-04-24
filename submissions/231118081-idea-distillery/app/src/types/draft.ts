export type FragmentCategory =
  | 'problem'
  | 'intent'
  | 'direction'
  | 'feature'
  | 'constraint'
  | 'workflow'
  | 'audience'
  | 'boundary'
  | 'future'
  | 'output'
  | 'unknown';

export type SignalId =
  | 'simple'
  | 'advanced'
  | 'summarizer'
  | 'conceptTool'
  | 'cardsOutput'
  | 'draftOutput'
  | 'pasteFlow'
  | 'guidedFlow'
  | 'offline'
  | 'ai'
  | 'soloAudience'
  | 'teamAudience'
  | 'future'
  | 'tightScope'
  | 'broadScope'
  | 'review';

export type Severity = 'low' | 'medium' | 'high';
export type DecisionPriority = 'Now' | 'Soon';
export type SectionTone = 'default' | 'muted';

export type DraftSectionTitle =
  | 'Concept Summary'
  | 'Problem and Intent'
  | 'Core Product Direction'
  | 'Key Features'
  | 'Constraints and Boundaries'
  | 'Contradictions and Tensions'
  | 'Undefined Areas'
  | 'Recommended Next Decisions';

export interface NoteFragment {
  id: string;
  raw: string;
  cleaned: string;
  normalized: string;
  keywords: string[];
  category: FragmentCategory;
  signals: SignalId[];
}

export interface OverlapGroup {
  id: string;
  fragmentIds: string[];
  canonicalFragmentId: string;
  similarity: number;
}

export interface IdeaUnit {
  id: string;
  title: string;
  canonicalStatement: string;
  category: FragmentCategory;
  fragmentIds: string[];
  strength: 'weak' | 'medium' | 'strong';
}

export interface DraftSection {
  title: DraftSectionTitle;
  items: string[];
}

export interface Contradiction {
  id: string;
  topic:
    | 'scope'
    | 'positioning'
    | 'workflow'
    | 'output'
    | 'audience'
    | 'technical';
  claimA: string;
  claimB: string;
  rationale: string;
  severity: Severity;
  fragmentIds: string[];
}

export interface UndefinedArea {
  id: string;
  area:
    | 'Target User'
    | 'Workflow'
    | 'Output Contract'
    | 'Success Metric'
    | 'Scope Boundary';
  explanation: string;
  severity: Severity;
  fragmentIds: string[];
}

export interface NextDecision {
  id: string;
  question: string;
  recommendation: string;
  options: string[];
  priority: DecisionPriority;
}

export interface LockedBrief {
  title: string;
  lockedSummary: string;
  directionItems: string[];
  featureFocus: string[];
  boundaryItems: string[];
  changeLog: string[];
  resolvedCount: number;
  totalDecisionCount: number;
  unresolvedQuestions: string[];
  labels: {
    positioning: string;
    primaryUser: string;
    mainArtifact: string;
    workflow: string;
    successMetric: string;
  };
}

export interface DistillationMetrics {
  fragmentCount: number;
  duplicatesCollapsed: number;
  ideaUnitCount: number;
}

export interface DistillationResult {
  title: string;
  sections: DraftSection[];
  contradictions: Contradiction[];
  undefinedAreas: UndefinedArea[];
  nextDecisions: NextDecision[];
  fragments: NoteFragment[];
  ideaUnits: IdeaUnit[];
  metrics: DistillationMetrics;
  refinements: {
    sharpenedSummary: string;
    focusedFeatures: string[];
    scopeBoundary: string;
  };
}
