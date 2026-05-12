// Fikirlerim için yerel kalıcılık katmanı.
// Sadece final idea.md üretimini saklıyoruz; yarıda kalan sohbeti
// geri yüklemek ayrı ve daha karmaşık bir UX, MVP dışı.

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'tohum:sessions:v1';

export type SavedSession = {
  id: string;
  savedAt: number;
  title: string;
  tagline: string;
  idea_md: string;
};

export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function readAll(): Promise<SavedSession[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSavedSession);
  } catch {
    return [];
  }
}

async function writeAll(sessions: SavedSession[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export async function listSessions(): Promise<SavedSession[]> {
  const all = await readAll();
  return all.sort((a, b) => b.savedAt - a.savedAt);
}

/**
 * Aynı idea_md içeriğini ikinci kez yazmaz. Spec ekranı yeniden
 * mount olduğunda kayıt tekrarını önler.
 */
export async function saveSessionIfNew(
  session: SavedSession,
): Promise<'saved' | 'duplicate'> {
  const existing = await readAll();
  const duplicate = existing.find((s) => s.idea_md === session.idea_md);
  if (duplicate) return 'duplicate';
  await writeAll([session, ...existing]);
  return 'saved';
}

export async function deleteSession(id: string): Promise<void> {
  const existing = await readAll();
  await writeAll(existing.filter((s) => s.id !== id));
}

export async function clearSessions(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

function isSavedSession(value: unknown): value is SavedSession {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.savedAt === 'number' &&
    typeof v.title === 'string' &&
    typeof v.tagline === 'string' &&
    typeof v.idea_md === 'string'
  );
}
