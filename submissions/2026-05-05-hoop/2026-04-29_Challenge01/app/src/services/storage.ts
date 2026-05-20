import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SpecHistoryEntry } from '@/types';

const KEY = 'nokta:spec-history:v1';
const MAX_ENTRIES = 50;

export async function listHistory(): Promise<SpecHistoryEntry[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SpecHistoryEntry[];
  } catch {
    return [];
  }
}

export async function saveHistory(entry: SpecHistoryEntry): Promise<void> {
  const cur = await listHistory();
  const next = [entry, ...cur].slice(0, MAX_ENTRIES);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
