// Tailwind for the blog build only (vite.blog.config.mjs). It scans the blog templates and script, so the
// compiled CSS carries the brand tokens and the utilities the templates use, and nothing from the rest of
// the site. Old post bodies that carry Bootstrap-era class names (container, text-white) get no styling
// from it, on purpose: blog.css styles the body by element.
import type { Config } from 'tailwindcss'

export default {
  content: ['./blog/templates/**/*.hbs', './src/blog/**/*.ts'],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#6A13CF',
          magenta: '#C71E92',
          tint: '#F7F1FE',
          tintStrong: '#EEE3FB',
        },
        ink: {
          DEFAULT: '#0F0F14',
          soft: '#3F3F4A',
          muted: '#5C5C6B',
        },
        line: {
          DEFAULT: '#E4E4EA',
          strong: '#CFCFD8',
        },
        canvas: {
          DEFAULT: '#FFFFFF',
          sunken: '#F7F7F9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'Liberation Mono', 'monospace'],
      },
    },
  },
} satisfies Config
