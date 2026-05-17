import type { AuditNote, AuditStorage } from './types';

export class NoteManager implements AuditStorage {
  private key = 'nokta_audit_notes';

  async save(note: AuditNote): Promise<void> {
    const notes = await this.getAll();
    notes.push(note);
    localStorage.setItem(this.key, JSON.stringify(notes));
  }

  async getAll(): Promise<AuditNote[]> {
    const data = localStorage.getItem(this.key);
    return data ? JSON.parse(data) : [];
  }

  async remove(id: string): Promise<void> {
    const notes = await this.getAll();
    const filtered = notes.filter(n => n.id !== id);
    localStorage.setItem(this.key, JSON.stringify(filtered));
  }

  async add(noteData: Omit<AuditNote, 'id' | 'timestamp'>): Promise<AuditNote> {
    const note: AuditNote = {
      ...noteData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    await this.save(note);
    return note;
  }
}
