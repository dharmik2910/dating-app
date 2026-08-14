/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f4',
          100: '#ffe1e8',
          200: '#ffc7d4',
          300: '#ff9fb5',
          400: '#ff6489',
          500: '#fb3c68',
          600: '#e81c4e',
          700: '#c4123f',
          800: '#a3123a',
          900: '#8b1236'
        }
      }
    }
  },
  plugins: []
};
