import * as NoteStore from '../../store/NoteStore.js';
import { SlashCommandHandler } from './SlashCommandHandler.js';
import { getMarkdownContinuation } from './editorTextTransforms.js';
import { SubjectPicker } from './SubjectPicker.js';
import { createEditorDraftPayload, EditorDraftCapture, EditorDraftRestorer } from './NoteEditorDrafts.js';
import { setupEditorPopups } from './NoteEditorPopups.js';
import { renderNoteEditorTemplate } from './NoteEditorTemplate.js';
import { confirmDialog } from '../common/ConfirmDialog.js';
import { extractNoteTitle, resolveNoteTitleForSave, splitNoteForEditing, stripRedundantTitleFromContent } from '../../services/NoteTitleService.ts';
import './NoteEditor.css';

const COMPOSER_HIDDEN_VIEW_MODES = ['trash', 'backup', 'about'];

export class NoteEditor {
  constructor(container) {
    this.container = container;
    this.currentEditId = null;
    this.currentEditBaseUpdatedAt = null;
    this.isApplyingState = false;
    this.isSaving = false;
    this.restoredDraftActive = false;
    this.restoredDraftSubjectId = null;
    this.lastState = null;
    
    this.handleInput = this.handleInput.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleDiscardDraft = this.handleDiscardDraft.bind(this);
    this.handlePageHide = this.handlePageHide.bind(this);
    this.handleSubjectChange = this.handleSubjectChange.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.subjectPicker = null;
    
    this.render();
    this.draftRestorer = new EditorDraftRestorer();
    this.draftCapture = new EditorDraftCapture({
      createPayload: () => this.createDraftPayload(),
      isBlocked: () => this.isApplyingState || this.isSaving,
    });

    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('pagehide', this.handlePageHide);
    
    this.unsubscribe = NoteStore.subscribe((state) => {
      const composer = this.container.querySelector('.composer');
      if (composer) {
        composer.style.display = COMPOSER_HIDDEN_VIEW_MODES.includes(state.viewMode) ? 'none' : '';
      }
      this.onStateChange(state);
    });
  }

