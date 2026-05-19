import AsyncStorage from '@react-native-async-storage/async-storage';
import { GamePitchStore } from '../types/draft';

const STORE_KEY = 'nokta-game-pitch-store-v1';

const emptyStore: GamePitchStore = {
  briefs: [],
  tickets: [],
};

export async function loadGamePitchStore(): Promise<GamePitchStore> {
  const raw = await AsyncStorage.getItem(STORE_KEY);

  if (!raw) {
    return emptyStore;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<GamePitchStore>;
    return {
      briefs: Array.isArray(parsed.briefs) ? parsed.briefs : [],
      tickets: Array.isArray(parsed.tickets) ? parsed.tickets : [],
    };
  } catch {
    return emptyStore;
  }
}

export async function saveGamePitchStore(store: GamePitchStore) {
  await AsyncStorage.setItem(STORE_KEY, JSON.stringify(store));
}
