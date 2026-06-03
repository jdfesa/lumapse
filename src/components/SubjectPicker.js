// =============================================================
// Componente: SubjectPicker
// Selector compacto de materias para el composer.
// =============================================================

export class SubjectPicker {
  constructor(root) {
    this.root = root;
    this.options = [{ id: '', label: 'Entrada', color: '', isChild: false }];

    this.input = root.querySelector('#composer-subject-select');
    this.trigger = root.querySelector('#composer-subject-trigger');
    this.label = root.querySelector('#composer-subject-label');
    this.menu = root.querySelector('#composer-subject-menu');

    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);

    this.init();
  }

  init() {
    this.trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      if (this.isOpen()) {
        this.close();
      } else {
        this.open();
      }
    });

    this.menu.addEventListener('click', (event) => {
      const option = event.target.closest('.composer__subject-option');
      if (!option) return;

      this.setValue(option.dataset.subjectId || '');
      this.close();
      this.trigger.focus();
    });

    document.addEventListener('click', this.handleDocumentClick);
    document.addEventListener('keydown', this.handleKeyDown);

    this.renderMenu('');
    this.setValue('', { renderMenu: false });
  }

  isOpen() {
    return Boolean(this.menu && !this.menu.hidden);
  }

  open() {
    if (!this.trigger || !this.menu) return;

    this.menu.hidden = false;
    this.trigger.setAttribute('aria-expanded', 'true');
  }

  close() {
    if (!this.trigger || !this.menu) return;

    this.menu.hidden = true;
    this.trigger.setAttribute('aria-expanded', 'false');
  }

  handleDocumentClick(event) {
    if (this.root && !this.root.contains(event.target)) {
      this.close();
    }
  }

  handleKeyDown(event) {
    if (event.key !== 'Escape' || !this.isOpen()) return;

    this.close();
    this.trigger?.focus();
  }

  update(subjectsData) {
    if (!this.input || !subjectsData || !subjectsData.tree) return;

    const currentValue = this.input.value;
    this.options = this.buildOptions(subjectsData);
    const nextValue = this.options.some(option => option.id === currentValue) ? currentValue : '';

    this.renderMenu(nextValue);
    this.setValue(nextValue, { renderMenu: false });
  }

  buildOptions(subjectsData) {
    const options = [{ id: '', label: 'Entrada', color: '', isChild: false }];
    for (const subject of subjectsData.tree) {
      options.push({
        id: subject.id,
        label: subject.name,
        color: subject.color || '',
        isChild: false,
      });

      for (const child of (subject.children || [])) {
        options.push({
          id: child.id,
          label: child.name,
          color: child.color || subject.color || '',
          isChild: true,
        });
      }
    }

    return options;
  }

  renderMenu(selectedValue = '') {
    if (!this.menu) return;

    this.menu.innerHTML = this.options.map(option => {
      const selected = option.id === selectedValue;
      const childClass = option.isChild ? ' composer__subject-option--child' : '';
      const inboxClass = option.id ? '' : ' composer__subject-option--inbox';
      const dotStyle = option.color ? ` style="--subject-color: ${this.escapeAttribute(option.color)}"` : '';

      return `
        <button
          class="composer__subject-option${childClass}${inboxClass}"
          type="button"
          role="option"
          data-subject-id="${this.escapeAttribute(option.id)}"
          aria-selected="${selected}"
        >
          <span class="composer__subject-option-dot"${dotStyle}></span>
          <span class="composer__subject-option-label">${this.escapeHtml(option.label)}</span>
        </button>
      `;
    }).join('');
  }

  setValue(value, options = {}) {
    const { renderMenu = true } = options;
    if (!this.input || !this.label || !this.trigger) return;

    const selected = this.options.find(option => option.id === value) || this.options[0];

    this.input.value = selected.id;
    this.label.textContent = selected.label;
    this.trigger.style.setProperty('--subject-color', selected.color || 'var(--color-accent)');
    this.trigger.classList.toggle('composer__subject-trigger--inbox', !selected.id);

    if (renderMenu) {
      this.renderMenu(selected.id);
    }
  }

  getValue() {
    return this.input?.value || '';
  }

  escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  escapeAttribute(text) {
    return this.escapeHtml(text).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  destroy() {
    document.removeEventListener('click', this.handleDocumentClick);
    document.removeEventListener('keydown', this.handleKeyDown);
  }
}
