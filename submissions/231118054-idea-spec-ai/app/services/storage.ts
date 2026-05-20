import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Spec {
  id: string;
  title: string;
  createdAt: string;
  rawIdea: string;
  problem: string;
  user: string;
  solution: string;
  scope: string;
  constraints: string;
}

const STORAGE_KEY = '@nokta_specs';

export const storage = {
  async getAllSpecs(): Promise<Spec[]> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (!json) return [];
      const specs: Spec[] = JSON.parse(json);
      // Sort by creation date descending (newest first)
      return specs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Error fetching specs from AsyncStorage:', error);
      return [];
    }
  },

  async saveSpec(specData: Omit<Spec, 'id' | 'createdAt'>): Promise<Spec> {
    try {
      const specs = await this.getAllSpecs();
      const newSpec: Spec = {
        ...specData,
        id: Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString(),
      };
      specs.push(newSpec);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(specs));
      return newSpec;
    } catch (error) {
      console.error('Error saving spec to AsyncStorage:', error);
      throw error;
    }
  },

  async deleteSpec(id: string): Promise<void> {
    try {
      const specs = await this.getAllSpecs();
      const filtered = specs.filter((s) => s.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting spec from AsyncStorage:', error);
      throw error;
    }
  }
};
