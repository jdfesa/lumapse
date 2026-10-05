import { clearDraft, loadDraft, saveDraft } from '../../services/EditorDraftService.ts';

export class EditorDraftCapture {
  constructor({ createPayload, isBlocked, onError = () => {} }) {
    Object.assign(this, { createPayload, isBlocked, onError });
    this.hasChanges = false;
    this.revision = 0;
    this.pending = null;
  }

  schedule() {
    if (this.isBlocked()) return;
    this.payload = this.createPayload();
    this.hasChanges = true;
    // Snapshot inmediato; la cola SQLite ordena cada escritura sin debounce.
    return this.persist();
  }

  flush() {
    if (this.isBlocked()) return this.pending;
    return this.pending || (this.hasChanges ? this.persist() : null);
  }

  persist() {
    const revision = ++this.revision;
    const write = this.payload ? saveDraft(this.payload) : clearDraft();
    this.pending = Promise.resolve(write).then(() => {
      if (revision !== this.revision) return;
      this.pending = null;
      this.hasChanges = false;
    }, error => {
      if (revision !== this.revision) return;
      this.pending = null;
      // Conservar el snapshot para reintentar, sin rechazos huérfanos en eventos DOM.
      this.onError(error);
    });
    return this.pending;
  }

  async discard() {
    await clearDraft();
    this.markSaved();
  }

  markSaved() {
    this.revision++;
    this.pending = null;
    this.hasChanges = false;
    this.payload = null;
  }
}

export function createEditorDraftPayload({
  currentEditBaseUpdatedAt,
  currentEditId,
  title,
  content,
  subjectId,
}) {
  if (currentEditId) {
    return {
      mode: 'edit',
      noteId: currentEditId,
      title,
      content,
      subjectId,
      baseUpdatedAt: currentEditBaseUpdatedAt,
    };
  }

  if (!title.trim() && !content.trim()) {
    return null;
  }

  return {
    mode: 'create',
    noteId: null,
    title,
    content,
    subjectId,
    baseUpdatedAt: null,
  };
}

export class EditorDraftRestorer {
  constructor() {
    this.draft = loadDraft();
    this.restored = false;
  }

  restore(state = {}) {
    if (this.restored || !this.draft) return null;

    if (this.draft.mode === 'edit') {
      const note = state.notes?.find(item => item.id === this.draft.noteId);
      if (!note && !state.notesLoaded) return null;

      this.restored = true;
      return createDraftRestoration(note ? this.draft : { ...this.draft, mode: 'create', noteId: null }, note);
    }

    this.restored = true;
    return createDraftRestoration(this.draft);
  }
}

function createDraftRestoration(draft, note = null) {
  const isEdit = draft.mode === 'edit';
  const content = draft.content || '';
  const title = draft.title || '';

  return {
    mode: draft.mode,
    currentEditId: isEdit ? draft.noteId : null,
    currentEditBaseUpdatedAt: isEdit ? draft.baseUpdatedAt || note?.updatedAt || null : null,
    title,
    content,
    subjectId: draft.subjectId || '',
    saveLabel: isEdit ? 'Actualizar' : 'Guardar',
    statusText: isEdit ? 'Cambios pendientes' : 'Borrador recuperado',
    focusTarget: title.trim() && !content.trim() ? 'title' : 'content',
  };
}
