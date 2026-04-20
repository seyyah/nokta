import AsyncStorage from '@react-native-async-storage/async-storage';

import type { SlopResult } from '@/constants/slop-types';

const STORAGE_KEY = 'nokta_slop_vault_v1';

export type SavedAnalysis = {
  id: string;
  ideaText: string;
  createdAt: string;
  result: SlopResult;
};

export async function getSavedAnalyses(): Promise<SavedAnalysis[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as SavedAnalysis[];
  } catch {
    return [];
  }
}

export async function saveAnalysis(entry: SavedAnalysis): Promise<void> {
  const current = await getSavedAnalyses();
  const next = [entry, ...current];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export async function deleteAnalysis(id: string): Promise<void> {
  const current = await getSavedAnalyses();
  const next = current.filter((item) => item.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export async function getAnalysisById(id: string): Promise<SavedAnalysis | null> {
  const current = await getSavedAnalyses();
  return current.find((item) => item.id === id) ?? null;
}
