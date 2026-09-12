/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'charcoal-dark': '#0D0D0D',
        'charcoal': '#121212',
        'charcoal-card': '#181818',
        'charcoal-surface': '#1C1B1A',
        'border-dark': '#2A2A2A',
        'accent-gold': '#D4AF37',
        'supporting-beige': '#C5A880',
        'ivory-light': '#F9F6F0',
        'ivory-muted': '#F5F2EB',
      },
      fontFamily: {
        headline: ['Cormorant Garamond', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
