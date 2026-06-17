/**
 * Nokta Voice Forge — TypeScript Type Definitions
 */

// ─── Audio Types ─────────────────────────────────────────

export interface AudioMeterData {
  /** Normalized amplitude 0-1 */
  amplitude: number;
  /** Raw dB value from expo-audio metering */
  dB: number;
  /** Simulated frequency band amplitudes */
  bands: number[];
  /** Whether sound is above silence threshold */
  isSpeaking: boolean;
  /** Timestamp */
  timestamp: number;
}

export interface AudioServiceState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  fileUri: string | null;
}

// ─── Avatar Types ────────────────────────────────────────

export type MouthShape = 'closed' | 'slightly_open' | 'half_open' | 'open' | 'wide_open';

export type EyeState = 'open' | 'half_closed' | 'closed' | 'looking_left' | 'looking_right';

export type PersonaId = 'junior' | 'senior';

export interface AvatarState {
  mouthShape: MouthShape;
  eyeState: EyeState;
  headTiltX: number;    // -1 to 1
  headTiltY: number;    // -1 to 1
  blinkProgress: number; // 0 (open) to 1 (closed)
  speakingIntensity: number; // 0 to 1
  persona: PersonaId;
}

export interface PersonaConfig {
  id: PersonaId;
  name: string;
  tone: string;
  primaryColor: string;
  gradient: readonly string[];
  faceShape: 'round' | 'angular';
  eyeSize: 'large' | 'normal';
  animationIntensity: number;
  greetingText: string;
  feedbackStyle: 'encouraging' | 'analytical';
}

// ─── Forge Types ─────────────────────────────────────────

export type ForgePhase =
  | 'READ'
  | 'LOCATE'
  | 'HYPOTHESIZE'
  | 'REPAIR'
  | 'TEST'
  | 'VERIFY'
  | 'COMMIT'
  | 'ROLLBACK';

export type ForgeResult = 'SUCCESS' | 'ROLLBACK' | 'IN_PROGRESS' | 'STUCK' | 'FAIL';

export interface ForgeCycle {
  id: number;
  reportName: string;
  hypothesis: string;
  result: ForgeResult;
  changedFiles: string[];
  testResult: string;
  commitHash: string;
  kg: number;
  humanTouchPoints: number;
  startTime: string;
  endTime: string;
  currentPhase: ForgePhase;
  phases: {
    phase: ForgePhase;
    status: 'pending' | 'active' | 'done' | 'failed';
    notes: string;
    timestamp: string;
  }[];
  durationMinutes: number;
}

export interface ForgeState {
  cycles: ForgeCycle[];
  consecutiveFailures: number;
  totalKg: number;
  isStuck: boolean;
  stuckReason: string;
  totalHumanTouchPoints: number;
}

// ─── Audit Types ─────────────────────────────────────────

export interface AuditReport {
  id: string;
  screenName: string;
  timestamp: string;
  note: string;
  markdownContent: string;
  screenshotUri: string | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved';
}

// ─── Expert Bridge Types ─────────────────────────────────

export interface ExpertCall {
  id: string;
  triggerReason: string;
  jitsiRoomUrl: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  summary: string;
  participants: string[];
  screenShared: boolean;
  resolutionNotes: string;
  contextForNextCycle: string;
}

export interface BridgeState {
  isStuck: boolean;
  stuckCycles: number[];
  expertCalls: ExpertCall[];
  lastCallSummary: string;
}

// ─── Navigation Types ────────────────────────────────────

export type RootStackParamList = {
  Home: undefined;
  Voice: undefined;
  Avatar: undefined;
  Forge: undefined;
  Audit: undefined;
  ExpertCall: { stuckReason?: string };
};

// ─── STT Types ───────────────────────────────────────────

export interface STTResult {
  text: string;
  confidence: number;
  language: string;
  duration: number;
  isFinal: boolean;
  isRealSTT?: boolean;
}
