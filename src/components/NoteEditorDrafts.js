import { clearDraft, saveDraft } from '../services/EditorDraftService.js';

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
