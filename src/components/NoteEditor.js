import * as NoteStore from '../store/NoteStore.js';
import { SlashCommandHandler } from './SlashCommandHandler.js';
import { EditorPopup } from './EditorPopup.js';
import { getCommandSnippet, getEditorCommandsForSurface } from './editorCommandRegistry.js';
import { applyInlineCommand, getMarkdownContinuation } from './editorTextTransforms.js';
import { SubjectPicker } from './SubjectPicker.js';
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
        <textarea 
          id="composer-input" 
          class="composer__textarea" 
          placeholder="Título o idea principal..."
          rows="1"
        ></textarea>
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

    const input = this.container.querySelector('#composer-input');
    const saveBtn = this.container.querySelector('#btn-save-note');
    const composer = this.container.querySelector('.composer');

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

    this.setupPlusButton(input, composer);
    this.setupFormatButton(input, composer);
  }

  /**
   * Configura el botón + con popup de opciones.
   */
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

  /**
   * Activa el modo enfoque: compositor fullscreen, sin distracciones.
   */
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

  /**
   * Desactiva el modo enfoque: vuelve al layout normal.
   */
  exitFocusMode() {
    const composer = this.container.querySelector('.composer');
    const focusHeader = this.container.querySelector('.composer__focus-header');
    if (!composer) return;

    composer.classList.remove('composer--focus');
    document.body.classList.remove('focus-mode-active');
    focusHeader.style.display = 'none';

    // Re-ajustar altura del textarea
    const input = this.container.querySelector('#composer-input');
    if (input) {
      input.style.height = 'auto';
      input.style.height = (input.scrollHeight) + 'px';
    }
  }

  handleInput(e) {
    const input = e.target;
    const saveBtn = this.container.querySelector('#btn-save-note');
    
    // Auto-resize
    input.style.height = 'auto';
    input.style.height = (input.scrollHeight) + 'px';
    
    // Habilitar/deshabilitar botón Guardar
    saveBtn.disabled = input.value.trim().length === 0;
  }

  /**
   * Auto-continue para listas Markdown.
   * Un Enter continúa el patrón; Enter sobre el item vacío sale de la lista.
   */
  handleKeyDown(e) {
    if (e.key !== 'Enter') return;

    // No interceptar si hay un popup activo
    if (this.slashHandler && this.slashHandler.isActive()) {
      return;
    }

    const textarea = e.target;
    const { value, selectionStart } = textarea;

    // Encontrar la línea actual
    const beforeCursor = value.substring(0, selectionStart);
    const lastNewline = beforeCursor.lastIndexOf('\n');
    const currentLine = beforeCursor.substring(lastNewline + 1);

    const continuation = getMarkdownContinuation(currentLine);
    if (!continuation) return;

    e.preventDefault();

    if (!continuation.text.trim()) {
      // Item vacío: eliminar el prefijo (salir del modo lista)
      const lineStart = lastNewline + 1;
      textarea.value = value.substring(0, lineStart) + value.substring(selectionStart);
      textarea.setSelectionRange(lineStart, lineStart);
    } else {
      // Insertar nueva línea con el prefijo Markdown correspondiente
      const newPrefix = `\n${continuation.prefix}`;
      const after = value.substring(selectionStart);
      textarea.value = beforeCursor + newPrefix + after;
      const newPos = selectionStart + newPrefix.length;
      textarea.setSelectionRange(newPos, newPos);
    }

    // Trigger input para resize y estado del botón
    textarea.dispatchEvent(new window.Event('input', { bubbles: true }));
  }

  async handleSave() {
    const input = this.container.querySelector('#composer-input');
    const content = input.value.trim();
    
    if (!content) return;

    const subjectId = this.subjectPicker?.getValue() || null;

    if (this.currentEditId) {
      // Estamos editando
      await NoteStore.updateNote(this.currentEditId, {
        content: content,
        // DP-001: título explícito con # o primera línea útil como título implícito.
        title: this.extractTitle(content),
        subjectId: subjectId
      });
      // Importante: llamar a selectNote ANTES de limpiar this.currentEditId
      // para que onStateChange detecte la transición y restaure el botón a "Guardar"
      NoteStore.selectNote(null); 
    } else {
      // Nueva nota
      await NoteStore.createNote(this.extractTitle(content), content, subjectId);
    }

    // Resetear composer
    input.value = '';
    input.style.height = 'auto';
    const btnSave = this.container.querySelector('#btn-save-note');
    btnSave.textContent = 'Guardar';
    btnSave.disabled = true;

    // Salir del modo enfoque si estaba activo
    this.exitFocusMode();
  }

  extractTitle(content) {
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      // Si tiene encabezado Markdown, usarlo como título
      if (trimmed.startsWith('# ')) {
        return trimmed.slice(2).trim() || 'Sin título';
      }
    }
    // Fallback: usar la primera línea no vacía como título
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) {
        // Limpiar sintaxis Markdown para mostrar texto limpio
        const clean = trimmed
          .replace(/^\s{0,3}#{1,6}\s+/, '')
          .replace(/^\s*(?:[-*+>]\s+|\d+\.\s+)/, '')
          .replace(/[*_~`[\]()]/g, '')       // quitar formato inline
          .trim();
        if (clean) {
          return clean.length > 60 ? clean.substring(0, 57) + '...' : clean;
        }
      }
    }
    return 'Sin título';
  }

  onStateChange(state) {
    const { activeNoteId, notes, subjects } = state;

    // Actualizar opciones del picker de materias
    this.updateSubjectSelect(subjects);
    
    // Si se seleccionó una nota (para editar)
    if (activeNoteId && activeNoteId !== this.currentEditId) {
      const noteToEdit = notes.find(n => n.id === activeNoteId);
      if (noteToEdit) {
        this.currentEditId = activeNoteId;
        const input = this.container.querySelector('#composer-input');
        input.value = noteToEdit.content;
        
        // Pre-seleccionar la materia de la nota
        this.subjectPicker?.setValue(noteToEdit.subjectId || '');
        
        // Trigger resize & btn state
        input.dispatchEvent(new window.Event('input'));
        
        // Foco y scroll arriba
        input.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Cambiar texto de botón
        this.container.querySelector('#btn-save-note').textContent = 'Actualizar';
      }
    } else if (!activeNoteId && this.currentEditId) {
      // Se canceló la edición (o se borró la nota editada)
      this.currentEditId = null;
      const input = this.container.querySelector('#composer-input');
      input.value = '';
      input.style.height = 'auto';
      this.container.querySelector('#btn-save-note').textContent = 'Guardar';
      this.container.querySelector('#btn-save-note').disabled = true;
    }

    // Sincronizar el picker con la materia activa si NO estamos editando una nota
    if (!activeNoteId && !this.currentEditId) {
      const nextSubjectId = state.activeSubjectId || '';
      if (this.subjectPicker?.getValue() !== nextSubjectId) {
        this.subjectPicker?.setValue(nextSubjectId);
      }
    }
  }

  /**
   * Actualiza las opciones del selector de materias en el composer.
   * @param {object} subjectsData Árbol de materias del store
   */
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
