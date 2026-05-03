// =============================================================
// Componente: NoteEditor
// Hito 03: MVP Completo
//
// Responsabilidad: Renderizar la nota activa y permitir su edición.
// Detectar cambios en tiempo real, guardarlos en IndexedDB vía Store
// (Auto-guardado) y mostrar una vista previa de Markdown en vivo.
//
// Integra: MarkdownPreview (RF-010)
// =============================================================

import * as NoteStore from '../store/NoteStore.js';
import { MarkdownPreview } from './MarkdownPreview.js';
import './NoteEditor.css';

export class NoteEditor {
  constructor(container) {
    this.container = container;
    this.currentNoteId = null;
    this.saveTimeout = null;
    this.preview = null; // Instancia de MarkdownPreview
    
    // Bind manual para mantener el contexto de 'this'
    this.handleInput = this.handleInput.bind(this);
    
    // Suscribirse a cambios en el Store
    this.unsubscribe = NoteStore.subscribe((state) => {
      this.onStateChange(state);
    });
  }

  /**
   * Responde a cambios de estado en la aplicación.
   */
  onStateChange(state) {
    const { activeNoteId, notes } = state;
    
    // 1. Estado vacío: si no hay nota seleccionada
    if (!activeNoteId) {
      this.currentNoteId = null;
      this.renderEmpty();
      return;
    }

    // 2. Cambio de nota seleccionada: si el ID es diferente, re-renderizamos todo
    if (this.currentNoteId !== activeNoteId) {
      this.currentNoteId = activeNoteId;
      const activeNote = notes.find(n => n.id === activeNoteId);
      if (activeNote) {
        this.renderEditor(activeNote);
      }
    }
    
    // Nota: Si el ID activo es el mismo que currentNoteId, NO re-renderizamos.
    // Esto es crucial para no perder el foco o la posición del cursor mientras
    // el usuario está escribiendo y se disparan actualizaciones.
  }

  /**
   * Renderiza el estado vacío cuando no hay nada seleccionado.
   */
  renderEmpty() {
    // Limpiar la instancia de preview si existe
    if (this.preview) {
      this.preview.destroy();
      this.preview = null;
    }

    this.container.innerHTML = `
      <div class="note-editor note-editor--empty">
        <p>Selecciona una nota del listado o presiona <strong>+</strong> para crear una nueva.</p>
      </div>
    `;
  }

  /**
   * Renderiza el formulario de edición de la nota (Título y Contenido)
   * junto con el panel de vista previa de Markdown.
   */
  renderEditor(note) {
    // Si el título es 'Sin título' (default), mostramos el input vacío 
    // con placeholder para invitar al usuario a escribir.
    const displayTitle = note.title === 'Sin título' ? '' : note.title;

    this.container.innerHTML = `
      <div class="note-editor">
        <header class="note-editor__header">
          <input 
            type="text" 
            id="editor-title" 
            class="note-editor__title" 
            placeholder="Título de la nota" 
            value="${displayTitle}"
            autocomplete="off"
          />
          <button id="btn-delete-note" class="note-editor__delete-btn" aria-label="Eliminar nota" title="Eliminar nota">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </header>
        <div class="note-editor__body">
          <textarea 
            id="editor-content" 
            class="note-editor__content" 
            placeholder="Empieza a escribir en Markdown..."
          >${note.content || ''}</textarea>
          <div id="preview-container" class="note-editor__preview-container"></div>
        </div>
      </div>
    `;

    // Adjuntar manejadores de eventos
    const titleInput = this.container.querySelector('#editor-title');
    const contentInput = this.container.querySelector('#editor-content');
    const deleteBtn = this.container.querySelector('#btn-delete-note');

    titleInput.addEventListener('input', this.handleInput);
    contentInput.addEventListener('input', this.handleInput);
    
    // HU-003: Confirmación al eliminar
    deleteBtn.addEventListener('click', async () => {
      if (window.confirm('¿Estás seguro de que deseas eliminar esta nota de forma permanente?')) {
        await NoteStore.deleteNote(this.currentNoteId);
      }
    });

    // Instanciar el MarkdownPreview en su contenedor
    const previewContainer = this.container.querySelector('#preview-container');
    this.preview = new MarkdownPreview(previewContainer);

    // Renderizar el preview con el contenido actual de la nota
    if (note.content) {
      this.preview.update(note.content);
    }

    // UX: Si la nota está recién creada (vacía), ponemos foco en el contenido automáticamente
    if (!note.content && !displayTitle) {
      contentInput.focus();
    }
  }

  /**
   * Maneja el evento de escritura en los inputs y aplica debounce
   * para no saturar la base de datos (Auto-guardado).
   * También actualiza el preview de Markdown en tiempo real.
   */
  handleInput() {
    const contentInput = this.container.querySelector('#editor-content');

    // Actualizar el preview en tiempo real (sin debounce, es instantáneo)
    if (this.preview && contentInput) {
      this.preview.update(contentInput.value);
    }

    // Debounce para el auto-guardado en IndexedDB
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    // HU-005: Auto-guardado automático tras inactividad
    this.saveTimeout = setTimeout(async () => {
      if (!this.currentNoteId) return;
      
      const titleInput = this.container.querySelector('#editor-title');
      
      const newTitle = titleInput.value.trim() || 'Sin título';
      const newContent = contentInput.value;
      
      await NoteStore.updateNote(this.currentNoteId, {
        title: newTitle,
        content: newContent
      });
    }, 800); // 800ms de debounce para el auto-guardado
  }

  /**
   * Limpieza al desmontar.
   */
  destroy() {
    if (this.unsubscribe) this.unsubscribe();
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    if (this.preview) this.preview.destroy();
    this.container.innerHTML = '';
  }
}

