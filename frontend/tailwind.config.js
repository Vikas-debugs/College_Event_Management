/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-purple': '#4c0c56',
        'dark-purple': '#3a0944',
        'mid-purple': '#6b2d7b',
        'light-purple': '#9966ac',
        'pale-purple': '#f3eaf6',
        'bright-orange': '#e29826',
        'gold': '#d4a229',
        'cream': '#faf8f5',
        'text-dark': '#2d1535',
        'text-muted': '#6b5a72',
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
