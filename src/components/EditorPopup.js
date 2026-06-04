/* ============================================================
   Componente: EditorPopup — Popup flotante reutilizable
   Hito 04: Editor Enhancements (Slash Commands, Link Lumapse)

   Responsabilidad: Mostrar un menú de opciones flotante sobre
   el composer del editor. Se posiciona relativo al contenedor
   del textarea (mobile-first, sin cálculo de caret).

   Uso:
     const popup = new EditorPopup({ container, onSelect, onDismiss });
     popup.show(items);
     popup.hide();
   ============================================================ */

export class EditorPopup {
  /**
   * @param {object} opts
   * @param {HTMLElement} opts.container — Elemento padre donde se monta el popup
   * @param {function} opts.onSelect — Callback al elegir: (item) => void
   * @param {function} opts.onDismiss — Callback al cerrar sin elegir: () => void
   */
  constructor({ container, onSelect, onDismiss }) {
    this.container = container;
    this.onSelect = onSelect;
    this.onDismiss = onDismiss || (() => {});

    this.items = [];
    this.filteredItems = [];
    this.activeIndex = 0;
    this.visible = false;
    this.clickOutsideTimer = null;

    // Crear el elemento DOM
    this.el = document.createElement('div');
    this.el.className = 'editor-popup';
    this.el.setAttribute('role', 'listbox');
    this.el.setAttribute('aria-label', 'Opciones del editor');
    this.container.appendChild(this.el);

    // Bind de métodos
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  /**
   * Muestra el popup con los items dados.
   * @param {Array<{id: string, label: string, description: string, snippet?: string}>} items
   * @param {string} [footerHint] — Texto de ayuda al pie del popup (opcional)
   */
  show(items, footerHint) {
    this.items = items;
    this.filteredItems = [...items];
    this.activeIndex = 0;
    this.visible = true;
    this.footerHint = footerHint || '';

    this.renderItems();
    this.el.classList.add('is-visible');

    // Escuchar teclas de navegación
    document.addEventListener('keydown', this.handleKeyDown, true);
    // Cerrar al hacer click fuera (con delay para evitar el click que abrió el popup)
    this.clickOutsideTimer = setTimeout(() => {
      document.addEventListener('click', this.handleClickOutside, true);
    }, 50);
  }

  /**
   * Oculta el popup.
   */
  hide() {
    if (!this.visible) return;
    this.visible = false;
    this.el.classList.remove('is-visible');
    this.el.innerHTML = '';

    if (this.clickOutsideTimer) {
      clearTimeout(this.clickOutsideTimer);
      this.clickOutsideTimer = null;
    }

    document.removeEventListener('keydown', this.handleKeyDown, true);
    document.removeEventListener('click', this.handleClickOutside, true);
  }

  /**
   * Filtra los items por query de texto.
   * @param {string} query
   */
  filterItems(query) {
    const q = query.trim().toLowerCase();
    this.filteredItems = this.items.filter(item => this.getSearchText(item).includes(q));
    this.activeIndex = 0;
    this.renderItems();
  }

  /**
   * Reemplaza los items (útil para búsquedas dinámicas o cambios de estado).
   * @param {Array} newItems
   */
  updateItems(newItems) {
    this.items = newItems;
    this.filteredItems = [...newItems];
    this.activeIndex = 0;
    this.renderItems();
  }

  /** @returns {boolean} */
  isVisible() {
    return this.visible;
  }

  // ── Internos ──────────────────────────────────

  renderItems() {
    if (this.filteredItems.length === 0) {
      this.el.innerHTML = '<div class="editor-popup__empty">Sin resultados</div>';
      this.renderFooterHint();
      return;
    }

    let lastGroup = null;
    this.el.innerHTML = this.filteredItems.map((item, i) => {
      const descHtml = item.description
        ? `<span class="editor-popup__desc">${this.escapeHtml(item.description)}</span>`
        : '';
      const groupHtml = item.groupLabel && item.groupLabel !== lastGroup
        ? `<div class="editor-popup__group">${this.escapeHtml(item.groupLabel)}</div>`
        : '';
      lastGroup = item.groupLabel || lastGroup;
      return `
      ${groupHtml}
      <div class="editor-popup__item ${i === this.activeIndex ? 'editor-popup__item--active' : ''}"
           role="option"
           aria-selected="${i === this.activeIndex}"
           data-index="${i}">
        <span class="editor-popup__label">${this.escapeHtml(item.label)}</span>
        ${descHtml}
      </div>
    `;
    }).join('');

    this.renderFooterHint();

    // Click en cada item
    this.el.querySelectorAll('.editor-popup__item').forEach(itemEl => {
      itemEl.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const idx = parseInt(itemEl.dataset.index, 10);
        const selected = this.filteredItems[idx];
        if (selected) {
          this.hide();
          this.onSelect(selected);
        }
      });
    });

    // Scroll al item activo
    const activeEl = this.el.querySelector('.editor-popup__item--active');
    if (activeEl && typeof activeEl.scrollIntoView === 'function') {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }

  /**
   * Maneja navegación con teclado (↑, ↓, Enter, Escape).
   * Captura en fase de captura para interceptar antes que el textarea.
   */
  handleKeyDown(e) {
    if (!this.visible) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        e.stopPropagation();
        if (this.filteredItems.length === 0) return;
        this.activeIndex = (this.activeIndex + 1) % this.filteredItems.length;
        this.renderItems();
        break;

      case 'ArrowUp':
        e.preventDefault();
        e.stopPropagation();
        if (this.filteredItems.length === 0) return;
        this.activeIndex = (this.activeIndex - 1 + this.filteredItems.length) % this.filteredItems.length;
        this.renderItems();
        break;

      case 'Enter':
        e.preventDefault();
        e.stopPropagation();
        if (this.filteredItems[this.activeIndex]) {
          const selected = this.filteredItems[this.activeIndex];
          this.hide();
          this.onSelect(selected);
        }
        break;

      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        this.hide();
        this.onDismiss();
        break;
    }
  }

  /**
   * Cierra el popup si se hace click fuera de él.
   */
  handleClickOutside(e) {
    if (!this.el.contains(e.target)) {
      this.hide();
      this.onDismiss();
    }
  }

  escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  getSearchText(item) {
    return [
      item.label,
      item.description,
      ...(item.aliases || []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
  }

  renderFooterHint() {
    if (this.footerHint) {
      this.el.innerHTML += `<div class="editor-popup__hint">${this.escapeHtml(this.footerHint)}</div>`;
    }
  }

  /**
   * Limpieza al desmontar.
   */
  destroy() {
    this.hide();
    if (this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
  }
}
