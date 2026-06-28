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
        slate: {
          350: '#b0bdcd',
          450: '#7c8ca1',
          455: '#79899e',
          550: '#55647a',
          650: '#3d4b5f',
          750: '#293548',
        },
        indigo: {
          550: '#a855f7',
          650: '#7e22ce',
        },
        emerald: {
          250: '#8ae5c3',
          550: '#0ba775',
          650: '#048760',
        },
        red: {
          250: '#fdb7b7',
          650: '#cc2121',
        },
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#312e81',
        },
        darkbg: '#0b0f19',
        'darkbg-card': '#161b26',
        'darkbg-border': '#222d3d',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
