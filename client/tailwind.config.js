/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-blue': '#0F2F64', // Custom color for text
        'custom-bg': '#dceaeb',   // Custom color for background
      },
    },
  },
  plugins: [],
}
