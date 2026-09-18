import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
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
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Consolas',
          'Liberation Mono',
          'monospace',
        ],
      },
      maxWidth: {
        page: '1200px',
      },
      boxShadow: {
        frame: '0 1px 2px rgba(15, 15, 20, 0.06), 0 12px 32px -16px rgba(15, 15, 20, 0.18)',
      },
    },
  },
  plugins: [],
} satisfies Config
