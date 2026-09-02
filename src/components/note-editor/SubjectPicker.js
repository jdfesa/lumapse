// =============================================================
// Componente: SubjectPicker
// Selector compacto de materias para el composer.
// =============================================================

import { escapeHtmlAttribute, escapeHtmlText } from '../common/htmlEscaping.js';
import { getSafeHexColor } from '../common/presentationValidation.js';

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

      this.setValue(option.dataset.subjectId || '', { emitChange: true });
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
      const subjectColor = getSafeHexColor(subject.color) || '';
      options.push({
        id: subject.id,
        label: subject.name,
        color: subjectColor,
        isChild: false,
      });

      for (const child of (subject.children || [])) {
        options.push({
          id: child.id,
          label: child.name,
          color: getSafeHexColor(child.color) || subjectColor,
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
      const safeColor = getSafeHexColor(option.color);
      const dotStyle = safeColor ? ` style="--subject-color: ${safeColor}"` : '';
      const safeLabel = escapeHtmlAttribute(option.label);

      return `
        <button
          class="composer__subject-option${childClass}${inboxClass}"
          type="button"
          role="option"
          data-subject-id="${escapeHtmlAttribute(option.id)}"
          aria-selected="${selected}"
          aria-label="${safeLabel}"
          title="${safeLabel}"
        >
          <span class="composer__subject-option-dot"${dotStyle}></span>
          <span class="composer__subject-option-label">${escapeHtmlText(option.label)}</span>
        </button>
      `;
    }).join('');
  }

  setValue(value, options = {}) {
    const { emitChange = false, renderMenu = true } = options;
    if (!this.input || !this.label || !this.trigger) return;

    const previousValue = this.input.value;
    const selected = this.options.find(option => option.id === value) || this.options[0];

    this.input.value = selected.id;
    this.label.textContent = selected.label;
    const safeColor = getSafeHexColor(selected.color);
    if (safeColor) {
      this.trigger.style.setProperty('--subject-color', safeColor);
    } else {
      this.trigger.style.removeProperty('--subject-color');
    }
    this.trigger.classList.toggle('composer__subject-trigger--inbox', !selected.id);

    if (renderMenu) {
      this.renderMenu(selected.id);
    }

    if (emitChange && previousValue !== selected.id) {
      this.input.dispatchEvent(new window.Event('change', { bubbles: true }));
    }
  }

  getValue() {
    return this.input?.value || '';
  }

  destroy() {
    document.removeEventListener('click', this.handleDocumentClick);
    document.removeEventListener('keydown', this.handleKeyDown);
  }
}
