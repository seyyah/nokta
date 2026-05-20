// @ts-check
import AsyncStorage from '@react-native-async-storage/async-storage';

/** @type {import('./core/types').AuditStorage} */
export const auditStorage = {
  async loadNotes() {
    try {
      const raw = await AsyncStorage.getItem('nokta_audit_notes');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      return [];
    } catch (e) {
      console.warn('[auditStorage] loadNotes failed:', e);
      return [];
    }
  },

  async saveNotes(notes) {
    try {
      await AsyncStorage.setItem('nokta_audit_notes', JSON.stringify(notes));
    } catch (e) {
      console.warn('[auditStorage] saveNotes failed:', e);
    }
  },
};
