import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { captureRef, captureScreen } from 'react-native-view-shot';
import { AuditStorage, AuditWidgetDeps } from './AuditWidgetHost';

const AUDIT_STORAGE_KEY = 'nokta-game-pitch-audit-notes-v1';
const REPORT_DIR_NAME = 'nokta-game-pitch-audit/';
const FORGE_ENDPOINT = process.env.EXPO_PUBLIC_FORGE_ENDPOINT?.trim();

let resolveAuditTarget: ((note: unknown) => string | null) | undefined;

function withResolvedAuditTargets(notes: unknown[]) {
  const resolver = resolveAuditTarget;

  if (!resolver) {
    return notes;
  }

  return notes.map((note) => {
    if (!note || typeof note !== 'object') {
      return note;
    }

    const draft = note as { note?: unknown };

    if (typeof draft.note !== 'string') {
      return note;
    }

    const target = resolver(note);

    if (!target || draft.note.toLowerCase().includes(target.toLowerCase())) {
      return note;
    }

    return {
      ...note,
      note: `${target}: ${draft.note}`,
    };
  });
}

function inlineNoteText(value: unknown) {
  return typeof value === 'string' ? value.replace(/\s*\n\s*/g, ' ').trim() : '';
}

async function withResolvedMarkdownTargets(content: string) {
  if (!resolveAuditTarget) {
    return content;
  }

  const raw = await AsyncStorage.getItem(AUDIT_STORAGE_KEY);

  if (!raw) {
    return content;
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return content;
    }

    const resolved = withResolvedAuditTargets(parsed);

    return parsed.reduce((markdown, note, index) => {
      const originalNote = inlineNoteText((note as { note?: unknown } | null)?.note);
      const resolvedNote = inlineNoteText((resolved[index] as { note?: unknown } | null)?.note);

      if (!originalNote || !resolvedNote || originalNote === resolvedNote) {
        return markdown;
      }

      return markdown.replace(`— ${originalNote}`, `— ${resolvedNote}`);
    }, content);
  } catch {
    return content;
  }
}

const auditStorage: AuditStorage = {
  async loadNotes() {
    const raw = await AsyncStorage.getItem(AUDIT_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },
  async saveNotes(notes) {
    await AsyncStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(withResolvedAuditTargets(notes)));
  },
};

function sanitizeFileName(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '-');
}

async function ensureReportDirectory() {
  const baseDirectory = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;

  if (!baseDirectory) {
    throw new Error('No writable file-system directory is available for audit export.');
  }

  const reportDirectory = `${baseDirectory}${REPORT_DIR_NAME}`;
  await FileSystem.makeDirectoryAsync(reportDirectory, { intermediates: true }).catch(() => {});
  return reportDirectory;
}

async function writeAuditFile(filename: string, content: string) {
  const reportDirectory = await ensureReportDirectory();
  const fileUri = `${reportDirectory}${sanitizeFileName(filename)}`;
  const finalContent = filename.toLowerCase().endsWith('.md')
    ? await withResolvedMarkdownTargets(content)
    : content;

  await FileSystem.writeAsStringAsync(fileUri, finalContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (filename.toLowerCase().endsWith('.md')) {
    void sendAuditReportToForge(filename, finalContent, fileUri);
  }

  return fileUri;
}

async function writeAuditBinaryFile(filename: string, base64: string) {
  const reportDirectory = await ensureReportDirectory();
  const fileUri = `${reportDirectory}${sanitizeFileName(filename)}`;
  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return fileUri;
}

async function shareAuditFile(uri: string) {
  const canShare = await Sharing.isAvailableAsync();

  if (!canShare) {
    return;
  }

  await Sharing.shareAsync(uri, {
    dialogTitle: 'Share Nokta Game Pitch audit report',
  });
}

async function sendAuditReportToForge(filename: string, content: string, fileUri: string) {
  if (!FORGE_ENDPOINT) {
    return;
  }

  try {
    await fetch(FORGE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename,
        content,
        fileUri,
        source: 'Nokta Game Pitch AuditWidget',
        exportedAt: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.warn('[AuditForge] Failed to send audit report:', error);
  }
}

export function createAuditWidgetDeps(
  currentScreen: string,
  targetResolver?: (note: unknown) => string | null
): AuditWidgetDeps {
  resolveAuditTarget = targetResolver;

  return {
    captureScreen: () => captureScreen({ format: 'png', quality: 0.92 }),
    captureRef: (ref) => captureRef(ref, { format: 'png', quality: 0.92 }),
    writeFile: writeAuditFile,
    writeFileBinary: writeAuditBinaryFile,
    shareFile: shareAuditFile,
    storage: auditStorage,
    currentScreen,
    reporterId: 'customer-developer',
    BugIcon: <Text style={styles.auditIcon}>!</Text>,
  };
}

const styles = StyleSheet.create({
  auditIcon: {
    color: '#FFFFFF',
    fontFamily: 'Manrope_700Bold',
    fontSize: 28,
    lineHeight: 30,
  },
});
