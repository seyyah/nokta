// Type definitions for nokta-audit
// This mirrors the drop-in API described in seyyah/nokta-audit

export interface AuditReport {
  id: string;
  screen: string;
  timestamp: string;
  note: string;
  screenshotUri?: string;
  annotations: Annotation[];
  markdown: string;
}

export interface Annotation {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}

export interface AuditWidgetProps {
  /** Screen identifier shown in the report */
  screenName: string;
  /** Called when the user saves a report */
  onReport?: (report: AuditReport) => void;
  /** Optional: override FAB position */
  fabPosition?: 'bottom-right' | 'bottom-left';
}
