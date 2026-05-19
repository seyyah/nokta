import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@nokta_ideas';

export async function saveIdea(idea) {
  try {
    const existing = await getIdeas();
    const newIdea = {
      ...idea,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    existing.unshift(newIdea);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    return newIdea;
  } catch (error) {
    console.error('Error saving idea:', error);
    throw error;
  }
}

export async function getIdeas() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading ideas:', error);
    return [];
  }
}

export async function deleteIdea(id) {
  try {
    const existing = await getIdeas();
    const filtered = existing.filter((idea) => idea.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting idea:', error);
  }
}

export async function clearAllIdeas() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing ideas:', error);
  }
}
