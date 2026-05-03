// =============================================================
// Componente: MarkdownPreview
// Hito 03: MVP Completo
//
// Responsabilidad: Renderizar contenido Markdown como HTML
// en un panel de vista previa. Se actualiza en tiempo real
// conforme recibe nuevo contenido.
//
// Dependencias:
//   - MarkdownService (renderMarkdown)
//
// RF cubiertos: RF-010 (renderizado en tiempo real)
// =============================================================

import { renderMarkdown } from '../services/MarkdownService.js';
import './MarkdownPreview.css';

export class MarkdownPreview {
  /**
   * @param {HTMLElement} container — Elemento donde se monta el preview
   */
  constructor(container) {
    this.container = container;
    this.lastContent = null; // Cache para evitar re-renders innecesarios

    this.render();
  }

  /**
   * Renderiza la estructura base del componente.
   */
  render() {
    this.container.innerHTML = `
      <div class="md-preview" id="md-preview">
        <div class="md-preview__empty">
          <p>La vista previa de Markdown aparecerá aquí mientras escribas.</p>
        </div>
      </div>
    `;

    this.previewEl = this.container.querySelector('#md-preview');
  }

  /**
   * Actualiza el contenido del preview con nuevo Markdown.
   * Incluye un guard para no re-renderizar si el contenido no cambió.
   *
   * @param {string} markdown — Texto Markdown a renderizar
   */
  update(markdown) {
    // Guard: no re-renderizar si el contenido es idéntico
    if (markdown === this.lastContent) return;
    this.lastContent = markdown;

    // Si no hay contenido, mostrar estado vacío
    if (!markdown || !markdown.trim()) {
      this.previewEl.innerHTML = `
        <div class="md-preview__empty">
          <p>La vista previa de Markdown aparecerá aquí mientras escribas.</p>
        </div>
      `;
      return;
    }

    // Renderizar Markdown → HTML seguro
    const html = renderMarkdown(markdown);
    this.previewEl.innerHTML = `
      <div class="md-preview__content">${html}</div>
    `;
  }

  /**
   * Limpia el preview al estado vacío.
   */
  clear() {
    this.lastContent = null;
    this.render();
  }

  /**
   * Limpieza al desmontar.
   */
  destroy() {
    this.container.innerHTML = '';
  }
}
