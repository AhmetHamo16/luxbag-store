/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8F5F2',
        gold: '#C6A75E',
        black: '#1E1E1E',
      }
    },
  },
  plugins: [],
}
