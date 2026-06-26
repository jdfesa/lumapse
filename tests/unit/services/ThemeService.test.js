import { beforeEach, describe, expect, it, vi } from 'vitest'

let ThemeService

function mockMatchMedia(matches = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  })
}

async function loadThemeService({ prefersLight = false } = {}) {
  vi.resetModules()
  mockMatchMedia(prefersLight)
  ThemeService = await import('../../../src/services/ThemeService.ts')
  return ThemeService
}

beforeEach(async () => {
  document.head.innerHTML = '<meta name="theme-color" content="#191919">'
  document.documentElement.removeAttribute('data-theme')
  localStorage.clear()
  await loadThemeService()
})

describe('ThemeService', () => {
  describe('init()', () => {
    it('aplica dark por defecto cuando localStorage está vacío y OS prefiere dark', async () => {
      await loadThemeService({ prefersLight: false })

      ThemeService.init()

      expect(ThemeService.getTheme()).toBe('dark')
      expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
    })

    it('aplica light cuando OS prefiere light', async () => {
      await loadThemeService({ prefersLight: true })

      ThemeService.init()

      expect(ThemeService.getTheme()).toBe('light')
      expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    })

    it('usa el valor guardado en localStorage si existe, ignorando OS', async () => {
      localStorage.setItem('lumapse-theme', 'dark')
      await loadThemeService({ prefersLight: true })

      ThemeService.init()

      expect(ThemeService.getTheme()).toBe('dark')
    })

    it('ignora valores inválidos en localStorage y usa dark', async () => {
      localStorage.setItem('lumapse-theme', 'purple')
      await loadThemeService({ prefersLight: false })

      ThemeService.init()

      expect(ThemeService.getTheme()).toBe('dark')
    })
  })

  describe('setTheme()', () => {
    it('establece data-theme="light" al llamar setTheme("light")', () => {
      ThemeService.setTheme('light')

      expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    })

    it('elimina data-theme al llamar setTheme("dark")', () => {
      document.documentElement.setAttribute('data-theme', 'light')

      ThemeService.setTheme('dark')

      expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
    })

    it('persiste el tema en localStorage', () => {
      ThemeService.setTheme('light')

      expect(localStorage.getItem('lumapse-theme')).toBe('light')
    })

    it('notifica a todos los listeners registrados con el tema nuevo', () => {
      const listenerA = vi.fn()
      const listenerB = vi.fn()
      ThemeService.onThemeChange(listenerA)
      ThemeService.onThemeChange(listenerB)

      ThemeService.setTheme('light')

      expect(listenerA).toHaveBeenCalledWith('light')
      expect(listenerB).toHaveBeenCalledWith('light')
    })

    it('normaliza a "dark" si se pasa un tema inválido', () => {
      ThemeService.setTheme('neon')

      expect(ThemeService.getTheme()).toBe('dark')
      expect(localStorage.getItem('lumapse-theme')).toBe('dark')
    })
  })

  describe('getTheme()', () => {
    it('retorna "light" cuando data-theme="light" está en <html>', () => {
      document.documentElement.setAttribute('data-theme', 'light')

      expect(ThemeService.getTheme()).toBe('light')
    })

    it('retorna "dark" cuando data-theme no está presente en <html>', () => {
      document.documentElement.removeAttribute('data-theme')

      expect(ThemeService.getTheme()).toBe('dark')
    })
  })

  describe('toggle()', () => {
    it('alterna de dark a light', () => {
      ThemeService.setTheme('dark')

      ThemeService.toggle()

      expect(ThemeService.getTheme()).toBe('light')
    })

    it('alterna de light a dark', () => {
      ThemeService.setTheme('light')

      ThemeService.toggle()

      expect(ThemeService.getTheme()).toBe('dark')
    })

    it('persiste el tema toggleado en localStorage', () => {
      ThemeService.setTheme('dark')

      ThemeService.toggle()

      expect(localStorage.getItem('lumapse-theme')).toBe('light')
    })
  })

  describe('onThemeChange()', () => {
    it('registra un callback y lo llama al cambiar el tema', () => {
      const listener = vi.fn()
      ThemeService.onThemeChange(listener)

      ThemeService.setTheme('light')

      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('la función de unsubscribe elimina el callback correctamente', () => {
      const listener = vi.fn()
      const unsubscribe = ThemeService.onThemeChange(listener)

      unsubscribe()
      ThemeService.setTheme('light')

      expect(listener).not.toHaveBeenCalled()
    })

    it('múltiples listeners reciben la notificación', () => {
      const listeners = [vi.fn(), vi.fn(), vi.fn()]
      listeners.forEach(listener => ThemeService.onThemeChange(listener))

      ThemeService.setTheme('light')

      listeners.forEach(listener => expect(listener).toHaveBeenCalledWith('light'))
    })

    it('un listener eliminado no recibe llamadas posteriores', () => {
      const kept = vi.fn()
      const removed = vi.fn()
      ThemeService.onThemeChange(kept)
      const unsubscribe = ThemeService.onThemeChange(removed)

      unsubscribe()
      ThemeService.setTheme('light')

      expect(kept).toHaveBeenCalledTimes(1)
      expect(removed).not.toHaveBeenCalled()
    })
  })

  describe('meta theme-color', () => {
    it('actualiza content a "#ffffff" en modo light', () => {
      ThemeService.setTheme('light')

      expect(document.querySelector('meta[name="theme-color"]').getAttribute('content')).toBe('#ffffff')
    })

    it('actualiza content a "#191919" en modo dark', () => {
      ThemeService.setTheme('dark')

      expect(document.querySelector('meta[name="theme-color"]').getAttribute('content')).toBe('#191919')
    })

    it('no falla si la meta tag no existe en el DOM', () => {
      document.querySelector('meta[name="theme-color"]').remove()

      expect(() => ThemeService.setTheme('light')).not.toThrow()
    })
  })
})
