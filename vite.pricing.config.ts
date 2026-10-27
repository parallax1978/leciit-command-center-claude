import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// The project does not install Node's type definitions; this config only reads two variables.
declare const process: { env: Record<string, string | undefined> }

/**
 * Production build of the pricing page alone, ready to upload to the live site.
 *
 *   npm run build:pricing                 -> dist-pricing/ for https://legiit.com/pricing/
 *   PRICING_BASE=/plans/ npm run build:pricing   -> for another path
 *
 * Asset URLs are absolute under PRICING_BASE, so the page works at both /pricing and /pricing/.
 * The page is written as index.html so a plain static server serves it for the folder URL.
 */
const base = process.env.PRICING_BASE ?? '/pricing/'

const pricingAsIndex: Plugin = {
  name: 'pricing-as-index',
  // After Vite's own HTML plugin has added the page to the bundle.
  enforce: 'post',
  generateBundle(_options, bundle) {
    const page = bundle['pricing.html']
    if (!page) return
    page.fileName = 'index.html'
    bundle['index.html'] = page
    delete bundle['pricing.html']
  },
}

export default defineConfig({
  base,
  plugins: [react(), pricingAsIndex],
  build: {
    outDir: process.env.PRICING_OUT ?? 'dist-pricing',
    emptyOutDir: true,
    rollupOptions: { input: { pricing: 'pricing.html' } },
  },
})
