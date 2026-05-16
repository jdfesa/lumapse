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
            <button class="composer__tool-btn" title="Etiquetas" disabled>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
            </button>
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
    const content = input.value.trim();
    
    if (!content) return;

    if (this.currentEditId) {
      // Estamos editando
      await NoteStore.updateNote(this.currentEditId, {
        content: content,
        // DP-001: Intentamos extraer título, o dejamos sin título si no hay #
        title: this.extractTitle(content)
      });
      this.currentEditId = null;
      NoteStore.selectNote(null); // Quitar modo edición
    } else {
      // Nueva nota
      await NoteStore.createNote(this.extractTitle(content), content);
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
    const { activeNoteId, notes } = state;
    
    // Si se seleccionó una nota (para editar)
    if (activeNoteId && activeNoteId !== this.currentEditId) {
      const noteToEdit = notes.find(n => n.id === activeNoteId);
      if (noteToEdit) {
        this.currentEditId = activeNoteId;
        const input = this.container.querySelector('#composer-input');
        input.value = noteToEdit.content;
        
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
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
    this.container.innerHTML = '';
  }
}
