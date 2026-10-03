import { defineConfig } from 'vite'
import { buildMetadataPlugin } from './scripts/build-metadata.js'

export default defineConfig({
  plugins: [buildMetadataPlugin()],
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    open: true,
  },
  optimizeDeps: {
    exclude: ['jeep-sqlite/loader']
  }
})
