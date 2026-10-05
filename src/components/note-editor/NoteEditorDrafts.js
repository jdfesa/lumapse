import { clearDraft, loadDraft, saveDraft } from '../../services/EditorDraftService.ts';

export class EditorDraftCapture {
  constructor({ createPayload, isBlocked }) {
    this.createPayload = createPayload;
    this.isBlocked = isBlocked;
    this.hasChanges = false;
  }

  schedule() {
    if (this.isBlocked()) return;

    this.hasChanges = true;
    // Capturar antes de que una terminacion abrupta omita los eventos de salida.
    // Esto actualiza solo el borrador, no la nota definitiva.
    this.persist();
  }

  flush() {
    if (this.hasChanges && !this.isBlocked()) {
      this.persist();
    }
  }

  persist() {
    const draft = this.createPayload();

    if (draft) {
      saveDraft(draft);
    } else {
      clearDraft();
    }

    this.hasChanges = false;
  }

  discard() {
    this.hasChanges = false;
    clearDraft();
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
