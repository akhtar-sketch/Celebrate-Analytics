import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Semantic background tokens — resolve via CSS custom properties
        canvas:  'rgb(var(--c-canvas)  / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        raised:  'rgb(var(--c-raised)  / <alpha-value>)',
        wash:    'rgb(var(--c-wash)    / <alpha-value>)',
        // Border tokens
        edge: {
          DEFAULT: 'rgb(var(--c-edge)      / <alpha-value>)',
          soft:    'rgb(var(--c-edge-soft) / <alpha-value>)',
        },
        // Text tokens
        ink: {
          DEFAULT: 'rgb(var(--c-ink)   / <alpha-value>)',
          2:       'rgb(var(--c-ink-2) / <alpha-value>)',
          3:       'rgb(var(--c-ink-3) / <alpha-value>)',
        },
        // Brand tokens
        brand: {
          DEFAULT: 'rgb(var(--c-brand)      / <alpha-value>)',
          mid:     'rgb(var(--c-brand-mid)  / <alpha-value>)',
          soft:    'rgb(var(--c-brand-soft) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--c-accent)      / <alpha-value>)',
          soft:    'rgb(var(--c-accent-soft) / <alpha-value>)',
        },
        // Sidebar tokens (always dark regardless of theme)
        sidebar: {
          bg:     'rgb(var(--c-sidebar-bg)     / <alpha-value>)',
          border: 'rgb(var(--c-sidebar-border) / <alpha-value>)',
          ink:    'rgb(var(--c-sidebar-ink)    / <alpha-value>)',
          'ink-2':'rgb(var(--c-sidebar-ink-2)  / <alpha-value>)',
          'ink-3':'rgb(var(--c-sidebar-ink-3)  / <alpha-value>)',
          wash:   'rgb(var(--c-sidebar-wash)   / <alpha-value>)',
          active: 'rgb(var(--c-sidebar-active) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
