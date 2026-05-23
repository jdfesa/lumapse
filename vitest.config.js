import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.js'],
      exclude: [
        'src/main.js',
        'src/components/**',
        'src/layout/**',
        'src/utils/**',
        'src/services/ExportService.js',
        'src/services/ImportService.js',
        'src/store/NoteStore.js',
      ],
    },
    setupFiles: ['tests/unit/setup.js'],
    globals: true,
  },
})
