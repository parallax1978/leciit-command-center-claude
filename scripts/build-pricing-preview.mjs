/**
 * Builds a single self-contained pricing page (styles, script, and logo inlined) that opens
 * from disk with a double-click, for reviewers who do not run the project.
 *
 * Usage: npm run build:pricing-preview   -> dist-pricing-preview/pricing-preview.html
 */
import { build } from 'vite'
import react from '@vitejs/plugin-react'
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const tmp = mkdtempSync(join(tmpdir(), 'pricing-preview-'))
await build({
  configFile: false,
  base: './',
  logLevel: 'warn',
  plugins: [react()],
  build: {
    outDir: tmp,
    emptyOutDir: true,
    // Inline every asset (the logo) so the file needs nothing beside it.
    assetsInlineLimit: () => true,
    cssCodeSplit: false,
    modulePreload: false,
    rollupOptions: { input: 'pricing.html', output: { inlineDynamicImports: true } },
  },
})

const assets = join(tmp, 'assets')
const files = readdirSync(assets)
const js = files.filter((f) => f.endsWith('.js'))
const css = files.filter((f) => f.endsWith('.css'))
if (js.length !== 1 || css.length !== 1) throw new Error(`Expected one script and one stylesheet, found ${files.join(', ')}`)

const script = readFileSync(join(assets, js[0]), 'utf8').replace(/<\/script/gi, '<\\/script')
const style = readFileSync(join(assets, css[0]), 'utf8')
let html = readFileSync(join(tmp, 'pricing.html'), 'utf8')
html = html
  .replace(/<script type="module" crossorigin src="[^"]+"><\/script>/, () => '')
  .replace(/<link rel="stylesheet" crossorigin href="[^"]+">/, () => `<style>${style}</style>`)
  .replace(/<link rel="icon"[^>]*>/, '')
  // Module scripts run after the document is parsed, so the script can sit in the head.
  .replace('</head>', () => `<script type="module">${script}</script>\n  </head>`)
if (/src="\.\/assets|href="\.\/assets/.test(html)) throw new Error('A file reference was left in the preview')

const out = 'dist-pricing-preview'
mkdirSync(out, { recursive: true })
writeFileSync(join(out, 'pricing-preview.html'), html)
rmSync(tmp, { recursive: true, force: true })
console.log(`Wrote ${out}/pricing-preview.html (${Math.round(html.length / 1024)} KB)`)
