import { ExpertCaseNote } from '../types/caseNotes';
import { ExpertReviewRequest } from '../types/expertReview';

const caseNotesStore: ExpertCaseNote[] = [];

function makeId(): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `note_${Date.now()}_${rand}`;
}

export async function listCaseNotes(): Promise<ExpertCaseNote[]> {
  return [...caseNotesStore].sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1));
}

export async function saveExpertReviewToCaseNotes(review: ExpertReviewRequest): Promise<ExpertCaseNote> {
  if (!review.outcome) {
    throw new Error('Expert outcome is not available yet.');
  }

  const note: ExpertCaseNote = {
    id: makeId(),
    timestamp: new Date().toISOString(),
    pitch: review.pitch,
    aiSummary: review.aiSummary,
    escalationReason: review.reason,
    escalationContext: review.orchestrationReasons.join(' '),
    expertVerdict: review.outcome.verdict,
    goNoGo: review.outcome.goNoGo,
    expertName: review.reviewer.name
  };

  caseNotesStore.unshift(note);
  return note;
}
