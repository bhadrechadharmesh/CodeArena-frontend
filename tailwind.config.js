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
          550: '#5956ec',
          650: '#493fd7',
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
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#312e81',
        },
        darkbg: {
          DEFAULT: '#0F172A',
          card: '#1E293B',
          border: '#334155',
        }
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
