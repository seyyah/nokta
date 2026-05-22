import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuditStorage, AuditNote } from "@xtatistix/mobile-audit";

const STORAGE_KEY = "nokta_audit_notes";

// Host-owned persistence adapter. The widget never imports AsyncStorage itself;
// it only receives this interface through `deps.storage`. Swapping AsyncStorage
// for MMKV/SQLite is a one-file change here — the widget contract is unchanged.
export const auditStorage: AuditStorage = {
  async loadNotes(): Promise<AuditNote[]> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuditNote[]) : [];
  },
  async saveNotes(notes: AuditNote[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  },
};
