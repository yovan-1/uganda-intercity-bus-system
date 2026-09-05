/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mustnavy: {
          700: '#1e40af',
          800: '#1E3A8A', // Official MUST Navy Blue
          900: '#1e3a5f',
          950: '#0f172a',
        },
        mustgold: {
          400: '#fbbf24',
          500: '#F59E0B', // Official MUST Gold/Amber
          600: '#d97706',
          700: '#b45309',
        },
        mustlight: '#f8fafc',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'must-card': '0 10px 30px -5px rgba(30, 58, 138, 0.12)',
        'must-glow': '0 0 25px rgba(245, 158, 11, 0.3)',
      }
    },
  },
  plugins: [],
}
