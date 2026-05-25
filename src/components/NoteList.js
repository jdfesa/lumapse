// =============================================================
// Componente: Feed (antes NoteList)
// Hito 04: Interfaz Microblog (estilo Memos)
// =============================================================

import * as NoteStore from '../store/NoteStore.js';
import * as MarkdownService from '../services/MarkdownService.js';
import { formatRelativeDate, escapeHtml, findSubject, buildMoveMenu } from './NoteCardRenderer.js';
import { createFeedActionRouter } from './FeedActionRouter.js';
import { renderTrashView } from './TrashView.js';
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
    const router = createFeedActionRouter({
      onEdit: this.handleEdit,
      onDelete: this.handleDelete,
      onCopy: (button) => this.handleCopy(button),
      closeAllDropdowns: () => this.closeAllDropdowns(),
      refreshTrash: () => renderTrashView(this.feedContainer)
    });
    this.feedContainer.addEventListener('click', router);

    // Suscribirse al store
    this.unsubscribe = NoteStore.subscribe((state) => {
      if (state.viewMode === 'trash') {
        renderTrashView(this.feedContainer);
      } else {
        const notesToRender = NoteStore.getFilteredNotes();
        this.renderNotes(notesToRender, state.searchQuery, state.subjects);
      }
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

  handleEdit(id) {
    // Scroll arriba suave
    window.scrollTo({ top: 0, behavior: 'smooth' });
    NoteStore.selectNote(id);
  }

  async handleDelete(id) {
    if (confirm('¿Enviar esta nota a la Papelera de reciclaje?')) {
      await NoteStore.deleteNote(id);
    }
  }

  async handleCopy(btnElement) {
    const id = btnElement.dataset.id;
    const notes = NoteStore.getFilteredNotes();
    const note = notes.find(n => n.id === id);
    if (!note) return;

    try {
      await navigator.clipboard.writeText(note.content);
      const originalHtml = btnElement.innerHTML;
      btnElement.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Copiado!`;
      setTimeout(() => {
        btnElement.innerHTML = originalHtml;
        this.closeAllDropdowns();
      }, 1500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  }

  renderNotes(notes, searchQuery, subjectsData) {
    if (notes.length === 0) {
      if (searchQuery) {
        this.feedContainer.innerHTML = `
          <div class="feed__empty">
            <p>No se encontraron resultados para "${escapeHtml(searchQuery)}"</p>
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
      const timeStr = formatRelativeDate(note.updatedAt);
      const isPinned = note.pinned;
      const isArchived = note.archived;
      const pinLabel = isPinned ? 'Desfijar' : 'Fijar';
      const archiveLabel = isArchived ? 'Desarchivar' : 'Archivar';

      // Badge de materia (con breadcrumb si es sección hija)
      const found = findSubject(note.subjectId, subjectsData);
      let subjectBadge = '';
      if (found) {
        const color = found.subject.color || (found.parent ? found.parent.color : '');
        const label = found.parent
          ? `${escapeHtml(found.parent.name)} \u203A ${escapeHtml(found.subject.name)}`
          : escapeHtml(found.subject.name);
        subjectBadge = `<span class="note-card__subject-badge" style="--subject-color: ${color}">${label}</span>`;
      }
        
      // Badge de archivo
      const archivedBadge = isArchived
        ? `<span class="note-card__archived-badge">Archivada</span>`
        : '';

      // Badge de emoji de estado (DP-005)
      const statusBadge = note.statusEmoji
        ? `<span class="note-card__status-badge">${note.statusEmoji}</span>`
        : '';

      // Submenú de estado académico (DP-005)
      const statusEmojis = [
        { emoji: '📖', label: 'Por completar' },
        { emoji: '❓', label: 'Tengo dudas' },
        { emoji: '🔥', label: 'Importante' },
        { emoji: '✅', label: 'Repasado' },
      ];
      const statusItems = statusEmojis.map(s => {
        const isActive = note.statusEmoji === s.emoji ? ' note-card__emoji-btn--current' : '';
        return `<button class="note-card__emoji-btn js-btn-status${isActive}" data-note-id="${note.id}" data-emoji="${s.emoji}" title="${s.label}">${s.emoji}</button>`;
      }).join('');
      const clearStatus = note.statusEmoji
        ? `<button class="note-card__emoji-btn js-btn-status" data-note-id="${note.id}" data-emoji="" title="Quitar">✕</button>`
        : '';
      
      return `
        <article class="note-card${isPinned ? ' note-card--pinned' : ''}" data-id="${note.id}">
          <header class="note-card__header">
            <span class="note-card__time">
              ${isPinned ? '<svg class="note-card__pin-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M16 2l-4 4-6-2-2 2 5 5-5 7 2 2 7-5 5 5 2-2-2-6 4-4z"/></svg>' : ''}
              ${timeStr}
              ${subjectBadge}
              ${archivedBadge}
              ${statusBadge}
            </span>
            <div class="note-card__actions">
              <div class="note-card__emoji-wrapper">
                <button class="note-card__action-btn js-btn-emoji-trigger" title="Estado académico">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                </button>
                <div class="note-card__emoji-submenu">
                  ${statusItems}
                  ${clearStatus}
                </div>
              </div>
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
                <div class="note-card__move-wrapper">
                  <button class="note-card__dropdown-btn js-btn-move-trigger">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
                    Mover a
                    <svg class="note-card__move-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </button>
                  <div class="note-card__move-submenu">
                    ${buildMoveMenu(note.id, note.subjectId, subjectsData)}
                  </div>
                </div>
                <button class="note-card__dropdown-btn js-btn-edit" data-id="${note.id}">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  Editar
                </button>
                <button class="note-card__dropdown-btn js-btn-copy" data-id="${note.id}">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  Copiar
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
