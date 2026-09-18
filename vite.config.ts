/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Keep the caption track as a real same-origin file rather than an inlined data URL.
    assetsInlineLimit: (filePath) => (filePath.endsWith('.vtt') ? false : undefined),
  },
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
