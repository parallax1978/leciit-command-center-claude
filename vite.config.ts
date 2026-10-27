/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Keep the caption track as a real same-origin file rather than an inlined data URL.
    assetsInlineLimit: (filePath) => (filePath.endsWith('.vtt') ? false : undefined),
    rollupOptions: {
      // Two pages share one component and brand system: the landing page and the pricing page.
      input: {
        // Paths resolve from the project root, where every npm script runs.
        main: 'index.html',
        pricing: 'pricing.html',
      },
    },
  },
  server: { host: true, port: 5173 },
  // strictPort: the QA scripts expect 4173, so fail rather than silently serve on another port.
  preview: { host: true, port: 4173, strictPort: true },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
