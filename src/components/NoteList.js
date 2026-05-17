// =============================================================
// Componente: Feed (antes NoteList)
// Hito 04: Interfaz Microblog (estilo Memos)
// =============================================================

import * as NoteStore from '../store/NoteStore.js';
import * as MarkdownService from '../services/MarkdownService.js';
import './NoteList.css';

export class NoteList {
  constructor(containerElement) {
    this.container = containerElement;
    this.unsubscribe = null;
    
    // Bindings
    this.handleDelete = this.handleDelete.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleGlobalClick = this.handleGlobalClick.bind(this);
    
    // Escuchar clics globales para cerrar dropdowns
    document.addEventListener('click', this.handleGlobalClick);
    
    // Render base (sin notas aún)
    this.container.innerHTML = `<div class="feed" id="feed-items"></div>`;
    this.feedContainer = this.container.querySelector('#feed-items');

    // Delegación de eventos para botones de la card
    this.feedContainer.addEventListener('click', (e) => {
      const btnMenu = e.target.closest('.js-btn-menu');
      const btnEdit = e.target.closest('.js-btn-edit');
      const btnDelete = e.target.closest('.js-btn-delete');
      const btnPin = e.target.closest('.js-btn-pin');
      const btnArchive = e.target.closest('.js-btn-archive');
      
      // Si el clic no fue en un botón de menú, cerramos todos
      if (!btnMenu) {
        this.closeAllDropdowns();
      }

      if (btnMenu) {
        e.stopPropagation(); // Evitar que el global click lo atrape
        const dropdown = btnMenu.nextElementSibling;
        const isOpen = dropdown.classList.contains('is-open');
        this.closeAllDropdowns();
        if (!isOpen) {
          dropdown.classList.add('is-open');
        }
      } else if (btnPin) {
        NoteStore.togglePin(btnPin.dataset.id);
      } else if (btnArchive) {
        NoteStore.toggleArchive(btnArchive.dataset.id);
      } else if (btnEdit) {
        this.handleEdit(btnEdit.dataset.id);
      } else if (btnDelete) {
        this.handleDelete(btnDelete.dataset.id);
      }
    });

    // Suscribirse al store
    this.unsubscribe = NoteStore.subscribe((state) => {
      // Usamos getFilteredNotes para respetar la búsqueda (si implementamos búsqueda luego)
      const notesToRender = NoteStore.getFilteredNotes();
      this.renderNotes(notesToRender, state.searchQuery);
    });
  }

  closeAllDropdowns() {
    const dropdowns = this.container.querySelectorAll('.note-card__dropdown.is-open');
    dropdowns.forEach(d => d.classList.remove('is-open'));
  }

  handleGlobalClick(e) {
    if (!e.target.closest('.note-card__actions')) {
      this.closeAllDropdowns();
    }
  }

  // UX-03: Timestamps relativos
  formatRelativeDate(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'ahora';
    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffHours < 24) return `hace ${diffHours} h`;
    if (diffDays === 1) return 'ayer';
    if (diffDays < 7) return `hace ${diffDays} d`;
    
    // Fallback: ej. "16 may 2026"
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  handleEdit(id) {
    // Scroll arriba suave
    window.scrollTo({ top: 0, behavior: 'smooth' });
    NoteStore.selectNote(id);
  }

  async handleDelete(id) {
    if (confirm('¿Eliminar este memo?')) {
      await NoteStore.deleteNote(id);
      // Si la nota borrada estaba en edición, se resetea por el Store
    }
  }

  // Prevenir inyección de HTML en campos de texto puro
  escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  renderNotes(notes, searchQuery) {
    if (notes.length === 0) {
      if (searchQuery) {
        this.feedContainer.innerHTML = `
          <div class="feed__empty">
            <p>No se encontraron resultados para "${this.escapeHtml(searchQuery)}"</p>
          </div>
        `;
      } else {
        this.feedContainer.innerHTML = `
          <div class="feed__empty">
            <p>No hay notas todavía.</p>
            <p>Escribe alguna idea arriba.</p>
          </div>
        `;
      }
      return;
    }

    // Renderizar cards
    this.feedContainer.innerHTML = notes.map(note => {
      // Usar MarkdownService para renderizar el contenido completo de forma segura
      const renderedContent = MarkdownService.renderMarkdown(note.content);
      const timeStr = this.formatRelativeDate(note.updatedAt);
      const isPinned = note.pinned;
      const isArchived = note.archived;
      const pinLabel = isPinned ? 'Desfijar' : 'Fijar';
      const archiveLabel = isArchived ? 'Desarchivar' : 'Archivar';
      
      return `
        <article class="note-card${isPinned ? ' note-card--pinned' : ''}" data-id="${note.id}">
          <header class="note-card__header">
            <span class="note-card__time">
              ${isPinned ? '<svg class="note-card__pin-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M16 2l-4 4-6-2-2 2 5 5-5 7 2 2 7-5 5 5 2-2-2-6 4-4z"/></svg>' : ''}
              ${timeStr}
            </span>
            <div class="note-card__actions">
              <button class="note-card__action-btn js-btn-menu" title="Opciones">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
              </button>
              <div class="note-card__dropdown">
                <button class="note-card__dropdown-btn js-btn-pin" data-id="${note.id}">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 2l-4 4-6-2-2 2 5 5-5 7 2 2 7-5 5 5 2-2-2-6 4-4z"/></svg>
                  ${pinLabel}
                </button>
                <button class="note-card__dropdown-btn js-btn-archive" data-id="${note.id}">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>
                  ${archiveLabel}
                </button>
                <button class="note-card__dropdown-btn js-btn-edit" data-id="${note.id}">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  Editar
                </button>
                <button class="note-card__dropdown-btn note-card__dropdown-btn--delete js-btn-delete" data-id="${note.id}">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  Eliminar
                </button>
              </div>
            </div>
          </header>
          <div class="note-card__content markdown-body">
            ${renderedContent}
          </div>
        </article>
      `;
    }).join('');
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
    document.removeEventListener('click', this.handleGlobalClick);
    this.container.innerHTML = '';
  }
}
