// =============================================================
// Componente: NoteList
// Hito 04: Organización y UX (RF-015, RF-020)
//
// Responsabilidad: Renderizar la barra lateral con la lista de
// notas, barra de búsqueda (RF-015), permitir la creación de
// nuevas notas y la selección de una nota activa.
// En mobile: se muestra como overlay que se cierra al
// seleccionar una nota (RF-020).
// Se suscribe a NoteStore para reactividad.
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
    this.searchDebounceTimeout = null;
    
    // 1. Render base del componente (esqueleto)
    this.renderInitial();
    
    // 2. Adjuntar eventos (click en crear, click en nota, búsqueda)
    this.bindEvents();
    
    // 3. Suscribirse a los cambios de estado
    this.unsubscribe = NoteStore.subscribe((state) => {
      const filteredNotes = NoteStore.getFilteredNotes();
      this.renderNotes(filteredNotes, state.activeNoteId, state.notes.length);
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
            <button id="btn-import-note" class="note-list__action-btn" aria-label="Importar archivo Markdown" title="Importar nota (.md)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </button>
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
        <div class="note-list__search">
          <div class="note-list__search-wrapper">
            <span class="note-list__search-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              type="search"
              id="search-notes"
              class="note-list__search-input"
              placeholder="Buscar notas..."
              autocomplete="off"
              spellcheck="false"
            />
            <button id="btn-search-clear" class="note-list__search-clear" aria-label="Limpiar búsqueda" title="Limpiar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        <div id="note-list-count" class="note-list__count"></div>
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
    // Crear nota
    const createBtn = this.container.querySelector('#btn-create-note');
    createBtn.addEventListener('click', async () => {
      await NoteStore.createNote();
      // RF-020: En mobile, cerrar sidebar al crear nota y seleccionarla
      NoteStore.closeSidebar();
    });

    // Importar nota
    const importBtn = this.container.querySelector('#btn-import-note');
    importBtn.addEventListener('click', async () => {
      const { importMarkdownFile } = await import('../services/ImportService.js');
      try {
        await importMarkdownFile();
      } catch (error) {
        alert(error.message || 'Error al importar la nota.');
      }
    });

    // Exportar todas
    const exportAllBtn = this.container.querySelector('#btn-export-all');
    exportAllBtn.addEventListener('click', async () => {
      const { exportAllNotesToZip } = await import('../services/ExportService.js');
      try {
        await exportAllNotesToZip();
      } catch (error) {
        alert(error.message || 'Error al exportar las notas.');
      }
    });

    // RF-015: Búsqueda con debounce
    const searchInput = this.container.querySelector('#search-notes');
    const searchClear = this.container.querySelector('#btn-search-clear');

    searchInput.addEventListener('input', () => {
      const query = searchInput.value;

      // Mostrar/ocultar botón de limpiar
      searchClear.classList.toggle('is-visible', query.length > 0);

      // Debounce de 200ms
      if (this.searchDebounceTimeout) {
        clearTimeout(this.searchDebounceTimeout);
      }
      this.searchDebounceTimeout = setTimeout(() => {
        NoteStore.setSearchQuery(query);
      }, 200);
    });

    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      searchClear.classList.remove('is-visible');
      NoteStore.setSearchQuery('');
      searchInput.focus();
    });

    // Delegación de clics en items de la lista
    const listContainer = this.container.querySelector('#note-list-items');
    listContainer.addEventListener('click', (e) => {
      const noteItem = e.target.closest('.note-list__item');
      if (noteItem) {
        const noteId = noteItem.dataset.id;
        NoteStore.selectNote(noteId);
        // RF-020: En mobile, cerrar sidebar al seleccionar nota
        NoteStore.closeSidebar();
      }
    });
  }

  /**
   * UX-03: Formatea una fecha ISO de forma relativa ("hace 2h", "ayer").
   * @param {string} isoString Fecha en formato ISO
   */
  formatDate(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'Ahora';
    if (diffMin < 60) return `Hace ${diffMin}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays}d`;

    // Más de una semana: formato corto
    return new Intl.DateTimeFormat('es-AR', { 
      day: '2-digit', month: 'short'
    }).format(date);
  }

  /**
   * Actualiza el DOM con la lista de notas proporcionada por el Store.
   * @param {Array} notes Lista de notas (ya filtradas si hay búsqueda activa)
   * @param {string|null} activeNoteId ID de la nota seleccionada
   * @param {number} totalCount Total de notas (sin filtrar)
   */
  renderNotes(notes, activeNoteId, totalCount) {
    const listContainer = this.container.querySelector('#note-list-items');
    const countContainer = this.container.querySelector('#note-list-count');

    // Mostrar conteo
    const { searchQuery } = NoteStore.getState();
    if (searchQuery.trim()) {
      countContainer.textContent = `${notes.length} de ${totalCount} notas`;
    } else {
      countContainer.textContent = totalCount > 0 ? `${totalCount} notas` : '';
    }
    
    // Estado vacío
    if (notes.length === 0) {
      if (searchQuery.trim()) {
        listContainer.innerHTML = `
          <div class="note-list__empty">
            <p>Sin resultados para "<strong>${this.escapeHtml(searchQuery)}</strong>"</p>
          </div>
        `;
      } else {
        listContainer.innerHTML = `
          <div class="note-list__empty">
            <p>No hay notas todavía.</p>
            <p>Presiona <strong>+</strong> para crear tu primera nota.</p>
          </div>
        `;
      }
      return;
    }

    // Renderizar listado
    listContainer.innerHTML = notes.map(note => {
      const isActive = note.id === activeNoteId;
      // Truncar contenido para la vista previa (limpiar markdown)
      const previewText = this.getPreviewText(note.content);
      
      return `
        <article class="note-list__item ${isActive ? 'is-active' : ''}" data-id="${note.id}">
          <h3 class="note-list__item-title" title="${this.escapeHtml(note.title || 'Sin título')}">
            ${this.escapeHtml(note.title || 'Sin título')}
          </h3>
          <p class="note-list__item-preview">${this.escapeHtml(previewText)}</p>
          <time class="note-list__item-date">${this.formatDate(note.updatedAt)}</time>
        </article>
      `;
    }).join('');
  }

  /**
   * Extrae un texto de vista previa limpio del contenido Markdown.
   * Elimina headers, sintaxis markdown, y trunca a 80 caracteres.
   * @param {string} content Contenido en Markdown
   * @returns {string} Texto de preview
   */
  getPreviewText(content) {
    if (!content) return 'Sin contenido';

    // Remover la primera línea si es un header (ya se muestra como título)
    const lines = content.split('\n');
    const bodyLines = lines.filter(line => !line.trim().startsWith('# '));
    const body = bodyLines.join(' ').trim();

    if (!body) return 'Sin contenido';

    // Limpiar sintaxis markdown básica
    const cleaned = body
      .replace(/#{1,6}\s/g, '')       // Headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1')     // Italic
      .replace(/`(.*?)`/g, '$1')       // Code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // Images
      .replace(/^\s*[-*+]\s/gm, '')    // List markers
      .replace(/^\s*\d+\.\s/gm, '')    // Numbered list markers
      .replace(/>\s/g, '')             // Blockquotes
      .replace(/\s+/g, ' ')           // Collapse whitespace
      .trim();

    return cleaned.length > 80 ? cleaned.substring(0, 80) + '...' : cleaned;
  }

  /**
   * Escapa HTML para prevenir XSS en la UI.
   * @param {string} text Texto a escapar
   * @returns {string} Texto escapado
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Limpieza de memoria en caso de desmontar el componente.
   */
  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    if (this.searchDebounceTimeout) {
      clearTimeout(this.searchDebounceTimeout);
    }
    this.container.innerHTML = '';
  }
}
