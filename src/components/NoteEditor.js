// =============================================================
// Componente: NoteEditor (Composer)
// Hito 04: Interfaz Microblog (estilo Memos)
// =============================================================

import * as NoteStore from '../store/NoteStore.js';
import './NoteEditor.css';

export class NoteEditor {
  constructor(container) {
    this.container = container;
    this.currentEditId = null;
    
    // Bind para mantener 'this'
    this.handleInput = this.handleInput.bind(this);
    this.handleSave = this.handleSave.bind(this);
    
    // Render inicial
    this.render();
    
    // Suscribirse a cambios
    this.unsubscribe = NoteStore.subscribe((state) => {
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
            <button class="composer__tool-btn" title="Adjuntos" disabled>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
            </button>
          </div>
          <button id="btn-save-note" class="composer__save-btn" disabled>Guardar</button>
        </div>
      </div>
    `;

    const input = this.container.querySelector('#composer-input');
    const saveBtn = this.container.querySelector('#btn-save-note');

    input.addEventListener('input', this.handleInput);
    saveBtn.addEventListener('click', this.handleSave);
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
      this.currentEditId = null;
      NoteStore.selectNote(null); // Quitar modo edición
    } else {
      // Nueva nota
      await NoteStore.createNote(this.extractTitle(content), content, subjectId);
    }

    // Resetear composer
    input.value = '';
    input.style.height = 'auto';
    this.container.querySelector('#btn-save-note').disabled = true;
  }

  extractTitle(content) {
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ')) {
        return trimmed.slice(2).trim() || 'Sin título';
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
    this.container.innerHTML = '';
  }
}
