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
        brand: 'var(--text-color)',
        beige: 'var(--bg-color)',
        gold: 'var(--accent)',
        card: 'var(--card-bg)',
        footer: 'var(--footer-bg)',
        nav: 'var(--nav-bg)',
      }
    },
  },
  plugins: [],
}
