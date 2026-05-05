// =============================================================
// Componente: NoteList
// Hito 02: Core del Editor
//
// Responsabilidad: Renderizar la barra lateral con la lista de
// notas, permitir la creación de nuevas notas y la selección
// de una nota activa. Se suscribe a NoteStore para reactividad.
// =============================================================

import * as NoteStore from '../store/NoteStore.js';
import './NoteList.css';

export class NoteList {
  /**
   * @param {HTMLElement} containerElement Elemento del DOM donde se inyectará el componente
   */
  constructor(containerElement) {
    this.container = containerElement;
    this.unsubscribe = null;
    
    // 1. Render base del componente (esqueleto)
    this.renderInitial();
    
    // 2. Adjuntar eventos (click en crear, click en nota)
    this.bindEvents();
    
    // 3. Suscribirse a los cambios de estado
    this.unsubscribe = NoteStore.subscribe((state) => {
      this.renderNotes(state.notes, state.activeNoteId);
    });
  }

  /**
   * Renderiza el esqueleto HTML estático del componente.
   */
  renderInitial() {
    this.container.innerHTML = `
      <aside class="note-list">
        <header class="note-list__header">
          <h2 class="note-list__title">Notas</h2>
          <div class="note-list__actions">
            <button id="btn-export-all" class="note-list__action-btn" aria-label="Exportar todas las notas como ZIP" title="Exportar notas (ZIP)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>
            <button id="btn-create-note" class="note-list__action-btn" aria-label="Crear nueva nota" title="Crear nueva nota">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
          </div>
        </header>
        <div id="note-list-items" class="note-list__items">
          <!-- Las notas se inyectan aquí dinámicamente vía renderNotes() -->
        </div>
      </aside>
    `;
  }

  /**
   * Adjunta los manejadores de eventos. Usamos delegación de eventos
   * para la lista de notas para mayor eficiencia.
   */
  bindEvents() {
    const createBtn = this.container.querySelector('#btn-create-note');
    createBtn.addEventListener('click', async () => {
      await NoteStore.createNote();
    });

    const exportAllBtn = this.container.querySelector('#btn-export-all');
    exportAllBtn.addEventListener('click', async () => {
      const { exportAllNotesToZip } = await import('../services/ExportService.js');
      try {
        await exportAllNotesToZip();
      } catch (error) {
        alert(error.message || 'Error al exportar las notas.');
      }
    });

    const listContainer = this.container.querySelector('#note-list-items');
    listContainer.addEventListener('click', (e) => {
      // Delegación: buscar si se hizo clic en un item de la lista
      const noteItem = e.target.closest('.note-list__item');
      if (noteItem) {
        const noteId = noteItem.dataset.id;
        NoteStore.selectNote(noteId);
      }
    });
  }

  /**
   * Formatea una fecha ISO para mostrar de forma legible.
   * @param {string} isoString Fecha en formato ISO
   */
  formatDate(isoString) {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('es-AR', { 
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
    }).format(date);
  }

  /**
   * Actualiza el DOM con la lista de notas proporcionada por el Store.
   * @param {Array} notes Lista de notas
   * @param {string|null} activeNoteId ID de la nota seleccionada
   */
  renderNotes(notes, activeNoteId) {
    const listContainer = this.container.querySelector('#note-list-items');
    
    // Estado vacío
    if (notes.length === 0) {
      listContainer.innerHTML = `
        <div class="note-list__empty">
          <p>No hay notas todavía.</p>
          <p>Presiona <strong>+</strong> para crear tu primera nota.</p>
        </div>
      `;
      return;
    }

    // Renderizar listado
    listContainer.innerHTML = notes.map(note => {
      const isActive = note.id === activeNoteId;
      // Truncar contenido para la vista previa
      const previewText = note.content 
        ? (note.content.length > 60 ? note.content.substring(0, 60) + '...' : note.content)
        : 'Sin contenido';
      
      return `
        <article class="note-list__item ${isActive ? 'is-active' : ''}" data-id="${note.id}">
          <h3 class="note-list__item-title" title="${note.title || 'Sin título'}">
            ${note.title || 'Sin título'}
          </h3>
          <p class="note-list__item-preview">${previewText}</p>
          <time class="note-list__item-date">${this.formatDate(note.updatedAt)}</time>
        </article>
      `;
    }).join('');
  }

  /**
   * Limpieza de memoria en caso de desmontar el componente.
   */
  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    this.container.innerHTML = '';
  }
}
