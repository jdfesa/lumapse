// =============================================================
// layout/appShell — Template HTML principal
// Hito 04: Interfaz Microblog (estilo Memos)
//
// Responsabilidad: Generar el HTML del shell de la aplicación
// (drawer + main content). Extraído de main.js para separar
// la estructura visual de la lógica de inicialización.
// =============================================================

/**
 * Genera el HTML del shell principal de la aplicación.
 * Incluye: Drawer (sidebar), Header, Composer y Feed containers.
 * @returns {string} HTML string del app shell
 */
export function renderAppShell() {
  return `
    <!-- Drawer (Sidebar derecho para búsqueda y navegación de notas) -->
    <aside id="drawer" class="drawer">
      <div class="drawer__header">
        <div class="app-logo">
          <img src="icons/icon-144x144.png" width="24" height="24" alt="Lumapse" class="app-logo__icon" loading="eager">
          Lumapse
        </div>
        <button id="btn-close-drawer" class="icon-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div class="drawer__content">
        <!-- Search (RF-015) -->
        <div class="search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="drawer-search-input" placeholder="Buscar notas..." autocomplete="off">
        </div>

        <!-- Navegación por materia (DP-002 / Paso 9) -->
        <nav class="drawer__subjects">
          <div class="drawer__subjects-header">
            <span class="drawer__subjects-title">Materias</span>
            <button id="btn-add-subject" class="drawer__subjects-add" title="Nueva materia">+</button>
          </div>
          <div id="subject-form-container" class="drawer__subject-form" style="display:none">
            <input type="text" id="subject-name-input" class="drawer__subject-form-input" placeholder="Nombre de materia" maxlength="40" autocomplete="off">
            <div id="subject-color-picker" class="drawer__color-picker"></div>
            <div class="drawer__subject-form-actions">
              <button id="btn-subject-cancel" class="drawer__subject-form-btn">Cancelar</button>
              <button id="btn-subject-save" class="drawer__subject-form-btn drawer__subject-form-btn--primary">Crear</button>
            </div>
          </div>
          <button id="btn-inbox" class="drawer__subject-btn drawer__subject-btn--active" data-subject="inbox">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>
            <span>Entrada</span>
            <span id="inbox-count" class="drawer__subject-count">0</span>
          </button>
          <div id="subjects-list"></div>
        </nav>

        <!-- Filtro: Archivadas -->
        <button id="btn-toggle-archived" class="drawer__nav-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>
          <span id="archived-btn-label">Ver archivadas</span>
        </button>

        <!-- Papelera de Reciclaje (RF-026) -->
        <button id="btn-trash" class="drawer__nav-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          <span id="trash-btn-label">Papelera</span>
          <span id="trash-count" class="drawer__trash-count" style="display:none">0</span>
        </button>

        <!-- Herramientas de Test (Temporales - Ocultas por defecto) -->
        <!--
        <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--color-border);">
          <div class="drawer__subjects-title" style="margin-bottom: 1rem;">Testing & QA</div>
          <button id="btn-seed-tiktok" class="drawer__nav-btn" style="border-color: var(--color-accent); color: var(--color-accent);">
            <span>🚀 Cargar Demo TikTok</span>
          </button>
          <button id="btn-seed-stress" class="drawer__nav-btn">
            <span>🔥 Prueba de Estrés (1000)</span>
          </button>
        </div>
        -->
        
      </div>
    </aside>
    <div id="drawer-backdrop" class="drawer-backdrop"></div>

    <!-- App Menu (mantenimiento y configuración) -->
    <aside id="app-menu-drawer" class="app-menu-drawer" aria-label="Opciones de Lumapse" aria-hidden="true">
      <div class="app-menu-drawer__header">
        <div class="app-logo">
          <img src="icons/icon-144x144.png" width="24" height="24" alt="Lumapse" class="app-logo__icon" loading="eager">
          Lumapse
        </div>
        <button id="btn-close-app-menu" class="icon-btn" title="Cerrar opciones de Lumapse" aria-label="Cerrar opciones de Lumapse">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div class="app-menu-drawer__content">
        <button id="btn-export-backup" class="app-menu-drawer__item" type="button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"></path><path d="m7 10 5 5 5-5"></path><path d="M5 21h14"></path></svg>
          <span id="export-backup-btn-label">Exportar backup</span>
        </button>
        <button id="btn-import-backup" class="app-menu-drawer__item" type="button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21V9"></path><path d="m17 14-5-5-5 5"></path><path d="M5 3h14"></path></svg>
          <span id="import-backup-btn-label">Importar ZIP</span>
        </button>
        <button id="btn-toggle-theme" class="app-menu-drawer__item" type="button">
          <svg id="theme-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"></svg>
          <span id="theme-btn-label">Cambiar tema</span>
        </button>
      </div>
    </aside>
    <div id="app-menu-backdrop" class="app-menu-backdrop"></div>

    <!-- Main Content -->
    <main class="main-layout">
      <div class="feed-container">
        <header class="app-header">
          <div class="app-header__brand">
            <button id="btn-open-app-menu" class="app-header__logo-icon-btn" type="button" aria-controls="app-menu-drawer" aria-expanded="false" title="Opciones de Lumapse" aria-label="Opciones de Lumapse">
              <img src="icons/icon-144x144.png" width="24" height="24" alt="" class="app-logo__icon" loading="eager" aria-hidden="true">
            </button>
            <span class="app-logo__text">Lumapse</span>
          </div>
          <div class="app-header__actions">
            <button id="btn-toggle-calendar" class="icon-btn" title="Calendario">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </button>
            <button id="btn-open-drawer" class="icon-btn" title="Menú">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
          </div>
        </header>

        <!-- Calendar Popup (DP-006) -->
        <div id="calendar-popup" class="calendar-popup">
          <div id="heatmap-container"></div>
          <div id="upcoming-academic-events-container"></div>
        </div>
        
        <!-- Composer (crear/editar nota) -->
        <section id="composer-container"></section>
        
        <!-- Timeline (lista de notas) -->
        <section id="feed-items-container"></section>
      </div>
    </main>

    <!-- Toast: Alerta de papelera llena (RF-026) -->
    <div id="trash-warning-toast" class="trash-toast" style="display:none">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      <span>Tu papelera tiene muchos elementos. Vaciarla mantiene Lumapse rápido.</span>
      <button id="btn-empty-trash-toast" class="trash-toast__action">Vaciar ahora</button>
      <button id="btn-dismiss-toast" class="trash-toast__dismiss">✕</button>
    </div>
  `
}

/**
 * Escapa HTML para prevenir XSS en textos renderizados dinámicamente.
 * @param {string} text Texto a escapar
 * @returns {string} Texto con entidades HTML escapadas
 */
export function escapeHtml(text) {
  if (!text) return ''
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
