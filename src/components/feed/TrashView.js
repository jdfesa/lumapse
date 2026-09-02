// =============================================================
// TrashView — Vista de Papelera de Reciclaje (RF-026)
// Extraído de NoteList.js para reducir LOC.
// =============================================================

import * as SubjectService from '../../services/SubjectService.js';
import { escapeHtmlAttribute, escapeHtmlText } from '../common/htmlEscaping.js';
import { getSafeHexColor } from '../common/presentationValidation.js';

function renderSubjectColor(color, fallbackColor = null) {
  const safeColor = getSafeHexColor(color) || getSafeHexColor(fallbackColor);
  const style = safeColor ? ` style="background-color: ${safeColor}"` : '';
  return `<span class="drawer__subject-color"${style}></span>`;
}

function createDuplicateLabeler(getBaseName) {
  const seen = new Map();

  return (item) => {
    const baseName = (getBaseName(item) || '').trim() || 'Sin título';
    const key = baseName.toLowerCase();
    const count = seen.get(key) || 0;
    seen.set(key, count + 1);
    return count === 0 ? baseName : `${baseName} (${count})`;
  };
}

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

function renderEmptyTrash() {
  return `
    <div class="feed__empty">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.5">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
      <p>La papelera está vacía.</p>
      <p style="font-size: 0.8rem; color: var(--color-text-muted)">Los elementos eliminados aparecen aquí durante 30 días.</p>
    </div>
  `;
}

function renderTrashHeader(totalCount) {
  return `
    <div class="trash-header">
      <h2 class="trash-header__title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        Papelera de reciclaje
        <span class="trash-header__count">${escapeHtmlText(totalCount)}</span>
      </h2>
      <button class="trash-header__empty js-btn-empty-trash" title="Vaciar papelera">Vaciar papelera</button>
    </div>
  `;
}

function renderDeletedSubjectChild(child, subject) {
  return `
    <div class="trash-item trash-item--section trash-item--nested">
      <div class="trash-item__info">
        ${renderSubjectColor(child.color, subject.color)}
        <span class="trash-item__name">${escapeHtmlText(child.name)}</span>
        <span class="trash-item__meta">${escapeHtmlText(child.noteCount || 0)} nota(s) · incluida en la materia eliminada</span>
        <span class="trash-item__date">${escapeHtmlText(formatDeletedAgo(child.deletedAt))}</span>
      </div>
    </div>
  `;
}

function renderDeletedSubject(subject) {
  const children = subject.children || [];
  const childCount = children.reduce((sum, child) => sum + (child.noteCount || 0), 0);
  const totalNotes = (subject.noteCount || 0) + childCount;
  const sectionsInfo = children.length > 0 ? ` · ${children.length} sección(es)` : '';
  const subjectRow = `
    <div class="trash-item trash-item--subject">
      <div class="trash-item__info">
        ${renderSubjectColor(subject.color)}
        <span class="trash-item__name">${escapeHtmlText(subject.name)}</span>
        <span class="trash-item__meta">${escapeHtmlText(totalNotes)} nota(s)${escapeHtmlText(sectionsInfo)}</span>
        <span class="trash-item__date">${escapeHtmlText(formatDeletedAgo(subject.deletedAt))}</span>
      </div>
      <div class="trash-item__actions">
        <button class="trash-item__btn trash-item__btn--restore js-btn-restore-subject" data-id="${escapeHtmlAttribute(subject.id)}" title="Restaurar materia completa">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
          Restaurar
        </button>
      </div>
    </div>
  `;

  return subjectRow + children.map(child => renderDeletedSubjectChild(child, subject)).join('');
}

function renderDeletedSubjects(subjects) {
  if (subjects.length === 0) return '';

  return `<div class="trash-section__label">Materias eliminadas</div>`
    + subjects.map(renderDeletedSubject).join('');
}

function renderDeletedSection(section) {
  return `
    <div class="trash-item trash-item--section">
      <div class="trash-item__info">
        ${renderSubjectColor(section.color, section.parentColor)}
        <span class="trash-item__name">${escapeHtmlText(section.name)}</span>
        <span class="trash-item__meta">${escapeHtmlText(section.noteCount || 0)} nota(s) · ${escapeHtmlText(section.parentName)}</span>
        <span class="trash-item__date">${escapeHtmlText(formatDeletedAgo(section.deletedAt))}</span>
      </div>
      <div class="trash-item__actions">
        <button class="trash-item__btn trash-item__btn--restore js-btn-restore-section" data-id="${escapeHtmlAttribute(section.id)}" title="Restaurar sección">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
          Restaurar
        </button>
      </div>
    </div>
  `;
}

function renderDeletedSections(sections = []) {
  if (sections.length === 0) return '';

  return `<div class="trash-section__label">Secciones eliminadas</div>`
    + sections.map(renderDeletedSection).join('');
}

function renderDeletedNote(note, getDisplayName) {
  const preview = (note.content || '').substring(0, 120).replace(/[#*_[\]]/g, '');
  return `
    <div class="trash-item">
      <div class="trash-item__info">
        <span class="trash-item__name">${escapeHtmlText(getDisplayName(note))}</span>
        <span class="trash-item__preview">${escapeHtmlText(preview)}</span>
        <span class="trash-item__date">${escapeHtmlText(formatDeletedAgo(note.deletedAt))}</span>
      </div>
      <div class="trash-item__actions">
        <button class="trash-item__btn trash-item__btn--restore js-btn-restore" data-id="${escapeHtmlAttribute(note.id)}" title="Restaurar nota">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
        </button>
        <button class="trash-item__btn trash-item__btn--danger js-btn-permanent-delete" data-id="${escapeHtmlAttribute(note.id)}" title="Eliminar permanentemente">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    </div>
  `;
}

function renderDeletedNotes(notes) {
  if (notes.length === 0) return '';

  const getDisplayName = createDuplicateLabeler(note => note.title);
  return `<div class="trash-section__label">Notas eliminadas</div>`
    + notes.map(note => renderDeletedNote(note, getDisplayName)).join('');
}

export async function renderTrashView(feedContainer) {
  const trashData = await SubjectService.getTrashItems();

  feedContainer.innerHTML = trashData.totalCount === 0
    ? renderEmptyTrash()
    : [
        renderTrashHeader(trashData.totalCount),
        renderDeletedSubjects(trashData.subjects),
        renderDeletedSections(trashData.orphanSections),
        renderDeletedNotes(trashData.notes),
      ].join('');
}
