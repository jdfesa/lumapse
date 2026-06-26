// =============================================================
// Servicio: ThemeService
// Hito 04 — RF-019: Modo oscuro / modo claro
// Gestión modular del tema con persistencia en localStorage.
// =============================================================

const STORAGE_KEY = 'lumapse-theme'

export type Theme = 'dark' | 'light'

export const THEMES = Object.freeze({
  DARK: 'dark',
  LIGHT: 'light',
} as const)

type ThemeListener = (theme: Theme) => void

const listeners = new Set<ThemeListener>()

/**
 * Determina el tema inicial:
 * 1. Valor guardado en localStorage
 * 2. Preferencia del sistema operativo (prefers-color-scheme)
 * 3. Fallback: dark (default del proyecto)
 */
function resolveInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === THEMES.LIGHT || stored === THEMES.DARK) {
    return stored
  }

  // Respetar preferencia del OS si no hay valor guardado
  if (window.matchMedia?.('(prefers-color-scheme: light)').matches) {
    return THEMES.LIGHT
  }

  return THEMES.DARK
}

/** Aplica el tema al DOM (atributo data-theme en <html>) y actualiza meta theme-color */
function applyTheme(theme: Theme): void {
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')

  if (theme === THEMES.LIGHT) {
    document.documentElement.setAttribute('data-theme', 'light')
    if (metaThemeColor) metaThemeColor.setAttribute('content', '#ffffff')
  } else {
    document.documentElement.removeAttribute('data-theme')
    if (metaThemeColor) metaThemeColor.setAttribute('content', '#191919')
  }
}

// --- API pública ---

/** Retorna el tema actual ('dark' | 'light') */
export function getTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'light'
    ? THEMES.LIGHT
    : THEMES.DARK
}

/** Establece un tema específico y lo persiste */
export function setTheme(theme: unknown): void {
  const validTheme = theme === THEMES.LIGHT ? THEMES.LIGHT : THEMES.DARK
  applyTheme(validTheme)
  localStorage.setItem(STORAGE_KEY, validTheme)
  listeners.forEach(fn => fn(validTheme))
}

/** Alterna entre dark y light */
export function toggle(): void {
  const next = getTheme() === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK
  setTheme(next)
}

/**
 * Suscribe un callback que se ejecuta al cambiar el tema.
 * Retorna una función para desuscribirse.
 */
export function onThemeChange(callback: ThemeListener): () => boolean {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

/**
 * Inicializa el tema al cargar la app.
 * Debe llamarse una sola vez desde main.js.
 */
export function init(): void {
  const theme = resolveInitialTheme()
  applyTheme(theme)
  // No persiste en init para respetar el valor existente o la detección del OS
}
