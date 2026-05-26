// =============================================================
// Componente: NoteEditor (Composer)
// Hito 04: Interfaz Microblog (estilo Memos)
// =============================================================

import * as NoteStore from '../store/NoteStore.js';
import { SlashCommandHandler } from './SlashCommandHandler.js';
// import { NoteLinkHandler } from './NoteLinkHandler.js'; // DESACTIVADO
import { EditorPopup } from './EditorPopup.js';
import './NoteEditor.css';

export class NoteEditor {
  constructor(container) {
    this.container = container;
    this.currentEditId = null;
    
    // Bind para mantener 'this'
    this.handleInput = this.handleInput.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    
    // Render inicial
    this.render();
    
    // Suscribirse a cambios
    this.unsubscribe = NoteStore.subscribe((state) => {
      // Ocultar composer en modo papelera
      const composer = this.container.querySelector('.composer');
      if (composer) {
        composer.style.display = state.viewMode === 'trash' ? 'none' : '';
      }
      this.onStateChange(state);
    });
  }

  render() {
    this.container.innerHTML = `
      <div class="composer">
        <textarea 
          id="composer-input" 
          class="composer__textarea" 
          placeholder="Alguna idea..."
          rows="1"
        ></textarea>
        <div class="composer__footer">
          <div class="composer__tools">
            <select id="composer-subject-select" class="composer__subject-select" title="Materia">
              <option value="">Entrada</option>
            </select>
            <button class="composer__tool-btn composer__plus-btn" title="Insertar" id="composer-plus-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>
          <button id="btn-save-note" class="composer__save-btn" disabled>Guardar</button>
        </div>
      </div>
    `;

    const input = this.container.querySelector('#composer-input');
    const saveBtn = this.container.querySelector('#btn-save-note');
    const composer = this.container.querySelector('.composer');

    input.addEventListener('input', this.handleInput);
    input.addEventListener('keydown', this.handleKeyDown);
    saveBtn.addEventListener('click', this.handleSave);

    // Slash commands: instanciar handler con el popup dentro del composer
    this.slashHandler = new SlashCommandHandler(input, composer);

    // Link Lumapse: DESACTIVADO
    // this.linkHandler = new NoteLinkHandler(input, composer);
    this.linkHandler = null;

    // Botón +: menú de inserción (imagen, link lumapse)
    this.setupPlusButton(input, composer);
  }

