import { buildMockOutcome, REVIEW_STATUS_ORDER, selectReviewer } from '../mock/expertReviewSeeds';
import { AnalysisResult } from '../types/analysis';
import { ExpertReviewReason, ExpertReviewRequest, ExpertReviewStatus } from '../types/expertReview';

function makeId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${rand}`;
}

function statusComment(status: ExpertReviewStatus): string {
  switch (status) {
    case 'queued':
      return 'Request is in triage queue and awaiting assignment confirmation.';
    case 'accepted':
      return 'Reviewer accepted the request and is preparing diligence notes.';
    case 'in_review':
      return 'Reviewer is validating claims and cross-checking assumptions.';
    case 'completed':
      return 'Review completed with actionable findings and recommendation.';
    default:
      return 'Review status updated.';
  }
}

export async function submitExpertReviewRequest(input: {
  analysis: AnalysisResult;
  reason: ExpertReviewReason;
  note: string;
  orchestrationReasons: string[];
}): Promise<ExpertReviewRequest> {
  await new Promise((resolve) => setTimeout(resolve, 700));

  const now = new Date().toISOString();

  return {
    id: makeId('review'),
    status: 'queued',
    reason: input.reason,
    note: input.note.trim(),
    createdAt: now,
    updatedAt: now,
    pitch: input.analysis.pitch,
    aiSummary: input.analysis.summary,
    aiScore: input.analysis.score,
    orchestrationReasons: input.orchestrationReasons,
    reviewer: selectReviewer(input.reason),
    expertComments: [statusComment('queued')],
    outcome: null,
    savedToCaseNotes: false
  };
}

export function getNextReviewStatus(currentStatus: ExpertReviewStatus): ExpertReviewStatus {
  const currentIndex = REVIEW_STATUS_ORDER.indexOf(currentStatus);

  if (currentIndex < 0 || currentIndex >= REVIEW_STATUS_ORDER.length - 1) {
    return currentStatus;
  }

  return REVIEW_STATUS_ORDER[currentIndex + 1] ?? currentStatus;
}

export async function advanceExpertReviewStatus(request: ExpertReviewRequest): Promise<ExpertReviewRequest> {
  const nextStatus = getNextReviewStatus(request.status);

  if (nextStatus === request.status) {
    return request;
  }

  await new Promise((resolve) => setTimeout(resolve, 250));

  const nextComments = [...request.expertComments, statusComment(nextStatus)];

  if (nextStatus === 'completed') {
    return {
      ...request,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
      expertComments: nextComments,
      outcome: buildMockOutcome(request.reason, request.aiScore)
    };
  }

  return {
    ...request,
    status: nextStatus,
    updatedAt: new Date().toISOString(),
    expertComments: nextComments
  };
}
