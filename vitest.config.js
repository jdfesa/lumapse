import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    pool: 'threads',
    include: ['tests/unit/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: ['src/**/*.{js,ts}'],
      exclude: [
        'src/main.js',
        'src/components/**',
        'src/layout/**',
        'src/utils/**',
        'src/services/ImportService.js',
        'src/store/NoteStore.js',
      ],
    },
    setupFiles: ['tests/unit/setup.js'],
    globals: true,
  },
})
