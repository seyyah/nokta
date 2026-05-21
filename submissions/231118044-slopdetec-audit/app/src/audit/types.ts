import type React from 'react';

export type AuditNoteStatus = 'open' | 'fixed';

export type AuditNoteBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type AuditNote = {
  id: string;
  screenName: string;
  screenshot: string;
  screenshotAspect?: number;
  highlightBounds: AuditNoteBounds | null;
  note: string;
  status: AuditNoteStatus;
  timestamp: string;
  reporterId?: string;
};

export type AuditStorage = {
  loadNotes(): Promise<AuditNote[]>;
  saveNotes(notes: AuditNote[]): Promise<void>;
};

export type AuditWidgetDeps = {
  captureScreen(highlight?: AuditNoteBounds): Promise<string>;
  writeTextFile(filename: string, content: string): Promise<string>;
  writeBinaryFile(filename: string, base64: string): Promise<string>;
  shareFile(uri: string, title?: string): Promise<void>;
  storage: AuditStorage;
  reporterId?: string;
  BugIcon?: React.ReactNode;
};
