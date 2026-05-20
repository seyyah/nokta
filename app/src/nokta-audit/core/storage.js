// @ts-check
/**
 * @returns {string}
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export class NoteManager {
  /**
   * @param {import('./types').AuditStorage} storage
   */
  constructor(storage) {
    this.storage = storage;
  }

  /**
   * @returns {Promise<import('./types').AuditNote[]>}
   */
  async getAll() {
    return this.storage.loadNotes();
  }

  /**
   * @param {Omit<import('./types').AuditNote, 'id' | 'timestamp' | 'status'>} note
   * @returns {Promise<import('./types').AuditNote>}
   */
  async add(note) {
    const notes = await this.storage.loadNotes();
    /** @type {import('./types').AuditNote} */
    const newNote = {
      ...note,
      id: generateId(),
      timestamp: new Date().toISOString(),
      status: 'open',
    };
    await this.storage.saveNotes([...notes, newNote]);
    return newNote;
  }

  /**
   * @param {string} id
   * @param {Partial<import('./types').AuditNote>} patch
   * @returns {Promise<void>}
   */
  async update(id, patch) {
    const notes = await this.storage.loadNotes();
    const idx = notes.findIndex((n) => n.id === id);
    if (idx === -1) return;
    notes[idx] = { ...notes[idx], ...patch };
    await this.storage.saveNotes(notes);
  }

  /**
   * @param {string} id
   * @returns {Promise<void>}
   */
  async remove(id) {
    const notes = await this.storage.loadNotes();
    await this.storage.saveNotes(notes.filter((n) => n.id !== id));
  }

  /**
   * @returns {Promise<void>}
   */
  async clear() {
    await this.storage.saveNotes([]);
  }
}
