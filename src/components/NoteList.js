// =============================================================
// Componente: Feed (antes NoteList)
// Hito 04: Interfaz Microblog (estilo Memos)
// =============================================================

import * as NoteStore from '../store/NoteStore.js';
import * as MarkdownService from '../services/MarkdownService.js';
import * as SubjectService from '../services/SubjectService.js';
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
      const btnMove = e.target.closest('.js-btn-move-to');
      const btnStatus = e.target.closest('.js-btn-status');
      const btnCopy = e.target.closest('.js-btn-copy');
      // Trash actions
      const btnRestore = e.target.closest('.js-btn-restore');
      const btnPermanentDelete = e.target.closest('.js-btn-permanent-delete');
      const btnRestoreSubject = e.target.closest('.js-btn-restore-subject');
      const btnEmptyTrash = e.target.closest('.js-btn-empty-trash');
      
      // Si el clic no fue en un botón de menú, cerramos todos
      if (!btnMenu) {
        this.closeAllDropdowns();
      }

      if (btnEmptyTrash) {
        if (confirm('¿Vaciar la papelera? Esto eliminará permanentemente todas las notas y materias. Esta acción no se puede deshacer.')) {
          NoteStore.emptyTrash().then(() => this.renderTrashView());
        }
      } else if (btnRestore) {
        NoteStore.restoreNoteFromTrash(btnRestore.dataset.id).then(() => this.renderTrashView());
      } else if (btnPermanentDelete) {
        if (confirm('¿Eliminar permanentemente esta nota? Esta acción no se puede deshacer.')) {
          NoteStore.permanentlyDeleteNote(btnPermanentDelete.dataset.id).then(() => this.renderTrashView());
        }
      } else if (btnRestoreSubject) {
        NoteStore.restoreSubjectFromTrash(btnRestoreSubject.dataset.id).then(() => this.renderTrashView());
      } else if (btnMenu) {
        e.stopPropagation();
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
      } else if (btnMove) {
        const noteId = btnMove.dataset.noteId;
        const targetSubject = btnMove.dataset.subjectId || null;
        NoteStore.moveNote(noteId, targetSubject);
        this.closeAllDropdowns();
      } else if (btnStatus) {
        const noteId = btnStatus.dataset.noteId;
        const emoji = btnStatus.dataset.emoji || null;
        NoteStore.setNoteStatus(noteId, emoji);
        this.closeAllDropdowns();
      } else if (btnEdit) {
        this.handleEdit(btnEdit.dataset.id);
      } else if (btnDelete) {
        this.handleDelete(btnDelete.dataset.id);
      } else if (btnCopy) {
        this.handleCopy(btnCopy);
      }
    });

    // Suscribirse al store
    this.unsubscribe = NoteStore.subscribe((state) => {
      if (state.viewMode === 'trash') {
        this.renderTrashView();
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

  /**
   * Busca una materia en el árbol de subjects por ID.
   * Retorna { subject, parent } donde parent es la materia raíz
   * si subject es una sección hija, o null si es raíz.
   * @param {string} subjectId ID de la materia
   * @param {object} subjectsData Árbol de materias
   * @returns {{subject: object, parent: object|null}|null}
   */
  findSubject(subjectId, subjectsData) {
    if (!subjectId || !subjectsData || !subjectsData.tree) return null;
    for (const root of subjectsData.tree) {
      if (root.id === subjectId) return { subject: root, parent: null };
      for (const child of (root.children || [])) {
        if (child.id === subjectId) return { subject: child, parent: root };
      }
    }
    return null;
  }

  /**
   * Genera un botón individual del submenú "Mover a".
   * @param {string} noteId ID de la nota
   * @param {string} subjectId ID de la materia destino ('' = Entrada)
   * @param {string} label Nombre visible
   * @param {string} color Color de la materia ('' = sin dot)
   * @param {boolean} isCurrent Si es la materia actual de la nota
   * @param {boolean} isChild Si es una sección hija (indentada)
   * @returns {string} HTML del botón
   */
  renderMoveItem(noteId, subjectId, label, color, isCurrent, isChild = false) {
    const currentClass = isCurrent ? ' note-card__dropdown-btn--current' : ''
    const childClass = isChild ? ' note-card__dropdown-btn--child' : ''
    const colorDot = color
      ? `<span class="note-card__move-color" style="background-color: ${color}"></span>`
      : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>`
    const check = isCurrent ? ' ✓' : ''

    return `
      <button class="note-card__dropdown-btn${childClass} js-btn-move-to${currentClass}" 
              data-note-id="${noteId}" 
              data-subject-id="${subjectId}"
              ${isCurrent ? 'disabled' : ''}>
        ${colorDot}
        ${this.escapeHtml(label)}${check}
      </button>
    `
  }

  /**
   * Genera el HTML del submenú "Mover a" con todas las materias disponibles.
   * Marca como activa (y no clickeable) la materia actual de la nota.
   * @param {string} noteId ID de la nota
   * @param {string|null} currentSubjectId ID de la materia actual de la nota
   * @param {object} subjectsData Árbol de materias del store
   * @returns {string} HTML del submenú
   */
  buildMoveMenu(noteId, currentSubjectId, subjectsData) {
    const items = []

    // Opción "Entrada" (inbox)
    items.push(this.renderMoveItem(noteId, '', 'Entrada', '', !currentSubjectId))

    // Materias del árbol
    if (subjectsData && subjectsData.tree) {
      for (const subject of subjectsData.tree) {
        items.push(this.renderMoveItem(noteId, subject.id, subject.name, subject.color, currentSubjectId === subject.id))
        for (const child of (subject.children || [])) {
          items.push(this.renderMoveItem(noteId, child.id, child.name, child.color || subject.color, currentSubjectId === child.id, true))
        }
      }
    }

    return items.join('')
  }

  renderNotes(notes, searchQuery, subjectsData) {
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

      // Badge de materia (con breadcrumb si es sección hija)
      const found = this.findSubject(note.subjectId, subjectsData);
      let subjectBadge = '';
      if (found) {
        const color = found.subject.color || (found.parent ? found.parent.color : '');
        const label = found.parent
          ? `${this.escapeHtml(found.parent.name)} \u203A ${this.escapeHtml(found.subject.name)}`
          : this.escapeHtml(found.subject.name);
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
                    ${this.buildMoveMenu(note.id, note.subjectId, subjectsData)}
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

  // --- Trash View (RF-026) ---

  formatDeletedAgo(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const daysLeft = 30 - diffDays;

    if (diffDays === 0) return 'Eliminada hoy';
    if (diffDays === 1) return 'Eliminada ayer';
    if (daysLeft > 0) return `Eliminada hace ${diffDays} d (se purga en ${daysLeft} d)`;
    return `Eliminada hace ${diffDays} d (purgándose pronto)`;
  }

  async renderTrashView() {
    const trashData = await SubjectService.getTrashItems();

    if (trashData.totalCount === 0) {
      this.feedContainer.innerHTML = `
        <div class="feed__empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.5">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          <p>La papelera está vacía.</p>
          <p style="font-size: 0.8rem; color: var(--color-text-muted)">Los elementos eliminados aparecen aquí durante 30 días.</p>
        </div>
      `;
      return;
    }

    let html = '';

    // Header de papelera
    html += `
      <div class="trash-header">
        <h2 class="trash-header__title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          Papelera de reciclaje
          <span class="trash-header__count">${trashData.totalCount}</span>
        </h2>
        <button class="trash-header__empty js-btn-empty-trash">Vaciar papelera</button>
      </div>
    `;

    // Materias eliminadas
    if (trashData.subjects.length > 0) {
      html += `<div class="trash-section__label">Materias eliminadas</div>`;
      for (const subject of trashData.subjects) {
        const childCount = (subject.children || []).reduce((sum, c) => sum + (c.noteCount || 0), 0);
        const totalNotes = (subject.noteCount || 0) + childCount;
        const sectionsInfo = (subject.children || []).length > 0
          ? ` · ${subject.children.length} sección(es)`
          : '';
        html += `
          <div class="trash-item trash-item--subject">
            <div class="trash-item__info">
              <span class="drawer__subject-color" style="background-color: ${subject.color}"></span>
              <span class="trash-item__name">${this.escapeHtml(subject.name)}</span>
              <span class="trash-item__meta">${totalNotes} nota(s)${sectionsInfo}</span>
              <span class="trash-item__date">${this.formatDeletedAgo(subject.deletedAt)}</span>
            </div>
            <div class="trash-item__actions">
              <button class="trash-item__btn trash-item__btn--restore js-btn-restore-subject" data-id="${subject.id}" title="Restaurar materia completa">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                Restaurar
              </button>
            </div>
          </div>
        `;
      }
    }

    // Notas sueltas eliminadas
    if (trashData.notes.length > 0) {
      html += `<div class="trash-section__label">Notas eliminadas</div>`;
      for (const note of trashData.notes) {
        const preview = (note.content || '').substring(0, 120).replace(/[#*_[\]]/g, '');
        html += `
          <div class="trash-item">
            <div class="trash-item__info">
              <span class="trash-item__name">${this.escapeHtml(note.title || 'Sin título')}</span>
              <span class="trash-item__preview">${this.escapeHtml(preview)}</span>
              <span class="trash-item__date">${this.formatDeletedAgo(note.deletedAt)}</span>
            </div>
            <div class="trash-item__actions">
              <button class="trash-item__btn trash-item__btn--restore js-btn-restore" data-id="${note.id}" title="Restaurar nota">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
              </button>
              <button class="trash-item__btn trash-item__btn--danger js-btn-permanent-delete" data-id="${note.id}" title="Eliminar permanentemente">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>
        `;
      }
    }

    this.feedContainer.innerHTML = html;
  }
}
