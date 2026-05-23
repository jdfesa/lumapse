// =============================================================
// TrashView — Vista de Papelera de Reciclaje (RF-026)
// Extraído de NoteList.js para reducir LOC.
// =============================================================

import * as SubjectService from '../services/SubjectService.js';
import { escapeHtml } from './NoteCardRenderer.js';

export function formatDeletedAgo(isoString) {
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

export async function renderTrashView(feedContainer) {
  const trashData = await SubjectService.getTrashItems();

  if (trashData.totalCount === 0) {
    feedContainer.innerHTML = `
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
            <span class="trash-item__name">${escapeHtml(subject.name)}</span>
            <span class="trash-item__meta">${totalNotes} nota(s)${sectionsInfo}</span>
            <span class="trash-item__date">${formatDeletedAgo(subject.deletedAt)}</span>
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
            <span class="trash-item__name">${escapeHtml(note.title || 'Sin título')}</span>
            <span class="trash-item__preview">${escapeHtml(preview)}</span>
            <span class="trash-item__date">${formatDeletedAgo(note.deletedAt)}</span>
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

  feedContainer.innerHTML = html;
}
