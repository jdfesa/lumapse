export function renderNoteEditorTemplate() {
  return `
    <div class="composer">
      <div class="composer__focus-header" style="display:none">
        <span class="composer__focus-title">Modo Enfoque</span>
        <button class="composer__focus-exit" id="btn-exit-focus" title="Salir del modo enfoque">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
        </button>
      </div>
      <label class="composer__label" for="composer-title-input">Título</label>
      <input id="composer-title-input" class="composer__title-input" type="text" placeholder="Sin título" autocomplete="off" spellcheck="true">
      <label class="composer__label" for="composer-input">Contenido</label>
      <textarea id="composer-input" class="composer__textarea" placeholder="Escribí algo..." rows="3"></textarea>
      <div class="composer__footer">
        <div class="composer__tools">
          <div class="composer__subject-picker" id="composer-subject-picker">
            <input type="hidden" id="composer-subject-select" value="">
            <button
              id="composer-subject-trigger"
              class="composer__subject-trigger"
              type="button"
              aria-haspopup="listbox"
              aria-expanded="false"
              aria-controls="composer-subject-menu"
              title="Materia"
            >
              <span class="composer__subject-trigger-dot"></span>
              <span id="composer-subject-label" class="composer__subject-trigger-label">Entrada</span>
              <svg class="composer__subject-trigger-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            <div id="composer-subject-menu" class="composer__subject-menu" role="listbox" aria-label="Materia" hidden></div>
          </div>
          <button class="composer__tool-btn composer__plus-btn" title="Insertar" id="composer-plus-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
          <button class="composer__tool-btn composer__format-btn" title="Formato" id="composer-format-btn" aria-label="Formato">
            Aa
          </button>
          <button class="composer__tool-btn composer__focus-btn" title="Ampliar editor" id="composer-focus-btn" aria-label="Ampliar editor">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6"></path><path d="M21 3l-7 7"></path><path d="M9 21H3v-6"></path><path d="M3 21l7-7"></path></svg>
          </button>
        </div>
        <button id="btn-save-note" class="composer__save-btn" title="Guardar nota" disabled>Guardar</button>
      </div>
    </div>
  `;
}
