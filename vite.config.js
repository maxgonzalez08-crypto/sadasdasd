
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true
  },
  build: {
    outDir: 'dist'
  },
  base: './',
  // No longer injecting API keys at build time - handled on backend
  envPrefix: 'VITE_'
})
