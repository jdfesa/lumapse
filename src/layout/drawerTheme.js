// =============================================================
// layout/drawerTheme — Toggle de tema claro/oscuro
// Extraído de drawerController.js para reducir LOC.
// =============================================================

/**
 * Inicializa el toggle de tema oscuro/claro.
 * @param {object} ThemeService Servicio de tema inyectado
 */
export function initTheme(ThemeService) {
  ThemeService.init()

  const themeIcon = document.getElementById('theme-icon')
  const themeLabel = document.getElementById('theme-btn-label')
  const btnToggleTheme = document.getElementById('btn-toggle-theme')

  /** Actualiza el ícono y el label del botón según el tema activo */
  function updateThemeUI(theme) {
    if (theme === 'light') {
      // En modo claro, el botón ofrece cambiar a oscuro → ícono luna
      themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>'
      themeLabel.textContent = 'Modo oscuro'
    } else {
      // En modo oscuro, el botón ofrece cambiar a claro → ícono sol
      themeIcon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>'
      themeLabel.textContent = 'Modo claro'
    }
  }

  updateThemeUI(ThemeService.getTheme())
  ThemeService.onThemeChange(updateThemeUI)

  btnToggleTheme.addEventListener('click', () => {
    ThemeService.toggle()
  })
}
