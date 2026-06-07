import { clearDraft, loadDraft, saveDraft } from '../services/EditorDraftService.js';

const DRAFT_SAVE_DEBOUNCE_MS = 500;

export class EditorDraftCapture {
  constructor({ createPayload, isBlocked }) {
    this.createPayload = createPayload;
    this.isBlocked = isBlocked;
    this.timer = null;
    this.hasChanges = false;
  }

  schedule() {
    if (this.isBlocked()) return;

    this.hasChanges = true;
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.timer = null;
      this.persist();
    }, DRAFT_SAVE_DEBOUNCE_MS);
  }

  flush() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

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
      if (!note) return null;

      this.restored = true;
      return createDraftRestoration(this.draft, note);
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
