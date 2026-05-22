import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuditStorage, AuditNote } from '@xtatistix/mobile-audit';

const STORAGE_KEY = 'nokta_radar_audit_notes';

/**
 * AuditStorage adapter — host application boundary.
 * Widget, storage'ın "nerede" olduğunu bilmez; bu adapter AsyncStorage kullanır.
 * Drop-in prensibi: widget bu dosyayı import etmez, deps.storage üzerinden alır.
 */
export const auditStorage: AuditStorage = {
  async loadNotes(): Promise<AuditNote[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
  async saveNotes(notes: AuditNote[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {
      // Sessizce geç — widget'ı bloke etme
    }
  },
};
