/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        accent: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
        dark: {
          950: '#0a0a0f',
          900: '#13131a',
          800: '#1a1a24',
          700: '#25253a',
          600: '#3a3a52',
          500: '#52526b',
          400: '#8b8ba7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'radial-gradient(at 40% 20%, hsla(240, 100%, 70%, 0.3) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(280, 100%, 70%, 0.2) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(200, 100%, 70%, 0.2) 0px, transparent 50%)',
      },
    },
  },
  plugins: [],
}
