/**
 * auditStorage.ts
 *
 * Track A — Drop-in primitive disiplini:
 * Native bağımlılık eklememek için in-memory storage kullanılıyor.
 * Gerçek projede bu dosyada tek satır swap ile AsyncStorage / MMKV geçilir.
 *
 * AuditStorage interface'i @xtatistix/mobile-audit'tan gelir.
 */

import type { AuditStorage, AuditNote } from '@xtatistix/mobile-audit';

let _notes: AuditNote[] = [];

export const auditStorage: AuditStorage = {
  async loadNotes(): Promise<AuditNote[]> {
    return [..._notes];
  },
  async saveNotes(notes: AuditNote[]): Promise<void> {
    _notes = [...notes];
  },
};
