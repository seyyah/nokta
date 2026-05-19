import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'audit_notes_v1';

/**
 * AuditStorage interface implementasyonu.
 * Widget'ın NoteManager'ı bu adaptörü kullanır.
 * AsyncStorage → host application boundary kuralına uygun:
 * native paketi host sağlar, widget import etmez.
 */
export const auditStorage = {
  async loadNotes() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('[auditStorage] loadNotes failed:', e);
      return [];
    }
  },

  async saveNotes(notes) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
      console.warn('[auditStorage] saveNotes failed:', e);
    }
  },
};
