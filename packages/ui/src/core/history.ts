export interface HistoryEntry { label?: string; undo(): void; redo(): void }

export class History {
  private undoStack: HistoryEntry[] = [];
  private redoStack: HistoryEntry[] = [];
  private transaction: { label: string; entries: HistoryEntry[] } | null = null;
  readonly limit: number;
  constructor({ limit = 200 } = {}) { this.limit = limit; }
  begin(label = 'Change') { if (!this.transaction) this.transaction = { label, entries: [] }; }
  record(entry: HistoryEntry) {
    if (!entry?.undo || !entry?.redo) return;
    if (this.transaction) this.transaction.entries.push(entry); else this.push(entry);
  }
  commit() {
    const tx = this.transaction; this.transaction = null;
    if (!tx?.entries.length) return;
    this.push({ label: tx.label, undo: () => [...tx.entries].reverse().forEach(e => e.undo()), redo: () => tx.entries.forEach(e => e.redo()) });
  }
  cancel() { this.transaction = null; }
  private push(entry: HistoryEntry) {
    this.undoStack.push(entry); this.redoStack.length = 0;
    if (this.undoStack.length > this.limit) this.undoStack.shift();
  }
  undo() { const e = this.undoStack.pop(); if (!e) return false; e.undo(); this.redoStack.push(e); return true; }
  redo() { const e = this.redoStack.pop(); if (!e) return false; e.redo(); this.undoStack.push(e); return true; }
  clear() { this.undoStack.length = 0; this.redoStack.length = 0; this.transaction = null; }
  get canUndo() { return this.undoStack.length > 0; }
  get canRedo() { return this.redoStack.length > 0; }
}
