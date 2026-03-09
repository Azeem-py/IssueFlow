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
          DEFAULT: '#4F46E5', // Indigo
        },
        background: {
          light: '#F8FAFC', // Slate
          dark: '#0F172A', // Deep Navy
        },
        status: {
          bug: '#E11D48', // Rose
          feature: '#F59E0B', // Amber
          resolved: '#10B981', // Emerald
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
