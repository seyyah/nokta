import AsyncStorage from '@react-native-async-storage/async-storage';

export const PENDING_AUDIT_VOICE_NOTE_KEY = 'nokta-pending-audit-voice-note-v1';

export async function loadPendingAuditVoiceNote() {
  return AsyncStorage.getItem(PENDING_AUDIT_VOICE_NOTE_KEY);
}

export async function savePendingAuditVoiceNote(note: string) {
  const cleaned = note.trim();

  if (!cleaned) {
    await AsyncStorage.removeItem(PENDING_AUDIT_VOICE_NOTE_KEY);
    return;
  }

  await AsyncStorage.setItem(PENDING_AUDIT_VOICE_NOTE_KEY, cleaned);
}

export async function clearPendingAuditVoiceNote() {
  await AsyncStorage.removeItem(PENDING_AUDIT_VOICE_NOTE_KEY);
}
