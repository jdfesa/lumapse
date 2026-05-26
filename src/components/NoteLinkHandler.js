// =============================================================
// NoteLinkHandler — Vinculación interna entre notas [[Título]]
// Hito 04: Editor Enhancements
//
// Responsabilidad: Detectar el patrón "[[" en el textarea,
// mostrar un popup con las notas disponibles filtradas por
// búsqueda, e insertar [[Título]] al seleccionar.
//
// Diseño modular: este módulo es independiente y puede removerse
// sin efecto colateral (solo 1 import en NoteEditor.js y
// 1 regex en MarkdownService.js).
//
// Dependencias: EditorPopup, NoteStore
// =============================================================

import { EditorPopup } from './EditorPopup.js';
import * as NoteStore from '../store/NoteStore.js';

/**
 * Extrae un preview corto del contenido de una nota para mostrar
 * en el popup cuando la nota no tiene título explícito.
 * @param {string} content — Contenido Markdown de la nota
 * @returns {string} — Primeras ~50 chars del contenido limpio
 */
function getNotePreview(content) {
  if (!content) return '';
  // Remover encabezados Markdown y tomar texto plano
  const plain = content
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~`[\]()]/g, '')
    .trim();
  if (plain.length <= 50) return plain;
  return plain.substring(0, 47) + '...';
}

export class NoteLinkHandler {
  /**
   * @param {HTMLTextAreaElement} textarea — El textarea del composer
   * @param {HTMLElement} popupContainer — Contenedor para montar el popup
   * @param {string|null} currentEditId — ID de la nota en edición (para excluirla)
   */
  constructor(textarea, popupContainer, currentEditId = null) {
    this.textarea = textarea;
    this.currentEditId = currentEditId;
    this.active = false;
    this.triggerPosition = -1; // Posición del primer "[" del patrón "[["

    this.popup = new EditorPopup({
      container: popupContainer,
      onSelect: (item) => this.insertLink(item),
      onDismiss: () => this.deactivate(),
    });

    // Bind
    this.handleInput = this.handleInput.bind(this);

    // Listener
    this.textarea.addEventListener('input', this.handleInput);
  }

  /**
   * Actualizar el ID de la nota en edición (para excluirla de la búsqueda).
   * @param {string|null} editId
   */
  setCurrentEditId(editId) {
    this.currentEditId = editId;
  }

  /**
   * Detecta "[[" y activa el modo link.
   */
  handleInput() {
    const { value, selectionStart } = this.textarea;

    if (this.active) {
      // Ya estamos en modo link: filtrar por lo que escribió después de "[["
      const query = value.substring(this.triggerPosition + 2, selectionStart);

      // Si el usuario borró los "[[", desactivar
      if (selectionStart <= this.triggerPosition + 1 ||
          value.substring(this.triggerPosition, this.triggerPosition + 2) !== '[[') {
        this.deactivate();
        return;
      }

      // Si escribió "]]" manualmente, desactivar
      if (query.includes(']]') || query.includes('\n')) {
        this.deactivate();
        return;
      }

      this.updateNotesList(query);
      return;
    }

    // Detectar "[["
    if (selectionStart >= 2 &&
        value[selectionStart - 1] === '[' &&
        value[selectionStart - 2] === '[') {
      this.activate(selectionStart - 2);
    }
  }

  /**
   * Activa el modo link: busca notas y muestra el popup.
   */
  activate(position) {
    this.active = true;
    this.triggerPosition = position;
    this.updateNotesList('');
  }

  /**
   * Desactiva el modo link.
   */
  deactivate() {
    this.active = false;
    this.triggerPosition = -1;
    this.popup.hide();
  }

  /**
   * Actualiza la lista de notas en el popup filtradas por query.
   * @param {string} query
   */
  updateNotesList(query) {
    const state = NoteStore.getState();
    const notes = state.notes || [];

    // Filtrar: excluir nota en edición, excluir notas en papelera
    let candidates = notes.filter(n =>
      n.id !== this.currentEditId && !n.deletedAt
    );

    // Filtrar por query de búsqueda
    if (query.trim()) {
      const q = query.toLowerCase();
      candidates = candidates.filter(n =>
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.content && n.content.toLowerCase().includes(q))
      );
    }

    // Limitar a 8 resultados para no saturar el popup
    candidates = candidates.slice(0, 8);

    // Convertir a items del popup
    const items = candidates.map(note => ({
      id: note.id,
      label: note.title || 'Sin título',
      description: getNotePreview(note.content),
      noteTitle: note.title || 'Sin título',
    }));

    if (items.length === 0) {
      this.popup.show([{
        id: '__empty',
        label: 'Sin resultados',
        description: query ? `No hay notas que coincidan con "${query}"` : 'No hay notas disponibles',
      }]);
      return;
    }

    this.popup.show(items);
  }

  /**
   * Inserta [[Título]] en el textarea reemplazando el patrón escrito.
   * @param {object} item — Item seleccionado del popup
   */
  insertLink(item) {
    // No insertar si fue el placeholder de "sin resultados"
    if (item.id === '__empty') {
      this.deactivate();
      return;
    }

    const { value, selectionStart } = this.textarea;
    const title = item.noteTitle;

    // Reemplazar desde "[[" hasta la posición actual con [[Título]]
    const before = value.substring(0, this.triggerPosition);
    const after = value.substring(selectionStart);
    const link = `[[${title}]]`;

    this.textarea.value = before + link + after;

    // Posicionar cursor después del link insertado
    const cursorPos = this.triggerPosition + link.length;
    this.textarea.setSelectionRange(cursorPos, cursorPos);

    // Disparar input para actualizar UI
    this.textarea.dispatchEvent(new window.Event('input', { bubbles: true }));
    this.textarea.focus();

    this.deactivate();
  }

  /** @returns {boolean} */
  isActive() {
    return this.active;
  }

  /**
   * Limpieza al desmontar.
   */
  destroy() {
    this.textarea.removeEventListener('input', this.handleInput);
    this.popup.destroy();
  }
}
