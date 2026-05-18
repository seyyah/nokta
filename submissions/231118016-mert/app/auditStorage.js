import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'audit_notes';

export const auditStorage = {
  async loadNotes() {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  },
  async saveNotes(notes) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  },
};
