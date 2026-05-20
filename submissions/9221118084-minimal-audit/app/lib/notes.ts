import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'notlar_notes';

export interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  starred?: boolean;
}

export async function loadNotes(): Promise<Note[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as Note[]) : [];
}

export async function getNote(id: string): Promise<Note | undefined> {
  const notes = await loadNotes();
  return notes.find((n) => n.id === id);
}

export async function addNote(title: string, body: string): Promise<Note> {
  const notes = await loadNotes();
  const note: Note = {
    id: Date.now().toString(36),
    title: title.trim() || 'Başlıksız',
    body: body.trim(),
    createdAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(KEY, JSON.stringify([note, ...notes]));
  return note;
}

export async function deleteNote(id: string): Promise<void> {
  const notes = await loadNotes();
  await AsyncStorage.setItem(KEY, JSON.stringify(notes.filter((n) => n.id !== id)));
}

export async function toggleStar(id: string): Promise<void> {
  const notes = await loadNotes();
  const next = notes.map((n) => (n.id === id ? { ...n, starred: !n.starred } : n));
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}
