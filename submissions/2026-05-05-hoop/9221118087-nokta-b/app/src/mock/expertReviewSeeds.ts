import { ExpertReviewOutcome, ExpertReviewReason, ExpertReviewStatus, ExpertReviewer } from '../types/expertReview';

export const REVIEW_STATUS_ORDER: ExpertReviewStatus[] = ['queued', 'accepted', 'in_review', 'completed'];

export const REVIEW_STATUS_LABEL: Record<ExpertReviewStatus, string> = {
  queued: 'Queued',
  accepted: 'Accepted',
  in_review: 'In Review',
  completed: 'Completed'
};

const FALLBACK_REVIEWER: ExpertReviewer = {
  id: 'exp_1',
  name: 'Aylin Demir',
  domain: 'B2B SaaS GTM and Market Validation',
  availability: 'Online in review queue',
  responseEta: '20-30 min'
};

export const MOCK_REVIEWERS: ExpertReviewer[] = [
  FALLBACK_REVIEWER,
  {
    id: 'exp_2',
    name: 'Mert Kaya',
    domain: 'Technical Feasibility and Product Delivery',
    availability: 'Next available slot',
    responseEta: '35-45 min'
  },
  {
    id: 'exp_3',
    name: 'Selin Acar',
    domain: 'Investor Narrative and Fundraising Readiness',
    availability: 'Available this hour',
    responseEta: '15-25 min'
  }
];

function reviewerAt(index: number): ExpertReviewer {
  return MOCK_REVIEWERS[index] ?? FALLBACK_REVIEWER;
}

export function selectReviewer(reason: ExpertReviewReason): ExpertReviewer {
  if (reason === 'Technical feasibility') {
    return reviewerAt(1);
  }

  if (reason === 'Investor-readiness' || reason === 'Business model clarity') {
    return reviewerAt(2);
  }

  return reviewerAt(0);
}

export function buildMockOutcome(reason: ExpertReviewReason, aiScore: number): ExpertReviewOutcome {
  const defaultOutcome: ExpertReviewOutcome = {
    verdict: 'Current pitch narrative is directionally interesting but not yet diligence-grade.',
    topConcerns: [
      'Core customer segment is broad and not prioritized for initial entry.',
      'Market and impact claims are not tied to sourced or measured data.',
      'Execution constraints are under-specified for investor confidence.'
    ],
    topImprovements: [
      'Define one ICP and one urgent workflow with measurable pain frequency.',
      'Attach a small evidence table: pilot size, conversion, retention proxy, and baseline.',
      'State a phased launch plan with assumptions, risks, and kill criteria.'
    ],
    goNoGo: aiScore >= 72 ? 'Not ready' : 'Needs revision',
    expertAdded:
      'AI flagged generic risk patterns; expert review adds go-to-market boundary checks and practical diligence priorities.'
  };

  if (reason === 'Technical feasibility') {
    return {
      verdict: 'Technical claim stack is ambitious but currently lacks implementation realism.',
      topConcerns: [
        'Latency and integration claims appear optimistic relative to enterprise deployment realities.',
        'No architecture or dependency assumptions are disclosed.',
        'Operational failure modes are not acknowledged.'
      ],
      topImprovements: [
        'Provide an architecture diagram and expected system bottlenecks.',
        'Include phased performance targets instead of absolute claims.',
        'Add implementation prerequisites and integration time estimates.'
      ],
      goNoGo: 'Needs revision',
      expertAdded:
        'AI identified slop signals; expert review translates them into engineering feasibility gates and delivery risks.'
    };
  }

  if (reason === 'Investor-readiness') {
    return {
      verdict: 'Investor-facing story is compelling in tone but not yet defensible under partner-level questioning.',
      topConcerns: [
        'Differentiation is not benchmarked against direct alternatives.',
        'Monetization logic is implied but not quantified.',
        'No evidence ladder is shown from hypothesis to traction.'
      ],
      topImprovements: [
        'Add competitor matrix and explicit wedge strategy.',
        'Specify pricing model, expected gross margin, and payback logic.',
        'Show 90-day evidence milestones investors can audit.'
      ],
      goNoGo: aiScore >= 65 ? 'Needs revision' : 'Ready for next step',
      expertAdded:
        'AI highlighted textual risk; expert review reframes it into what an investment committee would challenge first.'
    };
  }

  return defaultOutcome;
}
