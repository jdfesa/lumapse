import * as NoteStore from '../store/NoteStore.js';
import { SlashCommandHandler } from './SlashCommandHandler.js';
import { EditorPopup } from './EditorPopup.js';
import { getCommandSnippet, getEditorCommandsForSurface } from './editorCommandRegistry.js';
import { applyInlineCommand, getMarkdownContinuation } from './editorTextTransforms.js';
import { SubjectPicker } from './SubjectPicker.js';
import { createEditorDraftPayload, EditorDraftCapture } from './NoteEditorDrafts.js';
import { renderNoteEditorTemplate } from './NoteEditorTemplate.js';
import { extractNoteTitle, resolveNoteTitleForSave, splitNoteForEditing, stripRedundantTitleFromContent } from '../services/NoteTitleService.js';
import './NoteEditor.css';

export class NoteEditor {
  constructor(container) {
    this.container = container;
    this.currentEditId = null;
    this.currentEditBaseUpdatedAt = null;
    this.isApplyingState = false;
    this.isSaving = false;
    
    this.handleInput = this.handleInput.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handlePageHide = this.handlePageHide.bind(this);
    this.handleSubjectChange = this.handleSubjectChange.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.subjectPicker = null;
    
    this.render();
    this.draftCapture = new EditorDraftCapture({
      createPayload: () => this.createDraftPayload(),
      isBlocked: () => this.isApplyingState || this.isSaving,
    });

    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('pagehide', this.handlePageHide);
    
    this.unsubscribe = NoteStore.subscribe((state) => {
      const composer = this.container.querySelector('.composer');
      if (composer) {
        composer.style.display = ['trash', 'backup'].includes(state.viewMode) ? 'none' : '';
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

    this.slashHandler = new SlashCommandHandler(input, composer);

    this.container.querySelector('#btn-exit-focus').addEventListener('click', () => this.exitFocusMode());
    this.container.querySelector('#composer-focus-btn').addEventListener('click', () => {
      this.plusPopup?.hide();
      this.formatPopup?.hide();
      this.enterFocusMode();
    });

    this.subjectPicker = new SubjectPicker(this.container.querySelector('#composer-subject-picker'));

    this.setupPlusButton(input, footer);
    this.setupFormatButton(input, footer);
  }

  setupPlusButton(textarea, composer) {
    const plusBtn = this.container.querySelector('#composer-plus-btn');

    this.plusPopup = new EditorPopup({
      container: composer,
      onSelect: (item) => this.insertCommandAtCursor(textarea, item),
      onDismiss: () => {},
    });

    this.bindPopupButton(plusBtn, this.plusPopup, 'plusMenuWasVisibleOnPointerDown', () => {
      this.formatPopup?.hide();
      this.plusPopup.show(getEditorCommandsForSurface('insert'), 'Tambien podes escribir / al inicio de linea');
    });
  }

  setupFormatButton(textarea, composer) {
    const formatBtn = this.container.querySelector('#composer-format-btn');

    this.formatPopup = new EditorPopup({
      container: composer,
      onSelect: (item) => applyInlineCommand(textarea, item),
      onDismiss: () => {},
    });

    this.bindPopupButton(formatBtn, this.formatPopup, 'formatMenuWasVisibleOnPointerDown', () => {
      this.plusPopup?.hide();
      this.formatPopup.show(getEditorCommandsForSurface('inline'), 'Selecciona texto o inserta un placeholder');
    });
  }

  bindPopupButton(button, popup, visibilityKey, showPopup) {
    button.addEventListener('pointerdown', () => {
      this[visibilityKey] = popup.isVisible();
    });
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this[visibilityKey] || popup.isVisible()) {
        this[visibilityKey] = false;
        popup.hide();
      } else {
        showPopup();
      }
    });
  }

  insertCommandAtCursor(textarea, command) {
    const snippet = getCommandSnippet(command);
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);

    textarea.value = before + snippet + after;
    const cursorOffset = Number.isInteger(command.cursorOffset)
      ? command.cursorOffset
      : snippet.length;
    const cursor = start + cursorOffset;
    if (command.selectLength) {
      textarea.setSelectionRange(cursor, cursor + command.selectLength);
    } else {
      textarea.setSelectionRange(cursor, cursor);
    }
    textarea.dispatchEvent(new window.Event('input', { bubbles: true }));
    textarea.focus();
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
      this.draftCapture.schedule();
    }
  }

  handleSubjectChange() {
    if (!this.isApplyingState) {
      this.draftCapture.schedule();
    }
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

    titleInput.value = '';
    input.value = '';
    input.style.height = 'auto';
    const btnSave = this.container.querySelector('#btn-save-note');
    btnSave.textContent = 'Guardar';
    btnSave.disabled = true;

    this.exitFocusMode();
  }

  extractTitle(content) {
    return extractNoteTitle(content);
  }

  onStateChange(state) {
    const { activeNoteId, notes, subjects } = state;

    this.updateSubjectSelect(subjects);
    
    if (activeNoteId && activeNoteId !== this.currentEditId) {
      this.draftCapture.flush();
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
    } else if (!activeNoteId && this.currentEditId) {
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
      this.isApplyingState = false;
    }

    if (!activeNoteId && !this.currentEditId) {
      const nextSubjectId = state.activeSubjectId || '';
      if (this.subjectPicker?.getValue() !== nextSubjectId) {
        this.subjectPicker?.setValue(nextSubjectId);
      }
    }
  }

  updateSubjectSelect(subjectsData) {
    this.subjectPicker?.update(subjectsData);
  }

  escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
