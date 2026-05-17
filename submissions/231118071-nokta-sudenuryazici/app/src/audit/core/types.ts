export interface AuditNoteBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AuditNote {
  id: string;
  screenName: string;
  screenshot: string; // Base64
  screenshotAspect: number;
  highlightBounds: AuditNoteBounds | null;
  note: string;
  timestamp: string;
  reporterId?: string;
}

export interface AuditStorage {
  save(note: AuditNote): Promise<void>;
  getAll(): Promise<AuditNote[]>;
  remove(id: string): Promise<void>;
}
