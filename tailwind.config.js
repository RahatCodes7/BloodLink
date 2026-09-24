/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}', './translations/**/*.{js}'],
  theme: {
    extend: {
      colors: {
        blood: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#dc2626',
          600: '#b91c1c',
          700: '#991b1b',
          800: '#7f1d1d',
          900: '#450a0a'
        },
        ink: '#1f2937'
      },
      borderRadius: { xl2: '1.25rem' },
      boxShadow: {
        soft: '0 4px 24px -6px rgba(185,28,28,.18)',
        card: '0 2px 12px -2px rgba(0,0,0,.08)'
      }
    }
  },
  plugins: []
};
