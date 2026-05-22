import * as FileSystem from 'expo-file-system/legacy';
import type { AuditStorage, AuditNote } from '@xtatistix/mobile-audit';

const FILE_PATH = FileSystem.documentDirectory + 'audit_notes.json';

export const auditStorage: AuditStorage = {
  async loadNotes(): Promise<AuditNote[]> {
    try {
      const info = await FileSystem.getInfoAsync(FILE_PATH);
      if (info.exists) {
        const content = await FileSystem.readAsStringAsync(FILE_PATH);
        return JSON.parse(content);
      }
    } catch (e) {
      console.error('Error loading notes:', e);
    }
    return [];
  },
  async saveNotes(notes: AuditNote[]): Promise<void> {
    try {
      await FileSystem.writeAsStringAsync(FILE_PATH, JSON.stringify(notes));
    } catch (e) {
      console.error('Error saving notes:', e);
    }
  },
};
