// Builds the rendered blog preview (blog-preview/*.html, from scripts/build-blog-preview.mjs) into dist-blog/.
//   node scripts/build-blog-preview.mjs && vite build --config vite.blog.config.mjs
//   BLOG_BASE=/blog/ vite build --config vite.blog.config.mjs   (absolute asset URLs for a deployment)
import { defineConfig } from 'vite'
import { existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve('blog-preview')
const input = existsSync(root)
  ? Object.fromEntries(
      readdirSync(root)
        .filter((f) => f.endsWith('.html'))
        .map((f) => [f.replace(/\.html$/, ''), resolve(root, f)]),
    )
  : {}

export default defineConfig({
  root,
  base: process.env.BLOG_BASE ?? './',
  publicDir: resolve('public'),
  build: {
    outDir: resolve('dist-blog'),
    emptyOutDir: true,
    rollupOptions: { input },
  },
  server: { host: '127.0.0.1', port: 5174, strictPort: true },
  preview: { host: '127.0.0.1', port: 4174, strictPort: true },
})
