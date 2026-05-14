export type Idea = {
  id: string;
  title: string;
  screen: string;
  status: 'draft' | 'audit-ready' | 'forged';
  customerSignal: string;
  developerMove: string;
  kg: number;
};

export const ideas: Idea[] = [
  {
    id: 'onboarding-handoff',
    title: 'Onboarding handoff',
    screen: 'Onboarding',
    status: 'forged',
    customerSignal: 'The first screen should explain how my note becomes a developer task.',
    developerMove: 'Add a customer-to-agent handoff strip directly under the primary call to action.',
    kg: 10,
  },
  {
    id: 'idea-context',
    title: 'Idea context cards',
    screen: 'IdeaDetail',
    status: 'forged',
    customerSignal: 'When I open an idea, I need a path from my request to the actual code change.',
    developerMove: 'Expose customer signal, forge hypothesis, and verification as a single detail surface.',
    kg: 15,
  },
  {
    id: 'forge-ratchet',
    title: 'Ratchet ledger',
    screen: 'ForgeBoard',
    status: 'audit-ready',
    customerSignal: 'I want to see failed hypotheses so the agent does not repeat them.',
    developerMove: 'Keep rollback rows visible next to successful commits in the forge board.',
    kg: 20,
  },
];

export const forgeCycles = [
  {
    id: 1,
    report: '01-onboarding-cta.md',
    result: 'success',
    kg: 10,
    summary: 'Added a clear handoff strip that tells the customer how the audit note becomes agent work.',
  },
  {
    id: 2,
    report: '02-idea-detail-context.md',
    result: 'success',
    kg: 15,
    summary: 'Promoted customer signal and verification intent into the idea detail screen.',
  },
  {
    id: 3,
    report: '03-forge-dashboard-feature.md',
    result: 'rollback',
    kg: 0,
    summary: 'Rejected an oversized automation panel because it blurred audit scope and broke the small-screen layout.',
  },
  {
    id: 4,
    report: '03-forge-dashboard-feature.md',
    result: 'success',
    kg: 20,
    summary: 'Added a compact ratchet board with visible rollback memory and kg progression.',
  },
];
