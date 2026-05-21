export type ScreenModel = {
  title: string;
  description: string;
  cardTitle: string;
  cardBody: string;
  bullets: string[];
};

export const screens = {
  capture: {
    title: 'Capture',
    description: 'Three lightweight routes, one audit primitive, and no hidden customer data.',
    cardTitle: 'Issue capture checklist',
    cardBody: 'Tap the audit button, draw one yellow selection, and leave one short note for the repair loop.',
    bullets: ['One visible problem per report', 'One screenshot with immutable burn-in', 'One concise customer note'],
  },
  reports: {
    title: 'Reports',
    description: 'Export-ready notes stay small, shareable, and coding-agent friendly.',
    cardTitle: 'Artifacts waiting to ship',
    cardBody: 'Export Markdown for the repair loop, then share the same evidence with a reviewer when needed.',
    bullets: ['Markdown for the repair loop', 'DOCX for review handoff', 'Local storage only'],
  },
  forge: {
    title: 'Forge',
    description: 'The repair loop advances only when each hypothesis survives a focused test.',
    cardTitle: 'Ratchet status',
    cardBody: 'Next step: keep the evidence, test the smallest repair, and only then advance the ratchet.',
    bullets: ['READ -> LOCATE -> REPAIR', 'TEST -> VERIFY -> COMMIT', 'Rollback when evidence says no'],
  },
} satisfies Record<string, ScreenModel>;
