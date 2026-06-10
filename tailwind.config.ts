import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/content/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        paper: 'var(--paper)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        line: 'var(--line)',
        accent: 'var(--accent)',
        'accent-strong': 'var(--accent-strong)',
        'accent-soft': 'var(--accent-soft)',
        warm: 'var(--warm)',
      },
      fontFamily: {
        display: ['var(--display)'],
        sans: ['var(--sans)'],
        mono: ['var(--mono)'],
      },
      boxShadow: {
        editorial: 'var(--shadow)',
      },
    },
  },
  plugins: [],
};

export default config;
