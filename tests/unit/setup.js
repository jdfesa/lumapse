import { afterEach, vi } from 'vitest'

vi.spyOn(console, 'log').mockImplementation(() => {})
vi.spyOn(console, 'warn').mockImplementation(() => {})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})
