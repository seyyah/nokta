export type FragmentCategory =
  | 'genre'
  | 'playerFantasy'
  | 'coreLoop'
  | 'mechanic'
  | 'reference'
  | 'scope'
  | 'prototype'
  | 'platform'
  | 'production'
  | 'future'
  | 'output'
  | 'unknown';

export type SignalId =
  | 'cozy'
  | 'horror'
  | 'survival'
  | 'farming'
  | 'exploration'
  | 'combat'
  | 'noCombat'
  | 'boss'
  | 'multiplayer'
  | 'offline'
  | 'soloDev'
  | 'shortPrototype'
  | 'largeScope'
  | 'pc'
  | 'mobile'
  | 'web'
  | 'crafting'
  | 'baseBuilding'
  | 'pets'
  | 'openWorld'
  | 'procedural'
  | 'story'
  | 'future'
  | 'cut'
  | 'mentor';

export type Severity = 'low' | 'medium' | 'high';
export type DecisionPriority = 'Now' | 'Soon';
export type SectionTone = 'default' | 'muted';
export type ReviewMode = 'HOOTL' | 'HOTL' | 'HITL';
export type ResultSource = 'groq' | 'local';

export type DraftSectionTitle =
  | 'Game Summary'
  | 'Core Loop'
  | 'Player Fantasy'
  | 'Core Mechanics'
  | 'Scope Boundary'
  | 'Feature Creep Warnings'
  | 'Prototype Plan'
  | 'Final GDD-lite Brief'
  | 'Mentor Feedback Writeback';

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
    | 'tone'
    | 'combat'
    | 'scope'
    | 'platform'
    | 'production'
    | 'multiplayer';
  claimA: string;
  claimB: string;
  rationale: string;
  severity: Severity;
  fragmentIds: string[];
}

export interface UndefinedArea {
  id: string;
  area:
    | 'Core Loop'
    | 'Player Fantasy'
    | 'Target Platform'
    | 'Prototype Constraint'
    | 'Scope Boundary'
    | 'Mentor Feedback';
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

export interface ReadinessReview {
  score: number;
  mode: ReviewMode;
  status: 'Buildable Prototype' | 'Mentor Recommended' | 'Mentor Required';
  rationale: string[];
}

export interface MentorPacket {
  recommendedMentor: string;
  topic: string;
  why: string[];
  questions: string[];
}

export interface MentorFeedbackWriteback {
  summary: string;
  acceptedDecisions: string[];
  rejectedAssumptions: string[];
  newConstraints: string[];
  nextActions: string[];
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
  mentorFeedback?: MentorFeedbackWriteback;
  labels: {
    genreDirection: string;
    prototypePlatform: string;
    combatDirection: string;
    multiplayerDirection: string;
    scopeMetric: string;
  };
}

export interface DistillationMetrics {
  fragmentCount: number;
  duplicatesCollapsed: number;
  ideaUnitCount: number;
  featureCreepCount: number;
}

export interface DistillationResult {
  title: string;
  sections: DraftSection[];
  contradictions: Contradiction[];
  undefinedAreas: UndefinedArea[];
  nextDecisions: NextDecision[];
  fragments: NoteFragment[];
  ideaUnits: IdeaUnit[];
  featureCreepWarnings: string[];
  readiness: ReadinessReview;
  mentorPacket: MentorPacket;
  source: ResultSource;
  metrics: DistillationMetrics;
  refinements: {
    sharpenedSummary: string;
    focusedFeatures: string[];
    scopeBoundary: string;
  };
}

export type BriefStatus = 'saved' | 'mentor_review' | 'reviewed';
export type ReviewTicketStatus = 'pending' | 'resolved';

export interface SavedGameBrief {
  id: string;
  title: string;
  rawInput: string;
  result: DistillationResult;
  selections: Record<string, string>;
  finalBrief: LockedBrief;
  status: BriefStatus;
  createdAt: string;
  updatedAt: string;
  mentorFeedback?: MentorFeedbackWriteback;
  futurePlan: string[];
}

export interface ReviewTicket {
  id: string;
  briefId: string;
  title: string;
  status: ReviewTicketStatus;
  mentorPacket: MentorPacket;
  readiness: ReadinessReview;
  createdAt: string;
  updatedAt: string;
  feedbackText?: string;
  resolvedAt?: string;
}

export interface GamePitchStore {
  briefs: SavedGameBrief[];
  tickets: ReviewTicket[];
}
