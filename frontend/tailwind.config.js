/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'graffiti-purple': '#8B5CF6',
        'graffiti-pink': '#EC4899',
        'graffiti-blue': '#3B82F6',
        'graffiti-green': '#10B981',
        'graffiti-yellow': '#F59E0B',
        'graffiti-red': '#EF4444',
      }
    },
  },
  plugins: [],
}