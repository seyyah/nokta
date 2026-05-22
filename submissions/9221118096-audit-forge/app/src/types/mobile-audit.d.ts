// Local type shim for @xtatistix/mobile-audit.
//
// The published package ships raw .tsx source as its `types` entry, and that
// source has internal type errors against react-native 0.81 (e.g. Animated.View
// construct signatures). Those are the package's concern, not ours — at runtime
// Metro strips types and the widget works fine. To keep the host's own
// typecheck meaningful and green, we point the module at this shim (via the
// tsconfig `paths` mapping). It mirrors the package's real public API exactly,
// so our usage is still validated against the true contract.
declare module "@xtatistix/mobile-audit" {
  import type { ReactNode, RefObject } from "react";

  export interface AuditNoteBounds {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  export type AuditNoteStatus = "open" | "fixed";

  export interface AuditNote {
    id: string;
    screenName: string;
    screenshot: string;
    screenshotAspect?: number;
    highlightBounds: AuditNoteBounds | null;
    note: string;
    status: AuditNoteStatus;
    timestamp: string;
    reporterRole?: string;
    reporterId?: string;
  }

  export interface AuditReportMeta {
    appName: string;
    exportedAt: string;
    totalNotes: number;
  }

  export interface AuditStorage {
    loadNotes(): Promise<AuditNote[]>;
    saveNotes(notes: AuditNote[]): Promise<void>;
  }

  export interface AuditWidgetDeps {
    captureScreen: () => Promise<string>;
    captureRef: (ref: RefObject<any>) => Promise<string>;
    writeFile: (filename: string, content: string) => Promise<string>;
    writeFileBinary: (filename: string, base64: string) => Promise<string>;
    shareFile: (uri: string) => Promise<void>;
    storage: AuditStorage;
    currentScreen: string;
    reporterId?: string;
    BugIcon: ReactNode;
  }

  export interface AuditWidgetProps {
    deps: AuditWidgetDeps;
    appName?: string;
    initialPosition?: { bottom: number; right: number };
  }

  export function AuditWidget(props: AuditWidgetProps): ReactNode;

  export class NoteManager {
    constructor(storage: AuditStorage);
    getAll(): Promise<AuditNote[]>;
    add(note: Omit<AuditNote, "id" | "timestamp" | "status">): Promise<AuditNote>;
    update(id: string, patch: Partial<AuditNote>): Promise<void>;
    remove(id: string): Promise<void>;
    clear(): Promise<void>;
  }

  export function generateId(): string;
  export function buildMarkdown(notes: AuditNote[], meta: AuditReportMeta): string;
  export function buildDocx(notes: AuditNote[], meta: AuditReportMeta): Promise<string>;
  export function AuditOverlay(props: Record<string, unknown>): ReactNode;
  export function AuditNoteList(props: Record<string, unknown>): ReactNode;
  export function AuditSelector(props: Record<string, unknown>): ReactNode;
}
