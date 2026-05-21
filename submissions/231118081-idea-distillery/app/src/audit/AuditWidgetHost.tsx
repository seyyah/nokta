import React from 'react';

export type AuditStorage = {
  loadNotes: () => Promise<unknown[]>;
  saveNotes: (notes: unknown[]) => Promise<void>;
};

export type AuditWidgetDeps = {
  captureScreen: () => Promise<string>;
  captureRef: (ref: React.RefObject<unknown>) => Promise<string>;
  writeFile: (filename: string, content: string) => Promise<string>;
  writeFileBinary: (filename: string, base64: string) => Promise<string>;
  shareFile: (uri: string) => Promise<void>;
  storage: AuditStorage;
  currentScreen: string;
  reporterId?: string;
  BugIcon: React.ReactNode;
};

type AuditWidgetHostProps = {
  deps: AuditWidgetDeps;
  appName?: string;
  initialPosition?: { bottom: number; right: number };
};

const { AuditWidget } = require('@xtatistix/mobile-audit') as {
  AuditWidget: React.ComponentType<AuditWidgetHostProps>;
};

export function AuditWidgetHost(props: AuditWidgetHostProps) {
  return <AuditWidget {...props} />;
}
