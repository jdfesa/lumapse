import * as NoteStore from '../store/NoteStore.js';
import { SlashCommandHandler } from './SlashCommandHandler.js';
import { EditorPopup } from './EditorPopup.js';
import { getCommandSnippet, getEditorCommandsForSurface } from './editorCommandRegistry.js';
import { applyInlineCommand, getMarkdownContinuation } from './editorTextTransforms.js';
import { SubjectPicker } from './SubjectPicker.js';
import { extractNoteTitle, resolveNoteTitleForSave, splitNoteForEditing, stripRedundantTitleFromContent } from '../services/NoteTitleService.js';
import './NoteEditor.css';

export class NoteEditor {
  constructor(container) {
    this.container = container;
    this.currentEditId = null;
    
    this.handleInput = this.handleInput.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.subjectPicker = null;
    
    this.render();
    
    this.unsubscribe = NoteStore.subscribe((state) => {
      const composer = this.container.querySelector('.composer');
      if (composer) {
        composer.style.display = ['trash', 'backup'].includes(state.viewMode) ? 'none' : '';
      }
      this.onStateChange(state);
    });
  }

  render() {
    this.container.innerHTML = `
      <div class="composer">
        <div class="composer__focus-header" style="display:none">
          <span class="composer__focus-title">Modo Enfoque</span>
          <button class="composer__focus-exit" id="btn-exit-focus" title="Salir del modo enfoque">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
          </button>
        </div>
        <label class="composer__label" for="composer-title-input">Título</label>
        <input id="composer-title-input" class="composer__title-input" type="text" placeholder="Sin título" autocomplete="off" spellcheck="true">
        <label class="composer__label" for="composer-input">Contenido</label>
        <textarea id="composer-input" class="composer__textarea" placeholder="Escribí algo..." rows="3"></textarea>
        <div class="composer__footer">
          <div class="composer__tools">
            <div class="composer__subject-picker" id="composer-subject-picker">
              <input type="hidden" id="composer-subject-select" value="">
              <button
                id="composer-subject-trigger"
                class="composer__subject-trigger"
                type="button"
                aria-haspopup="listbox"
                aria-expanded="false"
                aria-controls="composer-subject-menu"
                title="Materia"
              >
                <span class="composer__subject-trigger-dot"></span>
                <span id="composer-subject-label" class="composer__subject-trigger-label">Entrada</span>
                <svg class="composer__subject-trigger-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              <div id="composer-subject-menu" class="composer__subject-menu" role="listbox" aria-label="Materia" hidden></div>
            </div>
            <button class="composer__tool-btn composer__plus-btn" title="Insertar" id="composer-plus-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
            <button class="composer__tool-btn composer__format-btn" title="Formato" id="composer-format-btn" aria-label="Formato">
              Aa
            </button>
            <button class="composer__tool-btn composer__focus-btn" title="Ampliar editor" id="composer-focus-btn" aria-label="Ampliar editor">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6"></path><path d="M21 3l-7 7"></path><path d="M9 21H3v-6"></path><path d="M3 21l7-7"></path></svg>
            </button>
          </div>
          <button id="btn-save-note" class="composer__save-btn" title="Guardar nota" disabled>Guardar</button>
        </div>
      </div>
    `;

    const titleInput = this.container.querySelector('#composer-title-input');
    const input = this.container.querySelector('#composer-input');
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

    const title = resolveNoteTitleForSave(rawTitle, rawContent);
    const content = stripRedundantTitleFromContent(rawContent, title);
    const subjectId = this.subjectPicker?.getValue() || null;

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
      const noteToEdit = notes.find(n => n.id === activeNoteId);
      if (noteToEdit) {
        this.currentEditId = activeNoteId;
        const titleInput = this.container.querySelector('#composer-title-input');
        const input = this.container.querySelector('#composer-input');
        const editableNote = splitNoteForEditing(noteToEdit);
        titleInput.value = editableNote.title;
        input.value = editableNote.body;
        
        this.subjectPicker?.setValue(noteToEdit.subjectId || '');
        
        titleInput.dispatchEvent(new window.Event('input'));
        input.dispatchEvent(new window.Event('input'));
        
        input.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        this.container.querySelector('#btn-save-note').textContent = 'Actualizar';
      }
    } else if (!activeNoteId && this.currentEditId) {
      this.currentEditId = null;
      const titleInput = this.container.querySelector('#composer-title-input');
      const input = this.container.querySelector('#composer-input');
      titleInput.value = '';
      input.value = '';
      input.style.height = 'auto';
      this.container.querySelector('#btn-save-note').textContent = 'Guardar';
      this.container.querySelector('#btn-save-note').disabled = true;
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
    if (this.unsubscribe) this.unsubscribe();
    if (this.slashHandler) this.slashHandler.destroy();
    if (this.plusPopup) this.plusPopup.destroy();
    if (this.formatPopup) this.formatPopup.destroy();
    if (this.subjectPicker) this.subjectPicker.destroy();
    this.container.innerHTML = '';
  }
}
