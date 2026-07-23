/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdfbf7',
          100: '#fbf5e6',
          200: '#f7ebcd',
          300: '#edd69a',
          400: '#deb85b',
          500: '#d4af37',
          600: '#b38e2b',
          700: '#8f6c22',
          800: '#6d511b',
          900: '#503c16',
        },
        darkBg: '#0a0a0a',
        darkCard: '#121212',

      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        glassDark: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        glass: '12px',
      },
    },
  },
  plugins: [],
}