  /**
   * Configura el botón + con popup de opciones.
   */
  setupPlusButton(textarea, composer) {
    const plusBtn = this.container.querySelector('#composer-plus-btn');

    this.plusPopup = new EditorPopup({
      container: composer,
      onSelect: (item) => {
        if (item.id === 'link-lumapse') {
          // Simular escritura de [[ para activar el NoteLinkHandler
          const pos = textarea.selectionStart;
          const before = textarea.value.substring(0, pos);
          const after = textarea.value.substring(pos);
          textarea.value = before + '[[' + after;
          textarea.setSelectionRange(pos + 2, pos + 2);
          textarea.dispatchEvent(new window.Event('input', { bubbles: true }));
          textarea.focus();
        }
      },
      onDismiss: () => {},
    });

    plusBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.plusPopup.isVisible()) {
        this.plusPopup.hide();
      } else {
        this.plusPopup.show([
          { id: 'link-lumapse', label: 'Link Lumapse', description: '' },
        ], "Escribe / para comandos");
      }
    });
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
   * Auto-continue para listas de tareas (todo).
   * Enter después de '- [ ] texto' → nueva línea con '- [ ] '
   * Enter en '- [ ] ' vacío → elimina el prefijo (salir del modo lista)
   */
  handleKeyDown(e) {
    if (e.key !== 'Enter') return;

    // No interceptar si hay un popup activo
    if ((this.slashHandler && this.slashHandler.isActive()) ||
        (this.linkHandler && this.linkHandler.isActive())) {
      return;
    }

    const textarea = e.target;
    const { value, selectionStart } = textarea;

    // Encontrar la línea actual
    const beforeCursor = value.substring(0, selectionStart);
    const lastNewline = beforeCursor.lastIndexOf('\n');
    const currentLine = beforeCursor.substring(lastNewline + 1);

    // Verificar si la línea actual es un item de todo
    const todoMatch = currentLine.match(/^(- \[[ x]\] )(.*)/); 
    if (!todoMatch) return;

    const text = todoMatch[2];

    e.preventDefault();

    if (!text.trim()) {
      // Item vacío: eliminar el prefijo (salir del modo lista)
      const lineStart = lastNewline + 1;
      textarea.value = value.substring(0, lineStart) + value.substring(selectionStart);
      textarea.setSelectionRange(lineStart, lineStart);
    } else {
      // Insertar nueva línea con prefijo de todo
      const newPrefix = '\n- [ ] ';
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
    const subjectSelect = this.container.querySelector('#composer-subject-select');
    const content = input.value.trim();
    
    if (!content) return;

    const subjectId = subjectSelect.value || null;

    if (this.currentEditId) {
      // Estamos editando
      await NoteStore.updateNote(this.currentEditId, {
        content: content,
        // DP-001: Intentamos extraer título, o dejamos sin título si no hay #
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
          .replace(/^[#*\->\d.]+\s*/, '')  // quitar prefijos (#, *, -, >, 1.)
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

    // Actualizar opciones del select de materias
    this.updateSubjectSelect(subjects);
    
    // Si se seleccionó una nota (para editar)
    if (activeNoteId && activeNoteId !== this.currentEditId) {
      const noteToEdit = notes.find(n => n.id === activeNoteId);
      if (noteToEdit) {
        this.currentEditId = activeNoteId;
        // Sincronizar con el link handler
        if (this.linkHandler) this.linkHandler.setCurrentEditId(activeNoteId);
        const input = this.container.querySelector('#composer-input');
        input.value = noteToEdit.content;
        
        // Pre-seleccionar la materia de la nota
        const subjectSelect = this.container.querySelector('#composer-subject-select');
        if (subjectSelect) {
          subjectSelect.value = noteToEdit.subjectId || '';
        }
        
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
      if (this.linkHandler) this.linkHandler.setCurrentEditId(null);
      const input = this.container.querySelector('#composer-input');
      input.value = '';
      input.style.height = 'auto';
      this.container.querySelector('#btn-save-note').textContent = 'Guardar';
      this.container.querySelector('#btn-save-note').disabled = true;
    }

    // Sincronizar el select con la materia activa si NO estamos editando una nota
    if (!activeNoteId && !this.currentEditId) {
      const select = this.container.querySelector('#composer-subject-select');
      if (select && select.value !== (state.activeSubjectId || '')) {
        select.value = state.activeSubjectId || '';
      }
    }
  }

  /**
   * Actualiza las opciones del <select> de materias en el composer.
   * @param {object} subjectsData Árbol de materias del store
   */
  updateSubjectSelect(subjectsData) {
    const select = this.container.querySelector('#composer-subject-select');
    if (!select || !subjectsData || !subjectsData.tree) return;

    const currentValue = select.value;

    let options = '<option value="">Entrada</option>';
    for (const subject of subjectsData.tree) {
      // En mobile native UI, los estilos en <option> son ignorados, así que removemos el bullet ●
      options += `<option value="${subject.id}">${this.escapeHtml(subject.name)}</option>`;
      // Agregar secciones hijas indentadas
      for (const child of (subject.children || [])) {
        options += `<option value="${child.id}">&nbsp;&nbsp;↳ ${this.escapeHtml(child.name)}</option>`;
      }
    }

    select.innerHTML = options;
    // Restaurar selección previa si sigue siendo válida
    select.value = currentValue;
  }

  escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
    if (this.slashHandler) this.slashHandler.destroy();
    if (this.linkHandler) this.linkHandler.destroy();
    if (this.plusPopup) this.plusPopup.destroy();
    this.container.innerHTML = '';
  }
}
