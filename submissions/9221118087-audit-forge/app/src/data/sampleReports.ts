import type { AuditReport } from '../types/audit';
import { generateMarkdownReport } from '../utils/markdownReport';

const samples = [
  {
    id: 'sample-home-primary-action',
    title: 'Primary action label is unclear for first-time users',
    screenName: 'HomeScreen' as const,
    timestamp: '2026-05-17T09:10:00+03:00',
    markedArea: {
      id: 'home-primary-action',
      label: 'Primary action',
      description: 'Yellow marked area around the main Start audit flow button on the HomeScreen.',
    },
    userNote: 'The button says Start, but users do not know that it opens the audit capture flow.',
    expectedBehavior: 'The call to action should make the audit-reporting action explicit.',
    actualBehavior: 'The label is generic and easy to confuse with normal app navigation.',
    severity: 'medium' as const,
    stepsToReproduce: [
      'Open the app on HomeScreen.',
      'Look at the main action below the screen cards.',
      'Ask what action will happen without tapping it.',
    ],
    agentInstruction:
      'Read HomeScreen and ScreenCard copy. Rename the primary action so it clearly starts an audit report, then run typecheck and verify the HomeScreen still fits on a small phone viewport.',
  },
  {
    id: 'sample-reports-empty-state',
    title: 'Generated reports are hard to distinguish from sample reports',
    screenName: 'ReportsScreen' as const,
    timestamp: '2026-05-17T09:18:00+03:00',
    markedArea: {
      id: 'reports-list',
      label: 'Report list',
      description: 'Yellow marked area over the first report card in the ReportsScreen list.',
    },
    userNote: 'I cannot quickly tell whether a report came from the widget or from the packaged samples.',
    expectedBehavior: 'Generated reports should have a clear local/generated label.',
    actualBehavior: 'All report cards look similar when scanning the list.',
    severity: 'low' as const,
    stepsToReproduce: [
      'Generate one report with the floating AuditWidget.',
      'Open ReportsScreen.',
      'Compare the generated report card with the bundled sample report cards.',
    ],
    agentInstruction:
      'Inspect ReportsScreen and ReportCard. Add a clear source indicator for generated versus sample reports without adding new dependencies. Run typecheck and lint.',
  },
  {
    id: 'sample-settings-rollback-warning',
    title: 'Rollback policy is present but not prominent enough',
    screenName: 'SettingsScreen' as const,
    timestamp: '2026-05-17T09:26:00+03:00',
    markedArea: {
      id: 'rollback-policy',
      label: 'Rollback policy',
      description: 'Yellow marked area around the rollback policy panel near the bottom of SettingsScreen.',
    },
    userNote: 'The rollback rule is important for Track C, but it reads like secondary settings text.',
    expectedBehavior: 'Rollback should be clearly visible as a quality gate for failed repairs.',
    actualBehavior: 'The policy is easy to miss while scanning settings.',
    severity: 'high' as const,
    stepsToReproduce: [
      'Open SettingsScreen.',
      'Scroll to the repair policy area.',
      'Scan the page quickly and note whether rollback stands out.',
    ],
    agentInstruction:
      'Update SettingsScreen visual hierarchy so rollback is visibly a repair-loop gate. Preserve the existing Track C language and run typecheck.',
  },
];

export const sampleReports: AuditReport[] = samples.map((sample) => ({
  ...sample,
  status: sample.id === 'sample-settings-rollback-warning' ? 'rolled-back' : 'open',
  markdown: generateMarkdownReport(sample),
}));
