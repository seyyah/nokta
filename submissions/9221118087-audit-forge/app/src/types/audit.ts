export type ScreenName = 'HomeScreen' | 'ReportsScreen' | 'SettingsScreen';

export type AuditSeverity = 'low' | 'medium' | 'high';

export type ReportStatus = 'open' | 'fixed' | 'rolled-back';

export interface MarkedArea {
  id: string;
  label: string;
  description: string;
}

export interface AuditReportInput {
  title: string;
  screenName: ScreenName;
  timestamp: string;
  markedArea: MarkedArea;
  userNote: string;
  expectedBehavior: string;
  actualBehavior: string;
  severity: AuditSeverity;
  stepsToReproduce: string[];
  agentInstruction: string;
}

export interface AuditReport extends AuditReportInput {
  id: string;
  status: ReportStatus;
  markdown: string;
}

export interface ScreenSummary {
  name: ScreenName;
  title: string;
  description: string;
  risk: string;
}
