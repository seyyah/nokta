import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'audit_notes';

export const auditStorage = {
  async loadNotes() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('AuditStorage load error:', e);
      return [];
    }
  },
  async saveNotes(notes) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
      console.error('AuditStorage save error:', e);
    }
  },
};