  render() {
    this.container.innerHTML = renderNoteEditorTemplate();

    const titleInput = this.container.querySelector('#composer-title-input');
    const input = this.container.querySelector('#composer-input');
    const subjectInput = this.container.querySelector('#composer-subject-select');
    const saveBtn = this.container.querySelector('#btn-save-note');
    const discardBtn = this.container.querySelector('#btn-discard-draft');
    const composer = this.container.querySelector('.composer');
    const footer = this.container.querySelector('.composer__footer');

    titleInput.addEventListener('input', this.handleInput);
    titleInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        input.focus();
      }
    });
    input.addEventListener('input', this.handleInput);
    input.addEventListener('keydown', this.handleKeyDown);
    subjectInput.addEventListener('change', this.handleSubjectChange);
    saveBtn.addEventListener('click', this.handleSave);
    discardBtn.addEventListener('click', this.handleDiscardDraft);

    this.slashHandler = new SlashCommandHandler(input, composer);

    this.container.querySelector('#btn-exit-focus').addEventListener('click', () => this.exitFocusMode());
    this.container.querySelector('#composer-focus-btn').addEventListener('click', () => {
      this.plusPopup?.hide();
      this.formatPopup?.hide();
      this.enterFocusMode();
    });

    this.subjectPicker = new SubjectPicker(this.container.querySelector('#composer-subject-picker'));

    setupEditorPopups(this, input, footer);
  }

  enterFocusMode() {
    const composer = this.container.querySelector('.composer');
    const focusHeader = this.container.querySelector('.composer__focus-header');
    if (!composer) return;

    composer.classList.add('composer--focus');
    document.body.classList.add('focus-mode-active');
    focusHeader.style.display = '';

    const input = this.container.querySelector('#composer-input');
    if (input) input.focus();
  }

  exitFocusMode() {
    const composer = this.container.querySelector('.composer');
    const focusHeader = this.container.querySelector('.composer__focus-header');
    if (!composer) return;

    composer.classList.remove('composer--focus');
    document.body.classList.remove('focus-mode-active');
    focusHeader.style.display = 'none';

    const input = this.container.querySelector('#composer-input');
    if (input) {
      input.style.height = 'auto';
      input.style.height = (input.scrollHeight) + 'px';
    }
  }

  handleInput(e) {
    const input = e.target;
    
    if (input?.classList.contains('composer__textarea')) {
      input.style.height = 'auto';
      input.style.height = (input.scrollHeight) + 'px';
    }
    
    this.updateSaveState();

    if (!this.isApplyingState) {
      this.updateDraftIndicator();
      this.draftCapture.schedule();
    }
  }

  handleSubjectChange() {
    if (!this.isApplyingState) {
      this.restoredDraftSubjectId = this.subjectPicker?.getValue() || null;
      this.updateDraftIndicator();
      this.draftCapture.schedule();
    }
  }

  async handleDiscardDraft() {
    const confirmed = await confirmDialog({
      title: 'Descartar borrador',
      message: '¿Descartar este borrador?',
      confirmText: 'Descartar',
      cancelText: 'Conservar',
      danger: true,
    });
    if (!confirmed) return;

    this.discardDraft();
  }

  discardDraft() {
    this.isApplyingState = true;
    this.draftCapture.discard();

    if (this.currentEditId) {
      NoteStore.selectNote(null);
    }

    this.currentEditId = null;
    this.currentEditBaseUpdatedAt = null;
    this.restoredDraftActive = false;
    this.restoredDraftSubjectId = null;
    this.resetEditorForCreate();
    this.isApplyingState = false;
  }

  handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      this.draftCapture.flush();
    }
  }

  handlePageHide() {
    this.draftCapture.flush();
  }

  createDraftPayload() {
    const titleInput = this.container.querySelector('#composer-title-input');
    const input = this.container.querySelector('#composer-input');
    const title = titleInput?.value || '';
    const content = input?.value || '';
    const subjectId = this.subjectPicker?.getValue() || null;

    return createEditorDraftPayload({
      currentEditId: this.currentEditId,
      currentEditBaseUpdatedAt: this.currentEditBaseUpdatedAt,
      title,
      content,
      subjectId,
    });
  }

  updateSaveState() {
    const titleInput = this.container.querySelector('#composer-title-input');
    const input = this.container.querySelector('#composer-input');
    const saveBtn = this.container.querySelector('#btn-save-note');

    saveBtn.disabled = !titleInput.value.trim() && !input.value.trim();
  }

  handleKeyDown(e) {
    if (e.key !== 'Enter') return;

    if (this.slashHandler && this.slashHandler.isActive()) {
      return;
    }

    const textarea = e.target;
    const { value, selectionStart } = textarea;

    const beforeCursor = value.substring(0, selectionStart);
    const lastNewline = beforeCursor.lastIndexOf('\n');
    const currentLine = beforeCursor.substring(lastNewline + 1);

    const continuation = getMarkdownContinuation(currentLine);
    if (!continuation) return;

    e.preventDefault();

    if (!continuation.text.trim()) {
      const lineStart = lastNewline + 1;
      textarea.value = value.substring(0, lineStart) + value.substring(selectionStart);
      textarea.setSelectionRange(lineStart, lineStart);
    } else {
      const newPrefix = `\n${continuation.prefix}`;
      const after = value.substring(selectionStart);
      textarea.value = beforeCursor + newPrefix + after;
      const newPos = selectionStart + newPrefix.length;
      textarea.setSelectionRange(newPos, newPos);
    }

    textarea.dispatchEvent(new window.Event('input', { bubbles: true }));
  }

  async handleSave() {
    const titleInput = this.container.querySelector('#composer-title-input');
    const input = this.container.querySelector('#composer-input');
    const rawTitle = titleInput.value.trim();
    const rawContent = input.value.trim();
    
    if (!rawTitle && !rawContent) return;

    this.draftCapture.flush();

    const title = resolveNoteTitleForSave(rawTitle, rawContent);
    const content = stripRedundantTitleFromContent(rawContent, title);
    const subjectId = this.subjectPicker?.getValue() || null;

    this.isSaving = true;
    try {
      if (this.currentEditId) {
        await NoteStore.updateNote(this.currentEditId, {
          content: content,
          title,
          subjectId: subjectId
        });
        NoteStore.selectNote(null); 
      } else {
        await NoteStore.createNote(title, content, subjectId);
      }
    } finally {
      this.isSaving = false;
    }

    this.draftCapture.discard();

    titleInput.value = '';
    input.value = '';
    input.style.height = 'auto';
    const btnSave = this.container.querySelector('#btn-save-note');
    btnSave.textContent = 'Guardar';
    btnSave.disabled = true;
    this.currentEditId = null;
    this.currentEditBaseUpdatedAt = null;
    this.restoredDraftActive = false;
    this.restoredDraftSubjectId = null;
    this.hideDraftStatus();

    this.exitFocusMode();
  }

  extractTitle(content) {
    return extractNoteTitle(content);
  }

  onStateChange(state) {
    const { activeNoteId, notes, subjects } = state;
    this.lastState = state;

    this.updateSubjectSelect(subjects);
    if (this.tryRestoreDraft(state)) return;
    this.syncRestoredDraftSubject();

    if (COMPOSER_HIDDEN_VIEW_MODES.includes(state.viewMode)) {
      this.draftCapture.flush();
      return;
    }
    
    if (activeNoteId && activeNoteId !== this.currentEditId) {
      this.draftCapture.flush();
      this.restoredDraftActive = false;
      this.restoredDraftSubjectId = null;
      this.hideDraftStatus();
      const noteToEdit = notes.find(n => n.id === activeNoteId);
      if (noteToEdit) {
        this.currentEditId = activeNoteId;
        this.currentEditBaseUpdatedAt = noteToEdit.updatedAt || null;
        const titleInput = this.container.querySelector('#composer-title-input');
        const input = this.container.querySelector('#composer-input');
        const editableNote = splitNoteForEditing(noteToEdit);
        this.isApplyingState = true;
        titleInput.value = editableNote.title;
        input.value = editableNote.body;
        
        this.subjectPicker?.setValue(noteToEdit.subjectId || '');
        
        titleInput.dispatchEvent(new window.Event('input'));
        input.dispatchEvent(new window.Event('input'));
        this.isApplyingState = false;
        
        input.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        this.container.querySelector('#btn-save-note').textContent = 'Actualizar';
      }
    } else if (!activeNoteId && this.currentEditId && !this.restoredDraftActive) {
      if (this.handleMissingEditedNote(notes, state.notesLoaded)) return;

      this.draftCapture.flush();
      this.currentEditId = null;
      this.currentEditBaseUpdatedAt = null;
      const titleInput = this.container.querySelector('#composer-title-input');
      const input = this.container.querySelector('#composer-input');
      this.isApplyingState = true;
      titleInput.value = '';
      input.value = '';
      input.style.height = 'auto';
      this.container.querySelector('#btn-save-note').textContent = 'Guardar';
      this.container.querySelector('#btn-save-note').disabled = true;
      this.hideDraftStatus();
      this.isApplyingState = false;
    }

    if (!activeNoteId && !this.currentEditId && !this.restoredDraftActive) {
      const nextSubjectId = state.activeSubjectId || '';
      if (this.subjectPicker?.getValue() !== nextSubjectId) {
        this.subjectPicker?.setValue(nextSubjectId);
      }
    }
  }

  updateSubjectSelect(subjectsData) {
    this.subjectPicker?.update(subjectsData);
  }

  tryRestoreDraft(state) {
    const restoration = this.draftRestorer.restore(state);
    if (!restoration) return false;

    this.applyRestoredDraft(restoration);
    return true;
  }

  applyRestoredDraft(restoration) {
    this.restoredDraftActive = true;
    this.restoredDraftSubjectId = restoration.subjectId || null;
    this.currentEditId = restoration.currentEditId;
    this.currentEditBaseUpdatedAt = restoration.currentEditBaseUpdatedAt;
    this.applyEditorValues(restoration);
    this.showDraftStatus(restoration.statusText);
    this.focusRestoredDraft(restoration.focusTarget);
  }

  applyEditorValues({ title, content, subjectId, saveLabel }) {
    const titleInput = this.container.querySelector('#composer-title-input');
    const input = this.container.querySelector('#composer-input');
    this.isApplyingState = true;
    titleInput.value = title || '';
    input.value = content || '';
    this.subjectPicker?.setValue(subjectId || '');
    titleInput.dispatchEvent(new window.Event('input'));
    input.dispatchEvent(new window.Event('input'));
    this.container.querySelector('#btn-save-note').textContent = saveLabel;
    this.isApplyingState = false;
  }

  syncRestoredDraftSubject() {
    if (!this.restoredDraftActive || !this.restoredDraftSubjectId) return;
    if (this.subjectPicker?.getValue() !== this.restoredDraftSubjectId) {
      this.subjectPicker?.setValue(this.restoredDraftSubjectId);
    }
  }

  handleMissingEditedNote(notes = [], notesLoaded = false) {
    if (!notesLoaded || notes.some(note => note.id === this.currentEditId)) return false;

    this.draftCapture.flush();
    this.currentEditId = null;
    this.currentEditBaseUpdatedAt = null;
    this.restoredDraftActive = true;
    this.restoredDraftSubjectId = this.subjectPicker?.getValue() || null;
    this.container.querySelector('#btn-save-note').textContent = 'Guardar';
    this.showDraftStatus('Borrador recuperado');
    return true;
  }

  showDraftStatus(message) {
    const composer = this.container.querySelector('.composer');
    const actions = this.container.querySelector('#composer-draft-actions');
    const status = this.container.querySelector('#composer-draft-status');
    const discardBtn = this.container.querySelector('#btn-discard-draft');
    if (!composer || !actions || !status || !discardBtn) return;

    status.textContent = message;
    actions.hidden = !message;
    composer.classList.toggle('composer--draft-pending', Boolean(message));
    discardBtn.textContent = this.currentEditId ? 'Descartar cambios' : 'Descartar';
  }

  hideDraftStatus() {
    this.showDraftStatus('');
  }

  getPendingDraftLabel() {
    return this.currentEditId ? 'Cambios pendientes' : 'Borrador sin guardar';
  }

  updateDraftIndicator() {
    if (this.createDraftPayload()) {
      this.showDraftStatus(this.getPendingDraftLabel());
    } else {
      this.hideDraftStatus();
    }
  }

  resetEditorForCreate() {
    const titleInput = this.container.querySelector('#composer-title-input');
    const input = this.container.querySelector('#composer-input');
    titleInput.value = '';
    input.value = '';
    input.style.height = 'auto';
    this.subjectPicker?.setValue(this.lastState?.activeSubjectId || '');
    this.container.querySelector('#btn-save-note').textContent = 'Guardar';
    this.updateSaveState();
    this.hideDraftStatus();
  }

  focusRestoredDraft(target) {
    const selector = target === 'title' ? '#composer-title-input' : '#composer-input';
    this.container.querySelector(selector)?.focus();
  }

  destroy() {
    this.draftCapture.flush();
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('pagehide', this.handlePageHide);
    if (this.unsubscribe) this.unsubscribe();
    if (this.slashHandler) this.slashHandler.destroy();
    if (this.plusPopup) this.plusPopup.destroy();
    if (this.formatPopup) this.formatPopup.destroy();
    if (this.subjectPicker) this.subjectPicker.destroy();
    this.container.innerHTML = '';
  }
}
