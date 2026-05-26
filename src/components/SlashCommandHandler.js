// =============================================================
// SlashCommandHandler — Detección y ejecución de slash commands
// Hito 04: Editor Enhancements
//
// Responsabilidad: Detectar "/" al inicio de línea en el textarea,
// mostrar popup con comandos disponibles, e insertar el snippet
// Markdown correspondiente al seleccionar.
//
// Dependencias: EditorPopup
// =============================================================

import { EditorPopup } from './EditorPopup.js';
import './EditorPopup.css';

/**
 * Comandos disponibles.
 * Cada comando define el snippet a insertar y la posición relativa
 * del cursor después de la inserción (offset desde el inicio del snippet).
 */
const SLASH_COMMANDS = [
  {
    id: 'todo',
    label: '/todo',
    description: '',
    snippet: '- [ ] ',
    // Cursor al final del primer item
    cursorOffset: 6,
  },
  {
    id: 'code',
    label: '/code',
    description: '',
    snippet: '```\n\n```',
    // Cursor en la línea vacía entre backticks
    cursorOffset: 4,
  },
  {
    id: 'table',
    label: '/table',
    description: '',
    snippet: '| Header | Header |\n| ------ | ------ |\n| Cell   | Cell   |',
    // Cursor al inicio del primer "Header"
    cursorOffset: 2,
    // Seleccionar "Header" para que el usuario lo reemplace
    selectLength: 6,
  },
  {
    id: 'link',
    label: '/link',
    description: '',
    snippet: '[texto](url)',
    // Cursor seleccionando "texto"
    cursorOffset: 1,
    selectLength: 5,
  },
];

export class SlashCommandHandler {
  /**
   * @param {HTMLTextAreaElement} textarea — El textarea del composer
   * @param {HTMLElement} popupContainer — Contenedor para montar el popup
   */
  constructor(textarea, popupContainer) {
    this.textarea = textarea;
    this.active = false;
    this.triggerPosition = -1; // Posición del "/" en el textarea

    this.popup = new EditorPopup({
      container: popupContainer,
      onSelect: (item) => this.insertSnippet(item),
      onDismiss: () => this.deactivate(),
    });

    // Bind
    this.handleInput = this.handleInput.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);

    // Listeners
    this.textarea.addEventListener('input', this.handleInput);
    this.textarea.addEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Detecta "/" al inicio de línea y activa el modo slash.
   */
  handleInput() {
    const { value, selectionStart } = this.textarea;

    if (this.active) {
      // Ya estamos en modo slash: filtrar por lo que el usuario escribió después de "/"
      const query = value.substring(this.triggerPosition + 1, selectionStart);

      // Si el usuario borró el "/", desactivar
      if (selectionStart <= this.triggerPosition || value[this.triggerPosition] !== '/') {
        this.deactivate();
        return;
      }

      // Si el query tiene un espacio, desactivar (el usuario no quiere un comando)
      if (query.includes(' ') || query.includes('\n')) {
        this.deactivate();
        return;
      }

      this.popup.filterItems(query);
      return;
    }

    // Detectar "/" al inicio de línea
    const charAtCursor = value[selectionStart - 1];
    if (charAtCursor !== '/') return;

    // Verificar que está al inicio de línea (posición 0 o precedido por \n)
    const charBefore = selectionStart >= 2 ? value[selectionStart - 2] : null;
    if (selectionStart > 1 && charBefore !== '\n') return;

    // Activar modo slash
    this.activate(selectionStart - 1);
  }

  /**
   * Maneja Tab para autocompletar el primer resultado.
   */
  handleKeyDown(e) {
    if (!this.active || !this.popup.isVisible()) return;

    if (e.key === 'Tab') {
      e.preventDefault();
      // Simular Enter: seleccionar el item activo
      // El popup ya maneja Enter internamente
    }
  }

  /**
   * Activa el modo slash: guarda la posición del "/" y muestra el popup.
   */
  activate(position) {
    this.active = true;
    this.triggerPosition = position;
    this.popup.show(SLASH_COMMANDS);
  }

  /**
   * Desactiva el modo slash: oculta el popup.
   */
  deactivate() {
    this.active = false;
    this.triggerPosition = -1;
    this.popup.hide();
  }

  /**
   * Inserta el snippet del comando seleccionado, reemplazando el "/comando" escrito.
   * @param {object} command — El comando seleccionado
   */
  insertSnippet(command) {
    const { value, selectionStart } = this.textarea;

    // Calcular rango a reemplazar: desde "/" hasta la posición actual del cursor
    const before = value.substring(0, this.triggerPosition);
    const after = value.substring(selectionStart);

    // Nuevo valor con el snippet insertado
    this.textarea.value = before + command.snippet + after;

    // Posicionar el cursor dentro del snippet
    const cursorPos = this.triggerPosition + command.cursorOffset;
    if (command.selectLength) {
      // Seleccionar texto para que el usuario lo reemplace (ej: "Header", "texto")
      this.textarea.setSelectionRange(cursorPos, cursorPos + command.selectLength);
    } else {
      this.textarea.setSelectionRange(cursorPos, cursorPos);
    }

    // Disparar input para actualizar auto-resize y estado del botón Guardar
    this.textarea.dispatchEvent(new window.Event('input', { bubbles: true }));
    this.textarea.focus();

    this.deactivate();
  }

  /** @returns {boolean} — Si el handler está en modo activo */
  isActive() {
    return this.active;
  }

  /**
   * Limpieza al desmontar.
   */
  destroy() {
    this.textarea.removeEventListener('input', this.handleInput);
    this.textarea.removeEventListener('keydown', this.handleKeyDown);
    this.popup.destroy();
  }
}
