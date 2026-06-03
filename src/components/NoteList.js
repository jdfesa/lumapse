// =============================================================
// Componente: Feed (antes NoteList)
// Hito 04: Interfaz Microblog (estilo Memos)
// =============================================================

import * as NoteStore from '../store/NoteStore.js';
import * as MarkdownService from '../services/MarkdownService.js';
import { formatRelativeDate, escapeHtml, findSubject, buildMoveMenu } from './NoteCardRenderer.js';
import { createFeedActionRouter } from './FeedActionRouter.js';
import { renderTrashView } from './TrashView.js';
import { BackupView } from './BackupView.js';
import { confirmDialog } from './ConfirmDialog.js';
import { VirtualFeed } from './VirtualFeed.js';
import { renderClearNoteStatusButton, renderNoteStatusBadge, renderNoteStatusMenuItems } from './NoteStatus.js';
import './NoteList.css';

const MARKDOWN_HEADING_REGEX = /^\s{0,3}#{1,6}\s+/
const STRUCTURAL_MARKDOWN_REGEX = /^\s*(?:[-*+]\s+|\d+\.\s+|>\s+|```|\|)/
const COPY_FEEDBACK_VISIBLE_MS = 1000
const COPY_FEEDBACK_FADE_MS = 220

function cleanImplicitTitle(line) {
  return line
    .trim()
    .replace(/^\s{0,3}#{1,6}\s+/, '')
    .replace(/^\s*(?:[-*+>]\s+|\d+\.\s+)/, '')
    .replace(/[*_~`[\]()]/g, '')
    .trim()
}

function getImplicitTitlePresentation(note) {
  const content = note.content || ''
  const lines = content.split('\n')
  const titleLineIndex = lines.findIndex(line => line.trim())
  if (titleLineIndex === -1) return null

  const titleLine = lines[titleLineIndex]
  const trimmed = titleLine.trim()
  if (
    MARKDOWN_HEADING_REGEX.test(trimmed) ||
    STRUCTURAL_MARKDOWN_REGEX.test(trimmed)
  ) {
    return null
  }

  const title = cleanImplicitTitle(titleLine)
  if (!title) return null

  return {
    title,
    body: lines.slice(titleLineIndex + 1).join('\n'),
    lineOffset: titleLineIndex + 1,
  }
}

function renderImplicitTitleBlock(note) {
  const titlePresentation = getImplicitTitlePresentation(note);
  const bodyMarkdown = titlePresentation ? titlePresentation.body : (note.content || '');
  const renderedContent = bodyMarkdown.trim()
    ? MarkdownService.renderMarkdown(bodyMarkdown, { lineOffset: titlePresentation?.lineOffset || 0 })
    : '';
  const titleHtml = titlePresentation
    ? `<h2 class="note-card__implicit-title">${escapeHtml(titlePresentation.title)}</h2>`
    : '';

  return `${titleHtml}${renderedContent}`;
}

function renderSubjectBadge(note, subjectsData) {
  const found = findSubject(note.subjectId, subjectsData);
  if (!found) return '';

  const color = found.subject.color || (found.parent ? found.parent.color : '');
  const label = found.parent
    ? `${escapeHtml(found.parent.name)} \u203A ${escapeHtml(found.subject.name)}`
    : escapeHtml(found.subject.name);

  return `<span class="note-card__subject-badge" style="--subject-color: ${color}">${label}</span>`;
}

function renderEmptyState(state) {
  const query = (state.searchQuery || '').trim();
  const subjectsData = state.subjects || { tree: [] };
  const activeSubject = state.activeSubjectId
    ? findSubject(state.activeSubjectId, subjectsData)?.subject
    : null;

  let title = 'Todavía no hay notas en Entrada.';
  let copy = 'Escribí una idea arriba o asignala a una materia cuando la guardes.';

  if (query) {
    title = `No encontramos notas para "${escapeHtml(query)}".`;
    copy = 'Probá con otra palabra o limpiá la búsqueda para volver al feed.';
  } else if (state.dateFilter) {
    title = 'No hay notas en esta fecha.';
    copy = 'El calendario sigue marcando actividad cuando guardes apuntes ese día.';
  } else if (state.viewMode === 'subject') {
    title = activeSubject
      ? `${escapeHtml(activeSubject.name)} todavía no tiene notas.`
      : 'Esta materia todavía no tiene notas.';
    copy = 'Guardá la próxima idea con esta materia seleccionada.';
  } else if (state.viewMode === 'archived') {
    title = 'No hay notas archivadas.';
    copy = 'Cuando archives apuntes, vas a poder consultarlos desde acá.';
  }

  return `
    <div class="feed__empty">
      <svg class="feed__empty-icon" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        <line x1="8" y1="7" x2="16" y2="7"></line>
        <line x1="8" y1="11" x2="14" y2="11"></line>
      </svg>
      <p class="feed__empty-title">${title}</p>
      <p class="feed__empty-copy">${copy}</p>
    </div>
  `;
}

