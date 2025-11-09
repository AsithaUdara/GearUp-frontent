/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-foreground': 'var(--color-primary-foreground)',
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        border: 'var(--color-border)',
        'muted-foreground': 'var(--color-muted-foreground)',
        glass: 'var(--color-glass-bg)',
        'glass-border': 'var(--color-glass-border)',
        glow: 'var(--color-glow)',
      },
    },
  },
  plugins: [],
}
