/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        led: ['"Orbitron"', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: 'var(--surface)',
          raised: 'var(--surface-raised)',
          sunken: 'var(--surface-sunken)',
        },
        edge: 'var(--edge)',
        accent: {
          DEFAULT: 'var(--accent)',
          soft: 'var(--accent-soft)',
        },
        ink: {
          DEFAULT: 'var(--ink)',
          dim: 'var(--ink-dim)',
          faint: 'var(--ink-faint)',
        },
      },
      boxShadow: {
        glow: '0 0 24px 2px var(--accent-soft)',
        panel: '0 8px 40px -12px rgba(0,0,0,0.5)',
      },
      keyframes: {
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 var(--accent-soft)' },
          '70%': { boxShadow: '0 0 0 12px rgba(0,0,0,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(0,0,0,0)' },
        },
      },
      animation: {
        pulseRing: 'pulseRing 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
    },
  },
  plugins: [],
};
