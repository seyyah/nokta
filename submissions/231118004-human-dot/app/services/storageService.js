import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@nokta_history';

export async function saveAnalysis(analysis) {
  try {
    const existing = await getHistory();
    const newEntry = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...analysis,
    };
    const updated = [newEntry, ...existing].slice(0, 20); // max 20 kayıt
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return newEntry.id;
  } catch (e) {
    console.warn('saveAnalysis error:', e);
    return null;
  }
}

export async function getHistory() {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function getAnalysisById(id) {
  try {
    const history = await getHistory();
    return history.find((h) => h.id === id) || null;
  } catch (e) {
    return null;
  }
}

export async function deleteAnalysis(id) {
  try {
    const history = await getHistory();
    const updated = history.filter((h) => h.id !== id);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('deleteAnalysis error:', e);
  }
}
