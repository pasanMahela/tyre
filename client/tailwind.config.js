/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-blue': '#dceaeb', // Custom color for text dceaeb
        'custom-blue-light': '#1E5DBC', // Custom color for text 1E5DBC
        'custom-bg': '#0F2F64',   // Custom color for background 0F2F64 
      },
    },
  },
  plugins: [],
}
