/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#eaf4ff',
          100: '#d0e7ff',
          200: '#a3cfff',
          300: '#7ec8ff',
          400: '#4a9eff',
          500: '#3a86e0',
          600: '#2c6cc0',
          700: '#1d50a0',
          800: '#103476',
          900: '#0a1f4a',
        },
        accent: {
          50:  '#fff5e6',
          100: '#ffe5c2',
          200: '#ffcb8a',
          300: '#f9b06a',
          400: '#f2994a',
          500: '#e08434',
          600: '#c46d22',
          700: '#9c5418',
          800: '#764012',
          900: '#4f2c0d',
        },
        teal: {
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
        },
        pink: {
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
        },
        night: {
          900: '#040f1e',
          800: '#081B33',
          700: '#0d2240',
          600: '#102848',
          500: '#1a3d6b',
        },
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
