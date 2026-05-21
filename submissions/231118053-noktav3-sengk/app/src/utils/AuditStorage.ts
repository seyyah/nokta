import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuditStorage, AuditNote } from '@xtatistix/mobile-audit';

const STORAGE_KEY = '@slopsense_audit_notes';

export const slopSenseAuditStorage: AuditStorage = {
  loadNotes: async (): Promise<AuditNote[]> => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error('Error loading audit notes:', e);
      return [];
    }
  },
  saveNotes: async (notes: AuditNote[]): Promise<void> => {
    try {
      const jsonValue = JSON.stringify(notes);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error('Error saving audit notes:', e);
    }
  }
};