export class NoteList {
  constructor(containerElement) {
    this.container = containerElement;
    this.unsubscribe = null;
    this.virtualFeed = null;
    this.backupView = null;
    this.currentSubjectsData = null;
    
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
        this.destroyVirtualFeed();
        this.destroyBackupView();
        renderTrashView(this.feedContainer);
      } else if (state.viewMode === 'backup') {
        this.destroyVirtualFeed();
        this.renderBackupView();
      } else {
        this.destroyBackupView();
        const notesToRender = NoteStore.getFilteredNotes();
        this.renderNotes(notesToRender, state);
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
    const confirmed = await confirmDialog({
      message: '¿Enviar esta nota a la Papelera de reciclaje?',
    })
    if (confirmed) {
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
      const dropdown = btnElement.closest('.note-card__dropdown');
      btnElement.disabled = true;
      btnElement.classList.add('note-card__dropdown-btn--copied');
      btnElement.setAttribute('aria-live', 'polite');
      btnElement.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg> Copiado`;
      setTimeout(() => {
        dropdown?.classList.add('is-closing');
        setTimeout(() => {
          if (btnElement.isConnected) {
            btnElement.innerHTML = originalHtml;
            btnElement.disabled = false;
            btnElement.classList.remove('note-card__dropdown-btn--copied');
            btnElement.removeAttribute('aria-live');
          }
          dropdown?.classList.remove('is-open', 'is-closing');
        }, COPY_FEEDBACK_FADE_MS);
      }, COPY_FEEDBACK_VISIBLE_MS);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  }

  destroyVirtualFeed() {
    if (this.virtualFeed) {
      this.virtualFeed.destroy();
      this.virtualFeed = null;
    }
  }

  destroyBackupView() {
    if (this.backupView) {
      this.backupView.destroy();
      this.backupView = null;
    }
  }

  renderBackupView() {
    if (this.backupView) return;

    this.feedContainer.innerHTML = '';
    this.backupView = new BackupView(this.feedContainer);
    this.backupView.init();
  }

  renderNotes(notes, state) {
    const subjectsData = state.subjects;
    this.currentSubjectsData = subjectsData;

    if (notes.length === 0) {
      this.destroyVirtualFeed();
      this.feedContainer.innerHTML = renderEmptyState(state);
      return;
    }

    if (notes.length <= 50) {
      this.destroyVirtualFeed();
      this.feedContainer.innerHTML = notes.map(note => this.renderCard(note, subjectsData)).join('');
      return;
    }

    if (!this.virtualFeed) {
      this.virtualFeed = new VirtualFeed(this.feedContainer, (note) => this.renderCard(note, this.currentSubjectsData));
    }
    this.virtualFeed.setNotes(notes);
  }

  renderCard(note, subjectsData) {
    // Usar MarkdownService para renderizar el contenido completo de forma segura
    const renderedContent = renderImplicitTitleBlock(note);
    const timeStr = formatRelativeDate(note.updatedAt);
    const isPinned = note.pinned;
    const isArchived = note.archived;
    const pinLabel = isPinned ? 'Desfijar' : 'Fijar';
    const archiveLabel = isArchived ? 'Desarchivar' : 'Archivar';

    // Badge de archivo
    const archivedBadge = isArchived
      ? `<span class="note-card__archived-badge">Archivada</span>`
      : '';

    const statusBadge = renderNoteStatusBadge(note.statusEmoji);
    const statusItems = renderNoteStatusMenuItems(note.id, note.statusEmoji);
    const clearStatus = note.statusEmoji
      ? renderClearNoteStatusButton(note.id)
      : '';

    return `
      <article class="note-card${isPinned ? ' note-card--pinned' : ''}" data-id="${note.id}">
        <header class="note-card__header">
          <span class="note-card__time">
            ${isPinned ? '<svg class="note-card__pin-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M16 2l-4 4-6-2-2 2 5 5-5 7 2 2 7-5 5 5 2-2-2-6 4-4z"/></svg>' : ''}
            ${timeStr}
            ${renderSubjectBadge(note, subjectsData)}
            ${archivedBadge}
            ${statusBadge}
          </span>
          <div class="note-card__actions">
            <div class="note-card__status-wrapper">
              <button class="note-card__action-btn js-btn-status-trigger" title="Estado académico" aria-label="Estado académico">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
              </button>
              <div class="note-card__status-menu">
                ${statusItems}
                ${clearStatus}
              </div>
            </div>
            <button class="note-card__action-btn js-btn-menu" title="Opciones">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
            </button>
            <div class="note-card__dropdown">
              <button class="note-card__dropdown-btn js-btn-pin" data-id="${note.id}" title="${pinLabel} nota">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 2l-4 4-6-2-2 2 5 5-5 7 2 2 7-5 5 5 2-2-2-6 4-4z"/></svg>
                ${pinLabel}
              </button>
              <button class="note-card__dropdown-btn js-btn-archive" data-id="${note.id}" title="${archiveLabel} nota">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>
                ${archiveLabel}
              </button>
              <div class="note-card__move-wrapper">
                <button class="note-card__dropdown-btn js-btn-move-trigger" title="Mover nota">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
                  Mover a
                  <svg class="note-card__move-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
                <div class="note-card__move-submenu">
                  ${buildMoveMenu(note.id, note.subjectId, subjectsData)}
                </div>
              </div>
              <button class="note-card__dropdown-btn js-btn-edit" data-id="${note.id}" title="Editar nota">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                Editar
              </button>
              <button class="note-card__dropdown-btn js-btn-copy" data-id="${note.id}" title="Copiar nota">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                Copiar
              </button>
              <button class="note-card__dropdown-btn note-card__dropdown-btn--delete js-btn-delete" data-id="${note.id}" title="Eliminar nota">
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
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
    this.destroyVirtualFeed();
    this.destroyBackupView();
    document.removeEventListener('click', this.handleGlobalClick);
    this.container.innerHTML = '';
  }
}
