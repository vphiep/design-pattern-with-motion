import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-elevated': 'var(--bg-elevated)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        text: 'var(--text)',
        'text-muted': 'var(--text-muted)',
        'text-soft': 'var(--text-soft)',
        accent: 'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
        'accent-strong': 'var(--accent-strong)',
        secondary: 'var(--secondary)',
        'secondary-soft': 'var(--secondary-soft)',
        'grid-line': 'var(--grid-line)',
        'pattern-creational': 'var(--pattern-creational)',
        'pattern-structural': 'var(--pattern-structural)',
        'pattern-behavioral': 'var(--pattern-behavioral)'
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace']
      },
      fontSize: {
        'display-xl': [
          'clamp(3.5rem, 7vw, 6.5rem)',
          { lineHeight: '0.95', letterSpacing: '-0.03em' }
        ],
        'display-lg': [
          'clamp(2.5rem, 5vw, 4.5rem)',
          { lineHeight: '1.0', letterSpacing: '-0.02em' }
        ],
        'display-md': [
          'clamp(1.75rem, 3.5vw, 2.75rem)',
          { lineHeight: '1.1', letterSpacing: '-0.015em' }
        ],
        'display-sm': [
          'clamp(1.25rem, 2vw, 1.75rem)',
          { lineHeight: '1.2', letterSpacing: '-0.01em' }
        ]
      },
      maxWidth: {
        reading: '68ch',
        wide: '84rem'
      },
      animation: {
        'spin-slow': 'spin 18s linear infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        flicker: 'flicker 4s ease-in-out infinite',
        'marker-pulse': 'marker-pulse 2.4s ease-in-out infinite',
        'flow-dash': 'flow-dash 1.2s linear infinite',
        'attention-bounce': 'attention-bounce 1s ease-in-out',
        'subtle-pulse': 'subtle-pulse 2s ease-in-out infinite'
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' }
        },
        flicker: {
          '0%, 100%': { opacity: '0.85' },
          '50%': { opacity: '0.55' }
        },
        'marker-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.15)', opacity: '1' }
        },
        'flow-dash': {
          to: { strokeDashoffset: '-20' }
        },
        'attention-bounce': {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
          '40%, 43%': { transform: 'translate3d(0, -6px, 0)' },
          '70%': { transform: 'translate3d(0, -3px, 0)' },
          '90%': { transform: 'translate3d(0, -1px, 0)' }
        },
        'subtle-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.02)' }
        }
      },
      backgroundImage: {
        blueprint:
          'linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)',
        'blueprint-fine':
          'linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)'
      },
      backgroundSize: {
        'grid-lg': '64px 64px',
        'grid-md': '32px 32px',
        'grid-sm': '16px 16px'
      },
      boxShadow: {
        editorial: '0 1px 0 0 var(--border), 0 14px 30px -18px rgba(20, 14, 0, 0.18)',
        'editorial-dark': '0 1px 0 0 var(--border), 0 18px 40px -18px rgba(0, 0, 0, 0.5)',
        'accent-glow': '0 0 0 1px var(--accent), 0 8px 24px -10px var(--accent)'
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
        'out-quint': 'cubic-bezier(0.22, 1, 0.36, 1)'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};

export default config;
