import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ReactNode, RefObject } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { captureRef, captureScreen } from 'react-native-view-shot';
import type { AuditNote, AuditStorage } from '@xtatistix/mobile-audit';

const STORAGE_KEY = 'audit_notes';

const storage: AuditStorage = {
  async loadNotes(): Promise<AuditNote[]> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuditNote[]) : [];
  },
  async saveNotes(notes: AuditNote[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  },
};

export function createAuditDeps(currentScreen: string, BugIcon: ReactNode) {
  return {
    captureScreen: () => captureScreen({ format: 'png', result: 'tmpfile' }),
    captureRef: (ref: RefObject<unknown>) => captureRef(ref, { format: 'png', result: 'tmpfile' }),
    writeFile: async (filename: string, content: string) => {
      const uri = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(uri, content);
      return uri;
    },
    writeFileBinary: async (filename: string, base64: string) => {
      const uri = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(uri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return uri;
    },
    shareFile: async (uri: string) => {
      await Sharing.shareAsync(uri);
    },
    storage,
    currentScreen,
    reporterId: 'qa-track-a',
    BugIcon,
  };
}
