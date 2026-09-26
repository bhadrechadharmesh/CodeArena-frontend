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
          550: '#5265e8',
          650: '#384acb',
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
          50: '#faf2ee',
          100: '#f4e3db',
          500: '#ba5437',
          600: '#b4492d',
          700: '#923a24',
          900: '#612d20',
        },
        darkbg: '#0b1322',
        'darkbg-card': '#141e30',
        'darkbg-border': '#29374d',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
